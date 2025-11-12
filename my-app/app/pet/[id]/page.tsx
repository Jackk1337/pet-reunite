"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

export default function PetProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [pet, setPet] = useState<any | null>(null);
  const [owner, setOwner] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFound, setIsFound] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch pet by QR code
  useEffect(() => {
    const fetchPet = async () => {
      // Validate resolvedParams.id exists
      if (!resolvedParams?.id) {
        console.error("No QR code provided in URL");
        setPet(null);
        setIsLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "pets"),
          where("qrCode", "==", resolvedParams.id)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const petDoc = querySnapshot.docs[0];
          const petData: any = {
            id: petDoc.id,
            ...petDoc.data(),
          };
          setPet(petData);
          setIsFound(petData.isMissing === true);

          // Fetch owner information
          if (petData.OwnerID) {
            try {
              const ownerRef = doc(db, "users", petData.OwnerID);
              const ownerSnap = await getDoc(ownerRef);
              if (ownerSnap.exists()) {
                setOwner(ownerSnap.data());
              }
            } catch (ownerError) {
              console.error("Error fetching owner:", ownerError);
              // Continue even if owner fetch fails
            }
          }
        } else {
          setPet(null);
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
        // Don't show alert, just set pet to null and let the UI handle it
        setPet(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPet();
  }, [resolvedParams.id]);

  const handleFoundPet = async () => {
    if (!pet) return;

    setIsGettingLocation(true);
    setLocationError(null);

    // Request user's location
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latLong = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Update pet in Firestore
          const petRef = doc(db, "pets", pet.id);
          await updateDoc(petRef, {
            LatLong: latLong,
            isMissing: true,
            lastFoundAt: new Date().toISOString(),
          });

          // Update local state
          setPet({
            ...pet,
            LatLong: latLong,
            isMissing: true,
          });
          setIsFound(true);
        } catch (error) {
          console.error("Error updating pet location:", error);
          alert("Failed to update pet location. Please try again.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          "Failed to get your location. Please enable location services."
        );
        setIsGettingLocation(false);
      }
    );
  };

  const handleCallOwner = () => {
    if (owner?.phone || owner?.email) {
      // Try phone first, fallback to email
      const phone = owner.phone || owner.email;
      window.location.href = `tel:${phone}`;
    }
  };

  const handleTextOwner = () => {
    if (owner?.phone) {
      window.location.href = `sms:${owner.phone}`;
    } else if (owner?.email) {
      window.location.href = `mailto:${owner.email}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🐾</div>
          <p className="text-gray-600">Loading pet information...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pet Not Found
          </h1>
          <p className="text-gray-600">
            The QR code you scanned does not match any pet in our database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Status Badge */}
        {pet.isMissing && (
          <div className="mb-6">
            <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold text-sm">
              🚨 Missing Pet Alert
            </span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pet Image */}
          <div className="relative">
            {pet.image ? (
              <>
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-full rounded-xl shadow-lg"
                />
                {pet.isMissing && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                    Missing
                  </div>
                )}
              </>
            ) : (
              <div
                className="w-full h-96 rounded-xl flex items-center justify-center text-6xl relative"
                style={{ backgroundColor: "#fff5f0" }}
              >
                🐾
                {pet.isMissing && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                    Missing
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pet Details */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {pet.name}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {pet.species} {pet.breed && `• ${pet.breed}`}
            </p>

            <Card className="p-6 space-y-4 mb-6">
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Species</p>
                <p className="text-lg font-semibold text-gray-900">
                  {pet.species}
                </p>
              </div>
              {pet.breed && (
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Breed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.breed}
                  </p>
                </div>
              )}
              {pet.age && (
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.age} years
                  </p>
                </div>
              )}
              {pet.color && (
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Color/Markings</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.color}
                  </p>
                </div>
              )}
              {pet.microchip && (
                <div>
                  <p className="text-sm text-gray-600">Microchip ID</p>
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {pet.microchip}
                  </p>
                </div>
              )}
            </Card>

            {/* I've Found This Pet Button */}
            {!isFound && (
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 mb-4 text-white"
                onClick={handleFoundPet}
                disabled={isGettingLocation}
              >
                {isGettingLocation
                  ? "Getting your location..."
                  : "I've found this pet"}
              </Button>
            )}

            {locationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {locationError}
              </div>
            )}

            {/* Call and Text Owner Buttons - Only show after pet is found */}
            {isFound && (
              <div className="space-y-3 mb-4">
                <Button
                  size="lg"
                  className="w-full hover:opacity-90"
                  style={{ backgroundColor: "#ffb067" }}
                  onClick={handleCallOwner}
                >
                  📞 Call Owner
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleTextOwner}
                >
                  💬 Text Owner
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Map Section - Only show after pet is found and has location */}
        {isFound && pet.LatLong && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Last Known Location
              </h2>
              <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFMErHz1JgoLdTRGSbXSAqzeo9e-8pUMM&q=${pet.LatLong.latitude},${pet.LatLong.longitude}&zoom=15`}
                />
              </div>
              {pet.lastFoundAt && (
                <p className="text-sm text-gray-600 mt-2">
                  Last reported: {new Date(pet.lastFoundAt).toLocaleString()}
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
