import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Users,
  Building2,
  UserRound,
  Home,
  ShieldAlert,
  BadgeCheck,
  LoaderCircle,
  TrendingUp,
  Ban,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { adminContext } from "../../context/adminContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const roleLabels = {
  tenant: "Tenant",
  buyer: "Buyer",
  agent: "Agent",
  landlord: "Landlord",
  admin: "Admin",
};

export default function AdminOverview({ onNavigate }) {
  const { getOverview } = useContext(adminContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getOverview();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("We could not load the overview stats right now.");
        toast.error("We could not load the overview stats right now.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getOverview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-24 shadow-sm">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error || "No data available."}
      </div>
    );
  }

  const { users, agents, listings, transactions, riskDisputes, charts, recentTransactions, recentSignups } = data;

  const statCards = [
    { label: "Total users", value: users.total, icon: Users, tone: "text-emerald-700" },
    { label: "Agents", value: users.agents, icon: Building2, tone: "text-sky-700" },
    { label: "Tenants", value: users.tenants, icon: UserRound, tone: "text-indigo-700" },
    { label: "Buyers", value: users.buyers, icon: UserRound, tone: "text-purple-700" },
    { label: "Total listings", value: listings.total, icon: Home, tone: "text-emerald-700" },
    { label: "Pending review", value: listings.pendingReview, icon: ShieldAlert, tone: "text-amber-700" },
    { label: "Pending agent approvals", value: agents.pendingApprovals, icon: BadgeCheck, tone: "text-amber-700" },
    { label: "Pending verifications", value: agents.pendingVerifications, icon: BadgeCheck, tone: "text-amber-700" },
    { label: "Suspended accounts", value: users.suspended, icon: Ban, tone: "text-rose-700" },
    { label: "Pending risk disputes", value: riskDisputes.pending, icon: ShieldAlert, tone: "text-rose-700" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className={`flex items-center gap-2 text-sm text-slate-500`}>
              <Icon size={15} className={tone} /> {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp size={15} className="text-emerald-700" /> Total sales
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{transactions.sales.count}</p>
          <p className="mt-1 text-sm text-slate-500">{formatCurrency(transactions.sales.totalAmount)} total value</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp size={15} className="text-indigo-700" /> Total rentals
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{transactions.rentals.count}</p>
          <p className="mt-1 text-sm text-slate-500">{formatCurrency(transactions.rentals.totalAmount)} total value</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Listings created (last 6 months)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.listingsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="listings" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Sales &amp; rentals (last 6 months)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.transactionsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="rentals" stroke="#6366f1" strokeWidth={2} name="Rentals" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent deals</h3>
            <button
              type="button"
              onClick={() => onNavigate?.("listings")}
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              View listings
            </button>
          </div>
          {recentTransactions?.length ? (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t._id} className="rounded-2xl border border-slate-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{t.listing?.title || "Listing"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.dealType === "sale" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"}`}>
                      {t.dealType === "sale" ? "Sold" : "Rented"}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">
                    {t.agent?.firstName} {t.agent?.lastName} → {t.buyer?.firstName} {t.buyer?.lastName} · {formatCurrency(t.amount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(t.dealDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No deals recorded yet.</p>
          )}
        </div>

        <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Recent signups</h3>
          {recentSignups?.length ? (
            <div className="space-y-3">
              {recentSignups.map((u) => (
                <div key={u._id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                    <p className="text-slate-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {roleLabels[u.role] || u.role}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(u.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent signups.</p>
          )}
        </div>
      </div>
    </div>
  );
}
