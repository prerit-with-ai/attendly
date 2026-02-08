"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { enrollFace } from "@/actions/enrollment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentStatus } from "./enrollment-status";
import { PhotoUpload } from "./photo-upload";
import { WebcamCapture } from "./webcam-capture";

const MAX_IMAGES = 5;

interface FaceEnrollmentProps {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    faceEnrolled: boolean;
    faceEnrolledAt: Date | null;
    faceImageCount: number;
  };
}

export function FaceEnrollment({ employee }: FaceEnrollmentProps) {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(!employee.faceEnrolled);

  async function handleEnroll() {
    if (images.length === 0) {
      toast.error("Please add at least one photo");
      return;
    }

    setEnrolling(true);

    const formData = new FormData();
    for (const image of images) {
      formData.append("images", image);
    }

    const result = await enrollFace(employee.id, formData);
    setEnrolling(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Successfully enrolled ${result.faceCount} face(s)`);
    setImages([]);
    setShowEnrollForm(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/employees">
          <ArrowLeft className="mr-2 size-4" />
          Back to Employees
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EnrollmentStatus
            employeeId={employee.id}
            faceEnrolled={employee.faceEnrolled}
            faceEnrolledAt={employee.faceEnrolledAt}
            faceImageCount={employee.faceImageCount}
            onReenroll={() => {
              setImages([]);
              setShowEnrollForm(true);
            }}
          />
        </div>

        <div className="lg:col-span-2">
          {showEnrollForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {employee.faceEnrolled ? "Re-enroll Face" : "Enroll Face"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="upload">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 size-4" />
                      Upload Photos
                    </TabsTrigger>
                    <TabsTrigger value="webcam">
                      <Camera className="mr-2 size-4" />
                      Webcam Capture
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-4">
                    <PhotoUpload
                      images={images}
                      onImagesChange={setImages}
                      maxImages={MAX_IMAGES}
                    />
                  </TabsContent>
                  <TabsContent value="webcam" className="mt-4">
                    <WebcamCapture
                      images={images}
                      onImagesChange={setImages}
                      maxImages={MAX_IMAGES}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  {employee.faceEnrolled && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImages([]);
                        setShowEnrollForm(false);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleEnroll} disabled={enrolling || images.length === 0}>
                    {enrolling && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Enroll Face ({images.length} image{images.length !== 1 ? "s" : ""})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  Face is enrolled. Use the status panel to re-enroll or remove enrollment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
