"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export function NavHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-2xl"
            style={{ color: '#ffb067' }}
          >
            <span className="text-2xl" style={{ color: '#665a58' }}>🐾</span>
            <span>PetReunite.io</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 transition"
              style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Home
            </Link>
            <Link
              href="/#pricing"
              className="text-gray-700 transition"
              style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Pricing
            </Link>
            <Link
              href="/missing-pets"
              className="text-gray-700 transition"
              style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Missing Pets
            </Link>
            <div className="flex gap-3 items-center">
              {user ? (
                <div className="relative profile-dropdown-container">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/pets"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        My Pets
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Edit Profile
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild style={{ backgroundColor: '#ffb067' }} className="hover:opacity-90">
                    <Link href="/#pricing">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-700 transition py-2"
              style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Home
            </Link>
            <Link
              href="/missing-pets"
              className="block text-gray-700 transition py-2"
              style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Missing Pets
            </Link>
            <Link
              href="/#pricing"
              className="block text-gray-700 transition py-2"
              style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              Pricing
            </Link>
            {user ? (
              <>
                <Link
                  href="/pets"
                  className="block text-gray-700 transition py-2"
                  style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  onClick={() => setIsOpen(false)}
                >
                  My Pets
                </Link>
                <Link
                  href="/profile"
                  className="block text-gray-700 transition py-2"
                  style={{ '--hover-color': '#ffb067' } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffb067'}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  onClick={() => setIsOpen(false)}
                >
                  Edit Profile
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  className="w-full hover:opacity-90"
                  style={{ backgroundColor: '#ffb067' }}
                >
                  <Link href="/#pricing">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
