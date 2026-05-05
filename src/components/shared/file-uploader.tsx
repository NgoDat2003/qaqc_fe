"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadApi } from "@/shared/api/upload.api";

interface FileUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUploader({
  value,
  onChange,
  maxFiles = 5,
  className,
  disabled,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxFiles - value.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const results = await Promise.all(toUpload.map((f) => uploadApi.uploadEvidence(f)));
      onChange([...value, ...results.map((r) => r.url)]);
    } catch {
      // caller handles error via toast
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  const canAdd = value.length < maxFiles && !disabled;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Preview grid */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url) => (
            <div key={url} className="relative h-20 w-20 rounded-md overflow-hidden border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {canAdd && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Đang tải..." : "Thêm ảnh"}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
