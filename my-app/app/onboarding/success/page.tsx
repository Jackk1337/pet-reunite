"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OnboardingSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f9fa" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card className="p-10 shadow-xl border-gray-200 text-center space-y-6">
          <div className="text-5xl">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payment initiated
          </h1>
          <p className="text-gray-600">
            Thanks for choosing PetReunite. Once your payment is confirmed,
            we&apos;ll finalize your order and get your dog tags ready.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order reference: <span className="font-semibold">{orderId}</span>
            </p>
          )}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild variant="outline">
              <Link href="/onboarding/checkout">Back to checkout</Link>
            </Button>
            <Button asChild style={{ backgroundColor: "#ffb067" }} className="hover:opacity-90">
              <Link href="/register">
                Continue registration
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

