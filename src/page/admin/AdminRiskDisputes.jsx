import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle2, LoaderCircle, MapPin, ShieldAlert, XCircle } from "lucide-react";
import { adminContext } from "../../context/adminContext";

const severityStyles = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-rose-100 text-rose-700",
};

const statusFilters = [
  { value: "pending", label: "Pending" },
  { value: "resolved_confirmed", label: "Resolved — confirmed" },
  { value: "resolved_dismissed", label: "Resolved — dismissed" },
];

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminRiskDisputes() {
  const { getRiskDisputes, resolveDispute } = useContext(adminContext);

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [activeRow, setActiveRow] = useState(null); // { listingId, alertId }
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getRiskDisputes({ status: statusFilter, limit: 50 });
      setDisputes(result?.data?.disputes || []);
    } catch (err) {
      console.error(err);
      setError("We could not load risk alert disputes right now.");
    } finally {
      setLoading(false);
    }
  }, [getRiskDisputes, statusFilter]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const openDecision = (row) => {
    setActiveRow({ listingId: row.listingId, alertId: row.alert._id });
    setAdminNote("");
  };

  const handleResolve = async (event, decision) => {
    event.preventDefault();
    if (!activeRow) return;
    setSubmitting(true);
    try {
      await resolveDispute(activeRow.listingId, activeRow.alertId, decision, adminNote.trim() || undefined);
      toast.success(decision === "confirmed" ? "Risk confirmed — alert remains on the listing." : "Dispute upheld — alert removed from the listing.");
      setActiveRow(null);
      await loadDisputes();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not resolve this dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldAlert size={18} className="text-rose-600" /> Risk alert disputes
        </h2>
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
        <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : disputes.length === 0 ? (
        <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No {statusFilter.replace(/_/g, " ")} disputes right now.
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((row) => (
            <div key={`${row.listingId}-${row.alert._id}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-3">
                  {row.primaryPhoto ? (
                    <img src={row.primaryPhoto} alt={row.listingTitle} className="h-16 w-16 rounded-2xl object-cover" />
                  ) : null}
                  <div>
                    <p className="font-semibold text-slate-900">{row.listingTitle}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> {row.listingCity}, {row.listingRegion}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Agent: {row.agent?.firstName} {row.agent?.lastName} ({row.agent?.email})
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${severityStyles[row.alert.severity] || "bg-slate-100 text-slate-600"}`}>
                  {row.alert.severity}
                </span>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-800">{row.alert.type?.replace(/_/g, " ")}</p>
                <p className="mt-1 text-slate-600">{row.alert.description}</p>
                <p className="mt-2 text-xs text-slate-500">Flagged {formatDate(row.alert.flaggedAt)}</p>
              </div>

              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">Agent's dispute reason</p>
                <p className="mt-1">{row.alert.disputeReason}</p>
                {row.alert.disputeDocumentUrl ? (
                  <a href={row.alert.disputeDocumentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-amber-900 underline">
                    View supporting document
                  </a>
                ) : null}
                <p className="mt-2 text-xs text-amber-700">Disputed {formatDate(row.alert.disputedAt)}</p>
              </div>

              {row.alert.disputeStatus !== "pending" ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-800">
                    {row.alert.disputeStatus === "resolved_confirmed" ? "Risk confirmed — alert kept" : "Dispute upheld — alert removed"}
                  </p>
                  {row.alert.disputeAdminNote ? <p className="mt-1 text-slate-600">{row.alert.disputeAdminNote}</p> : null}
                  <p className="mt-1 text-xs text-slate-400">Resolved {formatDate(row.alert.resolvedAt)}</p>
                </div>
              ) : (
                <div className="mt-4">
                  {activeRow?.alertId === row.alert._id ? (
                    <form className="space-y-2 rounded-2xl border border-slate-200 p-4">
                      <label className="text-xs font-semibold uppercase text-slate-500">Explanation (optional)</label>
                      <textarea
                        value={adminNote}
                        onChange={(event) => setAdminNote(event.target.value)}
                        rows={2}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={(event) => handleResolve(event, "dismissed")}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <CheckCircle2 size={15} /> Approve dispute (remove alert)
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={(event) => handleResolve(event, "confirmed")}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                        >
                          <XCircle size={15} /> Reject dispute (keep alert)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRow(null)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openDecision(row)}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Review dispute
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
