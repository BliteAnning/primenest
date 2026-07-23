import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CircleAlert,
  ClipboardList,
  LayoutGrid,
  ListChecks,
  LoaderCircle,
  LogOut,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import axiosInstance from "../../axiosInstance";
import AgentOverview from "./AgentOverview";
import AgentListings from "./AgentListings";
import AgentListingForm from "./AgentListingForm";
import AgentRiskAlerts from "./AgentRiskAlerts";
import AgentProfile from "./AgentProfile";

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "listings", label: "My listings", icon: ListChecks },
  { id: "add-listing", label: "Add listing", icon: PlusCircle },
  { id: "risk-alerts", label: "Risk alerts", icon: ShieldAlert },
  { id: "profile", label: "Profile", icon: UserRound },
];

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [editingListingId, setEditingListingId] = useState(null);

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

        if (!fetchedUser) {
          throw new Error("Unable to load account");
        }

        if (fetchedUser.role !== "agent") {
          window.location.href = fetchedUser.role === "tenant" || fetchedUser.role === "buyer" ? "/my-dashboard-t" : "/listings";
          return;
        }

        if (!fetchedUser.onboardingCompleted) {
          navigate("/onboarding", { state: { role: "agent" } });
          return;
        }

        setUser(fetchedUser);
        localStorage.setItem("primenestUser", JSON.stringify(fetchedUser));
      } catch (err) {
        console.error(err);
        setError("We could not load your agent account right now.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("primenestUser", JSON.stringify(updatedUser));
  };

  const handleEditListing = (listingId) => {
    setEditingListingId(listingId);
    setActiveTab("add-listing");
  };

  const handleListingSaved = () => {
    setEditingListingId(null);
    setActiveTab("listings");
  };

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

  const isApproved = Boolean(user.isActive);
  const isVerified = Boolean(user.agentProfile?.licenseVerified);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 rounded-4xl border border-emerald-100 bg-white/80 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Building2 size={16} /> Agent dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome back, {user.firstName || "agent"}</h1>
            <p className="mt-2 text-sm text-slate-600">Manage your listings, media, risk alerts, and profile from one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              <BadgeCheck size={16} /> {isApproved ? "Approved" : "Pending approval"}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              <Sparkles size={16} /> {isVerified ? "Verified agent" : "Not verified"}
            </span>
            <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {!isApproved ? (
          <div className="mb-6 flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <p>
              Your agent account is awaiting admin approval. You can explore your dashboard, but you will not be able to publish new listings until an admin approves your account.
            </p>
          </div>
        ) : !isVerified ? (
          <div className="mb-6 flex items-start gap-3 rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
            <ClipboardList size={18} className="mt-0.5 shrink-0" />
            <p>
              You&apos;re approved and can create listings, but they&apos;ll go through a quick admin review before appearing publicly. Get verified from your profile tab for instant publishing.
            </p>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-4xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <UserRound size={22} />
              </div>
              <p className="mt-3 font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-slate-500">{user.agentProfile?.agencyName || "Independent agent"}</p>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id !== "add-listing") setEditingListingId(null);
                      setActiveTab(item.id);
                    }}
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
            {activeTab === "overview" ? <AgentOverview user={user} onNavigate={setActiveTab} /> : null}
            {activeTab === "listings" ? <AgentListings onEditListing={handleEditListing} /> : null}
            {activeTab === "add-listing" ? (
              <AgentListingForm user={user} editingListingId={editingListingId} onSaved={handleListingSaved} />
            ) : null}
            {activeTab === "risk-alerts" ? <AgentRiskAlerts /> : null}
            {activeTab === "profile" ? <AgentProfile user={user} onUserUpdate={handleUserUpdate} /> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
