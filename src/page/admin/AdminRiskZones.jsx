import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LoaderCircle, MapPinned, Plus, RotateCcw, Trash2 } from "lucide-react";
import { adminContext } from "../../context/adminContext";

const GHANA_CENTER = [7.9465, -1.0232];

const zoneTypes = [
  "flood_risk",
  "waterway_buffer",
  "ramsar_site",
  "environmental_zone",
  "demolition_history",
  "unauthorized_development",
  "coastal_erosion",
  "landslide_risk",
];

const sources = ["NADMO", "EPA_Ghana", "Lands_Commission", "OpenStreetMap", "HDX", "Manual", "REGSEC", "WRC", "Survey_Dept"];

const severityStyles = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

function DrawClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

const emptyForm = {
  name: "",
  description: "",
  type: "flood_risk",
  severity: "medium",
  region: "",
  city: "",
  associatedFeature: "",
  source: "Manual",
  bufferMeters: 0,
};

export default function AdminRiskZones() {
  const { getRiskZones, createRiskZone, deactivateRiskZone } = useContext(adminContext);

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [points, setPoints] = useState([]); // [{lat, lng}]
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadZones = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getRiskZones({ limit: 100 });
      setZones(result?.data?.zones || []);
    } catch (err) {
      console.error(err);
      setError("We could not load risk zones right now.");
    } finally {
      setLoading(false);
    }
  }, [getRiskZones]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleDeactivate = async (zoneId) => {
    if (!window.confirm("Deactivate this risk zone? Listings will be re-checked to remove its alerts.")) return;
    try {
      await deactivateRiskZone(zoneId);
      toast.success("Zone deactivated.");
      await loadZones();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not deactivate this zone.");
    }
  };

  const addPoint = (lat, lng) => {
    setPoints((current) => [...current, { lat, lng }]);
  };

  const resetDrawing = () => {
    setPoints([]);
  };

  const submitZone = async (event) => {
    event.preventDefault();
    if (points.length < 3) {
      toast.error("Click at least 3 points on the map to draw the zone's boundary.");
      return;
    }
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Please provide a name and description.");
      return;
    }

    const ring = points.map((p) => [p.lng, p.lat]);
    ring.push(ring[0]); // close the polygon

    setSubmitting(true);
    try {
      await createRiskZone({
        ...form,
        bufferMeters: Number(form.bufferMeters) || 0,
        geometry: { type: "Polygon", coordinates: [ring] },
      });
      toast.success("Risk zone created. Listings are being re-checked in the background.");
      setForm(emptyForm);
      setPoints([]);
      setShowForm(false);
      await loadZones();
    } catch (err) {
      console.error(err);
      toast.error("We could not create this risk zone.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <MapPinned size={18} className="text-emerald-700" /> Risk zones
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={15} /> {showForm ? "Close form" : "Add risk zone"}
        </button>
      </div>

      {showForm ? (
        <div className="space-y-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Click on the map to place the zone's boundary points (at least 3). Click <strong>Reset points</strong> to
            start over.
          </p>
          <div className="h-80 w-full overflow-hidden rounded-2xl border border-slate-200">
            <MapContainer center={GHANA_CENTER} zoom={7} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DrawClickHandler onPick={addPoint} />
              {points.length >= 2 ? (
                <Polygon positions={points.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#059669" }} />
              ) : null}
            </MapContainer>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{points.length} point(s) placed</span>
            <button
              type="button"
              onClick={resetDrawing}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={13} /> Reset points
            </button>
          </div>

          <form onSubmit={submitZone} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))}
                required
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
                required
                rows={2}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Type</label>
              <select
                value={form.type}
                onChange={(event) => setForm((c) => ({ ...c, type: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              >
                {zoneTypes.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Severity</label>
              <select
                value={form.severity}
                onChange={(event) => setForm((c) => ({ ...c, severity: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              >
                {["low", "medium", "high", "critical"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Region</label>
              <input
                value={form.region}
                onChange={(event) => setForm((c) => ({ ...c, region: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">City</label>
              <input
                value={form.city}
                onChange={(event) => setForm((c) => ({ ...c, city: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Associated feature</label>
              <input
                value={form.associatedFeature}
                onChange={(event) => setForm((c) => ({ ...c, associatedFeature: event.target.value }))}
                placeholder="e.g. Odaw River"
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Source</label>
              <select
                value={form.source}
                onChange={(event) => setForm((c) => ({ ...c, source: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              >
                {sources.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Buffer (meters)</label>
              <input
                type="number"
                min="0"
                value={form.bufferMeters}
                onChange={(event) => setForm((c) => ({ ...c, bufferMeters: event.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Create risk zone"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : zones.length === 0 ? (
        <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No risk zones recorded yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {zones.map((zone) => (
            <div key={zone._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{zone.name}</p>
                  <p className="text-xs text-slate-500">{zone.city || zone.region || "—"}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityStyles[zone.severity] || "bg-slate-100 text-slate-600"}`}>
                  {zone.severity}
                </span>
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{zone.type?.replace(/_/g, " ")}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{zone.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{zone.affectedListingsCount || 0} affected listing(s)</span>
                <span className={zone.isActive ? "text-emerald-700" : "text-slate-400"}>{zone.isActive ? "Active" : "Inactive"}</span>
              </div>
              {zone.isActive ? (
                <button
                  type="button"
                  onClick={() => handleDeactivate(zone._id)}
                  className="mt-3 inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 size={12} /> Deactivate
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
