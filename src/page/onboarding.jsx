import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Home, Sparkles, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../axiosInstance";

const defaultTenantForm = {
  monthlyIncome: "",
  budgetMin: "",
  budgetMax: "",
  preferredLocations: "Accra",
  propertyTypePreference: [],
  bedroomsNeeded: "",
  mustHaveAmenities: [],
  moveInTimeline: "flexible",
  advancePaymentCapacity: "",
  employmentStatus: "employed",
};

const defaultAgentForm = {
  agencyName: "",
  agencyAddress: "",
  yearsOfExperience: "",
  specializations: [],
  areasOfOperation: "",
  bio: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankName: "",
};

const propertyTypeOptions = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

const moveInTimelineOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "1_month", label: "Within 1 month" },
  { value: "3_months", label: "Within 3 months" },
  { value: "6_months", label: "Within 6 months" },
  { value: "flexible", label: "Flexible" },
];

const employmentStatusOptions = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
];

const specializationOptions = [
  { value: "residential_rental", label: "Residential rental" },
  { value: "residential_sale", label: "Residential sale" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "short_stay", label: "Short stay" },
];

const amenityOptions = [
  { value: "securityGuard", label: "Security guard" },
  { value: "securityDogs", label: "Security dogs" },
  { value: "cctv", label: "CCTV" },
  { value: "gatedCommunity", label: "Gated community" },
  { value: "electricFence", label: "Electric fence" },
  { value: "generator", label: "Generator" },
  { value: "solarPower", label: "Solar power" },
  { value: "borehole", label: "Borehole" },
  { value: "pipedWater", label: "Piped water" },
  { value: "waterTank", label: "Water tank" },
  { value: "internet", label: "Internet" },
  { value: "cableTv", label: "Cable TV" },
  { value: "carPark", label: "Car park" },
  { value: "swimmingPool", label: "Swimming pool" },
  { value: "gym", label: "Gym" },
  { value: "garden", label: "Garden" },
  { value: "playground", label: "Playground" },
  { value: "airConditioning", label: "Air conditioning" },
  { value: "petFriendly", label: "Pet friendly" },
];

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = useMemo(() => getStoredUser(), []);
  const role = location.state?.role || storedUser?.role || "tenant";

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(role === "agent" ? defaultAgentForm : defaultTenantForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
      };
    });
  };

  const goNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const goBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 3) {
      setStep((prev) => Math.min(prev + 1, 3));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload =
        role === "agent"
          ? {
              agentProfile: {
                agencyName: formData.agencyName,
                agencyAddress: formData.agencyAddress,
                yearsOfExperience: Number(formData.yearsOfExperience) || undefined,
                specializations: formData.specializations,
                areasOfOperation: formData.areasOfOperation
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                bio: formData.bio,
                bankAccountName: formData.bankAccountName,
                bankAccountNumber: formData.bankAccountNumber,
                bankName: formData.bankName,
              },
            }
          : {
              tenantProfile: {
                monthlyIncome: Number(formData.monthlyIncome) || undefined,
                budgetMin: Number(formData.budgetMin) || undefined,
                budgetMax: Number(formData.budgetMax) || undefined,
                preferredLocations: formData.preferredLocations
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                propertyTypePreference: formData.propertyTypePreference,
                bedroomsNeeded: Number(formData.bedroomsNeeded) || undefined,
                mustHaveAmenities: formData.mustHaveAmenities,
                moveInTimeline: formData.moveInTimeline,
                advancePaymentCapacity: Number(formData.advancePaymentCapacity) || undefined,
                employmentStatus: formData.employmentStatus,
              },
            };

      const response = await axiosInstance.patch("/users/me/onboarding", payload);

      if (response.data?.status === "success") {
        const updatedUser = {
          ...(storedUser || {}),
          onboardingCompleted: true,
          role,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile saved successfully.");
        window.location.href = role === "agent" ? "/my-dashboard-a" : "/listings";
      } else {
        throw new Error("Unable to save profile");
      }
    } catch (err) {
      console.error(err);
      setError("We could not save your profile right now. Please try again.");
      toast.error("We could not save your profile right now.");
    } finally {
      setLoading(false);
    }
  };

  const steps = role === "agent"
    ? ["Agency basics", "Professional details", "Review & save"]
    : ["Preferences", "Lifestyle & amenities", "Review & save"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_40%),linear-gradient(135deg,#f5fff9_0%,#ffffff_45%,#ecfdf5_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-8 shadow-2xl backdrop-blur lg:w-[42%]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            <Sparkles size={16} />
            PrimeNest onboarding
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            {role === "agent" ? "Set up your agency profile" : "Tell us what you need"}
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            {role === "agent"
              ? "Finish your profile so buyers and tenants can discover your listings faster."
              : "We will personalize property suggestions for your budget, location, and lifestyle."}
          </p>

          <div className="mt-8 rounded-3xl bg-emerald-600 p-6 text-white">
            <div className="mb-4 flex items-center gap-3">
              {role === "agent" ? <Home size={24} /> : <UserRound size={24} />}
              <h2 className="text-xl font-semibold">
                {role === "agent" ? "Agent spotlight" : "Tenant profile"}
              </h2>
            </div>
            <p className="text-sm leading-7 text-emerald-50">
              {role === "agent"
                ? "Your professional details help agents and tenants connect with confidence."
                : "Your answers help us recommend smarter homes and affordability-ready options."}
            </p>
          </div>
        </div>

        <div className="flex-1 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Step {step} of 3</p>
              <h2 className="text-2xl font-semibold text-slate-900">{steps[step - 1]}</h2>
            </div>
            <Link to="/" className="text-sm font-semibold text-emerald-600 hover:underline">
              Back home
            </Link>
          </div>

          <div className="mb-8 flex gap-2">
            {steps.map((title, index) => (
              <div key={title} className={`h-2 flex-1 rounded-full ${index + 1 <= step ? "bg-emerald-600" : "bg-slate-200"}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{error}</div> : null}

            {role === "agent" ? (
              <>
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Agency name
                        <input
                          name="agencyName"
                          value={formData.agencyName}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        Years of experience
                        <input
                          type="number"
                          name="yearsOfExperience"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </label>
                    </div>
                    <label className="block text-sm font-medium text-slate-700">
                      Agency address
                      <input
                        name="agencyAddress"
                        value={formData.agencyAddress}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      />
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {specializationOptions.map((option) => {
                          const active = formData.specializations.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleArrayToggle("specializations", option.value)}
                              className={`rounded-full px-3 py-2 text-sm font-medium ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="block text-sm font-medium text-slate-700">
                      Areas of operation
                      <input
                        name="areasOfOperation"
                        value={formData.areasOfOperation}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        placeholder="Accra, East Legon, Tema"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Short bio
                      <textarea
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      />
                    </label>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Review your profile</h3>
                    <p className="text-sm leading-7 text-slate-600">Your agency details will be saved and shared with tenants who are looking for trusted agents.</p>
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-900">Agency:</span> {formData.agencyName || "Not provided"}</p>
                      <p><span className="font-semibold text-slate-900">Experience:</span> {formData.yearsOfExperience || "0"} years</p>
                      <p><span className="font-semibold text-slate-900">Specializations:</span> {formData.specializations.length ? formData.specializations.join(", ") : "None selected"}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Monthly income (GHS)
                        <input
                          type="number"
                          name="monthlyIncome"
                          value={formData.monthlyIncome}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        Bedrooms needed
                        <input
                          type="number"
                          name="bedroomsNeeded"
                          value={formData.bedroomsNeeded}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Budget minimum (GHS)
                        <input
                          type="number"
                          name="budgetMin"
                          value={formData.budgetMin}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        Budget maximum (GHS)
                        <input
                          type="number"
                          name="budgetMax"
                          value={formData.budgetMax}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        />
                      </label>
                    </div>

                    <label className="block text-sm font-medium text-slate-700">
                      Preferred locations
                      <input
                        name="preferredLocations"
                        value={formData.preferredLocations}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                        placeholder="Accra, Kumasi, Takoradi"
                      />
                    </label>

                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Property type preference</p>
                      <div className="flex flex-wrap gap-2">
                        {propertyTypeOptions.map((option) => {
                          const active = formData.propertyTypePreference.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleArrayToggle("propertyTypePreference", option.value)}
                              className={`rounded-full px-3 py-2 text-sm font-medium ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <label className="block text-sm font-medium text-slate-700">
                      Move-in timeline
                      <select
                        name="moveInTimeline"
                        value={formData.moveInTimeline}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      >
                        {moveInTimelineOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Employment status
                      <select
                        name="employmentStatus"
                        value={formData.employmentStatus}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      >
                        {employmentStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-medium text-slate-700">
                      Advance payment capacity (months)
                      <input
                        type="number"
                        name="advancePaymentCapacity"
                        value={formData.advancePaymentCapacity}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      />
                    </label>

                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Must-have amenities</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {amenityOptions.map((option) => {
                          const active = formData.mustHaveAmenities.includes(option.value);
                          return (
                            <label key={option.value} className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm ${active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-700"}`}>
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => handleArrayToggle("mustHaveAmenities", option.value)}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-5">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 size={18} />
                      <h3 className="text-lg font-semibold text-slate-900">Review your preferences</h3>
                    </div>
                    <p className="text-sm leading-7 text-slate-600">This profile will help PrimeNest recommend better listings and affordability guidance for you.</p>
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-900">Income:</span> {formData.monthlyIncome || "Not set"}</p>
                      <p><span className="font-semibold text-slate-900">Budget:</span> {formData.budgetMin || "0"} - {formData.budgetMax || "0"} GHS</p>
                      <p><span className="font-semibold text-slate-900">Locations:</span> {formData.preferredLocations || "Not set"}</p>
                      <p><span className="font-semibold text-slate-900">Amenities:</span> {formData.mustHaveAmenities.length ? formData.mustHaveAmenities.join(", ") : "None selected"}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Saving..." : "Save profile"}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
