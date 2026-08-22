import { useContext, useEffect, useMemo, useState } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bath,
  BedDouble,
  BookmarkPlus,
  BrainCircuit,
  Calculator,
  CircleAlert,
  HomeIcon,
  LoaderCircle,
  Lock,
  LucideCreditCard,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { listingContext } from "../context/listingContext";
import axiosInstance from "../axiosInstance";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(value);

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("primenestUser") || localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const splitCommaValues = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getAdvanceAmount = (advancePayment, months, fallbackMonthlyMax) => {
  if (!advancePayment) {
    return fallbackMonthlyMax ? fallbackMonthlyMax * months : null;
  }

  if (months === 6) {
    return advancePayment.sixMonths ?? (fallbackMonthlyMax ? fallbackMonthlyMax * 6 : null);
  }

  if (months === 12) {
    return advancePayment.twelveMonths ?? advancePayment.annual ?? (fallbackMonthlyMax ? fallbackMonthlyMax * 12 : null);
  }

  if (months === 24) {
    return advancePayment.twentyFourMonths ?? advancePayment.two_years_advance ?? (fallbackMonthlyMax ? fallbackMonthlyMax * 24 : null);
  }

  return advancePayment.userCapacity ?? (fallbackMonthlyMax ? fallbackMonthlyMax * months : null);
};

const affordabilityTone = {
  Comfortable: "border-[#438608]/20 bg-[#438608]/10 text-[#438608]",
  Moderate: "border-amber-200 bg-amber-50 text-amber-700",
  Stretched: "border-orange-200 bg-orange-50 text-orange-700",
  "At Risk": "border-rose-200 bg-rose-50 text-rose-700",
};

const initialFilters = {
  q: "",
  sortBy: "newest",
  listingType: "",
  propertyType: "",
  region: "",
  city: "",
  bedrooms: "",
  bathrooms: "",
  radius: "10",
};

export default function Listings() {
  const { listings, loading, error, getListings } = useContext(listingContext);
  const storedUser = useMemo(() => getStoredUser(), []);
  const isTenantLoggedIn = Boolean(localStorage.getItem("token")) && storedUser?.role === "tenant";
  const [filters, setFilters] = useState(initialFilters);
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoMessage, setGeoMessage] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [quickForm, setQuickForm] = useState({
    income: storedUser?.tenantProfile?.monthlyIncome ? String(storedUser.tenantProfile.monthlyIncome) : "5000",
    advanceMonths: storedUser?.tenantProfile?.advancePaymentCapacity ? String(storedUser.tenantProfile.advancePaymentCapacity) : "12",
  });
  const [quickResult, setQuickResult] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [analysisForm, setAnalysisForm] = useState({
    monthlyIncome: storedUser?.tenantProfile?.monthlyIncome ? String(storedUser.tenantProfile.monthlyIncome) : "",
    totalBudget: "",
    preferredLocations: storedUser?.tenantProfile?.preferredLocations?.join(", ") || "",
    listingType: "rent",
    bedrooms: storedUser?.tenantProfile?.bedroomsNeeded ? String(storedUser.tenantProfile.bedroomsNeeded) : "",
    propertyTypes: storedUser?.tenantProfile?.propertyTypePreference?.join(", ") || "",
    advanceMonths: storedUser?.tenantProfile?.advancePaymentCapacity ? String(storedUser.tenantProfile.advancePaymentCapacity) : "12",
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const featuredCount = useMemo(() => listings.filter((item) => item.isFeatured).length, [listings]);
  const preferredLocationCount = useMemo(() => splitCommaValues(analysisForm.preferredLocations).length, [analysisForm.preferredLocations]);

  useEffect(() => {
    if (!isTenantLoggedIn) {
      return undefined;
    }

    if (!quickForm.income || Number(quickForm.income) <= 0) {
      setQuickResult(null);
      setQuickError("");
      return undefined;
    }

    let isActive = true;
    const timer = setTimeout(async () => {
      setQuickLoading(true);
      setQuickError("");

      try {
        const response = await axiosInstance.get("/affordability/calculate", {
          params: {
            income: Number(quickForm.income),
            advanceMonths: Number(quickForm.advanceMonths),
          },
        });

        if (isActive) {
          setQuickResult(response?.data?.data || null);
        }
      } catch (quickCalcError) {
        if (isActive) {
          console.error(quickCalcError);
          setQuickError("We could not refresh the budget calculator right now.");
          setQuickResult(null);
        }
      } finally {
        if (isActive) {
          setQuickLoading(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [isTenantLoggedIn, quickForm.advanceMonths, quickForm.income]);

  const quickAdvanceMonths = Number(quickForm.advanceMonths);
  const quickRecommendedMax = quickResult?.recommendedBudget?.max || 0;
  const selectedAdvanceCost = getAdvanceAmount(quickResult?.advancePayment, quickAdvanceMonths, quickRecommendedMax);
  const affordabilityBadgeClass = affordabilityTone[analysisResult?.financialSummary?.affordabilityScore?.label] || "border-slate-200 bg-slate-50 text-slate-700";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleQuickChange = (event) => {
    const { name, value } = event.target;
    setQuickForm((current) => ({ ...current, [name]: value }));
  };

  const handleAnalysisChange = (event) => {
    const { name, value } = event.target;
    setAnalysisForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const params = Object.fromEntries(
      Object.entries({ ...filters }).filter(([, value]) => value !== "" && value !== null)
    );

    if (geoCoords && params.radius) {
      params.lat = geoCoords.lat;
      params.lng = geoCoords.lng;
    }

    await getListings(params);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoMessage("Location ready for nearby searches.");
      },
      () => {
        setGeoMessage("Unable to access your location right now.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleReset = async () => {
    setFilters(initialFilters);
    setGeoCoords(null);
    setGeoMessage("");
    await getListings();
  };

  const handleSaveSearch = async () => {
    if (!localStorage.getItem("token")) {
      setSearchMessage("Please sign in to save your search.");
      return;
    }

    try {
      const payload = {
        name: searchName || "My saved search",
        criteria: { ...filters, lat: geoCoords?.lat || undefined, lng: geoCoords?.lng || undefined },
        alertEnabled: false,
      };

      await axiosInstance.post("/users/me/saved-searches", payload);
      setSearchMessage("Search saved to your dashboard.");
    } catch (error) {
      console.error(error);
      setSearchMessage("We could not save this search right now.");
    }
  };

  const handleUseCurrentSearch = () => {
    const inferredLocations = [filters.city, filters.region].filter(Boolean).join(", ");

    setAnalysisForm((current) => ({
      ...current,
      preferredLocations: inferredLocations || current.preferredLocations,
      listingType: filters.listingType || current.listingType,
      bedrooms: filters.bedrooms || current.bedrooms,
      propertyTypes: filters.propertyType || current.propertyTypes,
    }));
  };

  const handleRunAffordability = async (event) => {
    event.preventDefault();
    setAnalysisLoading(true);
    setAnalysisError("");

    const preferredLocations = splitCommaValues(analysisForm.preferredLocations);
    if (preferredLocations.length === 0) {
      setAnalysisLoading(false);
      setAnalysisResult(null);
      setAnalysisError("Add at least one preferred location to run the advisor.");
      return;
    }

    try {
      const payload = {
        monthlyIncome: analysisForm.monthlyIncome ? Number(analysisForm.monthlyIncome) : undefined,
        totalBudget: analysisForm.totalBudget ? Number(analysisForm.totalBudget) : undefined,
        preferredLocations,
        listingType: analysisForm.listingType || "rent",
        bedrooms: analysisForm.bedrooms ? Number(analysisForm.bedrooms) : undefined,
        propertyTypes: splitCommaValues(analysisForm.propertyTypes),
        advanceMonths: Number(analysisForm.advanceMonths) || 12,
      };

      const response = await axiosInstance.post("/affordability/analyse", payload);
      setAnalysisResult(response?.data?.data || null);
    } catch (analysisRequestError) {
      console.error(analysisRequestError);
      setAnalysisResult(null);
      setAnalysisError(
        analysisRequestError?.response?.data?.message || "We could not complete the affordability analysis right now."
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,rgba(67,134,8,0.08)_0%,rgba(67,134,25,0.03)_50%,rgba(67,134,25,0.09)_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-4xl border border-[#438608]/15 bg-white/85 p-6 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#438608]/10 px-3 py-1 text-sm font-semibold text-[#438608] motion-safe:animate-pulse">
              <HomeIcon size={16} />
              Homes tailored for tenants and buyers
            </div>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Discover the latest listings</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Browse verified properties, compare spaces, and open detailed pages for each home.
            </p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#438608] transition-transform duration-300 hover:translate-x-1 hover:underline">
            Back to home <ArrowRight size={16} />
          </Link>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#438608]/20 hover:shadow-lg">
            <p className="text-sm text-slate-500">Fresh listings</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{listings.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#438608]/20 hover:shadow-lg">
            <p className="text-sm text-slate-500">Featured homes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{featuredCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#438608]/20 hover:shadow-lg">
            <p className="text-sm text-slate-500">Coverage</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">Accra & Beyond</p>
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-4xl border border-[#438608]/15 bg-white shadow-xl">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_1.35fr]">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(67,134,8,0.22),transparent_38%),linear-gradient(160deg,#438608_0%,#438619_100%)] p-6 text-white sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur transition-transform duration-300 hover:scale-105">
                <LucideCreditCard size={16} /> Affordability advisor
              </div>
              <div className=' w-96 h-72'>
                <DotLottieReact
                  src="/animation3.lottie"
                  loop
                  autoplay
                  className='w-96 h-72'
                />
              </div>
              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">See what fits before you fall in love with a listing.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                Run a fast budget check instantly, then ask the AI advisor to match your income, preferred locations, and housing goals against live PrimeNest listings.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-sm text-white/80">Instant guidance</p>
                  <p className="mt-2 text-xl font-semibold">Quick calculator</p>
                  <p className="mt-2 text-sm text-white/75">Live budget range with advance-payment estimates tuned for Ghana’s rental market.</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-sm text-white/80">AI recommendation</p>
                  <p className="mt-2 text-xl font-semibold">Location-aware analysis</p>
                  <p className="mt-2 text-sm text-white/75">Friendly advice plus nearby location alternatives and matching inventory counts.</p>
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,rgba(67,134,8,0.03)_0%,rgba(67,134,25,0.07)_100%)] p-6 sm:p-8">
              {isTenantLoggedIn ? (
                <div className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                    <div className="rounded-[1.75rem] border border-[#438608]/15 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#438608]">
                            <Calculator size={16} /> Quick calculate
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">Live monthly budget guide</h3>
                        </div>
                        {quickLoading ? <LoaderCircle className="animate-spin text-[#438608]" size={18} /> : null}
                      </div>

                      <div className="mt-5 space-y-4">
                        <label className="block text-sm text-slate-600">
                          <span className="mb-2 block font-medium text-slate-700">Monthly income</span>
                          <input
                            type="range"
                            min="500"
                            max="40000"
                            step="100"
                            name="income"
                            value={quickForm.income}
                            onChange={handleQuickChange}
                            className="w-full accent-[#438608]"
                          />
                          <input
                            type="number"
                            min="1"
                            name="income"
                            value={quickForm.income}
                            onChange={handleQuickChange}
                            className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                          />
                        </label>

                        <label className="block text-sm text-slate-600">
                          <span className="mb-2 block font-medium text-slate-700">Advance period</span>
                          <select
                            name="advanceMonths"
                            value={quickForm.advanceMonths}
                            onChange={handleQuickChange}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                          >
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                            <option value="24">24 months</option>
                          </select>
                        </label>
                      </div>

                      {quickError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{quickError}</div> : null}

                      {quickResult ? (
                        <div className="mt-5 space-y-3">
                          <div className="rounded-3xl bg-slate-900 p-4 text-white">
                            <p className="text-sm text-slate-300">Recommended monthly rent</p>
                            <p className="mt-2 text-3xl font-bold">{formatCurrency(quickResult.recommendedBudget.min)} - {formatCurrency(quickResult.recommendedBudget.max)}</p>
                            <p className="mt-2 text-sm text-slate-300">Stretch ceiling: {formatCurrency(quickResult.stretchBudget.max)}</p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">6 months</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(getAdvanceAmount(quickResult.advancePayment, 6, quickRecommendedMax) || 0)}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">12 months</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(getAdvanceAmount(quickResult.advancePayment, 12, quickRecommendedMax) || 0)}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">24 months</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{formatCurrency(getAdvanceAmount(quickResult.advancePayment, 24, quickRecommendedMax) || 0)}</p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#438608]/20 bg-[#438608]/10 p-4 text-sm text-[#2f5e07] transition-colors duration-300">
                            For your selected {quickAdvanceMonths}-month advance, plan for about <span className="font-semibold">{formatCurrency(selectedAdvanceCost || 0)}</span> upfront.
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          Move the income slider to preview a realistic rent range.
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.75rem] border border-[#438608]/15 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#438608]">
                            <BrainCircuit size={16} /> AI affordability analysis
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">Get a personalised recommendation</h3>
                        </div>
                        <button
                          type="button"
                          onClick={handleUseCurrentSearch}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Use current filters
                        </button>
                      </div>

                      <form onSubmit={handleRunAffordability} className="mt-5 space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm text-slate-600">
                            <span className="mb-2 block font-medium text-slate-700">Monthly income</span>
                            <input
                              type="number"
                              min="1"
                              name="monthlyIncome"
                              value={analysisForm.monthlyIncome}
                              onChange={handleAnalysisChange}
                              placeholder="5000"
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                            />
                          </label>
                          <label className="text-sm text-slate-600">
                            <span className="mb-2 block font-medium text-slate-700">Total budget (optional)</span>
                            <input
                              type="number"
                              min="1"
                              name="totalBudget"
                              value={analysisForm.totalBudget}
                              onChange={handleAnalysisChange}
                              placeholder="60000"
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                            />
                          </label>
                          <label className="text-sm text-slate-600 md:col-span-2">
                            <span className="mb-2 block font-medium text-slate-700">Preferred locations</span>
                            <input
                              name="preferredLocations"
                              value={analysisForm.preferredLocations}
                              onChange={handleAnalysisChange}
                              placeholder="Adenta, Madina, East Legon"
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                            />
                            <span className="mt-2 block text-xs text-slate-500">Separate up to 5 locations with commas. Current count: {preferredLocationCount}</span>
                          </label>
                          <label className="text-sm text-slate-600">
                            <span className="mb-2 block font-medium text-slate-700">Listing type</span>
                            <select
                              name="listingType"
                              value={analysisForm.listingType}
                              onChange={handleAnalysisChange}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                            >
                              <option value="rent">Rent</option>
                              <option value="sale">Sale</option>
                              <option value="short_stay">Short stay</option>
                            </select>
                          </label>
                          <label className="text-sm text-slate-600">
                            <span className="mb-2 block font-medium text-slate-700">Advance months</span>
                            <select
                              name="advanceMonths"
                              value={analysisForm.advanceMonths}
                              onChange={handleAnalysisChange}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                            >
                              <option value="6">6 months</option>
                              <option value="12">12 months</option>
                              <option value="24">24 months</option>
                            </select>
                          </label>
                          <label className="text-sm text-slate-600">
                            <span className="mb-2 block font-medium text-slate-700">Bedrooms</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              name="bedrooms"
                              value={analysisForm.bedrooms}
                              onChange={handleAnalysisChange}
                              placeholder="2"
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                            />
                          </label>
                          <label className="text-sm text-slate-600">
                            <span className="mb-2 block font-medium text-slate-700">Property types</span>
                            <input
                              name="propertyTypes"
                              value={analysisForm.propertyTypes}
                              onChange={handleAnalysisChange}
                              placeholder="Apartment, house"
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-colors focus:border-[#438608]"
                            />
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={analysisLoading}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#438608] px-4 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b7808] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {analysisLoading ? <LoaderCircle className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                          Run affordability advisor
                        </button>
                      </form>
                    </div>
                  </div>

                  {analysisError ? (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{analysisError}</div>
                  ) : null}

                  {analysisResult ? (
                    <div className="grid gap-6 xl:grid-cols-1 2xl:grid-cols-2">
                      <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">Financial summary</p>
                            <h3 className="mt-1 text-2xl font-semibold text-slate-900">Your affordability snapshot</h3>
                          </div>
                          <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${affordabilityBadgeClass}`}>
                            {analysisResult.financialSummary.affordabilityScore.emoji} {analysisResult.financialSummary.affordabilityScore.label}
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-900 p-4 text-white">
                            <p className="text-sm text-slate-300">Recommended budget</p>
                            <p className="mt-2 text-2xl font-bold">{formatCurrency(analysisResult.financialSummary.recommendedBudget.min)} - {formatCurrency(analysisResult.financialSummary.recommendedBudget.max)}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Stretch budget</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(analysisResult.financialSummary.stretchBudget.max)}</p>
                            <p className="mt-2 text-xs text-slate-500">{analysisResult.financialSummary.stretchBudget.warning}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">12-month advance</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(getAdvanceAmount(analysisResult.financialSummary.advancePayment, 12, analysisResult.financialSummary.recommendedBudget.max) || 0)}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">24-month advance</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(getAdvanceAmount(analysisResult.financialSummary.advancePayment, 24, analysisResult.financialSummary.recommendedBudget.max) || 0)}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">Selected plan</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(analysisResult.financialSummary.advancePayment.userCapacity || 0)}</p>
                            <p className="mt-2 text-xs text-slate-500">{analysisResult.financialSummary.advancePayment.months} months upfront</p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#438608]/15 bg-[#438608]/10 p-4 text-sm text-[#2f5e07]">
                          Housing would take about <span className="font-semibold">{analysisResult.financialSummary.affordabilityScore.ratio}%</span> of your income at the recommended ceiling. {analysisResult.financialSummary.affordabilityScore.description}.
                        </div>
                      </div>

                      <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">AI recommendation</p>
                          <h3 className="mt-1 text-2xl font-semibold text-slate-900">Where to focus your search next</h3>
                        </div>

                        <div className="rounded-3xl border border-[#438608]/15 bg-[linear-gradient(180deg,rgba(67,134,8,0.03)_0%,rgba(67,134,25,0.08)_100%)] p-5 text-sm leading-7 text-slate-700">
                          {analysisResult.recommendation}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Matches found</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{analysisResult.matchingSummary.totalListingsFound}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Alternative areas</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{analysisResult.matchingSummary.alternativeSuggestions.length}</p>
                          </div>
                        </div>

                        {analysisResult.matchingSummary.byLocation.length > 0 ? (
                          <div>
                            <p className="mb-3 text-sm font-semibold text-slate-700">Top matching locations</p>
                            <div className="space-y-3">
                              {analysisResult.matchingSummary.byLocation.map((group) => (
                                <div key={group.location} className="rounded-2xl border border-slate-200 p-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-slate-900">{group.location}</p>
                                      <p className="text-sm text-slate-500">{group.count} matching properties</p>
                                    </div>
                                  </div>

                                  {group.sample?.length ? (
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                      {group.sample.map((sample) => (
                                        <Link
                                          key={`${group.location}-${sample._id || sample.title}`}
                                          to={sample._id ? `/listings/${sample._id}` : "/listings"}
                                          className="rounded-2xl bg-slate-50 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#438608]/10"
                                        >
                                          <p className="font-medium text-slate-900">{sample.title}</p>
                                          <p className="mt-1 text-sm text-slate-500">{sample.propertyType || "Property"} • {sample.bedrooms || 0} bed</p>
                                          <p className="mt-2 text-sm font-semibold text-[#438608]">{formatCurrency(sample.price)}</p>
                                        </Link>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {analysisResult.matchingSummary.noResultsIn.length > 0 ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            No current matches in {analysisResult.matchingSummary.noResultsIn.join(", ")}. Try the suggested alternatives or widen the budget slightly.
                          </div>
                        ) : null}

                        {analysisResult.matchingSummary.alternativeSuggestions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.matchingSummary.alternativeSuggestions.map((item) => (
                              <span key={item.location} className="rounded-full border border-[#438608]/20 bg-[#438608]/10 px-3 py-2 text-sm font-medium text-[#438608] transition-transform duration-300 hover:-translate-y-0.5">
                                {item.location} • {item.count} options
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center rounded-[1.75rem] border border-dashed border-[#438608]/20 bg-white p-6 text-center sm:p-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Lock size={24} />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-slate-900">Tenant-only affordability tools</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Sign in with a tenant account to unlock the quick calculator and AI affordability recommendation directly from the listings page.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link to="/login" className="rounded-full bg-[#438608] px-5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b7808]">
                      Sign in as tenant
                    </Link>
                    <Link to="/register" className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                      Create tenant account
                    </Link>
                  </div>
                  {storedUser?.role && storedUser.role !== "tenant" ? (
                    <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                      <CircleAlert size={16} /> This signed-in account is not a tenant profile.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mb-8 rounded-4xl border border-[#438608]/15 bg-white/90 p-4 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[#438608]">
              <SlidersHorizontal size={18} />
              <h2 className="text-lg font-semibold text-slate-900">Search & refine listings</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="inline-flex items-center gap-2 rounded-full border border-[#438608]/20 px-3 py-2 text-sm font-medium text-[#438608] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#438608]/10"
              >
                <MapPin size={15} />
                Use my location
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCw size={15} />
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 flex items-center gap-2 font-medium text-slate-700">
                <Search size={15} /> Search
              </span>
              <input
                name="q"
                value={filters.q}
                onChange={handleChange}
                placeholder="Neighborhood, keyword, or title"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Sort</span>
              <select name="sortBy" value={filters.sortBy} onChange={handleChange} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="most_viewed">Most viewed</option>
                <option value="relevance">Relevance</option>
              </select>
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Property type</span>
              <select name="listingType" value={filters.listingType} onChange={handleChange} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="">All</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Category</span>
              <select name="propertyType" value={filters.propertyType} onChange={handleChange} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="">All</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="office">Office</option>
                <option value="mansion">Mansion</option>
                <option value="townhouse">Townhouse</option>
                <option value="duplex">Duplex</option>
              </select>

            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Region</span>
              <input
                name="region"
                value={filters.region}
                onChange={handleChange}
                placeholder="Greater Accra"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">City</span>
              <input
                name="city"
                value={filters.city}
                onChange={handleChange}
                placeholder="Accra"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Bedrooms</span>
              <input
                type="number"
                min="1"
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleChange}
                placeholder="2"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>

            <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
              <span className="mb-2 block font-medium text-slate-700">Bathrooms</span>
              <input
                type="number"
                min="1"
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleChange}
                placeholder="2"
                className="w-full border-none bg-transparent p-0 outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Radius</span>
              <select name="radius" value={filters.radius} onChange={handleChange} className="border-none bg-transparent p-0 outline-none">
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {geoMessage ? <span>{geoMessage}</span> : <span>Use location for nearby listings.</span>}
              <input
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                placeholder="Name this search"
                className="rounded-full border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-[#438608]"
              />
              <button type="button" onClick={handleSaveSearch} className="inline-flex items-center gap-2 rounded-full border border-[#438608]/20 px-3 py-2 font-semibold text-[#438608] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#438608]/10">
                <BookmarkPlus size={15} /> Save search
              </button>
              <button type="submit" className="rounded-full bg-[#438608] px-4 py-2 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3b7808]">
                Apply filters
              </button>
            </div>
          </div>

          {searchMessage ? <p className="mt-3 text-sm text-[#438608]">{searchMessage}</p> : null}

        </form>

        {
          error ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null
        }

        {
          loading ? (
            <div

              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}
                  className="h-80 animate-pulse rounded-4xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 shadow-sm">
              <p className="text-lg font-semibold text-slate-900">No properties matched your search yet.</p>
              <p className="mt-2">Try a broader location or clear a few filters to explore more homes.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: false, amount: 0.2 }}
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => {
                const image =
                  listing.media?.find((item) => item.type === "photo" && item.url)?.url ||
                  listing.image ||
                  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80";

                return (
                  <Link
                    key={listing._id}
                    to={`/listings/${listing._id || listing.slug}`}
                    className="group overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#438608]/20 hover:shadow-xl"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img src={image} alt={listing.title} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110" />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-[#438608] transition-transform duration-300 group-hover:scale-105">
                        {listing.listingType === "sale" ? "For Sale" : "For Rent"}
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <MapPin size={14} />
                            {listing.location?.neighborhood || listing.location?.city || "Prime location"}
                          </p>
                        </div>
                        <div className="text-right text-lg font-bold text-[#438608] transition-transform duration-300 group-hover:-translate-y-0.5">{formatCurrency(listing.price)}</div>
                      </div>

                      <p className="text-sm leading-6 text-slate-600 line-clamp-3">{listing.description}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <BedDouble size={14} /> {listing.bedrooms || 2} bed
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={14} /> {listing.bathrooms || 2} bath
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )
        }
      </div >
    </div >
  );
}
