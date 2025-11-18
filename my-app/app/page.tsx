"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Counter } from "@/components/counter"
import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    initials: "AS",
    name: "Alex Summers",
    location: "Lost Max • Toronto",
    quote: "We had our golden back within hours. The instant alert and map directions made all the difference.",
  },
  {
    initials: "JP",
    name: "Jenna Patel",
    location: "Cat mom • Austin",
    quote: "The community response blew me away. PetReunite kept my contact info safe but got the word out fast.",
  },
  {
    initials: "MR",
    name: "Marcus Rivera",
    location: "Rescue volunteer • Denver",
    quote: "I help reunite pets every week. These smart tags and profiles make it effortless for finders and owners.",
  },
  {
    initials: "SK",
    name: "Sarah Kim",
    location: "Lost Luna • Seattle",
    quote: "Within 30 minutes of reporting Luna missing, we got a call. The QR code system is brilliant - it works instantly!",
  },
  {
    initials: "TJ",
    name: "Tom Johnson",
    location: "Dog dad • Miami",
    quote: "Best investment I've made for my pet. The peace of mind knowing we have this system in place is priceless.",
  },
  {
    initials: "LM",
    name: "Lisa Martinez",
    location: "Multi-pet owner • Phoenix",
    quote: "Managing multiple pets is easy with PetReunite. The profiles are comprehensive and the alerts are reliable.",
  },
  {
    initials: "DW",
    name: "David Wang",
    location: "Lost Bella • San Francisco",
    quote: "The map feature saved us hours of searching. We found Bella exactly where the system showed she was spotted.",
  },
  {
    initials: "EP",
    name: "Emma Parker",
    location: "Cat owner • Boston",
    quote: "As someone who travels a lot, knowing my cat's profile is accessible to the community gives me total confidence.",
  },
]

export default function HomePage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    slidesToScroll: 1,
  })
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setPrevBtnEnabled(emblaApi.canScrollPrev())
    setNextBtnEnabled(emblaApi.canScrollNext())
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-16 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 via-transparent to-orange-100/20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50">
                <span className="text-xl font-bold text-white">🐾</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent ml-3">PetReunite</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
              Track and find your <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">lost pet</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
              Equip your pet with a smart QR tag, share their profile with the community, and get them home faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full lg:w-1/2 h-80 sm:h-[420px] lg:h-[560px] group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative h-full rounded-3xl shadow-2xl overflow-hidden ring-4 ring-orange-200/50">
              <Image
                src="/hero-golden-retriever.png"
                alt="Happy dog reunited with its owner"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                style={{ objectPosition: "center 40%" }}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notification Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-16 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,176,103,0.1),transparent_70%)]"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 group">
              <div className="rounded-3xl shadow-2xl p-6 sm:p-10 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm border border-gray-200/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
                <div className="relative h-72 sm:h-[480px] rounded-2xl overflow-hidden ring-2 ring-orange-200/30 group-hover:ring-orange-300/50 transition-all duration-300">
                  <Image
                    src="/notification-phone.png"
                    alt="Pet found notification on smartphone"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 leading-tight">
                Get <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">instantly notified</span> when your pet is found with the finders contact details and map location
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Section */}
      <section id="pricing" className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-transparent to-orange-100/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-200/20 to-orange-300/20 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              So far, we've reunited{' '}
            </span>
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              <Counter target={187} />
            </span>
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {' '}lost pets
            </span>
          </h2>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 items-start">
            {/* Free Tier */}
            <div className="group relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-100/0 to-gray-100/0 group-hover:from-gray-100/50 group-hover:to-gray-100/0 rounded-2xl transition-all duration-300"></div>
              <div className="relative text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">£0</span>
                </div>
                <p className="text-sm text-gray-600">Free forever</p>
              </div>
              <ul className="space-y-4 mb-8 relative flex-1">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Unlimited pet profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">QR code generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Create missing pet posters</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Community updates and access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">SMS / Call / Email alerts if your pet is found</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 mt-auto">
                <Link href="/register?plan=free">Get Started</Link>
              </Button>
            </div>

            {/* Reunite Tier */}
            <div className="group relative bg-gradient-to-br from-white via-orange-50/30 to-white p-8 rounded-2xl shadow-2xl border-2 border-orange-300 hover:border-orange-400 transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex flex-col h-full">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                <span className="text-white px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50">Popular</span>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent rounded-2xl"></div>
              <div className="relative text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">Reunite</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">£6.99</span>
                </div>
                <p className="text-sm text-gray-600">Per month • Cancel anytime</p>
              </div>
              <ul className="space-y-4 mb-8 relative flex-1">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">1 free pet tag</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Unlimited pet profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">QR code generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Free missing pet posters whenever you need them</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Community updates and access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">SMS / Call / Email alerts if your pet is found</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 mt-auto">
                <Link href="/onboarding/tags?plan=reunite">Get Started</Link>
              </Button>
            </div>

            {/* Reunite + Tier */}
            <div className="group relative bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-100/0 to-gray-100/0 group-hover:from-gray-100/50 group-hover:to-gray-100/0 rounded-2xl transition-all duration-300"></div>
              <div className="relative text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Reunite +</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">£13.99</span>
                </div>
                <p className="text-sm text-gray-600">Per month • Cancel anytime</p>
              </div>
              <ul className="space-y-4 mb-8 relative flex-1">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">3 free pet tags</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Unlimited pet profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">QR code generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Free missing pet posters whenever you need them</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700">Community updates and access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-gray-700 italic">GPS tracking capabilities (coming soon)</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 mt-auto">
                <Link href="/onboarding/tags?plan=reunite-plus">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/20 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              What people think of <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">PetReunite</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Thousands of pet parents trust us to keep them connected with their furry family.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="group relative flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0"
                  >
                    <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md shadow-lg rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl hover:border-orange-200/50 transition-all duration-300 hover:-translate-y-1 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/0 group-hover:from-orange-50/30 group-hover:to-orange-50/0 rounded-2xl transition-all duration-300"></div>
                      <div className="relative flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30">
                          {testimonial.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.location}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed relative">
                        "{testimonial.quote}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className="rounded-full w-12 h-12 border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-orange-600" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "bg-orange-500 w-8"
                        : "bg-gray-300 hover:bg-orange-400"
                    }`}
                    onClick={() => emblaApi?.scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className="rounded-full w-12 h-12 border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 hover:text-orange-600" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
