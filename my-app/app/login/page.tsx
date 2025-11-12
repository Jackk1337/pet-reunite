"use client";

import type React from "react";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/pets");
    } catch (err: any) {
      const message =
        err?.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err?.message || "Failed to sign in.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user account ID to Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Only create the document if it doesn't exist
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          accountId: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
        });
      }

      router.push("/pets");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#f9f9fa' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-3xl mb-6"
            style={{ color: '#ffb067' }}
          >
            <span className="text-3xl" style={{ color: '#665a58' }}>🐾</span>
            <span>PetReunite</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Sign in to your account to manage your pets
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded focus:ring-2"
                  style={{ accentColor: '#ffb067' }}
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link
                href="#"
                className="font-medium"
                style={{ color: '#ffb067' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-2 hover:opacity-90"
              style={{ backgroundColor: '#ffb067' }}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-gray-300 bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 bg-transparent"
            >
              Apple
            </Button>
          </div>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold"
              style={{ color: '#ffb067' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
