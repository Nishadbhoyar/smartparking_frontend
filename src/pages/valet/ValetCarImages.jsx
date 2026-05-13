import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";
import { ImageOff, Loader2, ZoomIn, X } from "lucide-react";

/**
 * ValetCarImages
 *
 * Why this component exists:
 * GET /api/valet/images/{id} requires a valid JWT in the Authorization header.
 * A plain <img src="/api/valet/images/101" /> doesn't send headers, so the
 * server returns 403. This component fetches each image via axiosInstance
 * (which automatically attaches the Bearer token), converts the binary response
 * to a local blob URL, and renders it.  Blob URLs are revoked on unmount to
 * avoid memory leaks.
 *
 * Props:
 *   imageIds  — array of image IDs returned in carImageIds from the API
 *   className — optional extra class on the container
 */
const ValetCarImages = ({ imageIds, className = "" }) => {
  // blobUrls: { [imageId]: string | "error" | "loading" }
  const [blobUrls, setBlobUrls]   = useState({});
  const [lightbox, setLightbox]   = useState(null); // imageId currently in full-screen
  const revokeQueue               = useRef([]);      // track URLs to revoke on unmount

  useEffect(() => {
    if (!imageIds || imageIds.length === 0) return;

    // Mark all as loading immediately so UI shows spinners
    setBlobUrls((prev) => {
      const next = { ...prev };
      imageIds.forEach((id) => { if (!next[id]) next[id] = "loading"; });
      return next;
    });

    // Fetch each image independently — one failure doesn't block the others
    imageIds.forEach(async (id) => {
      try {
        const res = await axiosInstance.get(`/api/valet/images/${id}`, {
          responseType: "blob", // tells axios to return raw binary, not JSON
        });
        const url = URL.createObjectURL(res.data);
        revokeQueue.current.push(url); // remember to clean up later
        setBlobUrls((prev) => ({ ...prev, [id]: url }));
      } catch {
        setBlobUrls((prev) => ({ ...prev, [id]: "error" }));
      }
    });

    // Cleanup: revoke all blob URLs when component unmounts or imageIds change
    return () => {
      revokeQueue.current.forEach((url) => URL.revokeObjectURL(url));
      revokeQueue.current = [];
    };
  }, [JSON.stringify(imageIds)]); // only re-run if the list of IDs actually changes

  if (!imageIds || imageIds.length === 0) return null;

  return (
    <>
      {/* Image grid */}
      <div className={`grid grid-cols-3 gap-2 ${className}`}>
        {imageIds.map((id) => {
          const url = blobUrls[id];

          if (!url || url === "loading") {
            return (
              <div key={id}
                className="aspect-square bg-white/10 rounded-xl flex items-center justify-center">
                <Loader2 size={18} className="animate-spin text-gray-400" />
              </div>
            );
          }

          if (url === "error") {
            return (
              <div key={id}
                className="aspect-square bg-white/10 rounded-xl flex items-center justify-center">
                <ImageOff size={18} className="text-gray-500" />
              </div>
            );
          }

          return (
            <button key={id} onClick={() => setLightbox(id)}
              className="aspect-square rounded-xl overflow-hidden relative group focus:outline-none">
              <img src={url} alt="Parked car"
                className="w-full h-full object-cover" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn size={18} className="text-white" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox — full-screen view of a single image */}
      {lightbox !== null && blobUrls[lightbox] && blobUrls[lightbox] !== "error" && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20
              rounded-full p-2 transition-colors"
            onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <img
            src={blobUrls[lightbox]}
            alt="Parked car full view"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()} // don't close when clicking the image itself
          />
        </div>
      )}
    </>
  );
};

export default ValetCarImages;