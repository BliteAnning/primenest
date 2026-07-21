import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Home as HomeIcon, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  { title: 'Smart affordability', desc: 'Get a realistic budget range before you fall in love with a home.', icon: TrendingUp },
  { title: 'Verified listings', desc: 'Browse trusted homes and apartments from experienced agents.', icon: BadgeCheck },
  { title: 'Risk alerts', desc: 'Spot neighborhood concerns early with smart risk insights.', icon: ShieldCheck },
];

const steps = [
  'Create your tenant profile',
  'Explore curated listings',
  'Book viewings and shortlist homes',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fff9_0%,#ffffff_45%,#f0fdf4_100%)] text-slate-900">
      

      <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-8 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.2),_transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <Sparkles size={16} /> Ghana’s smarter real estate experience
            </div>
            <h2 className="text-5xl font-black leading-tight text-slate-900 sm:text-6xl">
              Find the right home with <span className="text-emerald-600">clarity and confidence</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              PrimeNest helps tenants and buyers discover beautiful homes, compare affordability, and move forward with confidence in a modern property marketplace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition hover:bg-emerald-700">
                Start your journey <ArrowRight size={18} />
              </Link>
              <Link to="/listings" className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-8 py-4 text-lg font-semibold text-emerald-700 transition hover:bg-emerald-50">
                Browse listings
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">🏠 5000+ curated homes</div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">🤖 AI-driven affordability</div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">🔒 Trusted listings</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -translate-y-4 rounded-[2rem] bg-emerald-200/50 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-7 text-white shadow-2xl">
              <div className="flex items-center justify-between rounded-[1.5rem] bg-white/15 p-4 backdrop-blur">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-50">Live today</p>
                  <h3 className="text-xl font-semibold">New listings in Accra</h3>
                </div>
                <div className="rounded-full bg-white/20 p-3"><HomeIcon size={24} /></div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/20 p-5 backdrop-blur">
                  <p className="text-sm text-emerald-50">Budget-friendly</p>
                  <p className="mt-2 text-3xl font-bold">GHS 4,200+</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/20 p-5 backdrop-blur">
                  <p className="text-sm text-emerald-50">Average savings</p>
                  <p className="mt-2 text-3xl font-bold">18%</p>
                </div>
              </div>
              <div className="mt-6 rounded-[1.5rem] bg-white/15 p-5 backdrop-blur">
                <p className="text-sm text-emerald-50">Popular neighborhoods</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['East Legon', 'Cantonments', 'Madina', 'Tema'].map((place) => (
                    <span key={place} className="rounded-full bg-white/20 px-3 py-1 text-sm">{place}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-16 sm:px-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Why tenants love PrimeNest</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to make a confident move</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                    <Icon size={22} />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900">{feature.title}</h4>
                  <p className="mt-3 leading-7 text-slate-600">{feature.desc}</p>
                  <div className="mt-5 text-sm font-semibold text-emerald-600">0{index + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 py-16 sm:px-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-emerald-100 bg-white p-8 shadow-xl lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">How it works</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">A calm, guided journey from browse to booking</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-[1.5rem] bg-emerald-50 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">0{index + 1}</div>
                <p className="leading-7 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-emerald-950 px-6 py-16 text-white sm:px-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-bold text-emerald-700">P</div>
              <h2 className="text-2xl font-bold">PrimeNest</h2>
            </div>
            <p className="mt-3 text-emerald-200">Making real estate simple, modern, and trustworthy in Ghana.</p>
          </div>
          <div className="flex gap-4 text-sm text-emerald-100">
            <Link to="/register" className="transition hover:text-white">Create account</Link>
            <Link to="/listings" className="transition hover:text-white">Explore homes</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}