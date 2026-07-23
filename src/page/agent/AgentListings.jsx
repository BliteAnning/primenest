import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Eye,
  Heart,
  LoaderCircle,
  MapPin,
  PencilLine,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import axiosInstance from "../../axiosInstance";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  under_offer: "bg-sky-100 text-sky-700",
  let: "bg-indigo-100 text-indigo-700",
  sold: "bg-purple-100 text-purple-700",
  archived: "bg-slate-200 text-slate-600",
  rejected: "bg-rose-100 text-rose-700",
};

const statusLabels = {
  draft: "Draft",
  pending_review: "Pending review",
  active: "Active",
  under_offer: "Under offer",
  let: "Let",
  sold: "Sold",
  archived: "Paused",
  rejected: "Rejected",
};

// Mirrors the transition map enforced by the backend toggleListingStatus endpoint
const availableActions = (status) => {
  if (status === "active") {
    return [
      { action: "pause", label: "Pause listing" },
      { action: "under_offer", label: "Mark under offer" },
      { action: "mark_let", label: "Mark as let" },
      { action: "mark_sold", label: "Mark as sold" },
    ];
  }
  if (status === "archived") {
    return [{ action: "reactivate", label: "Reactivate (send for review)" }];
  }
  if (status === "under_offer") {
    return [
      { action: "mark_let", label: "Mark as let" },
      { action: "mark_sold", label: "Mark as sold" },
    ];
  }
  return [];
};

const statusFilters = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending review" },
  { value: "active", label: "Active" },
  { value: "under_offer", label: "Under offer" },
  { value: "let", label: "Let" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Paused" },
  { value: "rejected", label: "Rejected" },
];

export default function AgentListings({ onEditListing }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionListingId, setActionListingId] = useState(null);

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/listings/my/listings", {
          params: { limit: 100, ...(statusFilter ? { status: statusFilter } : {}) },
        });
        setListings(response?.data?.data?.listings || []);
      } catch (err) {
        console.error(err);
        setError("We could not load your listings right now.");
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [statusFilter]);

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const response = await axiosInstance.get(`/listings/${id}`);
      setSelectedListing(response?.data?.data?.listing || null);
    } catch (err) {
      console.error(err);
      toast.error("We could not load this listing's details.");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelectedListing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing permanently? This cannot be undone.")) return;

    try {
      await axiosInstance.delete(`/listings/${id}`);
      toast.success("Listing deleted.");
      setListings((current) => current.filter((item) => item._id !== id));
      if (selectedId === id) closeDetail();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not delete this listing.");
    }
  };

  const handleStatusChange = async (id, action) => {
    setActionListingId(id);
    try {
      const response = await axiosInstance.patch(`/listings/${id}/status`, { action });
      const updated = response?.data?.data?.listing;
      setListings((current) => current.map((item) => (item._id === id ? { ...item, status: updated?.status || item.status } : item)));
      if (selectedListing?._id === id) {
        setSelectedListing((current) => (current ? { ...current, status: updated?.status || current.status } : current));
      }
      toast.success("Listing status updated.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not update this listing's status.");
    } finally {
      setActionListingId(null);
    }
  };

  if (selectedId) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={closeDetail} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
          <ArrowLeft size={16} /> Back to listings
        </button>

        {detailLoading || !selectedListing ? (
          <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
            <LoaderCircle className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : (
          <div className="space-y-6 rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[selectedListing.status] || "bg-slate-100 text-slate-700"}`}>
                  {statusLabels[selectedListing.status] || selectedListing.status}
                </span>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">{selectedListing.title}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} /> {selectedListing.location?.neighborhood || selectedListing.location?.city}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEditListing(selectedListing._id)}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <PencilLine size={15} /> Edit listing
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedListing._id)}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>

            {selectedListing.status === "rejected" && selectedListing.rejectionReason ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <p className="font-semibold">Rejected by admin</p>
                <p className="mt-1">{selectedListing.rejectionReason}</p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Price</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(selectedListing.price)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="flex items-center gap-2 text-sm text-slate-500"><Eye size={14} /> Views</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{selectedListing.viewCount || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="flex items-center gap-2 text-sm text-slate-500"><Heart size={14} /> Saved</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{selectedListing.saveCount || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="flex items-center gap-2 text-sm text-slate-500"><ShieldAlert size={14} /> Risk alerts</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedListing.hasRiskAlerts ? `${selectedListing.riskAlerts?.length || 0} active` : "None"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="flex items-center gap-2 text-sm text-slate-500"><BedDouble size={14} /> Bedrooms</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{selectedListing.bedrooms ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="flex items-center gap-2 text-sm text-slate-500"><Bath size={14} /> Bathrooms</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{selectedListing.bathrooms ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Listed on</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formatDate(selectedListing.createdAt)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900">Description</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{selectedListing.description}</p>
            </div>

            {selectedListing.media?.length ? (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Media</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {selectedListing.media.map((item) => (
                    <div key={item._id} className="overflow-hidden rounded-2xl border border-slate-200">
                      {item.type === "video" ? (
                        <video src={item.url} className="h-32 w-full object-cover" controls />
                      ) : (
                        <img src={item.url} alt={item.caption || selectedListing.title} className="h-32 w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {selectedListing.riskAlerts?.length ? (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Risk alerts on this listing</h3>
                <div className="space-y-3">
                  {selectedListing.riskAlerts.map((alert) => (
                    <div key={alert._id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{alert.type?.replace(/_/g, " ")}</span>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold uppercase">{alert.severity}</span>
                      </div>
                      <p className="mt-2">{alert.description}</p>
                      <p className="mt-2 text-xs text-amber-700">
                        {alert.isDisputed
                          ? `Dispute status: ${alert.disputeStatus || "pending"}`
                          : "Not yet disputed — manage disputes from the Risk alerts tab."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {availableActions(selectedListing.status).length ? (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                {availableActions(selectedListing.status).map(({ action, label }) => (
                  <button
                    key={action}
                    type="button"
                    disabled={actionListingId === selectedListing._id}
                    onClick={() => handleStatusChange(selectedListing._id, action)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">My listings</h2>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
        >
          {statusFilters.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No listings match this filter yet.</p>
          <p className="mt-2 text-sm">Create your first listing from the Add listing tab.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => {
            const thumbnail = listing.media?.find((item) => item.type === "photo")?.url;
            return (
              <div key={listing._id} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-36 bg-slate-100">
                  {thumbnail ? (
                    <img src={thumbnail} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No photo yet</div>
                  )}
                  <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[listing.status] || "bg-slate-100 text-slate-700"}`}>
                    {statusLabels[listing.status] || listing.status}
                  </span>
                  {listing.hasRiskAlerts ? (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
                      <ShieldAlert size={12} /> Risk
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <p className="font-semibold text-slate-900 line-clamp-1">{listing.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={13} /> {listing.location?.neighborhood || listing.location?.city}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(listing.price)}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Eye size={13} /> {listing.viewCount || 0}</span>
                    <span className="flex items-center gap-1"><Heart size={13} /> {listing.saveCount || 0}</span>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <button type="button" onClick={() => openDetail(listing._id)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      View
                    </button>
                    <button type="button" onClick={() => onEditListing(listing._id)} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50">
                      <PencilLine size={13} /> Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(listing._id)} className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
