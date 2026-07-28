import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BellRing,
  CalendarClock,
  Compass,
  Heart,
  Inbox,
  LayoutGrid,
  LogOut,
  MapPin,
  PencilLine,
  Search as SearchIcon,
  Sparkles,
  UserRound,
} from "lucide-react";
import axiosInstance from "../axiosInstance";
import EmailAlertsToggle from "../component/EmailAlertsToggle";
import TenantInquiries from "./tenant/TenantInquiries";
import TenantViewings from "./tenant/TenantViewings";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value);

const emptyProfile = {
  firstName: "",
  lastName: "",
  phone: "",
  tenantProfile: {
    monthlyIncome: "",
    budgetMin: "",
    budgetMax: "",
    bedroomsNeeded: "",
    moveInTimeline: "",
    employmentStatus: "",
  },
};

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [savedListings, setSavedListings] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const [profileRes, savedListingsRes, savedSearchesRes] = await Promise.all([
          axiosInstance.get("/users/me"),
          axiosInstance.get("/users/me/saved-listings"),
          axiosInstance.get("/users/me/saved-searches"),
        ]);

        const user = profileRes?.data?.data?.user || null;
        if (user) {
          setUser(user);
          localStorage.setItem("primenestUser", JSON.stringify(user));
          setProfile({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phone || "",
            tenantProfile: {
              monthlyIncome: user.tenantProfile?.monthlyIncome || "",
              budgetMin: user.tenantProfile?.budgetMin || "",
              budgetMax: user.tenantProfile?.budgetMax || "",
              bedroomsNeeded: user.tenantProfile?.bedroomsNeeded || "",
              moveInTimeline: user.tenantProfile?.moveInTimeline || "",
              employmentStatus: user.tenantProfile?.employmentStatus || "",
            },
          });
        }

        setSavedListings(savedListingsRes?.data?.data?.listings || []);
        setSavedSearches(savedSearchesRes?.data?.data?.savedSearches || []);
      } catch (error) {
        console.error(error);
        setMessage("We could not load your dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const stats = useMemo(() => ({
    savedListings: savedListings.length,
    savedSearches: savedSearches.length,
  }), [savedListings.length, savedSearches.length]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("tenantProfile.")) {
      const key = name.replace("tenantProfile.", "");
      setProfile((current) => ({
        ...current,
        tenantProfile: { ...current.tenantProfile, [key]: value },
      }));
      return;
    }

    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setMessage("");

    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        tenantProfile: {
          monthlyIncome: profile.tenantProfile.monthlyIncome,
          budgetMin: profile.tenantProfile.budgetMin,
          budgetMax: profile.tenantProfile.budgetMax,
          bedroomsNeeded: profile.tenantProfile.bedroomsNeeded,
          moveInTimeline: profile.tenantProfile.moveInTimeline,
          employmentStatus: profile.tenantProfile.employmentStatus,
        },
      };

      await axiosInstance.patch("/users/me", payload);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("We could not update your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteSearch = async (searchId) => {
    try {
      await axiosInstance.delete(`/users/me/saved-searches/${searchId}`);
      setSavedSearches((current) => current.filter((item) => item._id !== searchId));
      setMessage("Saved search removed.");
    } catch (error) {
      console.error(error);
      setMessage("We could not remove that saved search.");
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("primenestUser", JSON.stringify(updatedUser));
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "inquiries", label: "Inquiries", icon: Inbox },
    { id: "viewings", label: "Viewings", icon: CalendarClock },
    { id: "saved-listings", label: "Saved listings", icon: Heart },
    { id: "saved-searches", label: "Saved searches", icon: SearchIcon },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 rounded-[2rem] border border-emerald-100 bg-white/80 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Sparkles size={16} /> Tenant dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome back, {profile.firstName || "tenant"}</h1>
            <p className="mt-2 text-sm text-slate-600">Manage your profile, saved homes, and search alerts in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/listings" className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
              Browse listings
            </Link>
            <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <span className="inline-flex items-center gap-2">
                <BellRing size={16} /> Alerts
              </span>
            </button>
          </div>
        </div>

        {message ? <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <UserRound size={22} />
              </div>
              <p className="mt-3 font-semibold text-slate-900">{profile.firstName || "Your account"} {profile.lastName || ""}</p>
              <p className="text-sm text-slate-500">Tenant profile</p>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                      activeView === item.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button type="button" className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              <LogOut size={16} />
              Sign out
            </button>
          </aside>

          <main className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Saved listings</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.savedListings}</p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Saved searches</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.savedSearches}</p>
              </div>
            </section>

            {activeView === "overview" ? (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Your saved homes</h2>
                      <p className="mt-1 text-sm text-slate-600">Pick up where you left off and reopen your favorites.</p>
                    </div>
                    <button type="button" onClick={() => setActiveView("saved-listings")} className="text-sm font-semibold text-emerald-700">
                      View all
                    </button>
                  </div>
                  <div className="mt-5 space-y-3">
                    {savedListings.length ? savedListings.slice(0, 3).map((listing) => (
                      <div key={listing._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3">
                        <div>
                          <p className="font-semibold text-slate-900">{listing.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{listing.location?.neighborhood || listing.location?.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-700">{formatCurrency(listing.price)}</p>
                          <p className="text-xs uppercase text-slate-400">{listing.listingType}</p>
                        </div>
                      </div>
                    )) : <p className="text-sm text-slate-500">No saved listings yet.</p>}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Saved searches</h2>
                      <p className="mt-1 text-sm text-slate-600">Stay on top of searches you care about.</p>
                    </div>
                    <button type="button" onClick={() => setActiveView("saved-searches")} className="text-sm font-semibold text-emerald-700">
                      View all
                    </button>
                  </div>
                  <div className="mt-5 space-y-3">
                    {savedSearches.length ? savedSearches.slice(0, 3).map((search) => (
                      <div key={search._id} className="rounded-2xl border border-slate-200 p-3">
                        <p className="font-semibold text-slate-900">{search.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{search.criteria?.city || search.criteria?.region || "Broad search"}</p>
                      </div>
                    )) : <p className="text-sm text-slate-500">No saved searches yet.</p>}
                  </div>
                </section>
              </div>
            ) : null}

            {activeView === "profile" ? (
              <section className="space-y-6">
                <EmailAlertsToggle user={user} onUserUpdate={handleUserUpdate} />
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Edit your profile</h2>
                    <p className="mt-1 text-sm text-slate-600">Keep your tenant profile current so we can better match you with homes.</p>
                  </div>
                  <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                    <PencilLine size={18} />
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">First name</span>
                    <input name="firstName" value={profile.firstName} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">Last name</span>
                    <input name="lastName" value={profile.lastName} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">Phone</span>
                    <input name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">Monthly income</span>
                    <input name="tenantProfile.monthlyIncome" value={profile.tenantProfile.monthlyIncome} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">Budget minimum</span>
                    <input name="tenantProfile.budgetMin" value={profile.tenantProfile.budgetMin} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">Budget maximum</span>
                    <input name="tenantProfile.budgetMax" value={profile.tenantProfile.budgetMax} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">Bedrooms needed</span>
                    <input name="tenantProfile.bedroomsNeeded" value={profile.tenantProfile.bedroomsNeeded} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium text-slate-700">Move in timeline</span>
                    <input name="tenantProfile.moveInTimeline" value={profile.tenantProfile.moveInTimeline} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-sm text-slate-600 md:col-span-2">
                    <span className="mb-2 block font-medium text-slate-700">Employment status</span>
                    <input name="tenantProfile.employmentStatus" value={profile.tenantProfile.employmentStatus} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </label>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={savingProfile} className="rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
                      {savingProfile ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </form>
                </div>
              </section>
            ) : null}

            {activeView === "inquiries" ? <TenantInquiries /> : null}

            {activeView === "viewings" ? <TenantViewings /> : null}

            {activeView === "saved-listings" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Saved listings</h2>
                    <p className="mt-1 text-sm text-slate-600">Your favorite properties collected here.</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {savedListings.length ? savedListings.map((listing) => (
                    <div key={listing._id} className="rounded-[1.5rem] border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{listing.title}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <MapPin size={14} /> {listing.location?.neighborhood || listing.location?.city || "Prime location"}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                          {listing.listingType}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{listing.description?.slice(0, 120)}{listing.description?.length > 120 ? "..." : ""}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-semibold text-emerald-700">{formatCurrency(listing.price)}</p>
                        <Link to={`/listings/${listing._id}`} className="text-sm font-semibold text-emerald-700">Open</Link>
                      </div>
                    </div>
                  )) : <p className="text-sm text-slate-500">You have not saved any properties yet.</p>}
                </div>
              </section>
            ) : null}

            {activeView === "saved-searches" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Saved searches</h2>
                    <p className="mt-1 text-sm text-slate-600">Revisit your favorite search filters whenever you need them.</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {savedSearches.length ? savedSearches.map((search) => (
                    <div key={search._id} className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{search.name}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {search.criteria?.listingType ? `Type: ${search.criteria.listingType}` : "Type: all"} • {search.criteria?.city || search.criteria?.region || "Any location"}
                        </p>
                      </div>
                      <button type="button" onClick={() => handleDeleteSearch(search._id)} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                        Remove
                      </button>
                    </div>
                  )) : <p className="text-sm text-slate-500">You have not saved any searches yet.</p>}
                </div>
              </section>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;