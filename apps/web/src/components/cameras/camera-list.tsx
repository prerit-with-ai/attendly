"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";

import { deleteCamera, testCameraConnection, updateCameraStatus } from "@/actions/camera";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CameraDialog } from "./camera-dialog";

interface CameraRow {
  id: string;
  name: string;
  rtspUrl: string;
  description: string | null;
  status: string;
  lastConnectedAt: Date | null;
  locationId: string;
  locationName: string | null;
  createdAt: Date;
}

interface CameraListProps {
  cameras: CameraRow[];
  locations: { id: string; name: string }[];
}

function maskRtspUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "****";
    }
    return parsed.toString();
  } catch {
    return url.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    active: "default",
    inactive: "secondary",
    error: "destructive",
  };
  return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
}

export function CameraList({ cameras, locations }: CameraListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCamera, setEditCamera] = useState<CameraRow | undefined>();
  const [testingId, setTestingId] = useState<string | null>(null);

  function handleAdd() {
    setEditCamera(undefined);
    setDialogOpen(true);
  }

  function handleEdit(cam: CameraRow) {
    setEditCamera(cam);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteCamera(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Camera deleted");
    }
  }

  async function handleTestConnection(cam: CameraRow) {
    setTestingId(cam.id);
    const result = await testCameraConnection(cam.rtspUrl);
    if (result.success) {
      toast.success(result.message);
      await updateCameraStatus(cam.id, "active");
    } else {
      toast.error(result.message);
      await updateCameraStatus(cam.id, "error");
    }
    setTestingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Camera
        </Button>
      </div>

      {cameras.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No cameras yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first CCTV camera to start tracking attendance.
            </p>
            <Button className="mt-4" onClick={handleAdd}>
              <Plus className="mr-2 size-4" />
              Add Camera
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cameras.map((cam) => (
            <Card key={cam.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{cam.name}</CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {cam.locationName || "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={cam.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(cam)}>
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(cam.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">RTSP URL</p>
                  <p className="mt-0.5 truncate font-mono text-xs">{maskRtspUrl(cam.rtspUrl)}</p>
                </div>
                {cam.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    <p className="mt-0.5 text-sm">{cam.description}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={testingId === cam.id}
                  onClick={() => handleTestConnection(cam)}
                >
                  {testingId === cam.id ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : cam.status === "active" ? (
                    <Wifi className="mr-2 size-4" />
                  ) : (
                    <WifiOff className="mr-2 size-4" />
                  )}
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CameraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        locations={locations}
        camera={editCamera}
      />
    </div>
  );
}
