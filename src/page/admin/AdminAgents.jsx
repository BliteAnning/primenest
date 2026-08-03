import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Eye,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { adminContext } from "../../context/adminContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

const applicationStatusStyles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function AdminAgents() {
  const {
    getAgents,
    getAgentDetail,
    approveAgent,
    rejectAgent,
    verifyAgent,
    declineAgentVerification,
    suspendUser,
    unsuspendUser,
  } = useContext(adminContext);

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [reasonModal, setReasonModal] = useState(null); // { type, userId, title }
  const [reasonText, setReasonText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (applicationStatus) params.applicationStatus = applicationStatus;
      if (verificationStatus) params.verificationStatus = verificationStatus;
      const result = await getAgents(params);
      setAgents(result?.data?.agents || []);
    } catch (err) {
      console.error(err);
      setError("We could not load agents right now.");
    } finally {
      setLoading(false);
    }
  }, [getAgents, search, applicationStatus, verificationStatus]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const result = await getAgentDetail(id);
      setDetail(result);
    } catch (err) {
      console.error(err);
      toast.error("We could not load this agent's details.");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  const refreshAfterAction = async () => {
    await loadAgents();
    if (selectedId) {
      const result = await getAgentDetail(selectedId);
      setDetail(result);
    }
  };

  const handleApprove = async (userId) => {
    setBusyId(userId);
    try {
      await approveAgent(userId);
      toast.success("Agent approved.");
      await refreshAfterAction();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not approve this agent.");
    } finally {
      setBusyId(null);
    }
  };

  const handleVerify = async (userId) => {
    setBusyId(userId);
    try {
      await verifyAgent(userId);
      toast.success("Agent verified.");
      await refreshAfterAction();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not verify this agent.");
    } finally {
      setBusyId(null);
    }
  };

  const handleUnsuspend = async (userId) => {
    setBusyId(userId);
    try {
      await unsuspendUser(userId);
      toast.success("Agent unsuspended.");
      await refreshAfterAction();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not unsuspend this agent.");
    } finally {
      setBusyId(null);
    }
  };

  const openReasonModal = (type, userId, title) => {
    setReasonText("");
    setReasonModal({ type, userId, title });
  };

  const submitReason = async (event) => {
    event.preventDefault();
    if (!reasonModal || !reasonText.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    setSubmitting(true);
    try {
      if (reasonModal.type === "reject") {
        await rejectAgent(reasonModal.userId, reasonText.trim());
        toast.success("Agent application rejected.");
      } else if (reasonModal.type === "decline-verification") {
        await declineAgentVerification(reasonModal.userId, reasonText.trim());
        toast.success("Verification request declined.");
      } else if (reasonModal.type === "suspend") {
        await suspendUser(reasonModal.userId, reasonText.trim());
        toast.success("Agent suspended.");
      }
      setReasonModal(null);
      await refreshAfterAction();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "That action could not be completed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedId) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={closeDetail}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
        >
          <ArrowLeft size={16} /> Back to agents
        </button>

        {detailLoading || !detail ? (
          <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
            <LoaderCircle className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {detail.agent.firstName} {detail.agent.lastName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{detail.agent.email} · {detail.agent.phone}</p>
                  <p className="mt-1 text-sm text-slate-500">{detail.agent.agentProfile?.agencyName || "Independent agent"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${applicationStatusStyles[detail.agent.agentProfile?.applicationStatus] || "bg-slate-100 text-slate-600"}`}>
                    <BadgeCheck size={13} /> {detail.agent.agentProfile?.applicationStatus || "pending"}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${detail.agent.agentProfile?.licenseVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    <ShieldCheck size={13} /> {detail.agent.agentProfile?.licenseVerified ? "Verified" : "Not verified"}
                  </span>
                  {detail.agent.isSuspended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                      <Ban size={13} /> Suspended
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {!detail.agent.isActive && detail.agent.agentProfile?.applicationStatus !== "rejected" ? (
                  <>
                    <button
                      type="button"
                      disabled={busyId === detail.agent._id}
                      onClick={() => handleApprove(detail.agent._id)}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === detail.agent._id}
                      onClick={() => openReasonModal("reject", detail.agent._id, "Reject agent application")}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      <XCircle size={15} /> Decline
                    </button>
                  </>
                ) : null}

                {detail.agent.agentProfile?.verificationRequested ? (
                  <>
                    <button
                      type="button"
                      disabled={busyId === detail.agent._id}
                      onClick={() => handleVerify(detail.agent._id)}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
                    >
                      <ShieldCheck size={15} /> Verify agent
                    </button>
                    <button
                      type="button"
                      disabled={busyId === detail.agent._id}
                      onClick={() => openReasonModal("decline-verification", detail.agent._id, "Decline verification request")}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      <XCircle size={15} /> Decline verification
                    </button>
                  </>
                ) : null}

                {detail.agent.isSuspended ? (
                  <button
                    type="button"
                    disabled={busyId === detail.agent._id}
                    onClick={() => handleUnsuspend(detail.agent._id)}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <CheckCircle2 size={15} /> Unsuspend
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === detail.agent._id}
                    onClick={() => openReasonModal("suspend", detail.agent._id, "Suspend agent")}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    <Ban size={15} /> Suspend
                  </button>
                )}
              </div>

              {detail.agent.agentProfile?.applicationRejectionReason ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <p className="font-semibold">Application rejection reason</p>
                  <p className="mt-1">{detail.agent.agentProfile.applicationRejectionReason}</p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total listings</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{detail.listings.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total sales</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {detail.transactions.filter((t) => t.dealType === "sale").length}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total rentals</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {detail.transactions.filter((t) => t.dealType === "rental").length}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Last login</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formatDateTime(detail.agent.lastLoginAt)}</p>
                <p className="text-xs text-slate-400">{detail.agent.lastLoginIp || "—"}</p>
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Listings</h3>
              {detail.listings.length ? (
                <div className="space-y-2">
                  {detail.listings.map((l) => (
                    <div key={l._id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{l.title}</p>
                        <p className="flex items-center gap-1 text-slate-500"><MapPin size={12} /> {l.location?.city}</p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{l.status}</span>
                        <p className="mt-1 text-slate-500">{formatCurrency(l.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No listings yet.</p>
              )}
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Sales &amp; rentals history</h3>
              {detail.transactions.length ? (
                <div className="space-y-2">
                  {detail.transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{t.listing?.title}</p>
                        <p className="text-slate-500">{t.buyer?.firstName} {t.buyer?.lastName} ({t.buyer?.email})</p>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.dealType === "sale" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"}`}>
                          {t.dealType}
                        </span>
                        <p className="mt-1 text-slate-500">{formatCurrency(t.amount)} · {formatDate(t.dealDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No deals recorded yet.</p>
              )}
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Login history</h3>
              {detail.agent.loginHistory?.length ? (
                <div className="flex flex-wrap gap-2">
                  {[...detail.agent.loginHistory].reverse().map((entry, i) => (
                    <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {formatDateTime(entry.at)} · {entry.ip}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No login history recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {reasonModal ? (
          <ReasonModal
            title={reasonModal.title}
            reasonText={reasonText}
            setReasonText={setReasonText}
            submitting={submitting}
            onCancel={() => setReasonModal(null)}
            onSubmit={submitReason}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search agents by name, email or agency"
            className="w-full rounded-2xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={applicationStatus}
          onChange={(event) => setApplicationStatus(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All application statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={verificationStatus}
          onChange={(event) => setVerificationStatus(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All verification statuses</option>
          <option value="requested">Verification requested</option>
          <option value="verified">Verified</option>
          <option value="unverified">Not verified</option>
        </select>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No agents match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-4xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Listings</th>
                <th className="px-4 py-3">Sales / Rentals</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{agent.firstName} {agent.lastName}</p>
                    <p className="text-xs text-slate-500">{agent.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${applicationStatusStyles[agent.agentProfile?.applicationStatus] || "bg-slate-100 text-slate-600"}`}>
                      {agent.agentProfile?.applicationStatus || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {agent.agentProfile?.licenseVerified ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Verified</span>
                    ) : agent.agentProfile?.verificationRequested ? (
                      <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">Requested</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Not verified</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {agent.stats.totalListings} <span className="text-xs text-slate-400">({agent.stats.activeListings} active)</span>
                  </td>
                  <td className="px-4 py-3">
                    {agent.stats.totalSales} / {agent.stats.totalRentals}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(agent.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDetail(agent._id)}
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

function ReasonModal({ title, reasonText, setReasonText, submitting, onCancel, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Reason</label>
            <textarea
              value={reasonText}
              onChange={(event) => setReasonText(event.target.value)}
              rows={3}
              required
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
