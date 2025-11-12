"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PetProfileCard } from "@/components/pet-profile-card"
import { QRCodeDisplay } from "@/components/qr-code-display"

export default function PetProfilePage() {
  const [pets, setPets] = useState([
    {
      id: 1,
      name: "Max",
      type: "Dog",
      breed: "Golden Retriever",
      age: 3,
      color: "Golden",
      microchip: "985123456789012",
      image: "/golden-retriever-dog.jpg",
      qrCode: "https://petreunite.com/pet/1",
      contactName: "John Doe",
      contactPhone: "+1-555-0123",
      contactEmail: "john@example.com",
    },
    {
      id: 2,
      name: "Whiskers",
      type: "Cat",
      breed: "Tabby",
      age: 2,
      color: "Orange Tabby",
      microchip: "985123456789013",
      image: "/orange-tabby-cat.jpg",
      qrCode: "https://petreunite.com/pet/2",
      contactName: "John Doe",
      contactPhone: "+1-555-0123",
      contactEmail: "john@example.com",
    },
  ])

  const [selectedPet, setSelectedPet] = useState(pets[0])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9fa' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Pets</h1>
          <Button asChild style={{ backgroundColor: '#ffb067' }} className="hover:opacity-90">
            <Link href="/profile/add-pet">Add New Pet</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pet List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Pets</h2>
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedPet.id === pet.id
                      ? "border-2"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                  style={selectedPet.id === pet.id ? { backgroundColor: '#fff5f0', borderColor: '#ffb067' } : {}}
                >
                  <div className="font-semibold text-gray-900">{pet.name}</div>
                  <div className="text-sm text-gray-600">{pet.breed}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pet Details */}
          <div className="md:col-span-2 space-y-6">
            <PetProfileCard pet={selectedPet} />
            <QRCodeDisplay pet={selectedPet} />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href={`/profile/edit/${selectedPet.id}`}>Edit Profile</Link>
              </Button>
              <Button variant="destructive" className="w-full">
                Remove Pet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
