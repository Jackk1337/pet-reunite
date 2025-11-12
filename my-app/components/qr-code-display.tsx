"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Pet {
  id: number
  name: string
  type: string
  breed: string
  age: number
  color: string
  microchip: string
  image: string
  qrCode: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

interface QRCodeDisplayProps {
  pet: Pet
}

export function QRCodeDisplay({ pet }: QRCodeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadQRCode = () => {
    setIsDownloading(true)
    // Simulate download
    setTimeout(() => setIsDownloading(false), 1000)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">QR Code</h3>

      <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center mb-6 border-2 border-dashed border-gray-300">
        <div className="w-48 h-48 bg-white border-4 border-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">█████</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">█████</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">█████</div>
            <div className="text-xs text-gray-600 mt-4">(QR Code for {pet.name})</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Share this QR code with your veterinarian, trainer, or print it on {pet.name}'s collar. Anyone who scans it will
        see {pet.name}'s profile and be able to contact you.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={downloadQRCode} disabled={isDownloading} className="hover:opacity-90" style={{ backgroundColor: '#ffb067' }}>
          {isDownloading ? "Downloading..." : "Download QR Code"}
        </Button>
        <Button variant="outline">Print QR Code</Button>
      </div>
    </div>
  )
}
