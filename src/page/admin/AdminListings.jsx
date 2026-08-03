import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  Flag,
  LoaderCircle,
  MapPin,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { adminContext } from "../../context/adminContext";

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

export default function AdminListings() {
  const { getAllListingsAdmin, reviewListing, verifyListingAdmin, featureListing } = useContext(adminContext);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 60 };
      if (statusFilter) params.status = statusFilter;
      if (flaggedOnly) params.isFlagged = "true";
      const result = await getAllListingsAdmin(params);
      setListings(result?.data?.listings || []);
    } catch (err) {
      console.error(err);
      setError("We could not load listings right now.");
    } finally {
      setLoading(false);
    }
  }, [getAllListingsAdmin, statusFilter, flaggedOnly]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    if (!selected) return;
    const updated = listings.find((l) => l._id === selected._id);
    if (updated) setSelected(updated);
  }, [listings, selected]);

  const handleApprove = async (listingId) => {
    setBusy(true);
    try {
      await reviewListing(listingId, "approve");
      toast.success("Listing approved and published.");
      setShowRejectForm(false);
      await loadListings();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not approve this listing.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (event, listingId) => {
    event.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setBusy(true);
    try {
      await reviewListing(listingId, "reject", rejectReason.trim());
      toast.success("Listing rejected.");
      setShowRejectForm(false);
      setRejectReason("");
      await loadListings();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not reject this listing.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (listingId) => {
    setBusy(true);
    try {
      await verifyListingAdmin(listingId);
      toast.success("Listing verified.");
      await loadListings();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not verify this listing.");
    } finally {
      setBusy(false);
    }
  };

  const handleFeature = async (listingId) => {
    setBusy(true);
    try {
      await featureListing(listingId, 7);
      toast.success("Listing featured for 7 days.");
      await loadListings();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not feature this listing.");
    } finally {
      setBusy(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setShowRejectForm(false);
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
        >
          <ArrowLeft size={16} /> Back to listings
        </button>

        <div className="space-y-6 rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[selected.status] || "bg-slate-100 text-slate-700"}`}>
                {selected.status?.replace(/_/g, " ")}
              </span>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">{selected.title}</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={14} /> {selected.location?.neighborhood || selected.location?.city}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Agent: {selected.listedBy?.firstName} {selected.listedBy?.lastName} ({selected.listedBy?.email})
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900">{formatCurrency(selected.price)}</p>
              <p className="text-xs text-slate-400">Listed {formatDate(selected.createdAt)}</p>
            </div>
          </div>

          {selected.isFlagged ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <Flag size={16} /> This listing has been reported by users.
            </div>
          ) : null}

          {selected.riskAlerts?.length ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">{selected.riskAlerts.length} risk alert(s) on this listing</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            {selected.status === "pending_review" ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleApprove(selected._id)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <ThumbsUp size={15} /> Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowRejectForm((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                >
                  <ThumbsDown size={15} /> Reject
                </button>
              </>
            ) : null}
            {!selected.isVerified ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleVerify(selected._id)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-60"
              >
                <BadgeCheck size={15} /> Verify listing
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
                <BadgeCheck size={15} /> Verified
              </span>
            )}
            {!selected.isFeatured ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleFeature(selected._id)}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
              >
                <Sparkles size={15} /> Feature (7 days)
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                <Sparkles size={15} /> Featured
              </span>
            )}
          </div>

          {showRejectForm ? (
            <form onSubmit={(event) => handleReject(event, selected._id)} className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <label className="text-xs font-semibold uppercase text-rose-700">Rejection reason</label>
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={2}
                required
                className="w-full rounded-2xl border border-rose-200 px-4 py-2 text-sm outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                Confirm rejection
              </button>
            </form>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">All listings</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={flaggedOnly} onChange={(event) => setFlaggedOnly(event.target.checked)} />
            Flagged only
          </label>
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
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No listings match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-4xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{listing.title}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={11} /> {listing.location?.city}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {listing.listedBy?.firstName} {listing.listedBy?.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[listing.status] || "bg-slate-100 text-slate-700"}`}>
                      {listing.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(listing.price)}</td>
                  <td className="px-4 py-3">
                    {listing.isFlagged ? <Flag size={14} className="text-rose-600" /> : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(listing)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
