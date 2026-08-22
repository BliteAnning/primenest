import { useState } from 'react';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Home, Lock, Mail, Phone, UserRound } from 'lucide-react';
import {toast} from "react-hot-toast";
import axiosInstance from '../axiosInstance';


export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'tenant',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const response = await axiosInstance.post("/users/register", formData);
        if (response.data.status === "success") {
            toast.success("Account created successfully. Please check your email to verify your account.");
        }

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          role: 'tenant',
        });
        navigate("/verify-email-info");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(67,134,8,0.12),transparent_38%),linear-gradient(135deg,#f9fbf7_0%,#ffffff_50%,#f8f6f1_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-4xl border border-[#438608]/15 bg-white shadow-2xl lg:flex-row">
        <div className="bg-linear-to-br from-[#438608] via-[#4f790d] to-[#325A10] p-8 text-white lg:w-[42%] lg:p-10">
          <div className="inline-flex rounded-2xl">
            <img src={logo} alt="PrimeNest Logo" className="h-32 w-auto" />
          </div>
          <h2 className="mt-6 text-4xl font-bold">Create your PrimeNest account</h2>
          <p className="mt-4 text-lg leading-8 text-white/85">
            Join Ghana’s modern real estate platform and start exploring homes designed around your budget and lifestyle.
          </p>
          <div className="mt-8 rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm text-white/80">For tenants and buyers</p>
            <p className="mt-2 text-2xl font-semibold">Discover homes with confidence</p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-10 lg:p-12 bg-amber-50">
          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-amber-900">Create account</h3>
            <p className="mt-2 text-amber-800">A few details and you’re ready to explore.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{error}</div> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-amber-700">
                First name
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#438608]">
                  <UserRound size={18} className="text-slate-400" />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full border-none bg-transparent outline-none" />
                </div>
              </label>

              <label className="block text-sm font-medium text-amber-700">
                Last name
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#d6c091]">
                  <UserRound size={18} className="text-slate-400" />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full border-none bg-transparent outline-none" />
                </div>
              </label>
            </div>

            <label className="block text-sm font-medium text-amber-700">
              Email address
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#d6c091]">
                <Mail size={18} className="text-slate-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>

            <label className="block text-sm font-medium text-amber-700">
              Phone number
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#d6c091]">
                <Phone size={18} className="text-slate-400" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+233 XX XXX XXXX" className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>

            <label className="block text-sm font-medium text-amber-700">
              I am a
              <select name="role" value={formData.role} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#d6c091]">
                <option value="tenant">Tenant / Buyer</option>
                <option value="agent">Agent</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-amber-700">
              Password
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-amber-200 px-4 py-3 focus-within:border-[#d6c091]">
                <Lock size={18} className="text-amber-400" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full border-none bg-transparent outline-none" />
              </div>
            </label>

            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-900 px-5 py-4 text-lg font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Creating account...' : 'Create account'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600">
            Already have an account?{' '}<Link to="/login" className="font-semibold text-[#7C5102] hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}