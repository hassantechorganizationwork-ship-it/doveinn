"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  accept: string[];
  maxSizeBytes: number;
  error?: string;
  onError?: (message: string) => void;
  progress?: number | null;
  disabled?: boolean;
  label?: string;
};

function humanSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileDropzone({
  value,
  onChange,
  accept,
  maxSizeBytes,
  error,
  onError,
  progress,
  disabled,
  label = "Drag & drop an image, or click to browse",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const validate = (file: File): string | null => {
    if (!accept.includes(file.type)) {
      return "Photo must be a JPEG, PNG, WEBP, or GIF image";
    }
    if (file.size > maxSizeBytes) {
      return `Photo must be smaller than ${humanSize(maxSizeBytes)}`;
    }
    return null;
  };

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    const validationError = validate(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const isUploading = typeof progress === "number" && progress < 100;

  return (
    <div className="flex flex-col gap-2">
      {!value ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragActive
              ? "border-gold bg-gold/5"
              : "border-input hover:border-gold/60",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <UploadCloud className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WEBP, or GIF — up to {humanSize(maxSizeBytes)}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept.join(",")}
            disabled={disabled}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative flex items-center gap-3 rounded-lg border border-input p-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Selected photo preview"
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-primary">
              {value.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {humanSize(value.size)}
            </p>
            {typeof progress === "number" && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progress >= 100 ? "bg-green-600" : "bg-gold"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
          {!isUploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              aria-label="Remove photo"
              className="shrink-0 cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive disabled:cursor-not-allowed"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
