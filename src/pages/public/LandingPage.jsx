import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  MapPin, Clock, Shield, Zap, ArrowRight, Star,
  Car, Users, Building2, CheckCircle2, ChevronRight,
  Navigation, Wifi, CreditCard, Headphones
} from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCount({ target, suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Star row ─────────────────────────────────────────────────────────────────
function Stars({ rating = 0 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-white/20"} />
      ))}
    </div>
  );
}

// ── Lot card ─────────────────────────────────────────────────────────────────
function LotCard({ lot, rating, distance, index }) {
  const statusColor = lot.status === "ACTIVE"
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : "bg-amber-500/20 text-amber-400 border-amber-500/30";

  return (
    <div
      className="group relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.07] hover:border-white/[0.16] transition-all duration-300 cursor-pointer overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sp-blue/0 to-sp-blue/0 group-hover:from-sp-blue/5 group-hover:to-transparent rounded-2xl transition-all duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-sp-blue/15 border border-sp-blue/20 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-sp-blue" />
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
            {lot.status || "ACTIVE"}
          </span>
        </div>

        <h4 className="font-display font-bold text-white text-sm leading-snug mb-1 line-clamp-2">
          {lot.name}
        </h4>

        {rating != null && (
          <div className="flex items-center gap-1.5 mb-2">
            <Stars rating={rating} />
            <span className="text-white/40 text-[10px]">{rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1 text-white/40 text-[10px]">
            <MapPin size={10} />
            <span>{distance ? `${distance.toFixed(1)} km away` : "Nearby"}</span>
          </div>
          {lot.features?.length > 0 && (
            <div className="flex gap-1">
              {lot.features.slice(0, 2).map(f => (
                <span key={f} className="text-[9px] bg-white/[0.06] text-white/50 px-1.5 py-0.5 rounded-md">{f}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepCard({ num, title, desc, icon: Icon }) {
  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-sp-blue flex items-center justify-center font-display font-bold text-white text-sm flex-shrink-0 shadow-lg shadow-sp-blue/30">
          {num}
        </div>
        {num < 3 && <div className="w-px flex-1 bg-gradient-to-b from-sp-blue/40 to-transparent mt-2" />}
      </div>
      <div className="pb-10">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon size={15} className="text-sp-blue" />
          <span className="font-display font-bold text-white text-sm">{title}</span>
        </div>
        <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();

  // FIX: Removed the /api/super-admin/platform-stats API call.
  //
  // That endpoint requires SUPER_ADMIN role (JWT + correct role in SecurityConfig).
  // The landing page is public — no token exists here — so every visitor gets a 401.
  // Calling a role-gated admin endpoint from a public page is the wrong approach.
  //
  // If you want live stats on the landing page in the future, add a dedicated
  // public endpoint on the backend (e.g. GET /api/public/stats) that is explicitly
  // .permitAll() in SecurityConfig, and call that here instead.
  //
  // For now, the stats section displays the static fallback values below.

  // Nearby lots
  const [lots, setLots] = useState([]);
  const [ratings, setRatings] = useState({});
  const [lotsLoading, setLotsLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // ── Geolocation → nearby lots ───────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      setLotsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });
        try {
          const { data } = await axios.get(`${BASE_URL}/api/parking-lots/nearby`, {
            params: { lat: latitude, lng: longitude, limit: 6 }
          });
          setLots(data);

          // Fetch ratings in parallel
          const ratingMap = {};
          await Promise.allSettled(
            data.map(lot =>
              axios.get(`${BASE_URL}/api/feedback/lot/${lot.id}/average`)
                .then(r => { ratingMap[lot.id] = r.data; })
            )
          );
          setRatings(ratingMap);
        } catch {
          // lots remain empty — fallback shown
        } finally {
          setLotsLoading(false);
        }
      },
      () => {
        setLocationDenied(true);
        setLotsLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // ── Haversine for distance label ────────────────────────────────────────
  const getDistance = (lot) => {
    if (!userCoords) return null;
    const R = 6371;
    const dLat = (lot.latitude - userCoords.latitude) * Math.PI / 180;
    const dLon = (lot.longitude - userCoords.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
      Math.cos(userCoords.latitude * Math.PI/180) *
      Math.cos(lot.latitude * Math.PI/180) *
      Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // ── Static fallback stats (shown to all public visitors) ───────────────
  // Replace these with real numbers once you have a public /api/public/stats endpoint.
  const displayStats = [
    { label: "Parking Lots",        value: 500,   suffix: "+" },
    { label: "Completed Bookings",  value: 50000, suffix: "+" },
    { label: "Active Users",        value: 10000, suffix: "+" },
    { label: "Cities Covered",      value: 12,    suffix: ""  },
  ];

  return (
    <div className="min-h-screen bg-sp-dark font-body overflow-x-hidden">

      {/* ── Background textures ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "56px 56px"
          }} />
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] bg-sp-blue rounded-full blur-[200px] opacity-[0.12]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[180px] opacity-[0.08]" />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sp-blue rounded-xl flex items-center justify-center shadow-lg shadow-sp-blue/40">
            <span className="text-white font-display font-bold text-sm">S</span>
          </div>
          <span className="font-display text-white font-bold text-lg tracking-tight">SmartParking</span>
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#lots" className="hover:text-white transition-colors">Nearby lots</a>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/login")}
            className="hidden sm:block text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-2"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-sp-blue hover:bg-sp-blue-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-sp-blue/30 flex items-center gap-1.5"
          >
            Get started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pt-16 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-sp-blue/10 border border-sp-blue/25 text-sp-blue text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sp-blue animate-pulse" />
          Real-time availability · Zero guessing
        </div>

        <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] font-bold text-white leading-[1.04] tracking-tight mb-6">
          Parking that<br />
          <span className="relative inline-block">
            <span className="text-sp-blue">actually works.</span>
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sp-blue/60 to-transparent" />
          </span>
        </h1>

        <p className="text-white/50 text-lg leading-relaxed max-w-xl mx-auto mb-10">
          Find, book, and manage parking in real time — with live slot availability,
          valet service, and rental cars all on one platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <button
            onClick={() => navigate("/register")}
            className="bg-sp-blue hover:bg-sp-blue-dark text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all shadow-2xl shadow-sp-blue/30 flex items-center gap-2 justify-center"
          >
            Start parking smarter <ArrowRight size={17} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="border border-white/10 hover:border-white/20 text-white hover:bg-white/[0.04] font-semibold px-7 py-3.5 rounded-xl text-base transition-all"
          >
            Sign in to your account
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-white/30 text-xs">
          {[
            { icon: Shield, label: "Secure payments" },
            { icon: Wifi, label: "Real-time updates" },
            { icon: Headphones, label: "24/7 support" },
            { icon: CheckCircle2, label: "Verified lots" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={13} className="text-white/30" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform stats ───────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/[0.06] py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {displayStats.map(({ label, value, suffix }) => (
              <div key={label}>
                <div className="font-display text-4xl sm:text-5xl font-bold text-white mb-1">
                  <AnimatedCount target={value} suffix={suffix} />
                </div>
                <div className="text-white/40 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-sp-blue text-xs font-semibold uppercase tracking-widest mb-3">Everything you need</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Built for every use case</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: MapPin, title: "Live Map View",
              desc: "See every available slot in real time. No outdated data. Navigate directly from the app.",
              color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20"
            },
            {
              icon: Clock, title: "Instant Booking",
              desc: "Reserve your spot in seconds. Get confirmation immediately with your digital pass.",
              color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"
            },
            {
              icon: Car, title: "Valet Service",
              desc: "Drop off your car at the entrance. We park it — track your valet live on the map.",
              color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20"
            },
            {
              icon: Zap, title: "EV Charging Slots",
              desc: "Dedicated EV bays at partnered lots. Filter by charger type. Charge while you're away.",
              color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20"
            },
            {
              icon: CreditCard, title: "Promo Codes",
              desc: "Apply discount codes at checkout. First-time offers, loyalty rewards, and seasonal deals.",
              color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20"
            },
            {
              icon: Users, title: "Fleet & Rental Cars",
              desc: "Rent a car or list yours for rental. Full fleet management for business owners.",
              color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20"
            },
          ].map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div
              key={title}
              className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className={`w-11 h-11 ${bg} border ${border} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={19} className={color} />
              </div>
              <h3 className="font-display font-bold text-white text-[15px] mb-2">{title}</h3>
              <p className="text-white/45 text-[13px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how" className="relative z-10 px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sp-blue text-xs font-semibold uppercase tracking-widest mb-3">Simple process</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Parked in<br />3 steps
            </h2>
            <p className="text-white/45 text-sm leading-relaxed mb-10">
              No apps to download. No queues. No confusion.
              Just open SmartParking, find your spot, and go.
            </p>

            <div>
              <StepCard num={1} icon={Navigation} title="Find a lot near you"
                desc="Allow location access. We instantly show available lots nearby with live slot counts and ratings." />
              <StepCard num={2} icon={Clock} title="Book your slot"
                desc="Pick a time, choose your slot type (EV, regular, bike), and confirm. Takes under 30 seconds." />
              <StepCard num={3} icon={CheckCircle2} title="Park and go"
                desc="Show your digital pass at the gate. Or request a valet to handle it for you." />
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <span className="font-display font-bold text-white text-sm">Nearby Lots</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live
                </span>
              </div>
              {[
                { name: "Central Park Lot A", slots: 12, dist: "0.3 km", rating: 4.8 },
                { name: "Metro Station Parking", slots: 4, dist: "0.7 km", rating: 4.5 },
                { name: "City Square Garage", slots: 28, dist: "1.2 km", rating: 4.2 },
              ].map((lot) => (
                <div key={lot.name} className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
                  <div>
                    <div className="text-white text-xs font-semibold mb-0.5">{lot.name}</div>
                    <div className="flex items-center gap-2 text-white/35 text-[10px]">
                      <MapPin size={9} />
                      <span>{lot.dist}</span>
                      <Stars rating={lot.rating} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-emerald-400 text-sm">{lot.slots}</div>
                    <div className="text-white/30 text-[10px]">slots free</div>
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 bg-sp-blue text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                View on map <ChevronRight size={13} />
              </button>
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-sp-blue rounded-full blur-[80px] opacity-20 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Nearby lots (dynamic) ────────────────────────────────────────── */}
      <section id="lots" className="relative z-10 px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-sp-blue text-xs font-semibold uppercase tracking-widest mb-2">Live availability</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                {userCoords ? "Lots near you" : "Featured lots"}
              </h2>
            </div>
            {userCoords && (
              <div className="flex items-center gap-1.5 text-white/35 text-xs">
                <Navigation size={12} className="text-sp-blue" />
                Based on your location
              </div>
            )}
          </div>

          {lotsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 animate-pulse">
                  <div className="w-10 h-10 bg-white/[0.06] rounded-xl mb-4" />
                  <div className="h-3 bg-white/[0.06] rounded mb-2 w-3/4" />
                  <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!lotsLoading && locationDenied && (
            <div className="text-center py-14 border border-white/[0.06] rounded-2xl bg-white/[0.02]">
              <Navigation size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm mb-1">Location access required to show nearby lots</p>
              <p className="text-white/30 text-xs">Sign in to browse all available parking</p>
              <button
                onClick={() => navigate("/register")}
                className="mt-5 bg-sp-blue text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sp-blue/25"
              >
                Sign up to explore
              </button>
            </div>
          )}

          {!lotsLoading && !locationDenied && lots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lots.map((lot, i) => (
                <LotCard
                  key={lot.id}
                  lot={lot}
                  rating={ratings[lot.id] ?? null}
                  distance={getDistance(lot)}
                  index={i}
                />
              ))}
            </div>
          )}

          {!lotsLoading && !locationDenied && lots.length === 0 && (
            <div className="text-center py-14 border border-white/[0.06] rounded-2xl bg-white/[0.02]">
              <Building2 size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">No lots found near you yet</p>
              <p className="text-white/30 text-xs mt-1">We're expanding — check back soon</p>
            </div>
          )}

          {!lotsLoading && lots.length > 0 && (
            <div className="text-center mt-10">
              <button
                onClick={() => navigate("/register")}
                className="text-sp-blue text-sm font-semibold hover:text-white transition-colors flex items-center gap-1.5 mx-auto"
              >
                Sign up to book any of these lots <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sp-blue/10 border border-sp-blue/20 text-sp-blue text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-sp-blue animate-pulse" />
            Free to sign up
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Stop wasting time.<br />Park smarter today.
          </h2>
          <p className="text-white/45 text-base mb-10 max-w-md mx-auto">
            Join thousands of drivers already using SmartParking to find spots faster
            and park without the stress.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-sp-blue hover:bg-sp-blue-dark text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-2xl shadow-sp-blue/30 flex items-center gap-2 justify-center"
            >
              Create free account <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-white/10 hover:border-white/20 text-white/70 hover:text-white hover:bg-white/[0.04] font-semibold px-8 py-4 rounded-xl text-base transition-all"
            >
              I already have an account
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-white/25 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-sp-blue/80 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[9px]">S</span>
            </div>
            <span className="font-display font-semibold text-white/40">SmartParking</span>
          </div>
          <span>© {new Date().getFullYear()} SmartParking. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;