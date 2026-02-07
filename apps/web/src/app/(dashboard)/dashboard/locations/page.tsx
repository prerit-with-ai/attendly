import { getLocations } from "@/actions/location";
import { LocationList } from "@/components/locations/location-list";

export const metadata = {
  title: "Locations - Attndly",
};

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div className="space-y-6">
      <LocationList locations={locations} />
    </div>
  );
}
