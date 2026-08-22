import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Mail, X } from "lucide-react";

// Lightweight overlay modal for sending an inquiry to a listing's owner.
export default function InquiryModal({ listing, onSend, onClose }) {
  const [message, setMessage] = useState(
    `Hi, I'm interested in "${listing?.title || "this property"}". Could you share more details?`
  );
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }

    setSubmitting(true);
    try {
      await onSend({ listingId: listing._id, message: message.trim(), senderPhone: phone.trim() || undefined });
      toast.success("Your inquiry has been sent!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "We could not send your inquiry right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-4xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-sm font-semibold text-lime-700">
              <Mail size={15} /> Send an inquiry
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">{listing?.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Your message</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lime-500"
            />
          </label>
          <label className="block text-sm text-slate-600">
            <span className="mb-2 block font-medium text-slate-700">Phone (optional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="So the agent can call you back"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lime-500"
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-lime-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Send inquiry
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
