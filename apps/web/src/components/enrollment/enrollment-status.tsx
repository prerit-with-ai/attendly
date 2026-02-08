"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Trash2, RotateCcw } from "lucide-react";

import { removeFaceEnrollment } from "@/actions/enrollment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EnrollmentStatusProps {
  employeeId: string;
  faceEnrolled: boolean;
  faceEnrolledAt: Date | null;
  faceImageCount: number;
  onReenroll: () => void;
}

export function EnrollmentStatus({
  employeeId,
  faceEnrolled,
  faceEnrolledAt,
  faceImageCount,
  onReenroll,
}: EnrollmentStatusProps) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    const result = await removeFaceEnrollment(employeeId);
    setRemoving(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Face enrollment removed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Enrollment Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {faceEnrolled ? (
            <CheckCircle2 className="size-8 text-green-500" />
          ) : (
            <XCircle className="size-8 text-muted-foreground" />
          )}
          <div>
            <Badge variant={faceEnrolled ? "default" : "secondary"}>
              {faceEnrolled ? "Enrolled" : "Not Enrolled"}
            </Badge>
            {faceEnrolled && faceEnrolledAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Enrolled on {new Date(faceEnrolledAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {faceEnrolled && (
          <>
            <div className="text-sm">
              <span className="font-medium">{faceImageCount}</span>{" "}
              <span className="text-muted-foreground">
                face image{faceImageCount !== 1 ? "s" : ""} enrolled
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onReenroll}>
                <RotateCcw className="mr-2 size-4" />
                Re-enroll
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                disabled={removing}
                onClick={handleRemove}
              >
                {removing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Remove
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
