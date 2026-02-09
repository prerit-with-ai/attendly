"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";

import { detectFace } from "@/actions/enrollment";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages: number;
}

export function PhotoUpload({ images, onImagesChange, maxImages }: PhotoUploadProps) {
  const [validating, setValidating] = useState<number | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const validateAndAdd = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const toProcess = fileArray.slice(0, remaining);

      for (let i = 0; i < toProcess.length; i++) {
        const file = toProcess[i];

        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        setValidating(images.length + i);

        // Validate face detection
        const formData = new FormData();
        formData.append("image", file);
        const result = await detectFace(formData);

        if (result.error) {
          toast.error(result.error);
          setValidating(null);
          continue;
        }

        if (!result.detected) {
          toast.error(`${file.name}: ${result.message}`);
          setValidating(null);
          continue;
        }

        if (result.faceCount && result.faceCount > 1) {
          toast.error(`${file.name}: Multiple faces detected. Use a photo with only one person.`);
          setValidating(null);
          continue;
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        const newImages = [...images, file];
        const newPreviews = [...previews, previewUrl];
        onImagesChange(newImages);
        setPreviews(newPreviews);
        // Update images ref for next iteration
        images = newImages;
        previews.push(previewUrl);
      }

      setValidating(null);
    },
    [images, previews, onImagesChange, maxImages]
  );

  function handleRemove(index: number) {
    URL.revokeObjectURL(previews[index]);
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setPreviews(newPreviews);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      validateAndAdd(e.dataTransfer.files);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAdd(e.target.files);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Drag and drop photos or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG up to 5MB. {images.length}/{maxImages} images.
        </p>
        <label>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileSelect}
          />
          <Button type="button" variant="outline" size="sm" className="mt-3" asChild>
            <span>Choose Files</span>
          </Button>
        </label>
      </div>

      {validating !== null && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Validating face in image...
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              <img src={preview} alt={`Face ${index + 1}`} className="size-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-7"
                  onClick={() => handleRemove(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="absolute bottom-1 right-1">
                <CheckCircle2 className="size-4 text-green-400 drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
