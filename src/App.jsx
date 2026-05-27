import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";

function App() {
  useEffect(() => {
    const handle403 = (e) => {
      toast.error(`Access denied${e.detail?.url ? ` (${e.detail.url})` : ""}. You don't have permission for this action.`);
    };
    window.addEventListener("sp:forbidden", handle403);
    return () => window.removeEventListener("sp:forbidden", handle403);
  }, []);

  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "DM Sans, sans-serif", fontSize: "13px", borderRadius: "12px" },
          success: { iconTheme: { primary: "#2563eb", secondary: "#fff" } },
        }}
      />
    </AuthProvider>
  );
}

export default App;