"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PetProfileFormProps {
  onSubmit: (data: PetData) => void;
  initialData?: PetData & { image?: string | null };
  isEditMode?: boolean;
}

interface PetData {
  name: string;
  species: string;
  customSpecies?: string;
  breed: string;
  age: string;
  color: string;
  vetname?: string;
  vetaddress?: string;
  qrCode?: string;
  image?: string | null;
}

export function PetProfileForm({
  onSubmit,
  initialData,
  isEditMode = false,
}: PetProfileFormProps) {
  // Determine if species is "other" from initial data
  const getInitialSpecies = () => {
    if (initialData?.species) {
      const standardSpecies = ["Dog", "Cat", "Rabbit"];
      return standardSpecies.includes(initialData.species.toLowerCase())
        ? initialData.species.toLowerCase()
        : "other";
    }
    return "Dog";
  };

  const getInitialCustomSpecies = () => {
    if (initialData?.species) {
      const standardSpecies = ["Dog", "Cat", "Rabbit"];
      return standardSpecies.includes(initialData.species.toLowerCase())
        ? ""
        : initialData.species;
    }
    return "";
  };

  const [formData, setFormData] = useState<PetData>({
    name: initialData?.name || "",
    species: getInitialSpecies(),
    customSpecies: getInitialCustomSpecies(),
    breed: initialData?.breed || "",
    age: initialData?.age || "",
    color: initialData?.color || "",
    vetname: initialData?.vetname || "",
    vetaddress: initialData?.vetaddress || "",
    qrCode: initialData?.qrCode || "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(isEditMode ? 0 : 1);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      const standardSpecies = ["Dog", "Cat", "Rabbit"];
      const isStandardSpecies =
        initialData.species &&
        standardSpecies.includes(initialData.species.toLowerCase());
      const speciesValue = isStandardSpecies
        ? initialData.species.toLowerCase()
        : "other";
      const customSpeciesValue = isStandardSpecies
        ? ""
        : initialData.species || "";

      setFormData({
        name: initialData.name || "",
        species: speciesValue,
        customSpecies: customSpeciesValue,
        breed: initialData.breed || "",
        age: initialData.age || "",
        color: initialData.color || "",
        vetname: initialData.vetname || "",
        vetaddress: initialData.vetaddress || "",
        qrCode: initialData.qrCode || "",
      });
      setImagePreview(initialData.image || null);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resizeImageFile = (
    file: File,
    maxDimension = 800,
    maxFileSizeMB = 2
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check file size first (in MB)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        reject(
          new Error(
            "Image file is too large. Please use an image smaller than 10MB."
          )
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Calculate scale to fit within max dimension
          if (width > maxDimension || height > maxDimension) {
            const scale = Math.min(maxDimension / width, maxDimension / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Unable to process image"));
            return;
          }

          // Use better image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Always convert to JPEG for better compression (unless it's a PNG with transparency)
          // For simplicity, we'll convert everything to JPEG with good quality
          let quality = 0.8;
          let outputType = "image/jpeg";

          // Try to compress to target file size
          const compressToTargetSize = (targetQuality: number): string => {
            const dataUrl = canvas.toDataURL(outputType, targetQuality);
            const sizeMB = (dataUrl.length * 3) / 4 / (1024 * 1024); // Approximate size

            // If still too large and quality can be reduced, try again
            if (sizeMB > maxFileSizeMB && targetQuality > 0.5) {
              return compressToTargetSize(targetQuality - 0.1);
            }
            return dataUrl;
          };

          const dataUrl = compressToTargetSize(quality);
          resolve(dataUrl);
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImageError(null);

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setImageError("Please select a valid image file.");
          return;
        }

        // Show processing message
        const resizedImage = await resizeImageFile(file, 800, 2);
        setImagePreview(resizedImage);
      } catch (error: any) {
        console.error("Image processing error:", error);
        setImageError(
          error.message ||
            "We couldn't process that image. Please try another one."
        );
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, image: imagePreview });
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep === 1 && !formData.qrCode) {
      alert("Please enter your registration code");
      return;
    }
    if (currentStep === 2 && !imagePreview) {
      alert("Please upload a picture of your pet");
      return;
    }
    if (currentStep === 3 && (!formData.name || !formData.species)) {
      alert("Please fill in all required pet details");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.qrCode;
      case 2:
        return !!imagePreview;
      case 3:
        return !!formData.name && !!formData.species;
      default:
        return true;
    }
  };

  // If edit mode, show regular form
  if (isEditMode) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pet Photo
          </label>
          <div className="relative">
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Pet preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <label
                className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition"
                style={{ borderColor: "#ffb067", backgroundColor: "#fff5f0" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffe8d6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fff5f0")
                }
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">📸</div>
                  <p className="text-sm text-gray-600">
                    Click to upload pet photo
                  </p>
                </div>
              </label>
            )}
          </div>
          {imageError && (
            <p className="mt-2 text-sm text-red-600">{imageError}</p>
          )}
        </div>

        {/* Pet Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pet Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g Max"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species *
          </label>
          <select
            name="species"
            value={formData.species}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          >
            <option value="Dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="other">Other</option>
          </select>
          {formData.species === "other" && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specify Species *
              </label>
              <input
                type="text"
                name="customSpecies"
                value={formData.customSpecies}
                onChange={handleInputChange}
                required={formData.species === "other"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          )}
        </div>

        {/* Breed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Breed
          </label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age (years)
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color/Markings
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Vet Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vet Name
          </label>
          <input
            type="text"
            name="vetname"
            value={formData.vetname}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Vet Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vet Address
          </label>
          <input
            type="text"
            name="vetaddress"
            value={formData.vetaddress}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>

        <Button
          type="submit"
          className="w-full hover:opacity-90"
          style={{ backgroundColor: "#ffb067" }}
        >
          Update Profile
        </Button>
      </form>
    );
  }

  // Multi-step onboarding form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only submit on the final step
    if (currentStep === 4) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step
                  ? "bg-[#ffb067] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-[#ffb067]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Registration Code */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step 1: Enter Your Registration Code
            </h2>
            <p className="text-gray-600 mb-6">
              Enter the registration code you received with your order
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Code *
            </label>
            <input
              type="text"
              name="qrCode"
              value={formData.qrCode}
              onChange={handleInputChange}
              placeholder="Enter your registration code"
              required
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
              style={{ fontSize: "1.25rem" }}
            />
          </div>
        </div>
      )}

      {/* Step 2: Upload Picture */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step 2: Upload a Picture of Your Pet
            </h2>
            <p className="text-gray-600 mb-6">
              Add a clear photo of your pet to help with identification
            </p>
            <div className="relative">
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Pet preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label
                  className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition"
                  style={{ borderColor: "#ffb067", backgroundColor: "#fff5f0" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffe8d6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fff5f0")
                  }
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-4">📸</div>
                    <p className="text-lg text-gray-700 font-medium">
                      Click to upload pet photo
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Images will be automatically resized
                    </p>
                  </div>
                </label>
              )}
            </div>
            {imageError && (
              <p className="mt-2 text-sm text-red-600">{imageError}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Pet Details */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step 3: Enter Your Pet's Details
            </h2>
            <p className="text-gray-600 mb-6">Tell us about your pet</p>
          </div>

          {/* Pet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pet Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g Max"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Species *
            </label>
            <select
              name="species"
              value={formData.species}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
            >
              <option value="Dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="Rabbit">Rabbit</option>
              <option value="other">Other</option>
            </select>
            {formData.species === "other" && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specify Species *
                </label>
                <input
                  type="text"
                  name="customSpecies"
                  value={formData.customSpecies}
                  onChange={handleInputChange}
                  required={formData.species === "other"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Breed
            </label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              placeholder="e.g Golden Retriever"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age (years)
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              placeholder="e.g 3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color/Markings
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="e.g Golden"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      )}

      {/* Step 4: Vet Details */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Step 4: Enter Your Vet's Details
            </h2>
            <p className="text-gray-600 mb-6">
              Help us connect with your veterinarian if needed
            </p>
          </div>

          {/* Vet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vet Name
            </label>
            <input
              type="text"
              name="vetname"
              value={formData.vetname}
              onChange={handleInputChange}
              placeholder="e.g Dr. Smith"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Vet Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vet Address
            </label>
            <input
              type="text"
              name="vetaddress"
              value={formData.vetaddress}
              onChange={handleInputChange}
              placeholder="e.g 123 Main St, City, State"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffb067] focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        {currentStep > 1 ? (
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            className="px-6"
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="px-6 hover:opacity-90"
            style={{ backgroundColor: "#ffb067" }}
            disabled={!canProceedFromStep(currentStep)}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            className="px-6 hover:opacity-90"
            style={{ backgroundColor: "#ffb067" }}
          >
            Save
          </Button>
        )}
      </div>
    </form>
  );
}
