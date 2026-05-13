import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "—";
  try { return format(new Date(date), "dd MMM yyyy, hh:mm a"); }
  catch { return "—"; }
};

export const timeAgo = (date) => {
  if (!date) return "—";
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return "—"; }
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(amount || 0);

export const statusColor = (status) => {
  const map = {
    ACTIVE:     "bg-green-100 text-green-700",
    COMPLETED:  "bg-blue-100 text-blue-700",
    PENDING:    "bg-yellow-100 text-yellow-700",
    CANCELLED:  "bg-red-100 text-red-700",
    AVAILABLE:  "bg-green-100 text-green-700",
    OCCUPIED:   "bg-red-100 text-red-700",
    RESERVED:   "bg-yellow-100 text-yellow-700",
    INACTIVE:   "bg-gray-100 text-gray-600",
    FULL:       "bg-red-100 text-red-700",
    ACCEPTED:   "bg-blue-100 text-blue-700",
    PICKED_UP:  "bg-purple-100 text-purple-700",
    PARKED:     "bg-teal-100 text-teal-700",
    RETURN_REQ: "bg-orange-100 text-orange-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};
