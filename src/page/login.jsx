import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import axiosInstance, { setAuthSession } from '../axiosInstance';
import logo from '../assets/logo.png';


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
      } else if (user?.role === 'admin') {
        window.location.href = '/my-dashboard-admin';
      } else if (user?.role === 'agent') {
        window.location.href = '/my-dashboard-a';
      } else {
        window.location.href = '/listings';
        //navigate('/listings', { replace: true });
      }
      }

      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      //navigate('/onboarding', { state: { role: 'tenant' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(67,134,8,0.12),transparent_38%),linear-gradient(135deg,#f9fbf7_0%,#ffffff_50%,#f8f6f1_100%)] px-4 py-10 sm:px-6 bg-amber-100 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-4xl border border-[#438608]/15 bg-white shadow-2xl lg:flex-row">
        <div className="bg-linear-to-br from-[#438608] via-[#4f790d] to-[#325A10] p-8 text-white lg:w-[45%] lg:p-10">
          <img src={logo} alt="PrimeNest Logo" className="h-32 w-auto" />
          <h2 className="mt-6 text-4xl font-bold">Sign in and continue your home search</h2>
          <p className="mt-4 text-lg leading-8 text-white/85">
            Access your saved homes, explore new listings, and continue your journey with PrimeNest.
          </p>
          <div className="mt-8 rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-white/80">Tenant experience</p>
            <p className="mt-2 text-2xl font-semibold">Personalized and effortless</p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-10 lg:p-12 bg-white">
          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-amber-700">Login to PrimeNest</h3>
            <p className="mt-2 text-amber-800">Enter your email and password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{error}</div> : null}
            <label className="block text-sm font-medium text-amber-800">
              Email address
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 focus-within:border-[#438608]">
                <Mail size={18} className="text-amber-400" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>

            <label className="block text-sm font-medium text-amber-800">
              Password
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 focus-within:border-[#438608]">
                <Lock size={18} className="text-amber-400" />
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-900 px-5 py-4 text-lg font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link to="/forgot-password" className="font-semibold text-[#7C5102] hover:underline">Forgot password?</Link>
          </div>

          <p className="mt-8 text-center text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-[#865408] hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}