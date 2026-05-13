import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { ROLE_HOME_ROUTES } from "../../utils/constants";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { validateEmail } from "../../hooks/Valid";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const emailCheck = validateEmail(form.email);
  if (!emailCheck.valid) return toast.error(emailCheck.message);
  if (!form.password) return toast.error("Password is required");
  setLoading(true);
  try {
    const res  = await axiosInstance.post("/api/auth/login", form);
    const raw  = res.data;
    const user = { ...raw, id: raw.userId };
    login(user);
    toast.success(`Welcome back, ${user.name}!`);

    const destination = ROLE_HOME_ROUTES[user.role];
    if (destination) {
      navigate(destination, { replace: true });
    } else {
      console.error("No route defined for role:", user.role);
      navigate("/login", { replace: true });
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Invalid email or password.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex font-body">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-sp-dark flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-sp-blue rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-sp-blue rounded-xl flex items-center justify-center shadow-lg shadow-sp-blue/30">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <span className="font-display text-white text-xl font-bold tracking-tight">SmartParking</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-sp-blue/10 border border-sp-blue/20 text-sp-blue text-xs font-medium px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-sp-blue animate-pulse" />
            Real-time parking intelligence
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Park smarter.<br />
            <span className="text-sp-blue">Every time.</span>
          </h1>
          <p className="text-sp-muted text-lg leading-relaxed max-w-sm">
            Find available spots instantly, book in seconds, and never circle the block again.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-4">
            {[["2,400+", "Parking Lots"], ["98%", "Uptime"], ["< 30s", "Avg. Booking"]].map(([val, label]) => (
              <div key={label}>
                <div className="font-display text-2xl font-bold text-white">{val}</div>
                <div className="text-sp-muted text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 w-fit">
          <div className="flex -space-x-2">
            {["#3b82f6","#10b981","#f59e0b"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-sp-dark" style={{ background: c }} />
            ))}
          </div>
          <div>
            <div className="text-white text-xs font-medium">10,000+ drivers</div>
            <div className="text-sp-muted text-xs">parked this week</div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-sp-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display text-sp-dark font-bold">SmartParking</span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-sp-dark">Welcome back</h2>
            <p className="text-sp-muted mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              {/* FIX: added forgot password link */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-xs text-sp-blue hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-sp-blue hover:bg-sp-blue-dark text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sp-blue/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <> Sign In <ArrowRight size={15} /> </>}
            </button>
          </form>

          <p className="text-center text-sm text-sp-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-sp-blue font-semibold hover:underline">Create one</Link>
          </p>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-xs text-sp-muted text-center mb-3">Quick demo — click a role to autofill</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: "Customer",    email: "customer@test.com" },
                { label: "Valet",       email: "valet@test.com" },
                { label: "Lot Admin",   email: "admin@test.com" },
                { label: "Super Admin", email: "super@test.com" },
              ].map((r) => (
                <button key={r.label} type="button"
                  onClick={() => setForm({ email: r.email, password: "demo" })}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-sp-blue hover:text-sp-blue transition-colors">
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;