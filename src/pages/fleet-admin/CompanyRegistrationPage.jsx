import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Building2, ArrowRight, FileText, MapPin, Phone, Mail } from "lucide-react";

const BLANK = {
  companyName:        "",
  registrationNumber: "",
  address:            "",
  city:               "",
  contactEmail:       "",
  contactPhone:       "",
};

const CompanyRegistrationPage = () => {
  const { user, refreshCompany } = useAuth();
  const navigate                 = useNavigate();
  const [form, setForm]          = useState(BLANK);
  const [saving, setSaving]      = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) return toast.error("Company name is required");
    if (!form.city.trim())        return toast.error("City is required");

    setSaving(true);
    try {
      await axiosInstance.post("/api/rental-company/register", {
        ...form,
        fleetAdminId: user.id,
      });
      toast.success("Company registered! Awaiting verification.");
      // Refresh auth context so companyId + companyVerified are populated
      await refreshCompany(user.id);
      navigate("/fleet-admin/pending-verification");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-lg">

      {/* Header */}
      <div className="mb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={22} className="text-blue-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Register Your Company</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in your details. Our team will verify and activate your fleet account.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {["Company Info", "Under Review", "Activated"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0 ? "bg-sp-blue text-white" : "bg-gray-100 text-gray-400"
            }`}>{i + 1}</div>
            <span className={`text-xs font-medium ${i === 0 ? "text-gray-800" : "text-gray-400"}`}>{step}</span>
            {i < 2 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">

        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="label flex items-center gap-1.5">
            <Building2 size={12} className="text-gray-400" /> Company Name *
          </label>
          <input
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="Acme Rentals Pvt. Ltd."
            className="input"
          />
        </div>

        {/* Registration Number */}
        <div className="space-y-1.5">
          <label className="label flex items-center gap-1.5">
            <FileText size={12} className="text-gray-400" /> GST / Registration Number
          </label>
          <input
            value={form.registrationNumber}
            onChange={(e) => set("registrationNumber", e.target.value.toUpperCase())}
            placeholder="MH-2024-XXXXX"
            className="input font-mono tracking-wider"
          />
        </div>

        {/* City + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="label flex items-center gap-1.5">
              <MapPin size={12} className="text-gray-400" /> City *
            </label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Pune"
              className="input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="label flex items-center gap-1.5">
              <Phone size={12} className="text-gray-400" /> Contact Phone
            </label>
            <input
              value={form.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)}
              placeholder="+91 98765 43210"
              className="input"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="label flex items-center gap-1.5">
            <MapPin size={12} className="text-gray-400" /> Address
          </label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="123, Main Street, Koregaon Park"
            className="input"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-1.5">
          <label className="label flex items-center gap-1.5">
            <Mail size={12} className="text-gray-400" /> Contact Email
          </label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            placeholder="contact@acmerentals.in"
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><span>Submit for Verification</span><ArrowRight size={15} /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default CompanyRegistrationPage;