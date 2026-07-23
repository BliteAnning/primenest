import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { LoaderCircle, MapPin, ShieldAlert } from "lucide-react";
import axiosInstance from "../../axiosInstance";

const severityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

export default function AgentRiskAlerts() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disputeDrafts, setDisputeDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/listings/my/listings", { params: { limit: 100 } });
        setListings((response?.data?.data?.listings || []).filter((listing) => listing.hasRiskAlerts));
      } catch (err) {
        console.error(err);
        setError("We could not load your flagged listings right now.");
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const handleDraftChange = (alertId, value) => {
    setDisputeDrafts((current) => ({ ...current, [alertId]: value }));
  };

  const handleSubmitDispute = async (listingId, alertId) => {
    const reason = (disputeDrafts[alertId] || "").trim();
    if (!reason) {
      toast.error("Please explain why you're disputing this risk alert.");
      return;
    }

    setSubmittingId(alertId);
    try {
      await axiosInstance.patch(`/listings/${listingId}/risk-alerts/${alertId}/dispute`, { reason });
      toast.success("Dispute submitted for admin review.");
      setListings((current) =>
        current.map((listing) => {
          if (listing._id !== listingId) return listing;
          return {
            ...listing,
            riskAlerts: listing.riskAlerts.map((alert) =>
              alert._id === alertId ? { ...alert, isDisputed: true, disputeStatus: "pending", disputeReason: reason } : alert
            ),
          };
        })
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not submit this dispute.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldAlert size={18} className="text-rose-600" /> Risk alerts on your listings
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Review any flags raised on your properties and submit a dispute with supporting context for our team to re-assess.
        </p>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {listings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No risk alerts on your listings right now.</p>
          <p className="mt-2 text-sm">We&apos;ll notify you here if any of your properties get flagged.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{listing.title}</p>
                  <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} /> {listing.location?.neighborhood || listing.location?.city}</p>
                </div>
              </div>

              <div className="space-y-3">
                {listing.riskAlerts.map((alert) => (
                  <div key={alert._id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-amber-800">{alert.type?.replace(/_/g, " ")}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${severityStyles[alert.severity] || "bg-slate-100 text-slate-700"}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-amber-700">{alert.description || "No additional details provided."}</p>
                    {alert.source ? <p className="mt-1 text-xs text-amber-600">Source: {alert.source}</p> : null}

                    {alert.isDisputed ? (
                      <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-700">Dispute submitted — status: {alert.disputeStatus || "pending"}</p>
                        {alert.disputeReason ? <p className="mt-1">&quot;{alert.disputeReason}&quot;</p> : null}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <textarea
                          rows={2}
                          value={disputeDrafts[alert._id] || ""}
                          onChange={(event) => handleDraftChange(alert._id, event.target.value)}
                          placeholder="Explain why this risk alert should be reviewed or removed..."
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          disabled={submittingId === alert._id}
                          onClick={() => handleSubmitDispute(listing._id, alert._id)}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {submittingId === alert._id ? "Submitting..." : "Submit dispute"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
