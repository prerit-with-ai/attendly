"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, XCircle, Clock, Loader2, VideoOff } from "lucide-react";

import { checkInViaKiosk } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type KioskState = "idle" | "capturing" | "success" | "duplicate" | "not_recognized" | "error";

interface KioskResult {
  employeeName?: string;
  employeeCode?: string;
  confidence?: number;
  message: string;
}

interface KioskModeProps {
  locations: { id: string; name: string }[];
}

export function KioskMode({ locations }: KioskModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [type, setType] = useState<"check_in" | "check_out">("check_in");
  const [state, setState] = useState<KioskState>("idle");
  const [result, setResult] = useState<KioskResult | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
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
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [stopCamera]);

  function autoReset() {
    resetTimerRef.current = setTimeout(() => {
      setState("idle");
      setResult(null);
    }, 3000);
  }

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current || !locationId) return;

    setState("capturing");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setState("error");
          setResult({ message: "Failed to capture image" });
          autoReset();
          return;
        }

        const formData = new FormData();
        formData.append("image", blob, "kiosk-capture.jpg");
        formData.append("locationId", locationId);
        formData.append("type", type);

        try {
          const res = await checkInViaKiosk(formData);

          if (res.error) {
            setState("error");
            setResult({ message: res.error });
          } else if (!res.identified) {
            setState("not_recognized");
            setResult({
              message: res.message || "Face not recognized",
              confidence: res.confidence,
            });
          } else if (res.duplicate) {
            setState("duplicate");
            setResult({
              employeeName: res.employeeName,
              employeeCode: res.employeeCode,
              message: res.message || "Already checked in recently",
            });
          } else {
            setState("success");
            setResult({
              employeeName: res.employeeName,
              employeeCode: res.employeeCode,
              confidence: res.confidence,
              message: res.message || "Check-in successful!",
            });
          }
        } catch {
          setState("error");
          setResult({ message: "An unexpected error occurred" });
        }

        autoReset();
      },
      "image/jpeg",
      0.9
    );
  }

  const overlayClasses: Record<KioskState, string> = {
    idle: "",
    capturing: "",
    success: "bg-green-500/20 border-green-500",
    duplicate: "bg-amber-500/20 border-amber-500",
    not_recognized: "bg-red-500/20 border-red-500",
    error: "bg-red-500/20 border-red-500",
  };

  const overlayIcons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 className="size-20 text-green-500" />,
    duplicate: <Clock className="size-20 text-amber-500" />,
    not_recognized: <XCircle className="size-20 text-red-500" />,
    error: <XCircle className="size-20 text-red-500" />,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
              type === "check_in"
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            }`}
            onClick={() => setType("check_in")}
          >
            Check In
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
              type === "check_out"
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            }`}
            onClick={() => setType("check_out")}
          >
            Check Out
          </button>
        </div>
      </div>

      {/* Camera */}
      <div className="relative overflow-hidden rounded-xl border-2 bg-muted">
        {!cameraActive ? (
          <div className="flex flex-col items-center justify-center py-32">
            {cameraError ? (
              <>
                <VideoOff className="size-16 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-destructive">{cameraError}</p>
              </>
            ) : (
              <>
                <Camera className="size-16 text-muted-foreground/50" />
                <p className="mt-3 text-muted-foreground">
                  Start the camera to begin kiosk check-in
                </p>
              </>
            )}
            <Button className="mt-6" size="lg" onClick={startCamera}>
              <Camera className="mr-2 size-5" />
              Start Camera
            </Button>
          </div>
        ) : (
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full" />

            {/* Result overlay */}
            {state !== "idle" && state !== "capturing" && result && (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center border-4 ${overlayClasses[state]}`}
              >
                <div className="rounded-2xl bg-background/90 px-8 py-6 text-center shadow-lg backdrop-blur-sm">
                  {overlayIcons[state]}
                  {result.employeeName && (
                    <p className="mt-3 text-2xl font-bold">{result.employeeName}</p>
                  )}
                  {result.employeeCode && (
                    <p className="text-sm text-muted-foreground">{result.employeeCode}</p>
                  )}
                  <p
                    className={`mt-2 text-lg font-medium ${
                      state === "success"
                        ? "text-green-600 dark:text-green-400"
                        : state === "duplicate"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.confidence !== undefined && result.confidence > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Capture button */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <Button
                size="lg"
                className="h-14 px-8 text-lg shadow-lg"
                onClick={handleCapture}
                disabled={state === "capturing" || !locationId}
              >
                {state === "capturing" ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Identifying...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 size-5" />
                    Capture & Identify
                  </>
                )}
              </Button>
            </div>

            {/* Stop camera button */}
            <div className="absolute right-4 top-4">
              <Button variant="secondary" size="sm" onClick={stopCamera}>
                Stop Camera
              </Button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
