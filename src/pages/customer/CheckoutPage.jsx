import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";
import { ChevronLeft, KeyRound, CheckCircle, Clock } from "lucide-react";

const CheckoutPage = () => {
  const navigate=useNavigate(); const {bookingId}=useParams();
  const [code,setCode]=useState(""); const [result,setResult]=useState(null); const [loading,setL]=useState(false);

  useEffect(()=>{
    if(!bookingId)return;
    axiosInstance.get(`/api/bookings/${bookingId}`)
      .then(r=>{ if(r.data?.bookingCode)setCode(r.data.bookingCode); })
      .catch(()=>{});
  },[bookingId]);

  const handleCheckout=async()=>{
    if(!code.trim())return toast.error("Enter your booking code");
    setL(true);
    try{
      const res=await axiosInstance.post("/api/bookings/checkout",null,{params:{code:code.trim().toUpperCase()}});
      setResult(res.data);
      toast.success("Checkout successful!");
    }catch(err){ toast.error(err.response?.data?.message||"Checkout failed. Check your code."); }
    finally{ setL(false); }
  };

  if(result)return(
    <div className="page-container max-w-md space-y-6">
      <div className="card text-center py-10 space-y-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-500"/>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Checkout Complete</h2>
          <p className="text-gray-500 text-sm mt-1">Thank you for parking with us!</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Lot</span><span className="font-semibold">{result.parkingLotName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Slot</span><span className="font-semibold">{result.slotNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Code</span><span className="font-mono font-semibold">{result.bookingCode}</span></div>
          <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-base">
            <span>Total Paid</span>
            <span className="text-sp-blue">{formatCurrency(result.totalAmount)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {/* FIX: null guard — only show Rate button if parkingLotId is present */}
          {result.parkingLotId && (
            <button onClick={()=>navigate(`/customer/feedback/lot/${result.parkingLotId}`)} className="btn-secondary flex-1 text-sm">
              Rate this lot
            </button>
          )}
          <button onClick={()=>navigate("/customer/dashboard")} className="btn-primary flex-1 text-sm">Done</button>
        </div>
      </div>
    </div>
  );

  return(
    <div className="page-container max-w-md space-y-6">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16}/> Back
      </button>
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-500 text-sm mt-1">Enter your booking code to check out</p>
      </div>
      <div className="card space-y-5">
        <div className="space-y-1.5">
          <label className="label">Booking Code</label>
          <div className="relative">
            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
              placeholder="BK-XXXXXXXX" className="input pl-10 font-mono tracking-widest text-sm uppercase"
              onKeyDown={e=>e.key==="Enter"&&handleCheckout()}/>
          </div>
          <p className="text-xs text-gray-400">Find this code in your booking confirmation or My Bookings page.</p>
        </div>
        <button onClick={handleCheckout} disabled={loading||!code.trim()}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2">
          {loading?<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><Clock size={16}/> Complete Checkout</>}
        </button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
        <p className="font-semibold">How checkout works</p>
        <p>1. Enter your booking code from your confirmation.</p>
        <p>2. The system calculates your final fare based on actual exit time.</p>
        <p>3. Your slot is released back to available instantly.</p>
      </div>
    </div>
  );
};
export default CheckoutPage;