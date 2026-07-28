import { useState } from "react";
import { toast } from "react-hot-toast";
import { BadgeCheck, Building2, LoaderCircle, Save, ShieldCheck, Star } from "lucide-react";
import axiosInstance from "../../axiosInstance";
import EmailAlertsToggle from "../../component/EmailAlertsToggle";

const specializationOptions = [
  { value: "residential_rental", label: "Residential rental" },
  { value: "residential_sale", label: "Residential sale" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "short_stay", label: "Short stay" },
];

export default function AgentProfile({ user, onUserUpdate }) {
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    agencyName: user.agentProfile?.agencyName || "",
    agencyAddress: user.agentProfile?.agencyAddress || "",
    yearsOfExperience: user.agentProfile?.yearsOfExperience ?? "",
    specializations: user.agentProfile?.specializations || [],
    areasOfOperation: user.agentProfile?.areasOfOperation?.join(", ") || "",
    bio: user.agentProfile?.bio || "",
    bankAccountName: user.agentProfile?.bankAccountName || "",
    bankAccountNumber: user.agentProfile?.bankAccountNumber || "",
    bankName: user.agentProfile?.bankName || "",
  });
  const [saving, setSaving] = useState(false);
  const [requestingVerification, setRequestingVerification] = useState(false);

  const isApproved = Boolean(user.isActive);
  const isVerified = Boolean(user.agentProfile?.licenseVerified);
  const verificationRequested = Boolean(user.agentProfile?.verificationRequested);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSpecializationToggle = (value) => {
    setForm((current) => ({
      ...current,
      specializations: current.specializations.includes(value)
        ? current.specializations.filter((item) => item !== value)
        : [...current.specializations, value],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        agentProfile: {
          agencyName: form.agencyName,
          agencyAddress: form.agencyAddress,
          yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
          specializations: form.specializations,
          areasOfOperation: form.areasOfOperation.split(",").map((item) => item.trim()).filter(Boolean),
          bio: form.bio,
          bankAccountName: form.bankAccountName,
          bankAccountNumber: form.bankAccountNumber,
          bankName: form.bankName,
        },
      };

      const response = await axiosInstance.patch("/users/me", payload);
      const updatedUser = response?.data?.data?.user;
      if (updatedUser) onUserUpdate(updatedUser);
      toast.success("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("We could not update your profile right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    setRequestingVerification(true);
    try {
      const response = await axiosInstance.patch("/users/me/request-verification");
      const updatedUser = response?.data?.data?.user;
      if (updatedUser) onUserUpdate(updatedUser);
      toast.success("Verification request submitted.");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not submit your verification request.");
    } finally {
      setRequestingVerification(false);
    }
  };

  return (
    <div className="space-y-6">
      <EmailAlertsToggle user={user} onUserUpdate={onUserUpdate} />

      <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            <BadgeCheck size={16} /> {isApproved ? "Approved by admin" : "Pending admin approval"}
          </span>
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            <ShieldCheck size={16} /> {isVerified ? "Verified agent" : "Not verified"}
          </span>
          {user.agentProfile?.rating ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <Star size={16} /> {user.agentProfile.rating.toFixed(1)} ({user.agentProfile.totalRatings || 0})
            </span>
          ) : null}
        </div>

        {!isVerified ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <div>
              <p className="font-semibold text-sky-900">Get verified for instant listing approval</p>
              <p className="mt-1 text-sm text-sky-700">
                {verificationRequested
                  ? `Verification request submitted${user.agentProfile?.verificationRequestedAt ? ` on ${new Date(user.agentProfile.verificationRequestedAt).toLocaleDateString("en-GB")}` : ""}. Awaiting admin review.`
                  : "Submit a verification request so our team can review your license and unlock instant publishing."}
              </p>
            </div>
            {!verificationRequested ? (
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={requestingVerification}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
              >
                {requestingVerification ? "Submitting..." : "Request verification"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-4xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Building2 size={18} /> Agent profile
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">First name</span>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Last name</span>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Agency name</span>
            <input name="agencyName" value={form.agencyName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600 md:col-span-2">
            <span className="mb-2 block font-medium text-slate-700">Agency address</span>
            <input name="agencyAddress" value={form.agencyAddress} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Years of experience</span>
            <input type="number" min="0" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Areas of operation</span>
            <input name="areasOfOperation" value={form.areasOfOperation} onChange={handleChange} placeholder="Adenta, Madina, East Legon" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Specializations</p>
          <div className="flex flex-wrap gap-2">
            {specializationOptions.map((option) => {
              const active = form.specializations.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSpecializationToggle(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block text-sm text-slate-600">
          <span className="mb-2 block font-medium text-slate-700">Bio</span>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} maxLength={1000} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Bank name</span>
            <input name="bankName" value={form.bankName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Account name</span>
            <input name="bankAccountName" value={form.bankAccountName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Account number</span>
            <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
          Save profile
        </button>
      </form>
    </div>
  );
}
