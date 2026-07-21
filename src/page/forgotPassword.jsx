import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h2 className="text-3xl font-bold text-slate-900">Reset your password</h2>
        <p className="mt-3 text-slate-600">Enter your email and we’ll help you get back into PrimeNest.</p>

        {submitted ? (
          <div className="mt-6 rounded-[1.5rem] bg-emerald-50 p-4 text-sm text-emerald-700">
            If an account exists for {email || 'that address'}, we’ll send a reset link shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <Mail size={18} className="text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>
            <button type="submit" className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
