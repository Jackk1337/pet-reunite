"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PetProfileForm } from "@/components/pet-profile-form";
import { PetProfileList } from "@/components/pet-profile-list";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

export default function PetsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPet, setEditingPet] = useState<any | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [editFormKey, setEditFormKey] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPets, setIsFetchingPets] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [reportingPet, setReportingPet] = useState<any | null>(null);
  const [missingDate, setMissingDate] = useState("");
  const [missingTime, setMissingTime] = useState("");
  const [missingNotes, setMissingNotes] = useState("");
  const [notifyVet, setNotifyVet] = useState(false);
  const [notifyShelters, setNotifyShelters] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<
    google.maps.LatLngLiteral | null
  >(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({
    lat: 39.8097343,
    lng: -98.5556199,
  });
  const [isSavingMissingReport, setIsSavingMissingReport] = useState(false);
  const [showReunitedModal, setShowReunitedModal] = useState(false);
  const [petBeingReunited, setPetBeingReunited] = useState<any | null>(null);
  const [isSavingReunited, setIsSavingReunited] = useState(false);
  const router = useRouter();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "pet-reunite-maps",
    googleMapsApiKey: googleMapsApiKey ?? "",
  });

  // Fetch pets from Firestore
  const fetchPets = async (userId: string) => {
    setIsFetchingPets(true);
    try {
      const q = query(collection(db, "pets"), where("OwnerID", "==", userId));
      const querySnapshot = await getDocs(q);
      const petsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPets(petsData);
    } catch (error) {
      console.error("Error fetching pets from Firestore:", error);
      alert("Failed to load pets. Please refresh the page.");
    } finally {
      setIsFetchingPets(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/login");
      } else {
        // Fetch pets when user is authenticated
        fetchPets(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAddPet = async (petData: any) => {
    if (!user) {
      alert("You must be logged in to add a pet");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare pet data for Firestore
      const petDocument = {
        OwnerID: user.uid, // AccountID equals the user's UID
        name: petData.name,
        species:
          petData.species === "other" && petData.customSpecies
            ? petData.customSpecies
            : petData.species,
        breed: petData.breed || "",
        age: petData.age || "",
        color: petData.color || "",
        microchip: petData.microchip || "",
        qrCode: petData.qrCode || "",
        image: petData.image || "",
        vetname: petData.vetname || "",
        vetaddress: petData.vetaddress || "",
        createdAt: new Date().toISOString(),
      };

      // Add pet to Firestore
      const docRef = await addDoc(collection(db, "pets"), petDocument);

      // Refetch pets to get the latest data
      await fetchPets(user.uid);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding pet to Firestore:", error);
      alert("Failed to save pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowForm(open);
    if (open) {
      setFormKey((prev) => prev + 1);
    }
  };

  const handleEditPet = (pet: any) => {
    setEditingPet(pet);
    setShowEditForm(true);
    setEditFormKey((prev) => prev + 1);
  };

  const handleEditOpenChange = (open: boolean) => {
    setShowEditForm(open);
    if (!open) {
      setEditingPet(null);
    } else if (editingPet) {
      setEditFormKey((prev) => prev + 1);
    }
  };

  const handleUpdatePet = async (petData: any) => {
    if (!user || !editingPet) {
      alert("You must be logged in to update a pet");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare updated pet data for Firestore (excluding QR Code)
      const updatedPetDocument: any = {
        name: petData.name,
        species:
          petData.species === "other" && petData.customSpecies
            ? petData.customSpecies
            : petData.species,
        breed: petData.breed || "",
        age: petData.age || "",
        color: petData.color || "",
        microchip: petData.microchip || "",
        vetname: petData.vetname || "",
        vetaddress: petData.vetaddress || "",
        // QR Code is not updated - keep the original
        updatedAt: new Date().toISOString(),
      };

      // Update image if a new one was uploaded
      if (petData.image) {
        updatedPetDocument.image = petData.image;
      }

      // Update pet in Firestore
      const petRef = doc(db, "pets", editingPet.id);
      await updateDoc(petRef, updatedPetDocument);

      // Refetch pets to get the latest data
      await fetchPets(user.uid);
      setShowEditForm(false);
      setEditingPet(null);
    } catch (error) {
      console.error("Error updating pet in Firestore:", error);
      alert("Failed to update pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportMissing = (pet: any) => {
    setReportingPet(pet);
    setMissingDate(new Date().toISOString().split("T")[0]);
    setMissingTime("");
    setMissingNotes("");

    if (pet?.LatLong?.latitude && pet?.LatLong?.longitude) {
      const existingLocation = {
        lat: pet.LatLong.latitude,
        lng: pet.LatLong.longitude,
      };
      setMarkerPosition(existingLocation);
      setMapCenter(existingLocation);
    } else {
      setMarkerPosition(null);
      setMapCenter({
        lat: 39.8097343,
        lng: -98.5556199,
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(currentLocation);
          setMapCenter(currentLocation);
        });
      }
    }

    setShowMissingModal(true);
  };

  const resetMissingState = () => {
    setReportingPet(null);
    setMissingDate("");
    setMissingTime("");
    setMissingNotes("");
    setNotifyVet(false);
    setNotifyShelters(false);
    setMarkerPosition(null);
  };

  const handleMissingOpenChange = (open: boolean) => {
    setShowMissingModal(open);
    if (!open) {
      resetMissingState();
    }
  };

  const handleMapInteraction = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setMarkerPosition(newPosition);
        setMapCenter(newPosition);
      }
    },
    []
  );

  const handleSaveMissingReport = async () => {
    if (!user || !reportingPet) {
      alert("You must be logged in to report a missing pet.");
      return;
    }

    if (!markerPosition) {
      alert("Please select an approximate location on the map.");
      return;
    }

    if (!missingDate || !missingTime) {
      alert("Please provide the date and approximate time the pet was lost.");
      return;
    }

    setIsSavingMissingReport(true);
    try {
      const lostLatLong = {
        latitude: markerPosition.lat,
        longitude: markerPosition.lng,
      };

      const petRef = doc(db, "pets", reportingPet.id);
      await updateDoc(petRef, {
        isMissing: true,
        LatLong: lostLatLong,
        missingReport: {
          lostDate: missingDate,
          lostTime: missingTime,
          notes: missingNotes,
          location: lostLatLong,
          reportedAt: new Date().toISOString(),
        },
      });

      await fetchPets(user.uid);
      handleMissingOpenChange(false);
    } catch (error) {
      console.error("Error reporting missing pet:", error);
      alert("Failed to save missing report. Please try again.");
    } finally {
      setIsSavingMissingReport(false);
    }
  };

  const handleMarkReunited = (pet: any) => {
    if (!user) {
      alert("You must be logged in to update your pet status.");
      return;
    }
    setPetBeingReunited(pet);
    setShowReunitedModal(true);
  };

  const handleConfirmReunited = async (helped: boolean) => {
    if (!user || !petBeingReunited) {
      alert("Unable to record reunion. Please try again.");
      return;
    }

    setIsSavingReunited(true);
    try {
      const petRef = doc(db, "pets", petBeingReunited.id);
      await updateDoc(petRef, {
        isMissing: false,
        reunitedFeedback: helped,
        missingReport: {
          ...(petBeingReunited.missingReport || {}),
          reunitedAt: new Date().toISOString(),
          petReuniteHelped: helped,
        },
      });
      await fetchPets(user.uid);
      setShowReunitedModal(false);
      setPetBeingReunited(null);
    } catch (error) {
      console.error("Error updating pet status:", error);
      alert("Failed to update pet status. Please try again.");
    } finally {
      setIsSavingReunited(false);
    }
  };

  const handleReunitedOpenChange = (open: boolean) => {
    setShowReunitedModal(open);
    if (!open) {
      setPetBeingReunited(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f9fa" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Pets</h1>
          <p className="text-lg text-gray-600">
            Create and manage your pet profiles
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-1 gap-8">
          {/* Pets List Section */}
          <div>
            {isFetchingPets ? (
              <Card className="p-12 text-center shadow-lg">
                <div className="text-4xl mb-4 animate-pulse">🐾</div>
                <p className="text-gray-600">Loading your pets...</p>
              </Card>
            ) : pets.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Pets
                  </h2>
                  <Button
                    onClick={() => setShowForm(true)}
                    style={{ backgroundColor: "#ffb067" }}
                    className="hover:opacity-90"
                  >
                    Create Pet Profile
                  </Button>
                </div>
                <PetProfileList
                  pets={pets}
                  onEdit={handleEditPet}
                  onReportMissing={handleReportMissing}
                  onMarkReunited={handleMarkReunited}
                />
              </div>
            ) : (
              <Card className="p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No pets yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first pet profile to get started with PetReunite
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  style={{ backgroundColor: "#ffb067" }}
                  className="hover:opacity-90"
                >
                  Create Your First Pet
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Create Pet Modal */}
        <Dialog open={showForm} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Pet Profile</DialogTitle>
              <DialogDescription>
                Fill in your pet's information and enter the QR code from your
                order.
              </DialogDescription>
            </DialogHeader>
            <PetProfileForm key={formKey} onSubmit={handleAddPet} />
            {isLoading && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Saving pet to database...
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Missing Pet Modal */}
        <Dialog open={showMissingModal} onOpenChange={handleMissingOpenChange}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Report {reportingPet?.name || "pet"} as Missing
              </DialogTitle>
              <DialogDescription>
                Share the last known location and additional details to alert the
                community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Approximate location
                </p>
                <div className="h-72 rounded-lg overflow-hidden border border-gray-200">
                  {!googleMapsApiKey ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-gray-600">
                      Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your
                      environment to enable map reporting.
                    </div>
                  ) : isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={markerPosition || mapCenter}
                      zoom={13}
                      onClick={handleMapInteraction}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                      }}
                    >
                      {markerPosition && (
                        <Marker
                          position={markerPosition}
                          draggable
                          onDragEnd={handleMapInteraction}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      Loading map...
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Drag the pin to where your pet was last seen. We’ll store the
                  latitude and longitude to share with searchers.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="lost-date"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Date pet was lost
                  </label>
                  <input
                    id="lost-date"
                    type="date"
                    value={missingDate}
                    onChange={(e) => setMissingDate(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="lost-time"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    Approx. time pet was lost
                  </label>
                  <input
                    id="lost-time"
                    type="time"
                    value={missingTime}
                    onChange={(e) => setMissingTime(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="lost-notes"
                  className="text-sm font-medium text-gray-700 mb-1"
                >
                  Other information
                </label>
                <textarea
                  id="lost-notes"
                  value={missingNotes}
                  onChange={(e) => setMissingNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe what happened, what your pet was wearing, or anything that can help searchers."
                  className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                <label className="text-sm font-semibold text-gray-800">
                  Notifications
                </label>
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    checked={notifyVet}
                    onChange={(e) => setNotifyVet(e.target.checked)}
                  />
                  <span>Do you want to alert your vet that your pet is lost?</span>
                </label>
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                    checked={notifyShelters}
                    onChange={(e) => setNotifyShelters(e.target.checked)}
                  />
                  <span>
                    Do you want to let local animal shelters know your pet is lost?
                  </span>
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleMissingOpenChange(false)}
                  disabled={isSavingMissingReport}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleSaveMissingReport}
                  disabled={isSavingMissingReport || !googleMapsApiKey}
                >
                  {isSavingMissingReport
                    ? "Saving..."
                    : !googleMapsApiKey
                      ? "Enable Maps to Report"
                      : "Report Missing"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Pet Modal */}
        <Dialog open={showEditForm} onOpenChange={handleEditOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Pet Profile</DialogTitle>
              <DialogDescription>
                Update your pet's information. QR Code cannot be changed.
              </DialogDescription>
            </DialogHeader>
            {editingPet && (
              <PetProfileForm
                key={editFormKey}
                onSubmit={handleUpdatePet}
                initialData={{
                  name: editingPet.name,
                  species: editingPet.species,
                  breed: editingPet.breed || "",
                  age: editingPet.age || "",
                  color: editingPet.color || "",
                  microchip: editingPet.microchip || "",
                  qrCode: editingPet.qrCode || "",
                  image: editingPet.image || null,
                  vetname: editingPet.vetname || "",
                  vetaddress: editingPet.vetaddress || "",
                }}
                isEditMode={true}
              />
            )}
            {isLoading && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Updating pet in database...
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reunited Feedback Modal */}
        <Dialog open={showReunitedModal} onOpenChange={handleReunitedOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>That's great that you found your pet!</DialogTitle>
              <DialogDescription>
                Did PetReunite help you find your pet?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex flex-col gap-4">
              <Button
                disabled={isSavingReunited}
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleConfirmReunited(true)}
              >
                Yes
              </Button>
              <Button
                variant="outline"
                disabled={isSavingReunited}
                onClick={() => handleConfirmReunited(false)}
              >
                No
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
