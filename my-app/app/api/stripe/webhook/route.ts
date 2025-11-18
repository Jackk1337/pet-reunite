import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe =
  stripeSecretKey != null
    ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
    : null;

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        try {
          await updateDoc(doc(db, "orders", orderId), {
            status: "paid",
            stripePaymentStatus: session.payment_status ?? "paid",
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id ?? null,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id ?? null,
            paidAt: serverTimestamp(),
          });
        } catch (updateError) {
          console.error("Failed updating order after webhook", updateError);
        }
      }
    }
  } catch (error) {
    console.error("Error handling Stripe webhook", error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

