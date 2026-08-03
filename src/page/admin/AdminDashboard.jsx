import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  UserRound,
  Building2,
  ShieldAlert,
  MapPinned,
  LoaderCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import axiosInstance from "../../axiosInstance";
import AdminOverview from "./AdminOverview";
import AdminAgents from "./AdminAgents";
import AdminTenants from "./AdminTenants";
import AdminListings from "./AdminListings";
import AdminRiskZones from "./AdminRiskZones";
import AdminRiskDisputes from "./AdminRiskDisputes";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "agents", label: "Agents", icon: Building2 },
  { id: "tenants", label: "Tenants / Buyers", icon: UserRound },
  { id: "listings", label: "Listings", icon: Users },
  { id: "risk-zones", label: "Risk zones", icon: MapPinned },
  { id: "risk-disputes", label: "Risk alert listings", icon: ShieldAlert },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const response = await axiosInstance.get("/users/me");
        const fetchedUser = response?.data?.data?.user;

        if (!fetchedUser) throw new Error("Unable to load account");

        if (fetchedUser.role !== "admin") {
          window.location.href =
            fetchedUser.role === "agent"
              ? "/my-dashboard-a"
              : fetchedUser.role === "tenant" || fetchedUser.role === "buyer"
              ? "/my-dashboard-t"
              : "/listings";
          return;
        }

        setUser(fetchedUser);
        localStorage.setItem("primenestUser", JSON.stringify(fetchedUser));
      } catch (err) {
        console.error(err);
        setError("We could not load your admin account right now.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("primenestUser");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)]">
        <LoaderCircle className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">{error || "We could not load your dashboard."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 rounded-4xl border border-emerald-100 bg-white/80 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <ShieldCheck size={16} /> Admin dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome back, {user.firstName || "admin"}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage agents, tenants, listings, and risk zones across the platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-4xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck size={22} />
              </div>
              <p className="mt-3 font-semibold text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-slate-500">PrimeNest administrator</p>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                      activeTab === item.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={18} /> {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0">
            {activeTab === "overview" ? <AdminOverview onNavigate={setActiveTab} /> : null}
            {activeTab === "agents" ? <AdminAgents /> : null}
            {activeTab === "tenants" ? <AdminTenants /> : null}
            {activeTab === "listings" ? <AdminListings /> : null}
            {activeTab === "risk-zones" ? <AdminRiskZones /> : null}
            {activeTab === "risk-disputes" ? <AdminRiskDisputes /> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
