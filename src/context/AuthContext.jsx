import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, saveUser, clearUser } from "../utils/storage";
import axiosInstance, { registerLogoutHandler } from "../api/axiosInstance";

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? Date.now() >= payload.exp * 1000 : true;
  } catch { return true; }
};

const loadUser = () => {
  const u = getUser();
  if (!u) return null;
  if (u.token && isTokenExpired(u.token)) { clearUser(); return null; }
  return u;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUser);
  const navigate = useNavigate();

  // Register logout handler so axiosInstance can trigger React state clear
  useEffect(() => {
    registerLogoutHandler(() => {
      clearUser();
      setUser(null);
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  /**
   * Fetches the company linked to the given fleet admin user ID and
   * enriches the stored user object with companyId + companyVerified.
   *
   * Called automatically on first load (when companyId is still undefined),
   * and manually from CompanyRegistrationPage after successful registration.
   */
  const refreshCompany = useCallback(async (userId) => {
    try {
      const r = await axiosInstance.get(`/api/rental-company/by-admin/${userId}`);
      setUser((prev) => {
        const enriched = {
          ...prev,
          companyId:       r.data.id,
          companyVerified: r.data.platformVerified,
        };
        saveUser(enriched);
        return enriched;
      });
    } catch {
      // 404 = no company registered yet — mark explicitly so pages can redirect
      setUser((prev) => {
        const updated = { ...prev, companyId: null, companyVerified: false };
        saveUser(updated);
        return updated;
      });
    }
  }, []);

  /**
   * Auto-enrich once per login session.
   * Condition: FLEET_ADMIN user whose companyId has never been fetched (=== undefined).
   * After refreshCompany runs, companyId is either a number or null — never undefined again,
   * so this effect will not re-trigger on subsequent renders.
   */
  useEffect(() => {
    if (user?.role === "FLEET_ADMIN" && user?.companyId === undefined) {
      refreshCompany(user.id);
    }
  }, [user?.id, refreshCompany]);

  const login  = (u) => { saveUser(u); setUser(u); };
  const logout = async () => {
    try { await axiosInstance.post("/api/auth/logout"); } catch (_) {}
    finally { clearUser(); setUser(null); }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, refreshCompany }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);