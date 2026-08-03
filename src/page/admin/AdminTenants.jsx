import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ArrowLeft, Eye, Heart, LoaderCircle, MapPin, Search } from "lucide-react";
import { adminContext } from "../../context/adminContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

const roleLabels = { tenant: "Tenant", buyer: "Buyer" };

export default function AdminTenants() {
  const { getTenants, getTenantDetail } = useContext(adminContext);

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const result = await getTenants(params);
      setTenants(result?.data?.tenants || []);
    } catch (err) {
      console.error(err);
      setError("We could not load tenants/buyers right now.");
    } finally {
      setLoading(false);
    }
  }, [getTenants, search, roleFilter]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const result = await getTenantDetail(id);
      setDetail(result);
    } catch (err) {
      console.error(err);
      toast.error("We could not load this account's details.");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  if (selectedId) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={closeDetail}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
        >
          <ArrowLeft size={16} /> Back to tenants / buyers
        </button>

        {detailLoading || !detail ? (
          <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
            <LoaderCircle className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {detail.tenant.firstName} {detail.tenant.lastName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{detail.tenant.email} · {detail.tenant.phone}</p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {roleLabels[detail.tenant.role] || detail.tenant.role}
              </span>

              {detail.tenant.isSuspended ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  Suspended: {detail.tenant.suspensionReason || "No reason given"}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="flex items-center gap-2 text-sm text-slate-500"><Heart size={14} /> Saved listings</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{detail.tenant.savedListings?.length || 0}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Properties bought</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {detail.transactions.filter((t) => t.dealType === "sale").length}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Properties rented</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {detail.transactions.filter((t) => t.dealType === "rental").length}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Last login</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{formatDateTime(detail.tenant.lastLoginAt)}</p>
                <p className="text-xs text-slate-400">{detail.tenant.lastLoginIp || "—"}</p>
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Saved listings</h3>
              {detail.tenant.savedListings?.length ? (
                <div className="space-y-2">
                  {detail.tenant.savedListings.map((l) => (
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
                <p className="text-sm text-slate-500">No saved listings.</p>
              )}
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Bought / rented properties</h3>
              {detail.transactions.length ? (
                <div className="space-y-2">
                  {detail.transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{t.listing?.title}</p>
                        <p className="text-slate-500">
                          Agent: {t.agent?.firstName} {t.agent?.lastName} ({t.agent?.email})
                        </p>
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
                <p className="text-sm text-slate-500">No purchase/rental history yet.</p>
              )}
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">Login history</h3>
              {detail.tenant.loginHistory?.length ? (
                <div className="flex flex-wrap gap-2">
                  {[...detail.tenant.loginHistory].reverse().map((entry, i) => (
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
            placeholder="Search by name or email"
            className="w-full rounded-2xl border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All (tenants &amp; buyers)</option>
          <option value="tenant">Tenants</option>
          <option value="buyer">Buyers</option>
        </select>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-4xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No tenants/buyers match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-4xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Saved</th>
                <th className="px-4 py-3">Bought / Rented</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{tenant.firstName} {tenant.lastName}</p>
                    <p className="text-xs text-slate-500">{tenant.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {roleLabels[tenant.role] || tenant.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{tenant.stats.savedListingsCount}</td>
                  <td className="px-4 py-3">{tenant.stats.totalBought} / {tenant.stats.totalRented}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(tenant.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openDetail(tenant._id)}
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
