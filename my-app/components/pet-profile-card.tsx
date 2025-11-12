interface Pet {
  id: number
  name: string
  type: string
  breed: string
  age: number
  color: string
  microchip: string
  image: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

interface PetProfileCardProps {
  pet: Pet
}

export function PetProfileCard({ pet }: PetProfileCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-indigo-100 to-blue-100 relative">
        <img src={pet.image || "/placeholder.svg"} alt={pet.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{pet.name}</h2>
            <p className="text-gray-600">{pet.breed}</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#fff5f0', color: '#ffb067' }}>
              {pet.type}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-gray-600 text-sm font-medium">Age</p>
            <p className="text-gray-900 font-semibold">{pet.age} years</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Color</p>
            <p className="text-gray-900 font-semibold">{pet.color}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Microchip ID</p>
            <p className="text-gray-900 font-semibold text-xs">{pet.microchip}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Type</p>
            <p className="text-gray-900 font-semibold">{pet.type}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {pet.contactName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Phone:</span> {pet.contactPhone}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {pet.contactEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
