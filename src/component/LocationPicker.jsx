import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Vite bundles assets under hashed URLs, which breaks Leaflet's default
// marker icon lookup (it assumes relative paths on the same origin).
// Point the default icon at the bundled asset URLs explicitly.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [5.6037, -0.187]; // Accra, Ghana — sensible default before a pin is dropped

// Re-centers the map whenever the pinned position changes from outside the
// map itself (address search, "use my location", or loading an existing listing).
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 15));
    }
  }, [position, map]);

  return null;
}

// Lets the agent drop/move the pin by clicking anywhere on the map.
function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/**
 * Interactive map for capturing a listing's exact GPS coordinates.
 * Coordinates are required so every listing can be checked against known
 * risk zones (flooding, waterways, etc.) — agents can drop a pin, search an
 * address, or use their current location instead of typing raw lat/lng values.
 */
export default function LocationPicker({ latitude, longitude, onChange, addressQuery }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  const hasValidPosition =
    latitude !== "" &&
    longitude !== "" &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude));
  const position = hasValidPosition ? [Number(latitude), Number(longitude)] : null;

  const handlePick = (lat, lng) => {
    onChange({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePick(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    const query = searchTerm.trim() || addressQuery;
    if (!query) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=gh&q=${encodeURIComponent(query)}`
      );
      const results = await response.json();
      if (results?.[0]) {
        handlePick(Number(results[0].lat), Number(results[0].lon));
      }
    } catch (err) {
      console.error("Address search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search an address to jump to it on the map"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {searching ? <LoaderCircle className="animate-spin" size={16} /> : <Search size={16} />}
          Find on map
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locating ? <LoaderCircle className="animate-spin" size={16} /> : <LocateFixed size={16} />}
          Use my location
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={position || DEFAULT_CENTER} zoom={position ? 15 : 7} style={{ height: "280px", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          <RecenterMap position={position} />
          {position ? (
            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = event.target.getLatLng();
                  handlePick(lat, lng);
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin size={12} />
        {position
          ? `Pinned at ${position[0].toFixed(5)}, ${position[1].toFixed(5)}`
          : "Click on the map, search an address, or use your current location to drop a pin — required so we can check this property against known risk zones."}
      </p>
    </div>
  );
}
