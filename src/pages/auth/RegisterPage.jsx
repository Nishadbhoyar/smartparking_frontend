import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { ROLE_HOME_ROUTES, ROLES } from "../../utils/constants";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Zap } from "lucide-react";
import { validateEmail, validatePassword, validatePhone, passwordStrength } from "../../hooks/Valid";

// Super Admin is created directly via SQL — not available for self-registration
const ROLE_OPTIONS = [
  { value: ROLES.CUSTOMER,          label: "Customer",          emoji: "🚗", desc: "Find & book parking slots" },
  { value: ROLES.CAR_OWNER,         label: "Car Owner",         emoji: "🔑", desc: "List your car for rent" },
  { value: ROLES.FLEET_ADMIN,       label: "Fleet Admin",       emoji: "🚌", desc: "Manage a fleet of rental cars" },
  { value: ROLES.VALET,             label: "Valet",             emoji: "🧑‍✈️", desc: "Park & return customer vehicles" },
  { value: ROLES.PARKING_LOT_ADMIN, label: "Parking Lot Admin", emoji: "🅿️", desc: "Manage your parking lot" },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step,    setStep]   = useState(1);
  const [showPw,  setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]   = useState({
    name: "", email: "", password: "", phoneNumber: "", role: ""
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");

    const emailCheck = validateEmail(form.email);
    if (!emailCheck.valid) return toast.error(emailCheck.message);

    if (form.phoneNumber.trim()) {
      const phoneCheck = validatePhone(form.phoneNumber);
      if (!phoneCheck.valid) return toast.error(phoneCheck.message);
    }

    const pwCheck = validatePassword(form.password);
    if (!pwCheck.valid) return toast.error(pwCheck.message);

    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.role) return toast.error("Please select a role");
    setLoading(true);
    try {
      const res  = await axiosInstance.post("/api/auth/register", form);
      const raw  = res.data;
      const user = { ...raw, id: raw.userId };
      login(user);
      toast.success(`Account created! Welcome, ${user.name}`);
      navigate(ROLE_HOME_ROUTES[user.role] || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to instantly fill valid data during testing
  const fillDemoData = () => {
    const randomId = Math.floor(Math.random() * 10000);
    setForm({
      ...form,
      name: "Demo User",
      email: `demo${randomId}@test.com`,
      phoneNumber: "9876543210", // Valid Indian number starting with 9
      password: "Password123"    // Satisfies 8 chars, 1 uppercase, 1 number
    });
  };

  return (
    <div className="min-h-screen flex font-body">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sp-dark flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500 rounded-full blur-[120px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-sp-blue rounded-xl flex items-center justify-center shadow-lg shadow-sp-blue/30">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <span className="font-display text-white text-xl font-bold tracking-tight">SmartParking</span>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Join thousands of<br />
            <span className="text-sp-blue">smart drivers.</span>
          </h1>
          <div className="space-y-4">
            {[
              { n: "01", t: "Create your account",   d: "Fill in your basic details" },
              { n: "02", t: "Choose your role",       d: "Customises your dashboard" },
              { n: "03", t: "Start parking smarter",  d: "Access real-time availability" },
            ].map((s, i) => (
              <div key={i} className={`flex gap-4 ${step > i ? "opacity-100" : "opacity-40"} transition-opacity`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-display ${step > i ? "bg-sp-blue text-white" : "bg-white/10 text-white"}`}>
                  {step > i + 1 ? <Check size={14} /> : s.n}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{s.t}</div>
                  <div className="text-sp-muted text-xs mt-0.5">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sp-muted text-xs">Free to use · No credit card required</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-8">
            <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 1 ? "bg-sp-blue" : "bg-gray-200"}`} />
            <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 2 ? "bg-sp-blue" : "bg-gray-200"}`} />
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold text-sp-dark">Create account</h2>
                <p className="text-sp-muted mt-2 text-sm">Let's start with your basic details</p>
              </div>

              <form onSubmit={handleStep1} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">Full name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">Email *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">
                    Phone <span className="text-gray-400 normal-case font-normal">(optional)</span>
                  </label>
                  <input type="tel" value={form.phoneNumber}
                    onChange={(e) => set("phoneNumber", e.target.value)}
                    placeholder="+91 98765 43210"
                    maxLength={14}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all" />
                  <p className="text-xs text-gray-500">10-digit number starting with 6, 7, 8, or 9</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">Password *</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPw ? "text" : "password"} value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  {form.password && (() => {
                    const s = passwordStrength(form.password);
                    return s ? (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex gap-1 flex-1">
                          {["Weak", "Fair", "Good", "Strong"].map((level, i) => (
                            <div key={level} className={"h-1 flex-1 rounded-full transition-all " +
                              (["Weak","Fair","Good","Strong"].indexOf(s.label) >= i ? s.color : "bg-gray-200")} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{s.label}</span>
                      </div>
                    ) : null;
                  })()}
                  <p className="text-xs text-gray-500 mt-1">Min 8 chars · 1 uppercase letter · 1 number</p>
                </div>

                <button type="submit"
                  className="w-full bg-sp-blue hover:bg-sp-blue-dark text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sp-blue/25 active:scale-[0.98]">
                  Continue <ArrowRight size={15} />
                </button>
              </form>

              {/* Dev/Demo tool to easily bypass validation */}
              {/* <div className="mt-4 border-t border-gray-100 pt-4">
                <button 
                  type="button" 
                  onClick={fillDemoData}
                  className="w-full text-xs flex items-center justify-center gap-1.5 py-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <Zap size={14} className="text-amber-500" />
                  Quick fill valid demo data
                </button>
              </div> */}

              <p className="text-center text-sm text-sp-muted mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-sp-blue font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)}
                className="text-xs text-sp-muted hover:text-sp-dark flex items-center gap-1 mb-6 transition-colors">
                ← Back
              </button>
              <div className="mb-6">
                <h2 className="font-display text-3xl font-bold text-sp-dark">Pick your role</h2>
                <p className="text-sp-muted mt-2 text-sm">This shapes your entire experience</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {ROLE_OPTIONS.map((r) => (
                  <button key={r.value} type="button" onClick={() => set("role", r.value)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      form.role === r.value
                        ? "border-sp-blue bg-sp-blue/5"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}>
                    <div className="text-xl mb-2">{r.emoji}</div>
                    <div className={`text-xs font-bold ${form.role === r.value ? "text-sp-blue" : "text-sp-dark"}`}>{r.label}</div>
                    <div className="text-xs text-sp-muted mt-0.5 leading-tight">{r.desc}</div>
                  </button>
                ))}
              </div>

              <button onClick={handleSubmit} disabled={loading || !form.role}
                className="w-full bg-sp-blue hover:bg-sp-blue-dark text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sp-blue/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <> Create account <ArrowRight size={15} /> </>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;