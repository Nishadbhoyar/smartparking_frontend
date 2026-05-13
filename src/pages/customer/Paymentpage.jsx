import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Loader,
  CreditCard,
  ChevronLeft,
  RefreshCw,
  Phone,
  Clock,
  ShieldCheck,
  ArrowRight 
} from "lucide-react";

// ── Cashfree SDK ──────────────────────────────────────────────────────────────
const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE || "sandbox";

const loadCashfreeSDK = () =>
  new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () =>
      window.Cashfree ? resolve(window.Cashfree) : reject(new Error("Cashfree SDK failed to load"));
    script.onerror = () => reject(new Error("Cashfree SDK script error"));
    document.body.appendChild(script);
  });

// ── Service labels ────────────────────────────────────────────────────────────
const SERVICE_LABELS = {
  PARKING_BOOKING: "Parking Slot",
  CAR_RENTAL:      "Car Rental",
  VALET:           "Valet Service",
};

const SUCCESS_MESSAGES = {
  PARKING_BOOKING: "Your parking slot is confirmed.",
  CAR_RENTAL:      "Your car rental is confirmed.",
  VALET:           "Valet payment complete.",
};

// ── Component ─────────────────────────────────────────────────────────────────
const PaymentPage = () => {
  const { serviceType, referenceId } = useParams();
  const { state: routeState }        = useLocation();
  const navigate                     = useNavigate();
  const { user }                     = useAuth();

  const [serviceData,   setServiceData]   = useState(routeState?.serviceData ?? null);
  const [loadingData,   setLoadingData]   = useState(!routeState?.serviceData);

  const [phone,         setPhone]         = useState("");
  const [phoneError,    setPhoneError]    = useState("");
  
  // STAGES: enter_phone -> loading -> paying -> polling -> success | failed | pending (timeout)
  const [stage,         setStage]         = useState("enter_phone");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pollCount,     setPollCount]     = useState(0);
  const [sdkReady,      setSdkReady]      = useState(false);

  // ── Load service details if not passed via router state ───────────────────
  useEffect(() => {
    if (serviceData) return; 
    if (!serviceType || !referenceId || !user) return;

    const load = async () => {
      setLoadingData(true);
      try {
        let data;
        switch (serviceType) {
          case "PARKING_BOOKING": {
            const res = await axiosInstance.get(`/api/bookings/${referenceId}`);
            data = {
              referenceCode: res.data.bookingCode,
              amount:        res.data.totalAmount,
              label:         SERVICE_LABELS.PARKING_BOOKING,
              lines: [
                { key: "Location", value: res.data.parkingLotName },
                { key: "Slot",     value: res.data.slotNumber || "TBD" },
              ],
            };
            break;
          }
          case "CAR_RENTAL": {
            const res = await axiosInstance.get(`/api/rental-cars/customer/${user.id}/bookings`);
            const booking = (res.data || []).find((b) => String(b.id) === String(referenceId));
            if (!booking) throw new Error("Rental booking not found");
            data = {
              referenceCode: booking.bookingCode,
              amount:        booking.totalAmount,
              label:         SERVICE_LABELS.CAR_RENTAL,
              lines: [
                { key: "Vehicle", value: `${booking.carMake} ${booking.carModel}` },
                { key: "From",    value: new Date(booking.startTime).toLocaleDateString() },
                { key: "To",      value: new Date(booking.endTime).toLocaleDateString() },
              ],
            };
            break;
          }
          case "VALET": {
            const [reqRes, fareRes] = await Promise.all([
              axiosInstance.get(`/api/valet/request/${referenceId}`),
              axiosInstance.get(`/api/valet/fare/${referenceId}`),
            ]);
            data = {
              referenceCode: `VLT-${referenceId}`,
              amount:        fareRes.data.totalFare,
              label:         SERVICE_LABELS.VALET,
              lines: [
                { key: "License Plate", value: reqRes.data.carPlateNo },
                { key: "Base Fare",     value: formatCurrency(fareRes.data.baseFare) },
                { key: "Distance Fare", value: formatCurrency(fareRes.data.distanceFare) },
                fareRes.data.parkingFare > 0 ? { key: "Parking Fare", value: formatCurrency(fareRes.data.parkingFare) } : null,
                fareRes.data.surgeFare > 0 ? { key: "Surge Rate", value: formatCurrency(fareRes.data.surgeFare) } : null,
              ].filter(Boolean),
            };
            break;
          }
          default:
            throw new Error("Unknown service type: " + serviceType);
        }
        setServiceData(data);
      } catch (err) {
        toast.error("Could not load payment details. Please go back and try again.");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [serviceType, referenceId, user, serviceData]);

  // ── Preload Cashfree SDK ──────────────────────────────────────────────────
  useEffect(() => {
    loadCashfreeSDK()
      .then(() => setSdkReady(true))
      .catch(() => toast.error("Payment SDK failed to load. Refresh and try again."));
  }, []);

  // ── Phone validation ──────────────────────────────────────────────────────
  const validatePhone = (value) => {
    if (!value || value.trim().length !== 10 || !/^\d{10}$/.test(value.trim())) {
      setPhoneError("Enter a valid 10-digit mobile number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // ── Initiate payment ──────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!validatePhone(phone)) return;
    if (!sdkReady) return toast.error("Payment SDK still loading. Please wait.");

    setStage("loading");
    try {
      const { data } = await axiosInstance.post("/api/payments/initiate", {
        serviceType,
        referenceId: Number(referenceId),
        customerPhone: phone.trim(),
      });

      const { paymentSessionId } = data;
      if (!paymentSessionId) throw new Error("No session ID returned");

      setStage("paying");
      const cashfree = window.Cashfree({ mode: CASHFREE_MODE });
      
      const result = await cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" });

      if (result.error) {
        console.warn("Payment Modal Closed/Error:", result.error.message);
        setStage("failed");
        setPaymentStatus({ status: "USER_DROPPED", failureReason: result.error.message || "Payment window was closed or cancelled." });
      } else {
        // Modal closed successfully. Immediately trigger backend verification.
        console.log("Frontend success, forcing backend verification...");
        setStage("polling");
        verifyPaymentStatus();
      }
    } catch (err) {
      console.error("Payment error:", err);
      setStage("enter_phone");
      toast.error(err.response?.data?.message || "Payment could not be started. Try again.");
    }
  };

  // ── Immediate Backend Verification Loop ───────────────────────────────────
  const verifyPaymentStatus = useCallback(async () => {
    let currentAttempt = 0;
    const maxAttempts = 15; // e.g., 15 attempts * 2 seconds = 30 seconds

    while (currentAttempt < maxAttempts) {
      currentAttempt++;
      setPollCount(currentAttempt);
      
      try {
        const { data } = await axiosInstance.get("/api/payments/status", {
          params: { serviceType, referenceId },
        });
        
        setPaymentStatus(data);

        if (data.status === "SUCCESS") {
          setStage("success");
          toast.success("Payment successful!");
          return; // Exit loop on success
        } 
        
        if (data.status === "FAILED" || data.status === "USER_DROPPED") {
          setStage("failed");
          return; // Exit loop on failure
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }

      // If still PENDING/INITIATED, wait 2 seconds before trying again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // If loop exhausted and no final state reached
    setStage("pending");
  }, [serviceType, referenceId]);

  const handleRetry = () => {
    setStage("enter_phone");
    setPaymentStatus(null);
    setPollCount(0);
  };

  const handleDone = () => {
    if (serviceType === "VALET") navigate("/customer/dashboard");
    else navigate("/customer/bookings");
  };

  // ── 0. LOADING STATE ──────────────────────────────────────────────────────
  if (loadingData || !serviceData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#424754] border-t-[#adc6ff] rounded-full animate-spin" />
        <p className="text-[#c2c6d6] font-medium tracking-wide">Securing connection...</p>
      </div>
    );
  }

  // ── 1. SUCCESS STATE ──────────────────────────────────────────────────────
  if (stage === "success") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-[#191f2f]/80 backdrop-blur-xl border border-[#424754]/50 rounded-[2rem] w-full max-w-md text-center py-10 px-6 sm:px-10 shadow-2xl space-y-8">
          
          <div className="w-20 h-20 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(74,222,128,0.15)] relative">
            <CheckCircle size={40} className="text-[#4ade80] relative z-10" />
            <div className="absolute inset-0 rounded-full border-2 border-[#4ade80] animate-ping opacity-20"></div>
          </div>
          
          <div>
            <h2 className="text-3xl font-extrabold text-[#dce2f7] tracking-tight">Payment Successful</h2>
            <p className="text-[#c2c6d6] text-sm mt-2 font-medium">
              {SUCCESS_MESSAGES[serviceType] || "Your payment is confirmed."}
            </p>
          </div>

          <div className="bg-[#2e3545]/50 border border-[#424754]/30 rounded-2xl p-5 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-[#424754]/30">
              <span className="text-[#c2c6d6]">Reference Code</span>
              <span className="font-mono font-bold text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded uppercase tracking-widest">{serviceData.referenceCode}</span>
            </div>
            {serviceData.lines.map(({ key, value }) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-[#8c909f] font-medium">{key}</span>
                <span className="font-bold text-[#dce2f7]">{value}</span>
              </div>
            ))}
            {paymentStatus?.paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-[#8c909f] font-medium">Payment Method</span>
                <span className="font-bold text-[#dce2f7] capitalize">{paymentStatus.paymentMethod}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-[#424754]/30">
              <span className="font-bold text-[#dce2f7] text-base">Amount Paid</span>
              <span className="font-extrabold text-[#4ade80] text-lg">{formatCurrency(serviceData.amount)}</span>
            </div>
          </div>

          {/* ── UPDATED VIEW RECEIPT BUTTONS ── */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {serviceType !== "VALET" && (
              <button 
                onClick={() => navigate("/customer/bookings")} 
                className="flex-1 bg-[#2e3545] hover:bg-[#424754] text-[#dce2f7] font-bold py-3.5 rounded-xl transition-colors"
              >
                My Bookings
              </button>
            )}
            <button 
              onClick={() => navigate(`/customer/receipt/${referenceId}`)} 
              className="flex-1 bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(173,198,255,0.2)]"
            >
              View Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. FAILED OR CANCELLED STATE ──────────────────────────────────────────
  if (stage === "failed") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-[#191f2f]/80 backdrop-blur-xl border border-[#424754]/50 rounded-[2rem] w-full max-w-md text-center py-10 px-6 sm:px-10 shadow-2xl space-y-8">
          
          <div className="w-20 h-20 bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,180,171,0.15)] relative">
            <XCircle size={40} className="text-[#ffb4ab] relative z-10" />
            <div className="absolute inset-0 rounded-full border-2 border-[#ffb4ab] animate-ping opacity-20"></div>
          </div>
          
          <div>
            <h2 className="text-3xl font-extrabold text-[#dce2f7] tracking-tight">Payment Failed</h2>
            <p className="text-[#c2c6d6] text-sm mt-3 font-medium leading-relaxed">
              {paymentStatus?.status === "USER_DROPPED" 
                ? "The secure payment window was closed before completing the transaction." 
                : (paymentStatus?.failureReason || "We couldn't process your payment. Please check your bank or card details.")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={handleRetry} className="flex-1 bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(173,198,255,0.2)]">
              <RefreshCw size={16} /> Try Again
            </button>
            <button onClick={handleDone} className="flex-1 bg-[#2e3545] hover:bg-[#424754] text-[#dce2f7] font-bold py-3.5 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. PENDING STATE (Bank delay / Timeout) ───────────────────────────────
  if (stage === "pending") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-[#191f2f]/80 backdrop-blur-xl border border-[#424754]/50 rounded-[2rem] w-full max-w-md text-center py-10 px-6 sm:px-10 shadow-2xl space-y-8">
          
          <div className="w-20 h-20 bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(251,191,36,0.15)] relative">
            <Clock size={40} className="text-[#fbbf24] relative z-10" />
            <div className="absolute inset-0 rounded-full border-2 border-[#fbbf24] animate-ping opacity-20"></div>
          </div>
          
          <div>
            <h2 className="text-3xl font-extrabold text-[#dce2f7] tracking-tight">Payment Pending</h2>
            <p className="text-[#c2c6d6] text-sm mt-3 font-medium leading-relaxed">
              We are waiting for a secure confirmation from your bank. This can sometimes take a few minutes.
            </p>
          </div>
          
          <div className="bg-[#2e3545]/50 border border-[#424754]/30 rounded-2xl p-5 text-left text-sm text-[#8c909f] space-y-2">
             <p>• If money was deducted, it will be automatically updated or refunded within 24 hours.</p>
             <p>• You can safely leave this page and check your status in the Dashboard later.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
             <button onClick={() => { setStage("polling"); verifyPaymentStatus(); }} className="flex-1 bg-[#2e3545] hover:bg-[#424754] text-[#dce2f7] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
               <RefreshCw size={16} /> Check Again
             </button>
             <button onClick={handleDone} className="flex-1 bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(173,198,255,0.2)]">
               Dashboard
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 4. POLLING STATE (Actively Waiting) ───────────────────────────────────
  if (stage === "polling") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-[#191f2f]/80 backdrop-blur-xl border border-[#424754]/50 rounded-[2rem] w-full max-w-md text-center py-14 px-6 shadow-2xl space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#424754]"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-[#adc6ff] border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck size={28} className="text-[#adc6ff]" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#dce2f7] tracking-tight">Confirming Payment</h2>
            <p className="text-[#c2c6d6] text-sm mt-2 font-medium">
              Establishing secure handshake… ({pollCount * 2}s elapsed)
            </p>
          </div>
          <p className="text-[11px] text-[#8c909f] uppercase tracking-widest font-bold">Please do not close or refresh this page.</p>
        </div>
      </div>
    );
  }

  // ── 5. ENTER PHONE + SUMMARY (Default Checkout View) ──────────────────────
  return (
    <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8 font-sans pb-10">
      
      {/* Top Header / Back */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-[#191f2f]/60 border border-[#424754]/50 flex items-center justify-center text-[#c2c6d6] hover:text-[#dce2f7] hover:border-[#adc6ff]/50 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#dce2f7] tracking-tight">Checkout</h1>
        <p className="text-[#c2c6d6] font-medium text-sm">
          {serviceData.label} · Secured by Cashfree
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-[#191f2f]/60 backdrop-blur-xl border border-[#424754]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#adc6ff]/10 flex items-center justify-center text-[#adc6ff]">
            <CreditCard size={20} />
          </div>
          <h2 className="text-lg font-bold text-[#dce2f7]">Order Details</h2>
        </div>

        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-[#424754]/30">
            <span className="text-[#8c909f] font-medium">Reference Code</span>
            <span className="font-mono font-bold text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded tracking-widest uppercase">{serviceData.referenceCode}</span>
          </div>
          
          {serviceData.lines.map(({ key, value }) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-[#c2c6d6] font-medium">{key}</span>
              <span className="font-bold text-[#dce2f7] text-right max-w-[60%] truncate">{value}</span>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-4 border-t border-[#424754]/30">
            <span className="font-bold text-[#c2c6d6] text-base">Total Amount</span>
            <span className="text-2xl font-extrabold text-[#adc6ff] tracking-tight">
              {formatCurrency(serviceData.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Phone Number & Payment Action */}
      <div className="bg-[#191f2f]/60 backdrop-blur-xl border border-[#424754]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#dce2f7] mb-1">Billing Details</h2>
          <p className="text-[11px] text-[#8c909f] uppercase tracking-wider font-bold">Required for invoice</p>
        </div>

        <div className="space-y-2">
          <div className="relative group">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c909f] group-focus-within:text-[#adc6ff] transition-colors" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhone(v);
                if (phoneError) validatePhone(v);
              }}
              placeholder="10-digit mobile number"
              className={`w-full h-14 bg-[#0c1322] border ${phoneError ? 'border-[#ffb4ab]' : 'border-[#424754]'} rounded-xl pl-12 pr-4 text-[#dce2f7] font-mono tracking-widest focus:outline-none focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff] transition-all placeholder:text-[#424754] placeholder:tracking-normal placeholder:font-sans`}
              maxLength={10}
              onKeyDown={(e) => e.key === "Enter" && handlePay()}
            />
          </div>
          {phoneError && <p className="text-[11px] text-[#ffb4ab] font-bold flex items-center gap-1"><XCircle size={12} />{phoneError}</p>}
        </div>

        <button
          onClick={handlePay}
          disabled={stage === "loading" || !sdkReady}
          className="w-full bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#00285d] font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-[0_0_20px_rgba(173,198,255,0.15)] group"
        >
          {stage === "loading" ? (
            <span className="w-5 h-5 border-[3px] border-[#00285d]/30 border-t-[#00285d] rounded-full animate-spin" />
          ) : (
            <>
              Proceed to Pay {formatCurrency(serviceData.amount)}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {!sdkReady && (
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#8c909f] font-bold uppercase tracking-wider">
            <span className="w-3 h-3 border-2 border-[#8c909f]/30 border-t-[#8c909f] rounded-full animate-spin" />
            Initializing secure gateway
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/10 rounded-2xl p-5 flex gap-4">
        <ShieldCheck size={24} className="text-[#adc6ff] shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#dce2f7] mb-1">Guaranteed Safe Checkout</p>
          <p className="text-xs text-[#8c909f] leading-relaxed">
            All transactions are fully encrypted and processed through a PCI-DSS compliant payment gateway. We do not store your card details on our servers.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default PaymentPage;