import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Inbox,
  Loader2,
  Mail,
  MessageCircleReply,
  Phone,
  User2,
  X,
} from "lucide-react";
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
  { value: "new", label: "New" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
];

export default function AgentInquiries() {
  const { fetchReceivedInquiries, respondToInquiry, closeInquiry } = useContext(engagementContext);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReceivedInquiries(statusFilter ? { status: statusFilter } : {});
      setInquiries(data);
    } catch (err) {
      console.error(err);
      setError("We could not load your inquiries right now.");
    } finally {
      setLoading(false);
    }
  }, [fetchReceivedInquiries, statusFilter]);

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

  const openReply = (inquiry) => {
    setActiveReplyId(inquiry._id);
    setReplyMessage(inquiry.response?.message || "");
  };

  const handleRespond = async (id) => {
    if (!replyMessage.trim()) {
      toast.error("Please write a response before sending.");
      return;
    }

    setSubmittingId(id);
    try {
      const updated = await respondToInquiry(id, replyMessage.trim());
      setInquiries((current) => current.map((item) => (item._id === id ? { ...item, ...updated } : item)));
      toast.success("Response sent to tenant.");
      setActiveReplyId(null);
      setReplyMessage("");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not send your response.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleClose = async (id) => {
    setSubmittingId(id);
    try {
      const updated = await closeInquiry(id);
      setInquiries((current) => current.map((item) => (item._id === id ? { ...item, ...updated } : item)));
      toast.success("Inquiry closed.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not close this inquiry.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Inbox size={20} className="text-emerald-600" /> Inquiries
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {counts.total} total • {counts.new || 0} awaiting your response
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
        <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500">
          No inquiries to show yet. When a tenant messages you about a listing, it will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry._id} className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{inquiry.listing?.title || "Listing"}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <User2 size={14} />
                    {inquiry.sender?.firstName} {inquiry.sender?.lastName}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                    {inquiry.sender?.email ? (
                      <span className="inline-flex items-center gap-1"><Mail size={12} /> {inquiry.sender.email}</span>
                    ) : null}
                    {inquiry.sender?.phone ? (
                      <span className="inline-flex items-center gap-1"><Phone size={12} /> {inquiry.sender.phone}</span>
                    ) : null}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusStyles[inquiry.status] || "bg-slate-100 text-slate-700"}`}>
                  {inquiry.status}
                </span>
              </div>

              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{inquiry.message}</p>
              <p className="mt-2 text-xs text-slate-400">Received {formatDate(inquiry.createdAt)}</p>

              {inquiry.response?.message ? (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase text-emerald-700">Your response</p>
                  <p className="mt-1 text-sm text-emerald-800">{inquiry.response.message}</p>
                  <p className="mt-1 text-xs text-emerald-600">Sent {formatDate(inquiry.response.respondedAt)}</p>
                </div>
              ) : null}

              {inquiry.status !== "closed" ? (
                <div className="mt-4">
                  {activeReplyId === inquiry._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={replyMessage}
                        onChange={(event) => setReplyMessage(event.target.value)}
                        rows={3}
                        placeholder="Write your response..."
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleRespond(inquiry._id)}
                          disabled={submittingId === inquiry._id}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {submittingId === inquiry._id ? <Loader2 size={15} className="animate-spin" /> : <MessageCircleReply size={15} />}
                          Send response
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(null)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <X size={15} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openReply(inquiry)}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <MessageCircleReply size={15} /> {inquiry.status === "responded" ? "Edit response" : "Respond"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClose(inquiry._id)}
                        disabled={submittingId === inquiry._id}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        Close inquiry
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
