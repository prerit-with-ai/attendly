import { getLocations } from "@/actions/location";
import { KioskMode } from "@/components/attendance/kiosk-mode";

export const metadata = {
  title: "Kiosk Check-in - Attndly",
};

export default async function KioskPage() {
  const locations = await getLocations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kiosk Check-in</h1>
        <p className="text-muted-foreground">
          Look at the camera and click capture to check in or out
        </p>
      </div>

      <KioskMode locations={locations.map((l) => ({ id: l.id, name: l.name }))} />
    </div>
  );
}
