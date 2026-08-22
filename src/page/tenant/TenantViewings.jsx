import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { CalendarClock, Loader2, MapPin, Phone, User2, XCircle } from "lucide-react";
import { engagementContext } from "../../context/engagementContext";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusStyles = {
  requested: "bg-amber-100 text-amber-700",
  confirmed: "bg-lime-100 text-lime-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
  declined: "bg-rose-100 text-rose-700",
};

const statusFilters = [
  { value: "", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "declined", label: "Declined" },
];

export default function TenantViewings() {
  const { fetchMyViewings, cancelViewing } = useContext(engagementContext);
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionId, setActionId] = useState(null);

  const loadViewings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyViewings(statusFilter ? { status: statusFilter } : {});
      setViewings(data);
    } catch (err) {
      console.error(err);
      setError("We could not load your viewings right now.");
    } finally {
      setLoading(false);
    }
  }, [fetchMyViewings, statusFilter]);

  useEffect(() => {
    loadViewings();
  }, [loadViewings]);

  const counts = useMemo(() => {
    return viewings.reduce(
      (acc, viewing) => {
        acc.total += 1;
        acc[viewing.status] = (acc[viewing.status] || 0) + 1;
        return acc;
      },
      { total: 0 }
    );
  }, [viewings]);

  const handleCancel = async (id) => {
    const reason = window.prompt("Reason for cancelling this viewing (optional):") || "";
    setActionId(id);
    try {
      const updated = await cancelViewing(id, reason);
      setViewings((current) => current.map((item) => (item._id === id ? { ...item, ...updated } : item)));
      toast.success("Viewing cancelled.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not cancel this viewing.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <CalendarClock size={20} className="text-lime-600" /> My viewings
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {counts.total} total • {counts.requested || 0} awaiting confirmation
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                statusFilter === filter.value
                  ? "border-lime-600 bg-lime-600 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-slate-200 bg-white py-20 shadow-sm">
          <Loader2 className="animate-spin text-lime-600" size={32} />
        </div>
      ) : viewings.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500">
          You haven't booked any viewings yet. Open a listing and request a viewing to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {viewings.map((viewing) => (
            <div key={viewing._id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{viewing.listing?.title || "Listing"}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <User2 size={14} /> {viewing.agent?.firstName} {viewing.agent?.lastName}
                  </p>
                  {viewing.agent?.phone ? (
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <Phone size={12} /> {viewing.agent.phone}
                    </p>
                  ) : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[viewing.status] || "bg-slate-100 text-slate-700"}`}>
                  {viewing.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Requested for</p>
                  <p className="mt-1">{formatDateTime(viewing.requestedDate)}</p>
                </div>
                {viewing.confirmedDate ? (
                  <div className="rounded-2xl bg-lime-50 p-3 text-sm text-lime-700">
                    <p className="font-semibold">Confirmed for</p>
                    <p className="mt-1">{formatDateTime(viewing.confirmedDate)}</p>
                  </div>
                ) : null}
              </div>

              {viewing.address ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} /> {viewing.address}
                </p>
              ) : null}

              {viewing.notes ? (
                <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">"{viewing.notes}"</p>
              ) : null}

              {viewing.cancelReason ? (
                <p className="mt-3 text-sm text-rose-600">Cancellation reason: {viewing.cancelReason}</p>
              ) : null}
              {viewing.declineReason ? (
                <p className="mt-3 text-sm text-rose-600">Decline reason: {viewing.declineReason}</p>
              ) : null}

              {viewing.status === "requested" || viewing.status === "confirmed" ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleCancel(viewing._id)}
                    disabled={actionId === viewing._id}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    <XCircle size={15} /> Cancel viewing
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
