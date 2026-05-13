import { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  ImageOff,
  Loader2,
  ZoomIn,
  X,
  Upload,
  Trash2,
  Camera,
  ImagePlus,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * CarImageManager
 *
 * Handles full car image lifecycle:
 *  - Fetches image IDs from GET /api/rental-cars/{carId}/images
 *  - Loads each image as a blob (requires auth header — same pattern as ValetCarImages)
 *  - Uploads new images via POST /api/rental-cars/{carId}/images  (multipart, field: "image")
 *  - Deletes images via DELETE /api/rental-cars/images/{imageId}
 *
 * Props:
 *   carId      — ID of the car
 *   readOnly   — if true, hides upload/delete controls (for browse view)
 *   className  — optional wrapper class
 */
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES    = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES       = 6;

const CarImageManager = ({ carId, readOnly = false, className = "" }) => {
  const [imageIds,  setImageIds]  = useState([]);
  const [blobUrls,  setBlobUrls]  = useState({}); // { [imageId]: "loading" | "error" | blobUrl }
  const [lightbox,  setLightbox]  = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(null); // imageId being deleted

  const revokeQueue = useRef([]);
  const fileInputRef = useRef(null);

  // ── Fetch image IDs ──────────────────────────────────────────────────────
  const fetchIds = useCallback(async () => {
    if (!carId) return;
    try {
      const { data } = await axiosInstance.get(`/api/rental-cars/${carId}/images`);
      // API returns array of IDs: [1, 2, 3]
      setImageIds(Array.isArray(data) ? data : []);
    } catch {
      setImageIds([]);
    }
  }, [carId]);

  useEffect(() => { fetchIds(); }, [fetchIds]);

  // ── Fetch each image blob ─────────────────────────────────────────────────
  useEffect(() => {
    if (imageIds.length === 0) return;

    // Mark new IDs as loading
    setBlobUrls((prev) => {
      const next = { ...prev };
      imageIds.forEach((id) => { if (!next[id]) next[id] = "loading"; });
      return next;
    });

    imageIds.forEach(async (id) => {
      // Skip already loaded
      if (blobUrls[id] && blobUrls[id] !== "loading") return;
      try {
        const res = await axiosInstance.get(`/api/rental-cars/images/${id}`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(res.data);
        revokeQueue.current.push(url);
        setBlobUrls((prev) => ({ ...prev, [id]: url }));
      } catch {
        setBlobUrls((prev) => ({ ...prev, [id]: "error" }));
      }
    });

    return () => {
      revokeQueue.current.forEach((u) => URL.revokeObjectURL(u));
      revokeQueue.current = [];
    };
  }, [imageIds]); // eslint-disable-line

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (imageIds.length + files.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} images per car. You can add ${MAX_IMAGES - imageIds.length} more.`);
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG or WebP allowed`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name}: file too large (max ${MAX_FILE_SIZE_MB}MB)`);
        continue;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        await axiosInstance.post(`/api/rental-cars/${carId}/images`, formData);
        // Re-fetch IDs after each successful upload
        await fetchIds();
        toast.success("Image uploaded!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    }

    // Reset input so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    setDeleting(imageId);
    try {
      await axiosInstance.delete(`/api/rental-cars/images/${imageId}`);
      // Revoke the blob URL for this image
      if (blobUrls[imageId]) URL.revokeObjectURL(blobUrls[imageId]);
      setBlobUrls((prev) => { const n = { ...prev }; delete n[imageId]; return n; });
      setImageIds((prev) => prev.filter((id) => id !== imageId));
      toast.success("Image deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (dt?.files?.length) {
      // Simulate file input change
      const fakeEvent = { target: { files: dt.files } };
      handleFileChange(fakeEvent);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const canUpload = !readOnly && imageIds.length < MAX_IMAGES;

  return (
    <div className={className}>

      {/* Image Grid */}
      {imageIds.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {imageIds.map((id) => {
            const url = blobUrls[id];
            return (
              <div key={id} className="relative aspect-square group">
                {/* Loading */}
                {(!url || url === "loading") && (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  </div>
                )}

                {/* Error */}
                {url === "error" && (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                    <ImageOff size={18} className="text-gray-400" />
                  </div>
                )}

                {/* Image */}
                {url && url !== "loading" && url !== "error" && (
                  <>
                    <button
                      onClick={() => setLightbox(id)}
                      className="w-full h-full rounded-xl overflow-hidden block focus:outline-none"
                    >
                      <img
                        src={url}
                        alt="Car"
                        className="w-full h-full object-cover"
                      />
                      {/* Zoom overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn size={16} className="text-white" />
                      </div>
                    </button>

                    {/* Delete button — only in edit mode */}
                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(id)}
                        disabled={deleting === id}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                      >
                        {deleting === id
                          ? <Loader2 size={11} className="animate-spin text-white" />
                          : <Trash2 size={11} className="text-white" />
                        }
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Inline "add more" tile (when there's space) */}
          {canUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-sp-blue/50 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-sp-blue"
            >
              {uploading
                ? <Loader2 size={16} className="animate-spin" />
                : <ImagePlus size={16} />
              }
              <span className="text-[10px] font-medium">Add</span>
            </button>
          )}
        </div>
      ) : (
        /* Empty state / drop zone */
        !readOnly && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-3
              ${dragOver
                ? "border-sp-blue bg-blue-50 scale-[1.01]"
                : "border-gray-200 hover:border-sp-blue/50 hover:bg-gray-50"
              }
            `}
          >
            <Camera size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-500">
              {uploading ? "Uploading…" : "Drop images here or click to upload"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or WebP · Max {MAX_FILE_SIZE_MB}MB · Up to {MAX_IMAGES} photos
            </p>
          </div>
        )
      )}

      {/* Upload button (when images already exist) */}
      {canUpload && imageIds.length > 0 && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full text-xs text-sp-blue border border-sp-blue/20 rounded-xl py-2 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {uploading
            ? <><Loader2 size={12} className="animate-spin" /> Uploading…</>
            : <><Upload size={12} /> Upload Photos ({imageIds.length}/{MAX_IMAGES})</>
          }
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Lightbox */}
      {lightbox !== null && blobUrls[lightbox] && blobUrls[lightbox] !== "error" && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={blobUrls[lightbox]}
            alt="Car full view"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Delete from lightbox */}
          {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(null); handleDelete(lightbox); }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} /> Delete this photo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CarImageManager;