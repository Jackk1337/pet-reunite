"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export default function MissingPetsPage() {
  const [missingPets, setMissingPets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPet, setSelectedPet] = useState<any | null>(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("recently-lost")
  const [speciesFilter, setSpeciesFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const fetchMissingPets = async () => {
      setIsLoading(true)
      try {
        const q = query(
          collection(db, "pets"),
          where("isMissing", "==", true)
        )
        const querySnapshot = await getDocs(q)
        const petsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setMissingPets(petsData)
      } catch (error) {
        console.error("Error fetching missing pets from Firestore:", error)
        alert("Failed to load missing pets. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMissingPets()
  }, [])

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "Unknown"
    }
  }

  const formatLocation = (latLong: any) => {
    if (!latLong || !latLong.latitude || !latLong.longitude) {
      return "Location unknown"
    }
    return `${latLong.latitude.toFixed(4)}, ${latLong.longitude.toFixed(4)}`
  }

  const handleViewMap = (pet: any) => {
    if (pet.LatLong && pet.LatLong.latitude && pet.LatLong.longitude) {
      setSelectedPet(pet)
      setIsMapOpen(true)
    }
  }

  const getGoogleMapsUrl = (latLong: any) => {
    if (!latLong || !latLong.latitude || !latLong.longitude) {
      return ""
    }
    return `https://www.google.com/maps?q=${latLong.latitude},${latLong.longitude}&output=embed`
  }

  // Get unique species from all missing pets
  const getUniqueSpecies = () => {
    const species = missingPets
      .map((pet) => pet.species)
      .filter((species) => species && species.trim() !== "")
    return Array.from(new Set(species)).sort()
  }

  // Filter and sort pets
  const getFilteredAndSortedPets = () => {
    let filtered = [...missingPets]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((pet) =>
        pet.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply species filter
    if (speciesFilter !== "all") {
      filtered = filtered.filter((pet) => pet.species === speciesFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = a.lastFoundAt || a.missingDate || ""
      const dateB = b.lastFoundAt || b.missingDate || ""

      if (sortBy === "recently-lost") {
        // Most recent first
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      } else if (sortBy === "oldest-lost") {
        // Oldest first
        return new Date(dateA).getTime() - new Date(dateB).getTime()
      } else if (sortBy === "species") {
        // Sort by species alphabetically
        const speciesA = (a.species || "").toLowerCase()
        const speciesB = (b.species || "").toLowerCase()
        return speciesA.localeCompare(speciesB)
      }
      return 0
    })

    return filtered
  }

  const filteredPets = getFilteredAndSortedPets()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9fa' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Missing Pets</h1>
          <p className="text-lg text-gray-600">
            Help reunite these lost pets with their families
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by pet name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0"
                style={{ '--tw-ring-color': '#ffb067' } as React.CSSProperties}
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': '#ffb067' } as React.CSSProperties}
            >
              <option value="recently-lost">Recently Lost</option>
              <option value="oldest-lost">Oldest Lost</option>
              <option value="species">Species</option>
            </select>

            {/* Species Filter */}
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': '#ffb067' } as React.CSSProperties}
            >
              <option value="all">All Species</option>
              {getUniqueSpecies().map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-gray-600">
              Showing {filteredPets.length} of {missingPets.length} missing pets
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : missingPets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Missing Pets</h3>
            <p className="text-gray-600">
              There are currently no pets reported as missing. Check back later!
            </p>
          </Card>
        ) : filteredPets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              No pets match your search criteria. Try adjusting your filters.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                {/* Pet Image */}
                <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                  {pet.image ? (
                    <>
                      <img
                        src={pet.image}
                        alt={pet.name || "Missing pet"}
                        className="w-full h-full object-cover"
                      />
                      {pet.isMissing && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg">
                          Missing
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl relative" style={{ backgroundColor: '#fff5f0' }}>
                      🐾
                      {pet.isMissing && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg">
                          Missing
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pet Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {pet.name || "Unknown Pet"}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date Missing</p>
                      <p className="text-gray-900 font-semibold">
                        {formatDate(pet.lastFoundAt || pet.missingDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Known Location</p>
                      <p className="text-gray-900 font-semibold mb-2">
                        {formatLocation(pet.LatLong)}
                      </p>
                      {pet.LatLong && pet.LatLong.latitude && pet.LatLong.longitude ? (
                        <Button
                          onClick={() => handleViewMap(pet)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          View Map
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* View Pet Profile Button */}
                  {pet.qrCode ? (
                    <Button
                      asChild
                      className="w-full hover:opacity-90"
                      style={{ backgroundColor: '#ffb067' }}
                    >
                      <Link href={`/pet/${pet.qrCode}`}>View Pet Profile</Link>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full"
                      variant="outline"
                    >
                      Profile Unavailable
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Map Modal */}
        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogContent className="max-w-4xl w-full h-[600px] p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>
                {selectedPet?.name ? `${selectedPet.name}'s Last Known Location` : "Pet Location"}
              </DialogTitle>
            </DialogHeader>
            <div className="w-full h-[500px] px-6 pb-6">
              {selectedPet?.LatLong ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={getGoogleMapsUrl(selectedPet.LatLong)}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Location not available
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

