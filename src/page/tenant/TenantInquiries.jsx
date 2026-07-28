import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Inbox, Loader2, Mail, Phone, User2, XCircle } from "lucide-react";
import { engagementContext } from "../../context/engagementContext";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusStyles = {
  new: "bg-sky-100 text-sky-700",
  responded: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-200 text-slate-600",
};

const statusFilters = [
  { value: "", label: "All" },
  { value: "new", label: "Awaiting reply" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
];

export default function TenantInquiries() {
  const { fetchMyInquiries, closeInquiry } = useContext(engagementContext);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionId, setActionId] = useState(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyInquiries(statusFilter ? { status: statusFilter } : {});
      setInquiries(data);
    } catch (err) {
      console.error(err);
      setError("We could not load your inquiries right now.");
    } finally {
      setLoading(false);
    }
  }, [fetchMyInquiries, statusFilter]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const counts = useMemo(() => {
    return inquiries.reduce(
      (acc, inquiry) => {
        acc.total += 1;
        acc[inquiry.status] = (acc[inquiry.status] || 0) + 1;
        return acc;
      },
      { total: 0 }
    );
  }, [inquiries]);

  const handleClose = async (id) => {
    setActionId(id);
    try {
      const updated = await closeInquiry(id);
      setInquiries((current) => current.map((item) => (item._id === id ? { ...item, ...updated } : item)));
      toast.success("Inquiry closed.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not close this inquiry.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Inbox size={20} className="text-emerald-600" /> My inquiries
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {counts.total} total • {counts.new || 0} awaiting a reply
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
                  ? "border-emerald-600 bg-emerald-600 text-white"
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
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500">
          You haven't sent any inquiries yet. Open a listing and send a message to the agent to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{inquiry.listing?.title || "Listing"}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <User2 size={14} />
                    {inquiry.recipient?.firstName} {inquiry.recipient?.lastName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                    {inquiry.recipient?.email ? (
                      <span className="inline-flex items-center gap-1"><Mail size={12} /> {inquiry.recipient.email}</span>
                    ) : null}
                    {inquiry.recipient?.phone ? (
                      <span className="inline-flex items-center gap-1"><Phone size={12} /> {inquiry.recipient.phone}</span>
                    ) : null}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[inquiry.status] || "bg-slate-100 text-slate-700"}`}>
                  {inquiry.status}
                </span>
              </div>

              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{inquiry.message}</p>
              <p className="mt-2 text-xs text-slate-400">Sent {formatDate(inquiry.createdAt)}</p>

              {inquiry.response?.message ? (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-700">Agent's response</p>
                  <p className="mt-1 text-sm text-emerald-800">{inquiry.response.message}</p>
                  <p className="mt-1 text-xs text-emerald-600">Received {formatDate(inquiry.response.respondedAt)}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">Waiting for a response from the agent/landlord.</p>
              )}

              {inquiry.status !== "closed" ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleClose(inquiry._id)}
                    disabled={actionId === inquiry._id}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <XCircle size={15} /> Close inquiry
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
