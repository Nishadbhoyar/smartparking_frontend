// import { useEffect, useState } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// import axiosInstance from "../../api/axiosInstance";
// import { formatCurrency } from "../../utils/formatters";
// import toast from "react-hot-toast";
// import {
//   Tag,
//   ChevronLeft,
//   ParkingSquare,
//   CheckCircle,
//   Zap,
//   Car,
//   Accessibility,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";

// const SLOT_TYPE_INFO = {
//   REGULAR:      { icon: ParkingSquare, label: "Regular",       color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
//   EV_CHARGING:  { icon: Zap,           label: "EV Charging",   color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
//   HEAVY_VEHICLE:{ icon: Car,           label: "Heavy Vehicle", color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
//   BIKE:         { icon: Accessibility, label: "Bike",          color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
// };

// const BookSlotPage = () => {
//   const { lotId } = useParams();
//   const [sp] = useSearchParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [lot, setLot] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [selectedType, setType] = useState(sp.get("slotType") || "REGULAR");
//   const [hours, setHours] = useState(2);
//   const [promoCode, setPromo] = useState("");
//   const [discount, setDiscount] = useState(0);
//   const [promoMsg, setPromoMsg] = useState("");
//   const [promoLoading, setPL] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Eligible promos panel
//   const [eligiblePromos, setEligiblePromos] = useState([]);
//   const [promosOpen, setPromosOpen] = useState(false);
//   const [promosLoading, setPromosLoading] = useState(false);

//   const entryTime = new Date();
//   const exitTime = new Date(entryTime.getTime() + hours * 3600000);

//   useEffect(() => {
//     axiosInstance.get(`/api/parking-lots/${lotId}`).then((r) => setLot(r.data));
//     axiosInstance.get(`/api/slots/lot/${lotId}`).then((r) => setSlots(r.data || []));
//   }, [lotId]);

//   const rateSlot = slots.find((s) => s.slotType === selectedType && s.status === "AVAILABLE");
//   const hourlyRate = Number(sp.get("rate")) || rateSlot?.hourlyRate || 50;
//   const subtotal = hourlyRate * hours;
//   const total = Math.max(0, subtotal - discount);

//   const availableTypes = [...new Set(slots.filter((s) => s.status === "AVAILABLE").map((s) => s.slotType))];

//   const handleOpenPromos = async () => {
//     if (promosOpen) { setPromosOpen(false); return; }
//     setPromosOpen(true);
//     if (eligiblePromos.length > 0) return; // already loaded
//     setPromosLoading(true);
//     try {
//       const res = await axiosInstance.get("/api/promo/eligible", {
//         params: { customerId: user?.id, amount: subtotal },
//       });
//       setEligiblePromos(res.data || []);
//     } catch {
//       setEligiblePromos([]);
//     } finally {
//       setPromosLoading(false);
//     }
//   };

//   const handleQuickApply = (code) => {
//     setPromo(code);
//     setPromosOpen(false);
//     setTimeout(() => handleValidatePromoCode(code), 100);
//   };

//   const handleValidatePromoCode = async (codeOverride) => {
//     const code = (codeOverride || promoCode).trim();
//     if (!code) return;
//     setPL(true);
//     setPromoMsg("");
//     try {
//       const res = await axiosInstance.get("/api/promo/validate", {
//         params: { code, amount: subtotal, customerId: user?.id },
//       });
//       const disc = res.data?.discountAmount || 0;
//       setDiscount(disc);
//       setPromoMsg(`✓ Promo applied! You save ${formatCurrency(disc)}`);
//     } catch (err) {
//       setDiscount(0);
//       // FIX: show the actual backend error message — it's specific ("already used",
//       // "limit reached", "new users only", etc.) not a generic string
//       const backendMessage =
//         err.response?.data?.message ||
//         err.response?.data ||
//         "Invalid or expired promo code";
//       setPromoMsg(`✗ ${backendMessage}`);
//     } finally {
//       setPL(false);
//     }
//   };

//   const handleValidatePromo = () => handleValidatePromoCode(promoCode);

//   const handleBook = async () => {
//     if (!user?.id) return toast.error("Please log in first");
//     if (availableTypes.length === 0) return toast.error("No available slots");

//     setLoading(true);
//     try {
//       const payload = {
//         customerId: user.id,
//         parkingLotId: Number(lotId),
//         slotType: selectedType,
//         entryTime: entryTime.toISOString(),
//         exitTime: exitTime.toISOString(),
//         valetBooking: false,
//         promoCode: promoCode.trim() || null,
//       };
//       const res = await axiosInstance.post("/api/bookings/reserve", payload);
//       toast.success("Booking created! Proceed to payment.");
//       navigate(`/customer/payment/PARKING_BOOKING/${res.data.id}`, {
//         state: {
//           serviceData: {
//             referenceCode: res.data.bookingCode,
//             amount:        res.data.totalAmount,
//             label:         "Parking Slot",
//             lines: [
//               { key: "Lot",  value: res.data.parkingLotName },
//               { key: "Slot", value: res.data.slotNumber },
//             ],
//           },
//         },
//       });
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Booking failed. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page-container max-w-xl space-y-6">
//       <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
//         <ChevronLeft size={16} /> {lot?.name || "Back"}
//       </button>

//       <div>
//         <h1 className="font-display text-2xl font-bold text-gray-900">Book a Slot</h1>
//         <p className="text-gray-500 text-sm mt-1">at {lot?.name}</p>
//       </div>

//       {/* Slot Type */}
//       <div className="card space-y-3">
//         <h2 className="section-title">Slot Type</h2>
//         {availableTypes.length === 0 ? (
//           <p className="text-sm text-red-500">No slots available at this lot right now.</p>
//         ) : (
//           <div className="grid grid-cols-2 gap-2">
//             {availableTypes.map((type) => {
//               const info = SLOT_TYPE_INFO[type] || SLOT_TYPE_INFO.REGULAR;
//               const Icon = info.icon;
//               const count = slots.filter((s) => s.slotType === type && s.status === "AVAILABLE").length;
//               const active = selectedType === type;
//               return (
//                 <button key={type} onClick={() => setType(type)}
//                   className={`p-3.5 rounded-xl border-2 text-left transition-all ${active ? `${info.border} ${info.bg}` : "border-gray-100 hover:border-gray-200 bg-white"}`}>
//                   <div className="flex items-center gap-2 mb-1">
//                     <Icon size={15} className={active ? info.color : "text-gray-400"} />
//                     <span className={`text-sm font-semibold ${active ? info.color : "text-gray-700"}`}>{info.label}</span>
//                   </div>
//                   <div className="text-xs text-gray-500">{count} available</div>
//                   <div className={`text-xs font-bold mt-1 ${active ? info.color : "text-gray-600"}`}>
//                     {formatCurrency(rateSlot?.hourlyRate || hourlyRate)}/hr
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Duration */}
//       <div className="card space-y-3">
//         <h2 className="section-title">Duration</h2>
//         <div className="flex items-center gap-3">
//           <button onClick={() => setHours(Math.max(1, hours - 1))}
//             className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">−</button>
//           <div className="flex-1 text-center">
//             <span className="font-display text-3xl font-bold text-gray-900">{hours}</span>
//             <span className="text-gray-500 text-sm ml-1">hour{hours > 1 ? "s" : ""}</span>
//           </div>
//           <button onClick={() => setHours(Math.min(24, hours + 1))}
//             className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">+</button>
//         </div>
//         <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
//           <div><span className="font-medium text-gray-700">Entry:</span> {entryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
//           <div><span className="font-medium text-gray-700">Exit:</span> {exitTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
//         </div>
//       </div>

//       {/* Promo Code */}
//       <div className="card space-y-3">
//         <h2 className="section-title flex items-center gap-2"><Tag size={15} /> Promo Code</h2>

//         {/* Eligible promos accordion */}
//         {user?.id && (
//           <div>
//             <button onClick={handleOpenPromos}
//               className="flex items-center gap-2 text-xs text-purple-600 font-medium hover:text-purple-800 transition-colors mb-2">
//               {promosOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//               {promosOpen ? "Hide" : "See"} available promos for you
//             </button>

//             {promosOpen && (
//               <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-3">
//                 {promosLoading ? (
//                   <p className="text-xs text-gray-400">Loading promos…</p>
//                 ) : eligiblePromos.length === 0 ? (
//                   <p className="text-xs text-gray-400">No eligible promos right now.</p>
//                 ) : (
//                   eligiblePromos.map((p) => (
//                     <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
//                       <div>
//                         <p className="font-mono text-sm font-bold text-gray-900 tracking-wider">{p.code}</p>
//                         <p className="text-xs text-gray-500">
//                           {p.type === "PERCENTAGE" ? `${p.discountValue}% off` : `₹${p.discountValue} off`}
//                           {p.minBookingAmount ? ` · Min ₹${p.minBookingAmount}` : ""}
//                           {p.newUsersOnly ? " · New users only" : ""}
//                         </p>
//                       </div>
//                       <button onClick={() => handleQuickApply(p.code)}
//                         className="text-xs font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors">
//                         Apply
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Manual code entry */}
//         <div className="flex gap-2">
//           <input
//             value={promoCode}
//             onChange={(e) => {
//               setPromo(e.target.value.toUpperCase());
//               if (promoMsg) { setPromoMsg(""); setDiscount(0); }
//             }}
//             placeholder="Enter code e.g. FIRST50"
//             className="input flex-1 uppercase tracking-widest text-sm"
//           />
//           <button onClick={handleValidatePromo} disabled={promoLoading || !promoCode}
//             className="btn-secondary px-4 text-sm disabled:opacity-50">
//             {promoLoading
//               ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
//               : "Apply"}
//           </button>
//         </div>

//         {/* FIX: shows actual backend error, not hardcoded "Invalid or expired" */}
//         {promoMsg && (
//           <p className={`text-xs font-medium ${promoMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
//             {promoMsg}
//           </p>
//         )}
//       </div>

//       {/* Fare Summary */}
//       <div className="card space-y-3">
//         <h2 className="section-title">Fare Summary</h2>
//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between text-gray-600">
//             <span>{formatCurrency(hourlyRate)} × {hours} hr{hours > 1 ? "s" : ""}</span>
//             <span>{formatCurrency(subtotal)}</span>
//           </div>
//           {discount > 0 && (
//             <div className="flex justify-between text-green-600">
//               <span>Promo discount</span>
//               <span>−{formatCurrency(discount)}</span>
//             </div>
//           )}
//           <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
//             <span>Total</span>
//             <span className="text-sp-blue">{formatCurrency(total)}</span>
//           </div>
//         </div>
//       </div>

//       {/* Confirm */}
//       <button onClick={handleBook} disabled={loading || availableTypes.length === 0}
//         className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2">
//         {loading
//           ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//           : <><CheckCircle size={17} /> Confirm Booking — {formatCurrency(total)}</>}
//       </button>
//     </div>
//   );
// };

// export default BookSlotPage;

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import {
  Tag,
  ChevronLeft,
  ParkingSquare,
  CheckCircle,
  Zap,
  Car,
  Accessibility,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SLOT_TYPE_INFO = {
  REGULAR:      { icon: ParkingSquare, label: "Regular",       color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  EV_CHARGING:  { icon: Zap,           label: "EV Charging",   color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  HEAVY_VEHICLE:{ icon: Car,           label: "Heavy Vehicle", color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  BIKE:         { icon: Accessibility, label: "Bike",          color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
};

const BookSlotPage = () => {
  const { lotId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lot, setLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedType, setType] = useState(sp.get("slotType") || "REGULAR");
  const [hours, setHours] = useState(2);
  const [promoCode, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoLoading, setPL] = useState(false);
  const [loading, setLoading] = useState(false);

  // Eligible promos panel
  const [eligiblePromos, setEligiblePromos] = useState([]);
  const [promosOpen, setPromosOpen] = useState(false);
  const [promosLoading, setPromosLoading] = useState(false);

  const entryTime = new Date();
  const exitTime = new Date(entryTime.getTime() + hours * 3600000);

  useEffect(() => {
    axiosInstance.get(`/api/parking-lots/${lotId}`).then((r) => setLot(r.data));
    axiosInstance.get(`/api/slots/lot/${lotId}`).then((r) => setSlots(r.data || []));
  }, [lotId]);

  const rateSlot = slots.find((s) => s.slotType === selectedType && s.status === "AVAILABLE");
  // FIX: URL param was locking fare to initial rate — now always derives from selected type
  const hourlyRate = rateSlot?.hourlyRate || Number(sp.get("rate")) || 50;
  const subtotal = hourlyRate * hours;
  const total = Math.max(0, subtotal - discount);

  const availableTypes = [...new Set(slots.filter((s) => s.status === "AVAILABLE").map((s) => s.slotType))];

  const handleOpenPromos = async () => {
    if (promosOpen) { setPromosOpen(false); return; }
    setPromosOpen(true);
    if (eligiblePromos.length > 0) return; // already loaded
    setPromosLoading(true);
    try {
      const res = await axiosInstance.get("/api/promo/eligible", {
        params: { customerId: user?.id, amount: subtotal },
      });
      setEligiblePromos(res.data || []);
    } catch {
      setEligiblePromos([]);
    } finally {
      setPromosLoading(false);
    }
  };

  const handleQuickApply = (code) => {
    setPromo(code);
    setPromosOpen(false);
    setTimeout(() => handleValidatePromoCode(code), 100);
  };

  const handleValidatePromoCode = async (codeOverride) => {
    const code = (codeOverride || promoCode).trim();
    if (!code) return;
    setPL(true);
    setPromoMsg("");
    try {
      const res = await axiosInstance.get("/api/promo/validate", {
        params: { code, amount: subtotal, customerId: user?.id },
      });
      const disc = res.data?.discountAmount || 0;
      setDiscount(disc);
      setPromoMsg(`✓ Promo applied! You save ${formatCurrency(disc)}`);
    } catch (err) {
      setDiscount(0);
      // FIX: show the actual backend error message — it's specific ("already used",
      // "limit reached", "new users only", etc.) not a generic string
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid or expired promo code";
      setPromoMsg(`✗ ${backendMessage}`);
    } finally {
      setPL(false);
    }
  };

  const handleValidatePromo = () => handleValidatePromoCode(promoCode);

  const handleBook = async () => {
    if (!user?.id) return toast.error("Please log in first");
    if (availableTypes.length === 0) return toast.error("No available slots");

    setLoading(true);
    try {
      const payload = {
        customerId: user.id,
        parkingLotId: Number(lotId),
        slotType: selectedType,
        entryTime: entryTime.toISOString(),
        exitTime: exitTime.toISOString(),
        valetBooking: false,
        promoCode: promoCode.trim() || null,
      };
      const res = await axiosInstance.post("/api/bookings/reserve", payload);
      toast.success("Booking created! Proceed to payment.");
      navigate(`/customer/payment/PARKING_BOOKING/${res.data.id}`, {
        state: {
          serviceData: {
            referenceCode: res.data.bookingCode,
            amount:        res.data.totalAmount,
            label:         "Parking Slot",
            lines: [
              { key: "Lot",  value: res.data.parkingLotName },
              { key: "Slot", value: res.data.slotNumber },
            ],
          },
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} /> {lot?.name || "Back"}
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Book a Slot</h1>
        <p className="text-gray-500 text-sm mt-1">at {lot?.name}</p>
      </div>

      {/* Slot Type */}
      <div className="card space-y-3">
        <h2 className="section-title">Slot Type</h2>
        {availableTypes.length === 0 ? (
          <p className="text-sm text-red-500">No slots available at this lot right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableTypes.map((type) => {
              const info = SLOT_TYPE_INFO[type] || SLOT_TYPE_INFO.REGULAR;
              const Icon = info.icon;
              const count = slots.filter((s) => s.slotType === type && s.status === "AVAILABLE").length;
              // FIX: each card finds its OWN rate — previously all cards used selectedType's rate
              const cardRate = slots.find((s) => s.slotType === type && s.status === "AVAILABLE")?.hourlyRate || 0;
              const active = selectedType === type;
              return (
                <button key={type} onClick={() => setType(type)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${active ? `${info.border} ${info.bg}` : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={15} className={active ? info.color : "text-gray-400"} />
                    <span className={`text-sm font-semibold ${active ? info.color : "text-gray-700"}`}>{info.label}</span>
                  </div>
                  <div className="text-xs text-gray-500">{count} available</div>
                  <div className={`text-xs font-bold mt-1 ${active ? info.color : "text-gray-600"}`}>
                    {formatCurrency(cardRate)}/hr
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="card space-y-3">
        <h2 className="section-title">Duration</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setHours(Math.max(1, hours - 1))}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">−</button>
          <div className="flex-1 text-center">
            <span className="font-display text-3xl font-bold text-gray-900">{hours}</span>
            <span className="text-gray-500 text-sm ml-1">hour{hours > 1 ? "s" : ""}</span>
          </div>
          <button onClick={() => setHours(Math.min(24, hours + 1))}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50 transition-colors">+</button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
          <div><span className="font-medium text-gray-700">Entry:</span> {entryTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          <div><span className="font-medium text-gray-700">Exit:</span> {exitTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="card space-y-3">
        <h2 className="section-title flex items-center gap-2"><Tag size={15} /> Promo Code</h2>

        {/* Eligible promos accordion */}
        {user?.id && (
          <div>
            <button onClick={handleOpenPromos}
              className="flex items-center gap-2 text-xs text-purple-600 font-medium hover:text-purple-800 transition-colors mb-2">
              {promosOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {promosOpen ? "Hide" : "See"} available promos for you
            </button>

            {promosOpen && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-3">
                {promosLoading ? (
                  <p className="text-xs text-gray-400">Loading promos…</p>
                ) : eligiblePromos.length === 0 ? (
                  <p className="text-xs text-gray-400">No eligible promos right now.</p>
                ) : (
                  eligiblePromos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                      <div>
                        <p className="font-mono text-sm font-bold text-gray-900 tracking-wider">{p.code}</p>
                        <p className="text-xs text-gray-500">
                          {p.type === "PERCENTAGE" ? `${p.discountValue}% off` : `₹${p.discountValue} off`}
                          {p.minBookingAmount ? ` · Min ₹${p.minBookingAmount}` : ""}
                          {p.newUsersOnly ? " · New users only" : ""}
                        </p>
                      </div>
                      <button onClick={() => handleQuickApply(p.code)}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                        Apply
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual code entry */}
        <div className="flex gap-2">
          <input
            value={promoCode}
            onChange={(e) => {
              setPromo(e.target.value.toUpperCase());
              if (promoMsg) { setPromoMsg(""); setDiscount(0); }
            }}
            placeholder="Enter code e.g. FIRST50"
            className="input flex-1 uppercase tracking-widest text-sm"
          />
          <button onClick={handleValidatePromo} disabled={promoLoading || !promoCode}
            className="btn-secondary px-4 text-sm disabled:opacity-50">
            {promoLoading
              ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : "Apply"}
          </button>
        </div>

        {/* FIX: shows actual backend error, not hardcoded "Invalid or expired" */}
        {promoMsg && (
          <p className={`text-xs font-medium ${promoMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
            {promoMsg}
          </p>
        )}
      </div>

      {/* Fare Summary */}
      <div className="card space-y-3">
        <h2 className="section-title">Fare Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{formatCurrency(hourlyRate)} × {hours} hr{hours > 1 ? "s" : ""}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo discount</span>
              <span>−{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
            <span>Total</span>
            <span className="text-sp-blue">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Confirm */}
      <button onClick={handleBook} disabled={loading || availableTypes.length === 0}
        className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2">
        {loading
          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><CheckCircle size={17} /> Confirm Booking — {formatCurrency(total)}</>}
      </button>
    </div>
  );
};

export default BookSlotPage;