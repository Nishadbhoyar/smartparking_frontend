import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { User, Mail, Phone, Shield, Edit2, Check, X, Lock } from "lucide-react";

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", password: "", confirmPassword: "" });
  const [saving, setSave] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name cannot be empty");
    if (form.password && form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password && form.password !== form.confirmPassword) return toast.error("Passwords do not match");
    setSave(true);
    try {
      const body = { name: form.name.trim() };
      if (form.password) body.password = form.password;
      const res = await axiosInstance.put(`/api/users/${user.id}`, body);
      // Update auth context with new name
      login({ ...user, name: res.data.name });
      toast.success("Profile updated!");
      setEditing(false);
      setForm({ name: res.data.name, password: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setSave(false); }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({ name: user?.name || "", password: "", confirmPassword: "" });
  };

  return (
    <div className="page-container max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="btn-secondary flex items-center gap-1.5 text-sm">
            <Edit2 size={13} /> Edit
          </button>
        )}
      </div>

      <div className="card space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sp-blue/10 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-sp-blue">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-gray-900">{user?.name}</div>
            <div className="text-sm text-sp-blue font-medium mt-0.5">{user?.role?.replace(/_/g, " ")}</div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 space-y-4">
          {/* Read-only fields */}
          {[
            { icon: Mail,   label: "Email", value: user?.email },
            { icon: Shield, label: "Role",  value: user?.role?.replace(/_/g, " ") },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-gray-500" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">{label}</div>
                <div className="text-sm text-gray-900 font-medium">{value}</div>
              </div>
            </div>
          ))}

          {/* Editable name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 font-medium mb-1">Name</div>
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input text-sm py-1.5"
                />
              ) : (
                <div className="text-sm text-gray-900 font-medium">{user?.name}</div>
              )}
            </div>
          </div>

          {/* Password change (only shown when editing) */}
          {editing && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock size={14} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 font-medium mb-1">New Password <span className="text-gray-300">(optional)</span></div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="input text-sm py-1.5"
                  />
                </div>
              </div>
              {form.password && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 font-medium mb-1">Confirm Password</div>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className="input text-sm py-1.5"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit action buttons */}
        {editing && (
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={handleCancel} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm">
              <X size={13} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-sm">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Check size={13} /> Save Changes</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;