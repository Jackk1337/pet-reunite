"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN_CONFIG, type PlanKey } from "@/lib/plans";
import { db } from "@/lib/firebase";

type TagSelection = {
  selectionId: string;
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  colorSwatch: string;
};

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = (searchParams.get("plan") as PlanKey) || "reunite";
  const planKey: PlanKey = PLAN_CONFIG[planParam] ? planParam : "reunite";
  const plan = PLAN_CONFIG[planKey];

  const selectionsParam = searchParams.get("selections");
  const selectedTags = useMemo<TagSelection[]>(() => {
    if (!selectionsParam) {
      return [];
    }
    try {
      const parsed = JSON.parse(selectionsParam);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.productName === "string" &&
            typeof item.colorName === "string"
        )
        .map((item) => ({
          selectionId: item.selectionId ?? crypto.randomUUID(),
          productId: item.productId ?? "",
          productName: item.productName ?? "Dog Tag",
          colorId: item.colorId ?? "",
          colorName: item.colorName ?? "Selected color",
          colorSwatch: item.colorSwatch ?? "#ffb067",
        }));
    } catch (error) {
      console.error("Failed to parse selections", error);
      return [];
    }
  }, [selectionsParam]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [homeAddress, setHomeAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [sameAsHome, setSameAsHome] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sameAsHome) {
      setBillingAddress(homeAddress);
    }
  }, [homeAddress, sameAsHome]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError(null);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !homeAddress.line1.trim() ||
      !homeAddress.city.trim() ||
      !homeAddress.state.trim() ||
      !homeAddress.postalCode.trim() ||
      !homeAddress.country.trim()
    ) {
      setCheckoutError("Please provide your name, email address, and complete home address.");
      return;
    }

    if (
      !sameAsHome &&
      (!billingAddress.line1.trim() ||
        !billingAddress.city.trim() ||
        !billingAddress.state.trim() ||
        !billingAddress.postalCode.trim() ||
        !billingAddress.country.trim())
    ) {
      setCheckoutError("Please provide your billing address or mark it as the same as your home address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        planKey,
        planName: plan.name,
        planPrice: plan.price,
        billingCycle: plan.billingCycle,
        tagAllowance: plan.allocation,
        tagSelections: selectedTags,
        tagCount: selectedTags.length,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        homeAddress,
        billingAddress: sameAsHome ? homeAddress : billingAddress,
        sameAsHomeAddress: sameAsHome,
        createdAt: serverTimestamp(),
        status: "pending",
      });
      const selectionsPayload =
        selectionsParam ?? JSON.stringify(selectedTags ?? []);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planKey,
          orderId: orderRef.id,
          customerEmail: email.trim().toLowerCase(),
          selectionsParam: selectionsPayload,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to create Stripe checkout session.");
      }

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout URL missing.");
      }
    } catch (error) {
      console.error("Failed to save order", error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "We couldn't place your order. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f9fa" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Step 2</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 max-w-2xl">
            Confirm your plan, review the dog tags included with your order, and enter your account details to finish
            onboarding.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-md border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Selected plan</p>
                  <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{currencyFormatter.format(plan.price)}</p>
                  <p className="text-sm text-gray-500 capitalize">{plan.billingCycle} billing</p>
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/60 px-4 py-3 text-sm text-orange-700">
                <p>
                  Includes {plan.allocation} complimentary dog tag{plan.allocation === 1 ? "" : "s"}.
                </p>
              </div>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="p-6 shadow-md border-gray-200 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Account details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Address line 1</label>
                      <input
                        value={homeAddress.line1}
                        onChange={(event) => setHomeAddress((prev) => ({ ...prev, line1: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        placeholder="123 Pet Lane"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Address line 2 (optional)</label>
                      <input
                        value={homeAddress.line2}
                        onChange={(event) => setHomeAddress((prev) => ({ ...prev, line2: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <input
                        value={homeAddress.city}
                        onChange={(event) => setHomeAddress((prev) => ({ ...prev, city: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">State / Region</label>
                      <input
                        value={homeAddress.state}
                        onChange={(event) => setHomeAddress((prev) => ({ ...prev, state: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        placeholder="State"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Postal code</label>
                      <input
                        value={homeAddress.postalCode}
                        onChange={(event) => setHomeAddress((prev) => ({ ...prev, postalCode: event.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        placeholder="ZIP / Postal code"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <input
                      value={homeAddress.country}
                      onChange={(event) => setHomeAddress((prev) => ({ ...prev, country: event.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                      placeholder="Country"
                      required
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-md border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Billing address</h3>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={sameAsHome}
                      onChange={(event) => setSameAsHome(event.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    />
                    Same as home address
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {sameAsHome ? "Billing address (matches home address)" : "Billing address"}
                  </label>
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Address line 1</label>
                        <input
                          value={billingAddress.line1}
                          onChange={(event) =>
                            setBillingAddress((prev) => ({ ...prev, line1: event.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="123 Pet Lane"
                          required={!sameAsHome}
                          disabled={sameAsHome}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Address line 2 (optional)</label>
                        <input
                          value={billingAddress.line2}
                          onChange={(event) =>
                            setBillingAddress((prev) => ({ ...prev, line2: event.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="Apartment, suite, etc."
                          disabled={sameAsHome}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <input
                          value={billingAddress.city}
                          onChange={(event) =>
                            setBillingAddress((prev) => ({ ...prev, city: event.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="City"
                          required={!sameAsHome}
                          disabled={sameAsHome}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">State / Region</label>
                        <input
                          value={billingAddress.state}
                          onChange={(event) =>
                            setBillingAddress((prev) => ({ ...prev, state: event.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="State"
                          required={!sameAsHome}
                          disabled={sameAsHome}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Postal code</label>
                        <input
                          value={billingAddress.postalCode}
                          onChange={(event) =>
                            setBillingAddress((prev) => ({ ...prev, postalCode: event.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="ZIP / Postal code"
                          required={!sameAsHome}
                          disabled={sameAsHome}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <input
                        value={billingAddress.country}
                        onChange={(event) =>
                          setBillingAddress((prev) => ({ ...prev, country: event.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="Country"
                        required={!sameAsHome}
                        disabled={sameAsHome}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {checkoutError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {checkoutError}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  style={{ backgroundColor: "#ffb067" }}
                  className="hover:opacity-90 px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Checkout"}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="p-6 shadow-md border-gray-200 space-y-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Order summary</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{plan.billingCycle} billing cycle</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {currencyFormatter.format(plan.price)}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Dog tags</p>
                {selectedTags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags selected. Head back to add your complimentary tags.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTags.map((tag) => (
                      <div
                        key={tag.selectionId}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-4 w-4 rounded-full border border-white shadow-inner"
                            style={{ backgroundColor: tag.colorSwatch }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{tag.productName}</p>
                            <p className="text-gray-500">{tag.colorName}</p>
                          </div>
                        </div>
                        <span className="text-xs uppercase tracking-[0.3em] text-gray-400">Included</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {currencyFormatter.format(plan.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dog tags</span>
                  <span className="text-sm font-semibold text-gray-900">Included</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                  <span>Total due today</span>
                  <span>{currencyFormatter.format(plan.price)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

