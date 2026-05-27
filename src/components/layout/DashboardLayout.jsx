// import { useState, useEffect } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import Navbar  from "./Navbar";

// const DashboardLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();

//   // Close sidebar on route change (mobile)
//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [location.pathname]);

//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-50 font-body">
//       {/* ── Desktop sidebar (always visible) ── */}
//       <div className="hidden lg:flex">
//         <Sidebar />
//       </div>

//       {/* ── Mobile sidebar (drawer) ── */}
//       {sidebarOpen && (
//         <>
//           {/* Backdrop */}
//           <div
//             className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//             onClick={() => setSidebarOpen(false)}
//           />
//           {/* Drawer */}
//           <div className="fixed inset-y-0 left-0 z-50 lg:hidden flex">
//             <Sidebar onClose={() => setSidebarOpen(false)} />
//           </div>
//         </>
//       )}

//       {/* ── Main content ── */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         <Navbar
//           onMenuToggle={() => setSidebarOpen((s) => !s)}
//           sidebarOpen={sidebarOpen}
//         />
//         <main className="flex-1 overflow-y-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;



import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar  from "./Navbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8] font-sans">
      {/* ── Desktop sidebar (always visible) ── */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar (drawer) ── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden flex shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar
          onMenuToggle={() => setSidebarOpen((s) => !s)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;