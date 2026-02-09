"use client";

import { useState } from "react";
import { MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteLocation } from "@/actions/location";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocationDialog } from "./location-dialog";

type Location = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
};

interface LocationListProps {
  locations: Location[];
}

export function LocationList({ locations }: LocationListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | undefined>();

  function handleEdit(loc: Location) {
    setEditLocation(loc);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditLocation(undefined);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteLocation(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Location deleted");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Manage your office locations</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          Add Location
        </Button>
      </div>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No locations yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first office location to get started.
            </p>
            <Button className="mt-4" onClick={handleAdd}>
              <Plus className="size-4" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{loc.name}</CardTitle>
                  <CardDescription>
                    {loc.city}
                    {loc.address && ` — ${loc.address}`}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(loc)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(loc.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={loc.isActive ? "default" : "secondary"}>
                    {loc.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{loc.timezone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LocationDialog open={dialogOpen} onOpenChange={setDialogOpen} location={editLocation} />
    </>
  );
}
