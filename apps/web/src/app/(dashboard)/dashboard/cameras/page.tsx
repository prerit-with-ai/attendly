import { getCameras } from "@/actions/camera";
import { getLocations } from "@/actions/location";
import { CameraList } from "@/components/cameras/camera-list";

export const metadata = {
  title: "Cameras - Attndly",
};

export default async function CamerasPage() {
  const [cameras, locations] = await Promise.all([getCameras(), getLocations()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cameras</h1>
        <p className="text-muted-foreground">Manage your CCTV cameras and RTSP connections</p>
      </div>

      <CameraList
        cameras={cameras}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
      />
    </div>
  );
}
