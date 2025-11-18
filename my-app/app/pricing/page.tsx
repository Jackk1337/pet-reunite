"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      description: "Create your first pet profile and join the community",
      price: "£0",
      pricePerMonth: null,
      features: [
        "1 pet profile",
        "Basic QR code generation",
        "Community sightings feed",
        "Email notifications",
        "Free forever",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Reunite",
      description: "Everything you need to keep your pet protected",
      price: "£6.99",
      pricePerMonth: "per month",
      features: [
        "Up to 3 pet profiles",
        "Premium QR codes + 1 free dog tag",
        "Instant SMS & email alerts",
        "Interactive lost pet map",
        "Priority community support",
        "Pet status dashboard",
      ],
      cta: "Start Reunite",
      highlighted: true,
    },
    {
      name: "Reunite Plus",
      description: "Advanced tools for multi-pet households",
      price: "£13.99",
      pricePerMonth: "per month",
      features: [
        "Unlimited pet profiles",
        "Custom QR codes + 3 free dog tags",
        "Real-time location updates",
        "24/7 lost pet hotline",
        "Vet & medical notes storage",
        "Dedicated success manager",
      ],
      cta: "Go Reunite Plus",
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9fa' }}>
      {/* Header */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
          Choose the perfect plan to protect your furry friends
        </p>
        <p className="text-gray-500">No credit card required for the free plan</p>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div key={index} className={`transition-transform ${plan.highlighted ? "md:scale-105" : ""}`}>
              <Card
                className={`h-full p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-2 shadow-2xl"
                    : "border border-gray-200"
                }`}
                style={plan.highlighted ? { borderColor: '#ffb067', backgroundColor: '#fff5f0' } : {}}
              >
                {/* Header */}
                <div className="mb-6">
                  {plan.highlighted && (
                    <span className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ backgroundColor: '#ffb067' }}>
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.pricePerMonth && <span className="text-gray-600">/{plan.pricePerMonth}</span>}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`w-full mb-8 font-semibold ${
                    plan.highlighted
                      ? "hover:opacity-90"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                  style={plan.highlighted ? { backgroundColor: '#ffb067', color: 'white' } : {}}
                >
                  <Link href={plan.name === "Free" ? "/register?plan=free" : "/register"}>{plan.cta}</Link>
                </Button>

                {/* Features */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-4">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex gap-3 text-gray-700 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white border-t border-gray-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I change my plan anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and Apple Pay for your convenience.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
              },
              {
                q: "What happens if I cancel?",
                a: "Your data is retained for 30 days after cancellation. You can reactivate your account anytime.",
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes! Save 20% when you choose annual billing instead of monthly.",
              },
              {
                q: "Is there support for business accounts?",
                a: "We offer custom enterprise plans. Contact our sales team at sales@petreunite.com",
              },
            ].map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-white py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#ffb067' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to protect your pet?</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Start with our free plan or try any paid plan risk-free for 14 days.
          </p>
          <Button asChild size="lg" className="bg-white hover:bg-gray-100" style={{ color: '#ffb067' }}>
            <Link href="/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
