import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, User, Mail, Phone, Shield } from "lucide-react";
import toast from "react-hot-toast";

const ROLE_COLOR = {
  CUSTOMER:          "bg-blue-100 text-blue-700",
  VALET:             "bg-green-100 text-green-700",
  PARKING_LOT_ADMIN: "bg-amber-100 text-amber-700",
  SUPER_ADMIN:       "bg-red-100 text-red-700",
  FLEET_ADMIN:       "bg-purple-100 text-purple-700",
  CAR_OWNER:         "bg-cyan-100 text-cyan-700",
};

const AllUsersPage = () => {
  const [email, setEmail]   = useState("");
  const [user, setUser]     = useState(null);
  const [loading, setL]     = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter an email to search");
    setL(true);
    setSearched(true);
    setUser(null);
    try {
      const res = await axiosInstance.get(`/api/users/${encodeURIComponent(email.trim())}`);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setL(false);
    }
  };

  return (
    <div className="page-container space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">User Lookup</h1>
        <p className="text-gray-500 text-sm mt-1">Search any registered user by email address</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="input pl-10"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-5">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Search size={14} /> Search</>}
        </button>
      </form>

      {/* Result */}
      {searched && !loading && (
        user ? (
          <div className="card space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sp-blue/10 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-2xl text-sp-blue">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">{user.name}</h2>
                <span className={`badge text-xs mt-1 ${ROLE_COLOR[user.role] || "bg-gray-100 text-gray-600"}`}>
                  {user.role?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {[
                { icon: User,   label: "Name",  value: user.name },
                { icon: Mail,   label: "Email", value: user.email },
                { icon: Phone,  label: "Phone", value: user.phoneNumber || "Not provided" },
                { icon: Shield, label: "Role",  value: user.role?.replace(/_/g, " ") },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <User size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">No user found</p>
            <p className="text-gray-400 text-xs mt-1">No account registered with <strong>{email}</strong></p>
          </div>
        )
      )}
    </div>
  );
};
export default AllUsersPage;
