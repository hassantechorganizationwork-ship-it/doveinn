export const rooms = [
  { id: 1, slug: "master-room-1", name: "Master Room 1", type: "master", price: 7000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed"] },
  { id: 2, slug: "master-room-2", name: "Master Room 2", type: "master", price: 7000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed"] },
  { id: 3, slug: "master-room-3", name: "Master Room 3", type: "master", price: 7000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed"] },
  { id: 4, slug: "master-room-4", name: "Master Room 4", type: "master", price: 7000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed"] },
  { id: 5, slug: "master-room-5", name: "Master Room 5", type: "master", price: 7500, capacity: 3, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed", "Sofa"] },
  { id: 6, slug: "master-room-6", name: "Master Room 6", type: "master", price: 7500, capacity: 3, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed", "Sofa"] },
  { id: 7, slug: "master-suite-7", name: "Master Suite 7", type: "master", price: 9000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed", "Lounge Area", "Mini Fridge"] },
  { id: 8, slug: "master-suite-8", name: "Master Suite 8", type: "master", price: 9000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "King Size Bed", "Lounge Area", "Mini Fridge"] },
  { id: 9, slug: "twin-room-1", name: "Twin Room 1", type: "twin", price: 5000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "Twin Beds"] },
  { id: 10, slug: "twin-room-2", name: "Twin Room 2", type: "twin", price: 5000, capacity: 2, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "Twin Beds"] },
  { id: 11, slug: "twin-room-3", name: "Twin Room 3", type: "twin", price: 5500, capacity: 3, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "Twin Beds", "Extra Bed Available"] },
  { id: 12, slug: "twin-room-4", name: "Twin Room 4", type: "twin", price: 5500, capacity: 3, amenities: ["WiFi", "AC", "LCD TV", "Attached Bathroom", "Twin Beds", "Extra Bed Available"] },
]

export type Room = typeof rooms[0]
