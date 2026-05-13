import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Mail, KeyRound, Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { validateEmail, validatePassword } from "../../hooks/Valid";

const ForgotPasswordPage = () => {
  const [step, setStep]           = useState(1); // 1=email, 2=otp+new password
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState("");
  const [newPw, setNewPw]         = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setL]           = useState(false);
  const [done, setDone]           = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return toast.error(emailCheck.message);
    setL(true);
    try {
      await axiosInstance.post("/api/auth/forgot-password", { email: email.trim() });
      toast.success("If that email exists, an OTP has been sent.");
      setStep(2);
    } catch {
      toast.error("Request failed. Try again.");
    } finally { setL(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) return toast.error("Enter the 6-digit OTP");
    const pwCheck = validatePassword(newPw);
    if (!pwCheck.valid) return toast.error(pwCheck.message);
    setL(true);
    try {
      await axiosInstance.post("/api/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPw,
      });
      toast.success("Password reset! You can now log in.");
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Check your OTP.");
    } finally { setL(false); }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-5xl">🎉</div>
        <h2 className="font-display text-2xl font-bold text-gray-900">Password Reset!</h2>
        <p className="text-gray-500 text-sm">Your password has been updated. You can now sign in.</p>
        <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
          Go to Login <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
            <ChevronLeft size={16} /> Back to login
          </Link>
          <h2 className="font-display text-3xl font-bold text-sp-dark">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-sp-muted mt-2 text-sm">
            {step === 1
              ? "Enter your email and we'll send you an OTP."
              : `Enter the OTP sent to ${email} and your new password.`}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${step >= s ? "bg-sp-blue" : "bg-gray-200"}`} />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-sp-blue hover:bg-sp-blue-dark text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sp-blue/25 disabled:opacity-60">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Send OTP <ArrowRight size={15} /></>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">6-Digit OTP</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sp-dark uppercase tracking-wide">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-sp-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sp-blue/30 focus:border-sp-blue transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 text-sm">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-sp-blue hover:bg-sp-blue-dark text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sp-blue/25 disabled:opacity-60">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;