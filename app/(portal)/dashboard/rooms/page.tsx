"use client";

import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { rooms as initialRooms } from "@/lib/data/rooms";

export default function PortalRoomsPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftPrice, setDraftPrice] = useState("");

  const startEdit = (id: number, currentPrice: number) => {
    setEditingId(id);
    setDraftPrice(String(currentPrice));
  };

  const saveEdit = (id: number) => {
    const newPrice = Number(draftPrice);
    if (!Number.isNaN(newPrice) && newPrice > 0) {
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, price: newPrice } : r))
      );
    }
    setEditingId(null);
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-heading text-3xl text-primary">Rooms</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage room pricing and availability.
      </p>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Room Name</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Price / Night</th>
                <th className="py-2 pr-4 font-medium">Capacity</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-border last:border-none">
                  <td className="py-3 pr-4 font-medium text-primary">
                    {room.name}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      className={
                        room.type === "master"
                          ? "border-none bg-gold text-gold-foreground"
                          : "border-none bg-primary text-primary-foreground"
                      }
                    >
                      {room.type === "master" ? "Master" : "Twin"}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-primary">
                    {editingId === room.id ? (
                      <Input
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                        className="h-8 w-28"
                        type="number"
                      />
                    ) : (
                      `Rs ${room.price.toLocaleString()}`
                    )}
                  </td>
                  <td className="py-3 pr-4 text-primary">{room.capacity}</td>
                  <td className="py-3 pr-4">
                    <Badge className="border-none bg-green-600 text-white">
                      Available
                    </Badge>
                  </td>
                  <td className="py-3 pr-4">
                    {editingId === room.id ? (
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => saveEdit(room.id)}
                      >
                        <Check className="size-4" />
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => startEdit(room.id, room.price)}
                      >
                        <Pencil className="size-4" />
                        Edit Price
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
