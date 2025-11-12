"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(true)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Check password match
    if (name === "confirmPassword" || name === "password") {
      const pass = name === "password" ? value : formData.password
      const confirm = name === "confirmPassword" ? value : formData.confirmPassword
      setPasswordMatch(pass === confirm || confirm === "")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordMatch) return

    setIsLoading(true)
    // Simulate auth
    setTimeout(() => {
      setIsLoading(false)
      setFormData({ fullName: "", email: "", password: "", confirmPassword: "" })
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#f9f9fa' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-3xl mb-6" style={{ color: '#ffb067' }}>
            <span className="text-3xl" style={{ color: '#665a58' }}>🐾</span>
            <span>PetReunite</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join PetReunite to protect your furry friends</p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters, 1 uppercase, 1 number</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                  !passwordMatch && formData.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {!passwordMatch && formData.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 border-gray-300 rounded focus:ring-2 mt-1"
                style={{ accentColor: '#ffb067' }}
                required
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="#" className="hover:underline" style={{ color: '#ffb067' }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="hover:underline" style={{ color: '#ffb067' }}>
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !passwordMatch}
              className="w-full text-white font-semibold py-2 hover:opacity-90"
              style={{ backgroundColor: '#ffb067' }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="border-gray-300 bg-transparent">
              Google
            </Button>
            <Button variant="outline" className="border-gray-300 bg-transparent">
              Apple
            </Button>
          </div>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: '#ffb067' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
