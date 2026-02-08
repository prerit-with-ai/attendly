"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wifi } from "lucide-react";
import { toast } from "sonner";

import { createCameraSchema, type CreateCameraValues } from "@/lib/validators/camera";
import { createCamera, updateCamera, testCameraConnection } from "@/actions/camera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: { id: string; name: string }[];
  camera?: {
    id: string;
    name: string;
    rtspUrl: string;
    description: string | null;
    locationId: string;
  };
}

export function CameraDialog({
  open,
  onOpenChange,
  locations,
  camera: editCamera,
}: CameraDialogProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const isEditing = !!editCamera;

  const form = useForm<CreateCameraValues>({
    resolver: zodResolver(createCameraSchema),
    defaultValues: {
      name: editCamera?.name ?? "",
      locationId: editCamera?.locationId ?? "",
      rtspUrl: editCamera?.rtspUrl ?? "",
      description: editCamera?.description ?? "",
    },
  });

  async function handleTestConnection() {
    const rtspUrl = form.getValues("rtspUrl");
    if (!rtspUrl) {
      toast.error("Enter an RTSP URL first");
      return;
    }

    setTesting(true);
    const result = await testCameraConnection(rtspUrl);
    setTesting(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  async function onSubmit(values: CreateCameraValues) {
    setLoading(true);

    const result = isEditing
      ? await updateCamera({ ...values, id: editCamera.id })
      : await createCamera(values);

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Camera updated" : "Camera added");
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Camera" : "Add Camera"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the camera details." : "Add a new CCTV camera to your system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Entrance Camera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rtspUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RTSP URL</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="rtsp://admin:pass@192.168.1.100:554/stream" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={testing}
                      onClick={handleTestConnection}
                    >
                      {testing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Wifi className="size-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Camera facing the main entrance..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Update" : "Add Camera"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
