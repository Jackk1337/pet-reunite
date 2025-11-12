import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Counter } from "@/components/counter"

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9fa' }}>
      {/* Hero Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-16">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffb067' }}>
                <span className="text-xl font-bold" style={{ color: '#665a58' }}>🐾</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 ml-3">PetReunite</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">Track and find your lost pet</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
              Equip your pet with a smart QR tag, share their profile with the community, and get them home faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" style={{ backgroundColor: '#ffb067' }} className="hover:opacity-90">
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full lg:w-1/2 h-80 sm:h-[420px] lg:h-[560px]">
            <Image
              src="/hero-golden-retriever.png"
              alt="Happy dog reunited with its owner"
              fill
              className="object-cover rounded-3xl shadow-lg"
              style={{ objectPosition: "center 40%" }}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* Notification Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2">
              <div className="rounded-3xl shadow-xl p-6 sm:p-10 bg-transparent">
                <div className="relative h-72 sm:h-[480px] rounded-2xl overflow-hidden">
                  <Image
                    src="/notification-phone.png"
                    alt="Pet found notification on smartphone"
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                Get instantly notified when your pet is found with the finders contact details and map location
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Section */}
      <section id="pricing" className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900">
            So far, we've reunited <Counter target={187} /> lost pets
          </h2>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                </div>
                <p className="text-sm text-gray-600">One-time payment • For life</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">1 pet profile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">QR code generation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Basic notifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Community access</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-gray-600 hover:bg-gray-700">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Reunite Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 relative" style={{ borderColor: '#ffb067' }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="text-white px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#ffb067' }}>Popular</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Reunite</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                </div>
                <p className="text-sm text-gray-600">One-time payment • For life</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Up to 3 pet profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Premium QR codes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Instant notifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Map location tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Email alerts</span>
                </li>
              </ul>
              <Button asChild className="w-full hover:opacity-90" style={{ backgroundColor: '#ffb067' }}>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Reunite + Tier */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Reunite +</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$49</span>
                </div>
                <p className="text-sm text-gray-600">One-time payment • For life</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Unlimited pet profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Custom QR code designs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Real-time GPS tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">24/7 dedicated support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">SMS & email alerts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Veterinary records storage</span>
                </li>
              </ul>
              <Button asChild className="w-full hover:opacity-90" style={{ backgroundColor: '#ffb067' }}>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What people think of PetReunite</h2>
            <p className="mt-4 text-lg text-gray-600">
              Thousands of pet parents trust us to keep them connected with their furry family.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#ffb067', color: 'white' }}>
                  AS
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Alex Summers</p>
                  <p className="text-sm text-gray-500">Lost Max • Toronto</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                “We had our golden back within hours. The instant alert and map directions made all the difference.”
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#ffb067', color: 'white' }}>
                  JP
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Jenna Patel</p>
                  <p className="text-sm text-gray-500">Cat mom • Austin</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                “The community response blew me away. PetReunite kept my contact info safe but got the word out fast.”
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur shadow-lg rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: '#ffb067', color: 'white' }}>
                  MR
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Marcus Rivera</p>
                  <p className="text-sm text-gray-500">Rescue volunteer • Denver</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                “I help reunite pets every week. These smart tags and profiles make it effortless for finders and owners.”
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
