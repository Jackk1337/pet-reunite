import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLAN_CONFIG, type PlanKey } from "@/lib/plans";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe =
  stripeSecretKey != null
    ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
    : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      planKey,
      orderId,
      customerEmail,
      selectionsParam,
    }: {
      planKey?: PlanKey;
      orderId?: string;
      customerEmail?: string;
      selectionsParam?: string;
    } = body;

    if (!planKey || !orderId) {
      return NextResponse.json(
        { error: "Missing plan or order reference." },
        { status: 400 }
      );
    }

    const plan = PLAN_CONFIG[planKey];
    if (!plan || !plan.priceId) {
      return NextResponse.json(
        { error: "Unsupported plan selection." },
        { status: 400 }
      );
    }

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";
    const encodedSelections = selectionsParam || JSON.stringify([]);

    const successUrl = `${origin}/onboarding/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/onboarding/checkout?plan=${planKey}&selections=${encodeURIComponent(
      encodedSelections
    )}`;

    const session = await stripe.checkout.sessions.create({
      mode: plan.billingCycle === "monthly" ? "subscription" : "payment",
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      metadata: {
        orderId,
        planKey,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    try {
      await updateDoc(doc(db, "orders", orderId), {
        stripeSessionId: session.id,
        stripeCheckoutUrl: session.url,
      });
    } catch (error) {
      console.error("Failed to link Stripe session to order", error);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      { error: "Unable to initiate payment." },
      { status: 500 }
    );
  }
}
