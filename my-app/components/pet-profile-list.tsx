"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Pet {
  id: string | number;
  name: string;
  species: string;
  breed: string;
  age: string;
  color: string;
  microchip?: string;
  image?: string;
  qrCode?: string;
  isMissing?: boolean;
}

interface PetProfileListProps {
  pets: Pet[];
  onEdit?: (pet: Pet) => void;
  onReportMissing?: (pet: Pet) => void;
  onMarkReunited?: (pet: Pet) => void;
}

export function PetProfileList({
  pets,
  onEdit,
  onReportMissing,
  onMarkReunited,
}: PetProfileListProps) {
  return (
    <div className="grid gap-6">
      {pets.map((pet) => (
        <Card
          key={pet.id}
          className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          {pet.isMissing && (
            <div className="bg-red-50 px-6 py-2 text-sm font-semibold text-red-700 border-b border-red-100 flex items-center gap-2">
              <span>🚨 Missing Pet Alert</span>
            </div>
          )}
          <div className="grid sm:grid-cols-4 gap-6 p-6">
            {/* Pet Image - Clickable */}
            <Link
              href={pet.qrCode ? `/pet/${pet.qrCode}` : "#"}
              className="sm:col-span-1 cursor-pointer"
            >
              {pet.image ? (
                <img
                  src={pet.image || "/placeholder.svg"}
                  alt={pet.name}
                  className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
              ) : (
                <div
                  className="w-full h-40 rounded-lg flex items-center justify-center text-4xl transition-colors"
                  style={{ backgroundColor: "#fff5f0" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ffe8d6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fff5f0")
                  }
                >
                  🐾
                </div>
              )}
            </Link>

            {/* Pet Info - Clickable */}
            <Link
              href={pet.qrCode ? `/pet/${pet.qrCode}` : "#"}
              className="sm:col-span-2 space-y-2 cursor-pointer"
            >
              <h3
                className="text-2xl font-bold text-gray-900 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffb067")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                {pet.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-700">Species:</span>{" "}
                  {pet.species}
                </p>
                {pet.breed && (
                  <p>
                    <span className="font-semibold text-gray-700">Breed:</span>{" "}
                    {pet.breed}
                  </p>
                )}
                {pet.age && (
                  <p>
                    <span className="font-semibold text-gray-700">Age:</span>{" "}
                    {pet.age} years
                  </p>
                )}
                {pet.color && (
                  <p>
                    <span className="font-semibold text-gray-700">
                      Color/Markings:
                    </span>{" "}
                    {pet.color}
                  </p>
                )}
                {pet.microchip && (
                  <p>
                    <span className="font-semibold text-gray-700">
                      Microchip:
                    </span>{" "}
                    {pet.microchip}
                  </p>
                )}
              </div>
            </Link>

            {/* Actions */}
            <div className="sm:col-span-1 flex flex-col gap-2 justify-center">
              {pet.isMissing ? (
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMarkReunited && onMarkReunited(pet);
                  }}
                >
                  ✅ Reunited
                </Button>
              ) : (
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onReportMissing && onReportMissing(pet);
                  }}
                >
                  🚨 My pet is lost
                </Button>
              )}
              <Button
                variant="outline"
                className="border-gray-300 bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit && onEdit(pet);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
