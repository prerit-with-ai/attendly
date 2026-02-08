"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, X, CheckCircle2, Loader2, VideoOff } from "lucide-react";

import { detectFace } from "@/actions/enrollment";
import { Button } from "@/components/ui/button";

interface WebcamCaptureProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages: number;
}

export function WebcamCapture({ images, onImagesChange, maxImages }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError("Could not access camera. Please ensure camera permissions are granted.");
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [stopCamera, previews]);

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Failed to capture image");
          setCapturing(false);
          return;
        }

        // Validate face
        const formData = new FormData();
        formData.append("image", blob, "capture.jpg");
        const result = await detectFace(formData);

        if (result.error) {
          toast.error(result.error);
          setCapturing(false);
          return;
        }

        if (!result.detected) {
          toast.error(result.message || "No face detected. Please look at the camera.");
          setCapturing(false);
          return;
        }

        if (result.faceCount && result.faceCount > 1) {
          toast.error("Multiple faces detected. Ensure only one person is visible.");
          setCapturing(false);
          return;
        }

        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);

        onImagesChange([...images, file]);
        setPreviews((prev) => [...prev, previewUrl]);
        setCapturing(false);
        toast.success("Photo captured");
      },
      "image/jpeg",
      0.9
    );
  }

  function handleRemove(index: number) {
    URL.revokeObjectURL(previews[index]);
    onImagesChange(images.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border bg-muted">
        {!cameraActive ? (
          <div className="flex flex-col items-center justify-center py-16">
            {cameraError ? (
              <>
                <VideoOff className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-destructive">{cameraError}</p>
              </>
            ) : (
              <>
                <Camera className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Camera is not active</p>
              </>
            )}
            <Button className="mt-4" variant="outline" onClick={startCamera}>
              <Camera className="mr-2 size-4" />
              Start Camera
            </Button>
          </div>
        ) : (
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              <Button onClick={handleCapture} disabled={capturing || images.length >= maxImages}>
                {capturing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 size-4" />
                )}
                Capture ({images.length}/{maxImages})
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                Stop
              </Button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              <img src={preview} alt={`Capture ${index + 1}`} className="size-full object-cover" />
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
