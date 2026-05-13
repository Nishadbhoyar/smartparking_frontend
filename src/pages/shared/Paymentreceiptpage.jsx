import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { formatCurrency } from "../../utils/formatters";
import { CheckCircle, XCircle, Clock, ChevronLeft, Loader, CreditCard, Download } from "lucide-react";

const formatDateTime = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const PaymentReceiptPage = () => {
  const { bookingId } = useParams();
  const navigate      = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!bookingId) return;
    axiosInstance.get("/api/payments/receipt", { params: { bookingId } })
      .then((r) => setReceipt(r.data))
      .catch(() => setError("Could not load receipt. Please try again."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="page-container max-w-md flex items-center justify-center py-24">
        <Loader size={28} className="text-sp-blue animate-spin" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="page-container max-w-md space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="card text-center py-16">
          <XCircle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-gray-500 text-sm">{error || "Receipt not found."}</p>
        </div>
      </div>
    );
  }

  const isPaid     = receipt.paymentStatus === "SUCCESS";
  const isFailed   = receipt.paymentStatus === "FAILED";
  const isPending  = receipt.paymentStatus === "INITIATED";
  const isRefunded = receipt.paymentStatus === "REFUNDED";

  // Status banner config
  const banner = isPaid
    ? { bg: "bg-green-50",  border: "border-green-200", icon: <CheckCircle size={28} className="text-green-500" />, title: "Payment Confirmed",  subtitle: "Your parking slot is booked." }
    : isFailed
    ? { bg: "bg-red-50",    border: "border-red-200",   icon: <XCircle     size={28} className="text-red-500" />,   title: "Payment Failed",     subtitle: receipt.failureReason || "Payment was not completed." }
    : isPending
    ? { bg: "bg-amber-50",  border: "border-amber-200", icon: <Clock       size={28} className="text-amber-500" />, title: "Payment Pending",    subtitle: "Waiting for bank confirmation." }
    : isRefunded
    ? { bg: "bg-blue-50",   border: "border-blue-200",  icon: <CreditCard  size={28} className="text-blue-500" />,  title: "Payment Refunded",   subtitle: "Amount has been refunded." }
    : { bg: "bg-gray-50",   border: "border-gray-200",  icon: <Clock       size={28} className="text-gray-400" />,  title: receipt.paymentStatus, subtitle: "" };

  return (
    <div className="page-container max-w-md space-y-5">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl font-bold text-gray-900">Booking Receipt</h1>

      {/* Status Banner */}
      <div className={`${banner.bg} border ${banner.border} rounded-2xl p-5 flex items-center gap-4`}>
        {banner.icon}
        <div>
          <p className="font-bold text-gray-900">{banner.title}</p>
          <p className="text-sm text-gray-600 mt-0.5">{banner.subtitle}</p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="card space-y-3">
        <h2 className="section-title">Booking Details</h2>
        <Row label="Booking Code"  value={<span className="font-mono font-bold">{receipt.bookingCode}</span>} />
        <Row label="Customer"      value={receipt.customerName} />
        <Row label="Parking Lot"   value={receipt.parkingLotName} />
        <Row label="Slot"          value={receipt.slotNumber} />
        <Row label="Entry Time"    value={formatDateTime(receipt.scheduledEntryTime)} />
        <Row label="Exit Time"     value={formatDateTime(receipt.scheduledExitTime)} />
        <Row label="Booking Status" value={
          <span className={`badge text-xs ${
            receipt.bookingStatus === "PAID"      ? "bg-blue-100 text-blue-700"   :
            receipt.bookingStatus === "ACTIVE"    ? "bg-green-100 text-green-700" :
            receipt.bookingStatus === "COMPLETED" ? "bg-gray-100 text-gray-600"   :
            receipt.bookingStatus === "CANCELLED" ? "bg-red-100 text-red-600"     :
            "bg-yellow-100 text-yellow-700"
          }`}>{receipt.bookingStatus}</span>
        } />
      </div>

      {/* Payment Details */}
      <div className="card space-y-3">
        <h2 className="section-title">Payment Details</h2>
        <Row label="Order ID"       value={<span className="font-mono text-xs">{receipt.cashfreeOrderId}</span>} />
        {receipt.cashfreePaymentId && (
          <Row label="Transaction ID" value={<span className="font-mono text-xs">{receipt.cashfreePaymentId}</span>} />
        )}
        <Row label="Payment Status" value={
          <span className={`badge text-xs ${
            isPaid     ? "bg-green-100 text-green-700" :
            isFailed   ? "bg-red-100 text-red-600"     :
            isPending  ? "bg-amber-100 text-amber-700"  :
            isRefunded ? "bg-blue-100 text-blue-700"    :
            "bg-gray-100 text-gray-600"
          }`}>{receipt.paymentStatus}</span>
        } />
        {receipt.paymentMethod && (
          <Row label="Paid via" value={<span className="capitalize">{receipt.paymentMethod}</span>} />
        )}
        {receipt.failureReason && (
          <Row label="Failure Reason" value={<span className="text-red-600 text-xs">{receipt.failureReason}</span>} />
        )}
        <Row label="Initiated At"   value={formatDateTime(receipt.paymentInitiatedAt)} />
        {receipt.paymentCompletedAt && (
          <Row label="Completed At" value={formatDateTime(receipt.paymentCompletedAt)} />
        )}

        {/* Amount — bold, prominent */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 font-bold text-base">
          <span className="text-gray-900">Amount</span>
          <span className={isPaid ? "text-green-600" : isFailed ? "text-red-500" : "text-gray-900"}>
            {formatCurrency(receipt.amountPaid)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/customer/bookings")}
          className="btn-secondary flex-1 text-sm"
        >
          My Bookings
        </button>
        <button
          onClick={() => window.print()}
          className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
        >
          <Download size={14} /> Save / Print
        </button>
      </div>

    </div>
  );
};

// Small helper to keep rows DRY
const Row = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm gap-3">
    <span className="text-gray-500 flex-shrink-0">{label}</span>
    <span className="font-semibold text-gray-900 text-right">{value}</span>
  </div>
);

export default PaymentReceiptPage;