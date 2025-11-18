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
  deleteDoc,
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
  const [posterPet, setPosterPet] = useState<any | null>(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [qrPet, setQrPet] = useState<any | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleGeneratePosters = (pet: any) => {
    setPosterPet(pet);
    setShowPosterModal(true);
  };

  const handlePosterOpenChange = (open: boolean) => {
    setShowPosterModal(open);
    if (!open) {
      setPosterPet(null);
    }
  };

  const handleShowQrModal = (pet: any) => {
    setQrPet(pet);
    setShowQrModal(true);
  };

  const handleDownloadQr = () => {
    if (!qrPet) return;
    const link = document.createElement("a");
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
      `https://petreunite.io/pet/${qrPet.qrCode || qrPet.id}`
    )}`;
    link.href = qrUrl;
    link.download = `${qrPet.name || "pet"}-qr-code.png`;
    link.click();
  };

  const handleDownloadPoster = () => {
    if (!posterPet) return;

    const lostDateTime = (() => {
      const date = posterPet?.missingReport?.lostDate;
      if (!date) return "Unknown";
      const time = posterPet?.missingReport?.lostTime || "00:00";
      const parsed = new Date(`${date}T${time}`);
      if (Number.isNaN(parsed.getTime())) {
        return date;
      }
      return parsed.toLocaleString();
    })();

    const imageBlock = posterPet?.image
      ? `<img src="${posterPet.image}" alt="${posterPet.name}" style="width:100%;height:320px;object-fit:cover;border-radius:16px;margin-bottom:16px;" />`
      : `<div style="width:100%;height:320px;border-radius:16px;background:#ffe6d2;display:flex;align-items:center;justify-content:center;font-size:72px;margin-bottom:16px;">🐾</div>`;

    const printableHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Missing Poster - ${posterPet.name}</title>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 32px; background: #f7f7f7; }
      .poster { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 24px; padding: 32px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); }
      .banner { text-align: center; font-size: 42px; letter-spacing: 2px; font-weight: 800; color: #c2410c; margin-bottom: 24px; }
      .name { text-align: center; font-size: 36px; font-weight: 700; margin-bottom: 8px; color: #111827; }
      .badge { display: inline-flex; align-items: center; gap: 6px; background: #fee2e2; color: #b91c1c; padding: 6px 14px; border-radius: 999px; font-weight: 600; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
      .grid div { background: #f9fafb; border-radius: 12px; padding: 12px; }
      .label { font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.08em; margin-bottom: 4px; }
      .value { font-size: 16px; color: #111827; font-weight: 600; }
      .qr-card { display:flex; align-items:center; gap:16px; background:linear-gradient(135deg,#fff7ed,#fffbeb); border-radius:16px; padding:16px; margin-top:12px; border:1px solid #fed7aa; box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
      .qr-card img { width:110px; height:110px; border-radius:12px; border:1px dashed #f59e0b; background:#fff; padding:8px; }
      .qr-text { font-size:15px; color:#92400e; font-weight:600; line-height:1.4; }
    </style>
  </head>
  <body>
    <div class="poster">
      <div class="banner">MISSING PET</div>
      <div style="width:100%;height:320px;border-radius:16px;overflow:hidden;margin-bottom:16px;background:#ffe6d2;display:flex;align-items:center;justify-content:center;">
        ${
          posterPet?.image
            ? `<img src="${posterPet.image}" alt="${posterPet.name}" style="max-width:100%;max-height:100%;object-fit:contain;" />`
            : `<span style="font-size:72px;">🐾</span>`
        }
      </div>
      <div class="name">${posterPet.name}</div>
      <div style="text-align:center;margin-bottom:24px;">
        <span class="badge">Lost • ${lostDateTime}</span>
      </div>
      <div class="grid">
        <div>
          <div class="label">Breed</div>
          <div class="value">${posterPet.breed || "Unknown"}</div>
        </div>
        <div>
          <div class="label">Color</div>
          <div class="value">${posterPet.color || "Unknown"}</div>
        </div>
      </div>
      <div class="qr-card" style="page-break-inside: avoid;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
          `https://petreunite.io/pet/${posterPet.qrCode || posterPet.id}`
        )}" alt="QR code" />
        <p class="qr-text">Please scan this QR code to view the owner's contact details.</p>
      </div>
      <div style="text-align:center;margin-top:20px;font-size:14px;font-weight:600;color:#9a3412;">
        PetReunite.io
      </div>
    </div>
    <script>
      window.onload = function() {
        window.print();
      };
    </script>
  </body>
</html>`;

    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (printWindow) {
      printWindow.document.write(printableHtml);
      printWindow.document.close();
    } else {
      alert("Please allow pop-ups to download the missing poster.");
    }
  };

  const handleReunitedOpenChange = (open: boolean) => {
    setShowReunitedModal(open);
    if (!open) {
      setPetBeingReunited(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !petToDelete) {
      alert("Unable to delete pet. Please try again.");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "pets", petToDelete.id));
      await fetchPets(user.uid);
      setShowDeleteModal(false);
      setPetToDelete(null);
    } catch (error) {
      console.error("Error deleting pet:", error);
      alert("Failed to delete pet. Please try again.");
    } finally {
      setIsDeleting(false);
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
                  onGeneratePosters={handleGeneratePosters}
                  onDelete={(pet) => {
                    setPetToDelete(pet);
                    setShowDeleteModal(true);
                  }}
                  onShowQr={handleShowQrModal}
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

        {/* Missing Poster Modal */}
        <Dialog open={showPosterModal} onOpenChange={handlePosterOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Generate Missing Posters
              </DialogTitle>
              <DialogDescription>
                Print or download posters to share in your community.
              </DialogDescription>
            </DialogHeader>
            {posterPet && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-4">
                  <p className="text-sm text-orange-800">
                    We’ll create a high-resolution, print-friendly poster with your pet’s latest photo and missing details. You can
                    print directly or save as PDF.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 p-6 bg-white space-y-4">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Missing Pet</p>
                    <h3 className="text-3xl font-bold text-gray-900">{posterPet.name}</h3>
                    <p className="text-sm text-gray-500">
                      Lost {posterPet?.missingReport?.lostDate || "Date unknown"}
                      {posterPet?.missingReport?.lostTime ? ` at ${posterPet.missingReport.lostTime}` : ""}
                    </p>
                  </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900">Breed</p>
                      <p>{posterPet.breed || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Color / Markings</p>
                      <p>{posterPet.color || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Microchip</p>
                      <p>{posterPet.microchip || "Not provided"}</p>
                    </div>
                  </div>
                <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 p-4 border border-orange-100 flex flex-col sm:flex-row items-center gap-3 shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `https://petreunite.io/pet/${posterPet.qrCode || posterPet.id}`
                    )}`}
                    alt="QR code"
                    className="w-28 h-28 rounded-xl border-2 border-dashed border-orange-200 bg-white p-2"
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900 mb-1">Share owner details</p>
                    <p>Please scan this QR code to view owner's contact information and the live pet profile.</p>
                  </div>
                </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => handlePosterOpenChange(false)}>
                    Close
                  </Button>
                  <Button className="bg-yellow-500 text-white hover:bg-yellow-600" onClick={handleDownloadPoster}>
                    Download printable poster
                  </Button>
                </div>
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

        {/* Delete Pet Modal */}
        <Dialog open={showDeleteModal} onOpenChange={(open) => {
          setShowDeleteModal(open);
          if (!open) {
            setPetToDelete(null);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete pet profile</DialogTitle>
              <DialogDescription>
                This will remove {petToDelete?.name || "this pet"} and all related data from your account.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              This action cannot be undone. Are you sure you want to delete this pet?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Code Modal */}
        <Dialog open={showQrModal} onOpenChange={(open) => {
          setShowQrModal(open);
          if (!open) {
            setQrPet(null);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pet QR Code</DialogTitle>
              <DialogDescription>
                Scan to open {qrPet?.name || "this pet"}’s profile instantly.
              </DialogDescription>
            </DialogHeader>
            {qrPet ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                    `https://petreunite.io/pet/${qrPet.qrCode || qrPet.id}`
                  )}`}
                  alt="Pet QR code"
                  className="w-60 h-60 rounded-2xl border border-gray-200 p-4 bg-white"
                />
                <p className="text-sm text-gray-600 text-center">
                  Point your camera at the QR code to view the live profile.
                </p>
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleDownloadQr}>
                  Download QR code
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Select a pet to generate a QR code.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
