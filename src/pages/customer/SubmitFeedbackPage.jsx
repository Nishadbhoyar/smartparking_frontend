import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { Star, MessageSquare, ChevronLeft, Send } from "lucide-react";

const SubmitFeedbackPage = () => {
  const { type, id } = useParams(); // type = "valet" or "parking", id = booking ID
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // To display who/what they are rating
  const [targetName, setTargetName] = useState("Loading...");
  const [targetIds, setTargetIds] = useState({ valetId: null, parkingLotId: null });

  // Fetch the booking details to get the Valet ID or Parking Lot ID
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (type === "valet") {
          const res = await axiosInstance.get(`/api/valet/request/${id}`);
          setTargetName(res.data.valetName || "your Valet");
          setTargetIds({ valetId: res.data.valetId, parkingLotId: null });
        } else if (type === "parking") {
          const res = await axiosInstance.get(`/api/bookings/${id}`);
          setTargetName(res.data.parkingLotName || "the Parking Lot");
          setTargetIds({ valetId: null, parkingLotId: res.data.parkingLotId });
        }
      } catch (err) {
        toast.error("Failed to load booking details.");
      }
    };
    fetchDetails();
  }, [type, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating!");

    setSubmitting(true);

    // This matches your backend FeedbackRequestDTO exactly!
    const payload = {
      customerId: user.id,
      rating: rating,
      comment: comment,
      valetId: targetIds.valetId,
      parkingLotId: targetIds.parkingLotId
    };

    try {
      await axiosInstance.post("/api/feedback/submit", payload);
      toast.success("Thank you for your feedback!");
      navigate("/customer/bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-lg mx-auto py-10 space-y-6">
      
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          How was your experience?
        </h1>
        <p className="text-gray-500 text-sm">
          Please rate {targetName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        
        {/* Star Rating System */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={40}
                className={`transition-colors ${
                  (hoverRating || rating) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-gray-200"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Comment Box */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MessageSquare size={16} /> Additional Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved or what could be improved..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sp-blue focus:border-sp-blue resize-none h-32"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 h-12 text-base disabled:opacity-50"
        >
          {submitting ? "Submitting..." : (
            <>Submit Review <Send size={16} /></>
          )}
        </button>

      </form>
    </div>
  );
};

export default SubmitFeedbackPage;