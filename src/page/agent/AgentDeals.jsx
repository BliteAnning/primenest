import { useCallback, useEffect, useMemo, useState } from "react";
import { Handshake, LoaderCircle, MapPin, User2 } from "lucide-react";
import axiosInstance from "../../axiosInstance";

const formatCurrency = (value, currency = "GHS") =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const dealTypeFilters = [
  { value: "", label: "All deals" },
  { value: "sale", label: "Sales" },
  { value: "rental", label: "Rentals" },
];

export default function AgentDeals() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dealType, setDealType] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/transactions/my", {
        params: { limit: 100, ...(dealType ? { dealType } : {}) },
      });
      setTransactions(response?.data?.data?.transactions || []);
    } catch (err) {
      console.error(err);
      setError("We could not load your deals right now.");
    } finally {
      setLoading(false);
    }
  }, [dealType]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        acc.count += 1;
        acc.amount += t.amount || 0;
        return acc;
      },
      { count: 0, amount: 0 }
    );
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Handshake size={20} className="text-lime-600" /> My deals
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {totals.count} closed deal{totals.count === 1 ? "" : "s"} • {formatCurrency(totals.amount)} total received
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dealTypeFilters.map((filter) => (
            <button
              key={filter.value || "all"}
              type="button"
              onClick={() => setDealType(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                dealType === filter.value
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
        <div className="flex items-center justify-center rounded-4xl border border-slate-200 bg-white py-20 shadow-sm">
          <LoaderCircle className="animate-spin text-lime-600" size={32} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500">
          No deals recorded yet. Mark a listing as "let" or "sold" from My listings to record your first deal.
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((t) => (
            <div key={t._id} className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{t.listing?.title || "Listing"}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={13} /> {t.listing?.location?.neighborhood || t.listing?.location?.city || "—"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${t.dealType === "sale" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"}`}>
                  {t.dealType === "sale" ? "Sold" : "Rented"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Amount received</p>
                  <p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(t.amount, t.currency)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="flex items-center gap-1 font-semibold text-slate-800"><User2 size={13} /> Tenant/buyer</p>
                  <p className="mt-1">{t.buyer ? `${t.buyer.firstName} ${t.buyer.lastName}` : t.buyerName}</p>
                  {t.buyerContact || t.buyer?.email || t.buyer?.phone ? (
                    <p className="mt-0.5 text-xs text-slate-400">{t.buyerContact || t.buyer?.email || t.buyer?.phone}</p>
                  ) : null}
                </div>
              </div>

              {t.notes ? <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{t.notes}</p> : null}

              <p className="mt-3 text-xs text-slate-400">Closed {formatDate(t.dealDate)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
