"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ShopPage() {
  const [cart, setCart] = useState<{ id: number; quantity: number }[]>([])

  const products = [
    {
      id: 1,
      name: "Personalized QR Code Collar Tag",
      category: "Collars & Tags",
      price: 24.99,
      rating: 4.8,
      reviews: 142,
      image: "/personalized-qr-collar-tag.jpg",
      description: "Durable aluminum tag with custom QR code and pet information",
    },
    {
      id: 2,
      name: "Smart GPS Pet Collar",
      category: "GPS Devices",
      price: 89.99,
      rating: 4.9,
      reviews: 87,
      image: "/smart-gps-pet-collar.jpg",
      description: "Real-time GPS tracking with 7-day battery life",
    },
    {
      id: 3,
      name: "Microchip Scanner",
      category: "Microchip",
      price: 149.99,
      rating: 4.7,
      reviews: 34,
      image: "/microchip-scanner-device.jpg",
      description: "Portable microchip reader for pet identification",
    },
    {
      id: 4,
      name: "Premium ID Card Set",
      category: "Collars & Tags",
      price: 19.99,
      rating: 4.6,
      reviews: 203,
      image: "/premium-pet-id-cards.jpg",
      description: "Set of 3 customizable ID cards with emergency contact info",
    },
    {
      id: 5,
      name: "LED Safety Collar",
      category: "Collars & Tags",
      price: 34.99,
      rating: 4.8,
      reviews: 156,
      image: "/led-safety-pet-collar.jpg",
      description: "Waterproof collar with LED light for visibility at night",
    },
    {
      id: 6,
      name: "Pet First Aid Kit",
      category: "Safety",
      price: 44.99,
      rating: 4.9,
      reviews: 96,
      image: "/pet-first-aid-kit.jpg",
      description: "Complete emergency first aid kit for pets",
    },
    {
      id: 7,
      name: "Reflective Harness",
      category: "Collars & Tags",
      price: 39.99,
      rating: 4.7,
      reviews: 124,
      image: "/reflective-pet-harness.jpg",
      description: "Comfortable harness with reflective strips for safety",
    },
    {
      id: 8,
      name: "Pet Tracking Device",
      category: "GPS Devices",
      price: 59.99,
      rating: 4.8,
      reviews: 211,
      image: "/pet-tracking-device.jpg",
      description: "Lightweight tracker with 30-day battery",
    },
  ]

  const handleAddToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) {
        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { id: productId, quantity: 1 }]
    })
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9fa' }}>
      {/* Header */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Pet Safety Shop</h1>
            <p className="text-lg text-gray-600">Premium products to keep your pets safe and protected</p>
          </div>
          <Button asChild variant="outline" className="relative bg-transparent">
            <Link href="/cart">
              Cart
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center -translate-y-2 translate-x-2" style={{ backgroundColor: '#ffb067' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-fit shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  {["All", "Collars & Tags", "GPS Devices", "Microchip", "Safety"].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={cat === "All"}
                        className="w-4 h-4 border-gray-300 rounded"
                        style={{ accentColor: '#ffb067' }}
                      />
                      <span className="text-gray-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {["Under $25", "$25 - $50", "$50 - $100", "Over $100"].map((price) => (
                    <label key={price} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 border-gray-300 rounded" style={{ accentColor: '#ffb067' }} />
                      <span className="text-gray-600">{price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Rating</h4>
                <div className="space-y-2">
                  {["⭐⭐⭐⭐⭐ (5 stars)", "⭐⭐⭐⭐ & up", "⭐⭐⭐ & up"].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 border-gray-300 rounded" style={{ accentColor: '#ffb067' }} />
                      <span className="text-gray-600 text-sm">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                    <span className="absolute top-3 right-3 text-white px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#ffb067' }}>
                      {product.category}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm">⭐ {product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold" style={{ color: '#ffb067' }}>${product.price.toFixed(2)}</span>
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        className="text-white hover:opacity-90"
                        style={{ backgroundColor: '#ffb067' }}
                        size="sm"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white border-t border-gray-200 mt-16 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-3">✓</div>
            <h3 className="font-bold text-gray-900 mb-2">Quality Guaranteed</h3>
            <p className="text-gray-600">All products tested and approved by pet experts</p>
          </div>
          <div>
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="font-bold text-gray-900 mb-2">Free Shipping</h3>
            <p className="text-gray-600">Orders over $50 ship free to your door</p>
          </div>
          <div>
            <div className="text-4xl mb-3">↩️</div>
            <h3 className="font-bold text-gray-900 mb-2">Easy Returns</h3>
            <p className="text-gray-600">30-day money-back guarantee on all items</p>
          </div>
        </div>
      </section>
    </div>
  )
}
