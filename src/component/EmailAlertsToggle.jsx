import { useState } from "react";
import { toast } from "react-hot-toast";
import { BellOff, BellRing, LoaderCircle } from "lucide-react";
import axiosInstance from "../axiosInstance";

// Reusable toggle for opting in/out of non-essential email notifications
// (inquiries, viewing confirmations, price drops, listing review outcomes, etc).
// Essential account emails (verification, password reset, suspensions) are
// always sent regardless of this preference.
export default function EmailAlertsToggle({ user, onUserUpdate, className = "" }) {
  const [saving, setSaving] = useState(false);
  const enabled = user?.emailAlertsEnabled !== false;

  const handleToggle = async () => {
    const nextValue = !enabled;
    setSaving(true);
    try {
      const response = await axiosInstance.patch("/users/me", { emailAlertsEnabled: nextValue });
      const updatedUser = response?.data?.data?.user;
      if (updatedUser) onUserUpdate?.(updatedUser);
      toast.success(nextValue ? "Email alerts turned on." : "Email alerts turned off.");
    } catch (err) {
      console.error(err);
      toast.error("We could not update your email preference right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {enabled ? <BellRing size={20} /> : <BellOff size={20} />}
        </div>
        <div>
          <p className="font-semibold text-slate-900">Email alerts</p>
          <p className="mt-1 text-sm text-slate-500">
            {enabled
              ? "You'll receive emails for inquiries, viewings, price drops, and listing updates."
              : "You've turned off non-essential emails. Account and security emails will still be sent."}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={saving}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition disabled:opacity-60 ${
          enabled ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        >
          {saving ? <LoaderCircle size={14} className="animate-spin text-slate-400" /> : null}
        </span>
      </button>
    </div>
  );
}
