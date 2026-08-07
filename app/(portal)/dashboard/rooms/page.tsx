"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/context/ToastContext";

type DbRoom = {
  id: string;
  name: string;
  type: "master" | "twin";
  price_per_night: number;
  capacity: number;
  is_active: boolean;
  booked_today: boolean;
};

export default function PortalRoomsPage() {
  const toast = useToast();

  const [rooms, setRooms] = useState<DbRoom[] | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchRooms = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/rooms");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load rooms");
      }
      setRooms(json.data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const startEdit = (room: DbRoom) => {
    setEditingId(room.id);
    setDraftPrice(String(room.price_per_night));
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async (id: string) => {
    setEditError(null);
    const newPrice = Number(draftPrice);
    if (!Number.isFinite(newPrice) || newPrice <= 0) {
      setEditError("Enter a valid price.");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price_per_night: newPrice }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to save changes.");
      }
      setRooms((prev) => prev?.map((r) => (r.id === id ? json.data : r)) ?? prev);
      setEditingId(null);
      toast.success("Room price updated.");
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-heading text-3xl text-primary">Rooms</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage room pricing and availability.
      </p>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {listLoading && (
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
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-none">
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-5 w-14" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-8 w-28" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!listLoading && listError && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">{listError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRooms}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Retry
            </Button>
          </div>
        )}

        {!listLoading && !listError && (
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
                {rooms?.map((room) => {
                  const isEditing = editingId === room.id;
                  return (
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
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <Input
                              value={draftPrice}
                              onChange={(e) => setDraftPrice(e.target.value)}
                              className="h-8 w-28"
                              type="number"
                            />
                            {editError && (
                              <p className="text-xs text-destructive">{editError}</p>
                            )}
                          </div>
                        ) : (
                          `Rs ${room.price_per_night.toLocaleString()}`
                        )}
                      </td>
                      <td className="py-3 pr-4 text-primary">{room.capacity}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={
                            !room.is_active
                              ? "border-none bg-muted text-muted-foreground"
                              : room.booked_today
                                ? "border-none bg-red-600 text-white"
                                : "border-none bg-green-600 text-white"
                          }
                        >
                          {!room.is_active
                            ? "Inactive"
                            : room.booked_today
                              ? "Booked Today"
                              : "Available"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={savingEdit}
                              className="bg-green-600 text-white hover:bg-green-700"
                              onClick={() => saveEdit(room.id)}
                            >
                              {savingEdit ? <Spinner /> : <Check className="size-4" />}
                              {savingEdit ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={savingEdit}
                              onClick={cancelEdit}
                            >
                              <X className="size-4" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => startEdit(room)}
                          >
                            <Pencil className="size-4" />
                            Edit Price
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
