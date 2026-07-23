import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import axiosInstance, { setAuthSession } from '../axiosInstance';


export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post("/users/login", formData);
      if (response.data.status === "success") {
        const user = response.data?.data?.user;
        const token = response.data?.accessToken;
        setAuthSession(token, user);
        if (user?.onboardingCompleted === false) {
        navigate('/onboarding', { state: { role: user?.role || 'tenant' } });
      } else if (user?.role === 'agent') {
        window.location.href = '/my-dashboard-a';
      } else {
        window.location.href = '/listings';
        //navigate('/listings', { replace: true });
      }
      }

      
    } catch (err) {
      console.error(err);
      //navigate('/onboarding', { state: { role: 'tenant' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_35%),linear-gradient(135deg,#f5fff9_0%,#ffffff_45%,#ecfdf5_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl lg:flex-row">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-8 text-white lg:w-[45%] lg:p-10">
          <div className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">Welcome back</div>
          <h2 className="mt-6 text-4xl font-bold">Sign in and continue your home search</h2>
          <p className="mt-4 text-lg leading-8 text-emerald-50">
            Access your saved homes, explore new listings, and continue your journey with PrimeNest.
          </p>
          <div className="mt-8 rounded-[1.5rem] bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-emerald-50">Tenant experience</p>
            <p className="mt-2 text-2xl font-semibold">Personalized and effortless</p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-10 lg:p-12">
          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-slate-900">Login to PrimeNest</h3>
            <p className="mt-2 text-slate-600">Enter your email and password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{error}</div> : null}
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <Mail size={18} className="text-slate-400" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
                <Lock size={18} className="text-slate-400" />
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link to="/forgot-password" className="font-semibold text-emerald-600 hover:underline">Forgot password?</Link>
          </div>

          <p className="mt-8 text-center text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}