"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { AmenityIcon } from "@/components/amenities/AmenityIcon";
import { useToast } from "@/context/ToastContext";
import type { Amenity } from "@/lib/supabase/amenities";

export default function AmenitiesPage() {
  const toast = useToast();

  const [amenities, setAmenities] = useState<Amenity[] | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAmenities = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/amenities");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to load amenities");
      }
      setAmenities(json.data);
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/amenities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, icon }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to create amenity.");
      }
      setAmenities((prev) => (prev ? [json.data, ...prev] : [json.data]));
      setName("");
      setDescription("");
      setIcon("");
      toast.success("Amenity added.");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (amenity: Amenity) => {
    setEditingId(amenity.id);
    setEditName(amenity.name);
    setEditDescription(amenity.description ?? "");
    setEditIcon(amenity.icon ?? "");
    setEditError(null);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleSaveEdit = async (id: string) => {
    setEditError(null);
    if (!editName.trim()) {
      setEditError("Name is required.");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/amenities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          icon: editIcon,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to save changes.");
      }
      setAmenities(
        (prev) => prev?.map((a) => (a.id === id ? json.data : a)) ?? prev
      );
      setEditingId(null);
      toast.success("Amenity updated.");
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/amenities/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to delete amenity.");
      }
      setAmenities((prev) => prev?.filter((a) => a.id !== id) ?? prev);
      toast.success("Amenity deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-heading text-3xl text-primary">Amenities</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the amenities shown across the site.
      </p>

      {/* CREATE FORM */}
      <form
        onSubmit={handleCreate}
        className="mt-6 rounded-xl bg-white p-6 shadow-sm"
      >
        <h2 className="font-heading text-lg text-primary">Add Amenity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amenity-name">Name</Label>
            <Input
              id="amenity-name"
              placeholder="Free WiFi"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amenity-icon">Icon</Label>
            <Input
              id="amenity-icon"
              placeholder="wifi or 📶"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amenity-description">Description</Label>
            <Input
              id="amenity-description"
              placeholder="High-speed internet in all rooms"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {formError && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          disabled={creating}
          className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {creating ? <Spinner /> : <Plus className="size-4" />}
          {creating ? "Saving..." : "Add Amenity"}
        </Button>
      </form>

      {/* LIST */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {listLoading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Icon</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-none">
                    <td className="py-3 pr-4">
                      <Skeleton className="h-6 w-6" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="py-3 pr-4">
                      <Skeleton className="h-8 w-32" />
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
              onClick={fetchAmenities}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Retry
            </Button>
          </div>
        )}

        {!listLoading && !listError && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Icon</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {amenities?.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No amenities yet. Add one above.
                    </td>
                  </tr>
                )}

                {amenities?.map((amenity) => {
                  const isEditing = editingId === amenity.id;
                  const isConfirmingDelete = confirmDeleteId === amenity.id;
                  const isDeleting = deletingId === amenity.id;

                  return (
                    <tr
                      key={amenity.id}
                      className="border-b border-border align-top last:border-none"
                    >
                      <td className="py-3 pr-4">
                        {isEditing ? (
                          <Input
                            value={editIcon}
                            onChange={(e) => setEditIcon(e.target.value)}
                            className="h-8 w-20"
                          />
                        ) : (
                          <AmenityIcon icon={amenity.icon} />
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium text-primary">
                        {isEditing ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 w-40"
                          />
                        ) : (
                          amenity.name
                        )}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {isEditing ? (
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="min-h-8 w-full max-w-xs"
                          />
                        ) : (
                          amenity.description || "—"
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            {editError && (
                              <p className="text-xs text-destructive">
                                {editError}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={savingEdit}
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => handleSaveEdit(amenity.id)}
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
                          </div>
                        ) : isConfirmingDelete ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-destructive">
                              Delete this amenity?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={isDeleting}
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDelete(amenity.id)}
                              >
                                {isDeleting ? <Spinner /> : <Trash2 className="size-4" />}
                                {isDeleting ? "Deleting..." : "Confirm"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isDeleting}
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => startEdit(amenity)}
                            >
                              <Pencil className="size-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmDeleteId(amenity.id)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </div>
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
