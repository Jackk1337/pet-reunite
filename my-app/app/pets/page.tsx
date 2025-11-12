"use client";

import { useState, useEffect } from "react";
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
  const router = useRouter();

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
                <PetProfileList pets={pets} onEdit={handleEditPet} />
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
      </div>
    </div>
  );
}
