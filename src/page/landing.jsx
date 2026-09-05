import { Link } from 'react-router-dom';
import { useRef } from 'react';
import logo from '../assets/logo.png';
import house from '../assets/house.jpg';
import { Typewriter } from "react-simple-typewriter"
import { SlideLeft, SlideRight } from "../../animate";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, BadgeCheck, Home as HomeIcon, ShieldCheck, Sparkles, TrendingUp, Bell as BellIcon } from 'lucide-react';

const features = [
  { title: 'Smart affordability', desc: 'Get a realistic budget range before you fall in love with a home.', icon: TrendingUp },
  { title: 'Verified listings', desc: 'Browse trusted homes and apartments from experienced agents.', icon: BadgeCheck },
  { title: 'Risk alerts', desc: 'Spot neighborhood concerns early with smart risk insights.', icon: ShieldCheck },
  { title: 'Real-time updates', desc: 'Stay ahead with instant notifications on new listings and price changes.', icon: BellIcon },
  { title: 'Renovation visualization', desc: 'See potential upgrades and renovations with our interactive tools.', icon: HomeIcon },
];

const steps = [
  'Create your tenant account',
  'Complete your profile and preferences',
  'Explore curated listings',
  'Book viewings and shortlist homes',
  'Make an offer and finalize your move'
];
const agentsteps = [
  'Create your agent profile',
  'Submit your credentials and necessary documents for verification',
  'Get verified and approved as a trusted agent',
  'List your properties',
  'Manage inquiries and bookings',
];

export default function Home() {
   const typingRef = useRef(null);
      const isInView = useInView(typingRef, { once: true });
      const skillRef = useRef(null);
      const skillsInView = useInView(skillRef, { once: false }); // animate every time in view
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f9fbf7_0%,#ffffff_50%,#f8f6f1_100%)] text-slate-900">


      <section className="custom-background relative overflow-hidden px-6 py-20 sm:px-8 lg:px-8 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(67,134,8,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(124,81,2,0.1),transparent_35%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>

            <div ref={typingRef} className="text-3xl font-black leading-tight text-slate-100 sm:text-6xl">
              <h1>
                {isInView ? (
                  <Typewriter
                    words={[
                      'Find the right home with clarity and confidence'
                    ]}
                    loop={0}
                    cursor
                    cursorStyle="|"
                    typeSpeed={50}
                    deleteSpeed={50}
                    delaySpeed={3000}
                  />
                ) : <span style={{ opacity: 0 }}>
                                Find the right home with clarity and confidence
                            </span>}
              </h1>
            </div>
            <p className="mt-6 max-w-2xl text-sm sm:text-lg leading-8 text-slate-200">
              PrimeNest helps tenants and buyers discover beautiful homes, compare affordability, and move forward with confidence in a modern property marketplace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#438608] px-8 py-4 text-lg font-semibold text-white shadow-xl transition hover:bg-[#376f07]">
                Start your journey <ArrowRight size={18} />
              </Link>
              <Link to="/listings" className="inline-flex items-center justify-center rounded-full border border-[#7C5102] px-8 py-4 text-lg font-semibold text-[#7C5102] transition hover:bg-[#7C5102]/6">
                Browse listings
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">🏠 5000+ curated homes</div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">🤖 AI-driven affordability</div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">🔒 Trusted listings</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -translate-y-4 rounded-4xl bg-[#438608]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-4xl border border-[#438608]/20 bg-linear-to-br from-[#438608] via-[#4f790d] to-[#096424] p-7 text-white shadow-2xl">
              <div className="flex flex-col items-center gap-1">
                <div className=" w-0 h-0 rounded-full p-1 text-sm font-semibold text-white/90 sm:w-auto sm:h-auto sm:rounded-3xl ">
                  <img src={logo} alt="PrimeNest Logo" className="h-48 w-auto" />
                </div>
                <p className="text-center text-sm font-semibold">Ghana’s modern real estate platform</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/20 p-5 backdrop-blur">
                  <p className="text-sm text-white/80">Budget-friendly</p>
                  <p className="mt-2 text-3xl font-bold">GHS 4,200+</p>
                </div>
                <div className="rounded-3xl bg-white/20 p-5 backdrop-blur">
                  <p className="text-sm text-white/80">Average savings</p>
                  <p className="mt-2 text-3xl font-bold">18%</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-white/15 p-5 backdrop-blur">
                <p className="text-sm text-white/80">Popular neighborhoods</p>
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

      <section
        id="features"
        className="px-6 py-16 sm:px-8 lg:px-8 bg-lime-700"

      >
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: false, amount: 0.3 }}
          className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-900">Why tenants love PrimeNest</p>
            <h3 className="mt-3 text-3xl font-bold text-amber-600 sm:text-4xl">Everything you need to make a confident move</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-4xl border border-slate-200 bg-amber-100 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-4 inline-flex rounded-2xl bg-[#438608]/12 p-3 text-[#438608]">
                    <Icon size={22} />
                  </div>
                  <h4 className="text-xl font-semibold text-amber-900">{feature.title}</h4>
                  <p className="mt-3 leading-7 text-slate-600">{feature.desc}</p>
                  <div className="mt-5 text-sm font-semibold text-[#7C5102]">0{index + 1}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section id="how" className="px-6 py-16 sm:px-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false, amount: 0.2 }}
          className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-[#438608]/15 bg-white p-8 shadow-xl lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#438608]">Want to buy/rent a property?</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">A calm, guided journey from browse to booking</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-3xl bg-[#438608]/8 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#438608] text-sm font-semibold text-white">0{index + 1}</div>
                <p className="leading-7 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
      <section id="agents" className="px-6 py-16 sm:px-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: false, amount: 0.2 }}
          className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-[#438608]/15 bg-[#438608] p-8 shadow-xl lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-600">Want to become an agent and sell/rent your properties?</p>
            <h3 className="mt-3 text-3xl font-bold text-white">Follow the steps to join our network of trusted agents</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {agentsteps.map((step, index) => (
              <div key={step} className="rounded-3xl bg-amber-100 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-sm font-semibold text-white">0{index + 1}</div>
                <p className="leading-7 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
      <section id="contact" className="px-6 py-16 sm:px-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-[#438608]/15 bg-white p-8 shadow-xl lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <img src={house} alt="House" />
          </motion.div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#438608]">Ready to find your dream home?</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">Start your journey with PrimeNest today</h3>
            <p className="mt-4 leading-7 text-slate-700">Join thousands of satisfied tenants and buyers who have found their perfect homes with PrimeNest. Sign up now and take the first step towards a confident and informed home search.</p>
            <div className="mt-6">
              <Link to="/listings" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#438608] px-8 py-4 text-lg font-semibold text-white shadow-xl transition hover:bg-[#376f07]">
                Explore properties <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}