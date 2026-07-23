import { useEffect, useMemo, useState } from "react";
import { Clock, Eye, Heart, Home, LoaderCircle, PlusCircle, ShieldAlert, TrendingUp } from "lucide-react";
import axiosInstance from "../../axiosInstance";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value || 0);

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

export default function AgentOverview({ user, onNavigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadListings = async () => {
      try {
        const response = await axiosInstance.get("/listings/my/listings", { params: { limit: 100 } });
        if (isMounted) {
          setListings(response?.data?.data?.listings || []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("We could not load your listings overview right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadListings();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totals = {
      total: listings.length,
      active: 0,
      pendingReview: 0,
      views: 0,
      saves: 0,
      flagged: 0,
    };

    listings.forEach((listing) => {
      if (listing.status === "active") totals.active += 1;
      if (listing.status === "pending_review") totals.pendingReview += 1;
      if (listing.hasRiskAlerts) totals.flagged += 1;
      totals.views += listing.viewCount || 0;
      totals.saves += listing.saveCount || 0;
    });

    return totals;
  }, [listings]);

  const recentListings = useMemo(() => listings.slice(0, 5), [listings]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500"><Home size={15} /> Total listings</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500"><TrendingUp size={15} /> Active</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.active}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500"><Clock size={15} /> Pending review</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.pendingReview}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500"><ShieldAlert size={15} /> Flagged</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.flagged}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500"><Eye size={15} /> Total views</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.views}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500"><Heart size={15} /> Total saves</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.saves}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("add-listing")}
          disabled={!user.isActive}
          className="flex flex-col items-start justify-center gap-2 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50 p-5 text-left text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlusCircle size={20} />
          <span className="font-semibold">Add a new listing</span>
          {!user.isActive ? <span className="text-xs text-emerald-700/80">Available once your account is approved</span> : null}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent listings</h3>
          <button type="button" onClick={() => onNavigate("listings")} className="text-sm font-semibold text-emerald-700 hover:underline">
            View all
          </button>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <LoaderCircle className="animate-spin text-emerald-600" size={28} />
          </div>
        ) : recentListings.length === 0 ? (
          <p className="text-sm text-slate-500">You have not created any listings yet.</p>
        ) : (
          <div className="space-y-3">
            {recentListings.map((listing) => (
              <div key={listing._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{listing.title}</p>
                  <p className="text-sm text-slate-500">{listing.location?.city || listing.location?.neighborhood || "Location"} • {formatCurrency(listing.price)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {statusLabels[listing.status] || listing.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
