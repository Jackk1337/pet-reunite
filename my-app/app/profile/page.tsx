"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { auth, db, storage } from "@/lib/firebase";

type EditableField = "photo" | "name" | "email" | "address" | "plan";

type Address = {
  line1: string;
  line2: string;
  country: string;
  county: string;
  postalCode: string;
};

type ProfileData = {
  displayName: string;
  email: string;
  address: Address;
  subscriptionPlan: string;
  photoURL: string;
};

const createEmptyAddress = (): Address => ({
  line1: "",
  line2: "",
  country: "",
  county: "",
  postalCode: "",
});

const defaultProfile: ProfileData = {
  displayName: "",
  email: "",
  address: createEmptyAddress(),
  subscriptionPlan: "Starter",
  photoURL: "",
};

const planOptions = [
  {
    value: "Starter",
    tagline: "Free tools for 1 pet",
  },
  {
    value: "Premium",
    tagline: "Unlimited pets + SMS alerts",
  },
  {
    value: "Family",
    tagline: "Shared access for households",
  },
];

const popularCountries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Ireland",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Brazil",
  "Mexico",
  "South Africa",
  "India",
  "Japan",
  "Singapore",
  "United Arab Emirates",
];

const normalizeAddress = (raw: unknown): Address => {
  if (!raw) {
    return createEmptyAddress();
  }

  if (typeof raw === "string") {
    return {
      ...createEmptyAddress(),
      line1: raw,
    };
  }

  const data = raw as Partial<Address>;
  return {
    line1: data.line1 || "",
    line2: data.line2 || "",
    country: data.country || "",
    county: data.county || "",
    postalCode: data.postalCode || "",
  };
};

const formatAddress = (address: Address) => {
  const lines = [
    address.line1,
    address.line2,
    address.county,
    address.postalCode,
    address.country,
  ].filter((part) => part?.trim());

  return lines.join(", ");
};

export default function EditProfilePage() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalField, setModalField] = useState<EditableField | null>(null);
  const [fieldValue, setFieldValue] = useState("");
  const [addressForm, setAddressForm] = useState<Address>(createEmptyAddress());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setFirebaseUser(null);
        router.push("/login");
        return;
      }
      setFirebaseUser(user);
      void loadProfile(user);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const loadProfile = async (user: User) => {
    setIsLoading(true);
    setError(null);
    try {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<ProfileData>;
        setProfile({
          displayName: data.displayName || user.displayName || "",
          email: data.email || user.email || "",
          address: normalizeAddress(data.address),
          subscriptionPlan: data.subscriptionPlan || "Starter",
          photoURL: data.photoURL || user.photoURL || "",
        });
      } else {
        const seededProfile: ProfileData = {
          displayName: user.displayName || "",
          email: user.email || "",
          address: createEmptyAddress(),
          subscriptionPlan: "Starter",
          photoURL: user.photoURL || "",
        };
        await setDoc(userRef, {
          ...seededProfile,
          createdAt: new Date().toISOString(),
        });
        setProfile(seededProfile);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      setError("We couldn't load your profile. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (field: EditableField) => {
    setStatusMessage(null);
    setModalError(null);
    if (field === "photo") {
      setPhotoFile(null);
      setPhotoPreview(profile.photoURL || null);
    } else if (field === "address") {
      setAddressForm(
        profile.address
          ? { ...profile.address }
          : createEmptyAddress()
      );
    } else {
      setFieldValue(
        getFieldValue(field as Exclude<EditableField, "photo" | "address">)
      );
    }
    setModalField(field);
  };

  const handleCloseModal = () => {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setModalField(null);
    setFieldValue("");
    setAddressForm(createEmptyAddress());
    setPhotoFile(null);
    setPhotoPreview(null);
    setModalError(null);
  };

  const getFieldValue = (field: Exclude<EditableField, "photo" | "address">) => {
    switch (field) {
      case "name":
        return profile.displayName;
      case "email":
        return profile.email;
      case "plan":
        return profile.subscriptionPlan;
      default:
        return "";
    }
  };

  const handleAddressChange = (
    field: keyof Address,
    value: string
  ) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!firebaseUser || !modalField) return;

    setIsSaving(true);
    setError(null);

    const userRef = doc(db, "users", firebaseUser.uid);
    const updates: Partial<ProfileData> & { updatedAt: string } = {
      updatedAt: new Date().toISOString(),
    };

    try {
      if (modalField === "photo") {
        if (!photoFile) {
          setModalError("Please choose a photo to upload.");
          setIsSaving(false);
          return;
        }
        const storageRef = ref(
          storage,
          `users/${firebaseUser.uid}/profile-photo-${Date.now()}`
        );
        await uploadBytes(storageRef, photoFile);
        const downloadURL = await getDownloadURL(storageRef);
        updates.photoURL = downloadURL;
        await setDoc(userRef, updates, { merge: true });
        setProfile((prev) => ({
          ...prev,
          photoURL: downloadURL,
        }));
      } else if (modalField === "address") {
        const normalizedAddress: Address = {
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim(),
          country: addressForm.country.trim(),
          county: addressForm.county.trim(),
          postalCode: addressForm.postalCode.trim(),
        };

        if (!normalizedAddress.line1 || !normalizedAddress.country) {
          setModalError("Address line 1 and country are required.");
          setIsSaving(false);
          return;
        }

        updates.address = normalizedAddress;

        await setDoc(userRef, updates, { merge: true });
        setProfile((prev) => ({
          ...prev,
          address: normalizedAddress,
        }));
      } else {
        const trimmedValue = fieldValue.trim().replace(/\s+/g, " ").trim();
        if (!trimmedValue) {
          setModalError(
            modalField === "name"
              ? "Please enter your full name."
              : modalField === "email"
              ? "Please enter a valid email."
              : "Please select a subscription plan."
          );
          setIsSaving(false);
          return;
        }
        const map: Record<Exclude<EditableField, "photo" | "address">, keyof ProfileData> =
          {
            name: "displayName",
            email: "email",
            plan: "subscriptionPlan",
          };

        const key = map[modalField];
        updates[key] = trimmedValue;

        await setDoc(userRef, updates, { merge: true });
        setProfile((prev) => ({
          ...prev,
          [key]: trimmedValue,
        }));
      }

      setModalError(null);
      setStatusMessage("Profile updated successfully.");
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save profile field", err);
      const message = "We couldn't save your changes. Please try again.";
      setError(message);
      setModalError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const editableSections = [
    {
      field: "name" as const,
      label: "Name",
      value: profile.displayName || "Add your full name",
      helper: "This appears on missing-pet alerts and QR code pages.",
    },
    {
      field: "email" as const,
      label: "Email",
      value: profile.email || "Add a contact email",
      helper: "We'll use this for account notices and found-pet pings.",
    },
    {
      field: "address" as const,
      label: "Address",
      value: formatAddress(profile.address) || "Add your home base",
      helper: "Helps responders know where to return your pet.",
    },
    {
      field: "plan" as const,
      label: "Subscription Plan",
      value: profile.subscriptionPlan,
      helper: "Upgrade anytime to unlock more reach and alerts.",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f9f9fa" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex justify-center">
          <Card className="w-full max-w-md p-10 text-center shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <span className="text-5xl animate-pulse">🐾</span>
              <p className="text-gray-600">Loading your profile…</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f9fa" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400 mb-3">
            Account
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Edit Profile
              </h1>
              <p className="text-gray-600 mt-2">
                Keep your contact and plan details up to date so your pets get
                home faster.
              </p>
            </div>
            <Button
              style={{ backgroundColor: "#ffb067" }}
              className="hover:opacity-90"
              onClick={() => router.push("/pets")}
            >
              View My Pets
          </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {statusMessage && !error && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {statusMessage}
          </div>
        )}

        <Card className="p-6 lg:p-8 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="h-28 w-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center text-3xl font-semibold text-gray-500">
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName || "Profile photo"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (profile.displayName?.charAt(0) ||
                      profile.email?.charAt(0) ||
                      "U").toUpperCase()
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:text-gray-900"
                  onClick={() => handleOpenModal("photo")}
                  aria-label="Edit profile photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                  Owner
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                  {profile.displayName || "Add your name"}
                </h2>
                <p className="text-gray-600">{profile.email || "No email"}</p>
                <p className="mt-3 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                  {profile.subscriptionPlan} plan
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">
                Profile completeness
              </p>
              <p>
                Keep everything current so rescuers can reach you immediately.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {editableSections.map((section) => (
            <Card
              key={section.field}
              className="p-6 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
                  {section.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {section.value || "Not set"}
                </p>
                <p className="mt-1 text-sm text-gray-500">{section.helper}</p>
              </div>
              <button
                className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition hover:text-gray-900"
                onClick={() => handleOpenModal(section.field)}
                aria-label={`Edit ${section.label}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!modalField} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {modalField === "photo"
                  ? "Update profile picture"
                  : modalField === "plan"
                  ? "Choose your subscription"
                  : `Update ${modalField}`}
              </DialogTitle>
              <DialogDescription>
                {modalField === "photo"
                  ? "Upload a clear photo so helpers can recognize you."
                  : "Your changes save instantly to your PetReunite account."}
              </DialogDescription>
            </DialogHeader>

            {modalField === "photo" && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-36 w-36 rounded-full border-4 border-white shadow-inner overflow-hidden bg-gray-100 flex items-center justify-center text-4xl font-semibold text-gray-500">
                    {photoPreview || profile.photoURL ? (
                      <img
                        src={photoPreview || profile.photoURL}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (profile.displayName?.charAt(0) ||
                        profile.email?.charAt(0) ||
                        "U").toUpperCase()
                    )}
                  </div>
                </div>
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Camera className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="font-semibold text-gray-900">
                    Drop a photo or click to upload
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG or JPG, up to 5MB
                  </span>
                </label>
              </div>
            )}

            {modalField && (modalField === "name" || modalField === "email") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  {modalField === "name"
                    ? "Full name"
                    : "Email address"}
                </label>
                <input
                  type={modalField === "email" ? "email" : "text"}
                  value={fieldValue}
                  onChange={(event) => setFieldValue(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                  placeholder={
                    modalField === "name" ? "Jane Doe" : "you@example.com"
                  }
                />
              </div>
            )}

            {modalField === "address" && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">
                      Address line 1
                    </label>
                    <input
                      type="text"
                      value={addressForm.line1}
                      onChange={(event) =>
                        handleAddressChange("line1", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">
                      Address line 2 (optional)
                    </label>
                    <input
                      type="text"
                      value={addressForm.line2}
                      onChange={(event) =>
                        handleAddressChange("line2", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-900">
                        County / State / Region
                      </label>
                      <input
                        type="text"
                        value={addressForm.county}
                        onChange={(event) =>
                          handleAddressChange("county", event.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        placeholder="e.g. California"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-900">
                        Postal / ZIP code
                      </label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(event) =>
                          handleAddressChange("postalCode", event.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        placeholder="e.g. 94107 or SW1A 1AA"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900">
                      Country
                    </label>
                    <input
                      type="text"
                      list="country-list"
                      value={addressForm.country}
                      onChange={(event) =>
                        handleAddressChange("country", event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                      placeholder="Start typing a country"
                    />
                    <datalist id="country-list">
                      {popularCountries.map((country) => (
                        <option key={country} value={country} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  We support postal codes, ZIP codes, and regions worldwide.
                  Enter whatever format is used in your country.
                </p>
              </div>
            )}

            {modalField === "plan" && (
              <div className="space-y-3">
                {planOptions.map((plan) => (
                  <label
                    key={plan.value}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                      fieldValue === plan.value ||
                      profile.subscriptionPlan === plan.value
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {plan.value}
                      </p>
                      <p className="text-sm text-gray-500">{plan.tagline}</p>
                    </div>
                    <input
                      type="radio"
                      name="subscription-plan"
                      value={plan.value}
                      checked={
                        fieldValue
                          ? fieldValue === plan.value
                          : profile.subscriptionPlan === plan.value
                      }
                      onChange={(event) => setFieldValue(event.target.value)}
                      className="h-5 w-5 accent-[#ffb067]"
                    />
                  </label>
                ))}
              </div>
            )}

            {modalError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {modalError}
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type={modalField === "photo" ? "button" : "submit"}
                onClick={modalField === "photo" ? handleSave : undefined}
                disabled={isSaving}
                style={{ backgroundColor: "#ffb067" }}
                className="hover:opacity-90"
              >
                {isSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
