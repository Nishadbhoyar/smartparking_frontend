/**
 * SlotGrid.jsx
 *
 * Used on: LotDetailsPage (Customer), SlotManagerPage (Lot Admin)
 *
 * Features:
 *  - Renders all slots in a visual grid by status
 *  - Subscribes to /topic/slots/:lotId via WebSocket
 *  - Updates individual slots in real-time without refetch
 *  - Color: green=AVAILABLE, red=OCCUPIED, yellow=RESERVED
 *  - Customer mode: click available slot to book
 *  - Admin mode: click to view/edit slot
 */

import React, { useState, useCallback } from "react"; // ✅ React added
import useSlotWebSocket from "../../hooks/useSlotWebSocket";
import { Zap, Car, Accessibility, ParkingSquare } from "lucide-react";

const SLOT_STATUS_STYLES = {
  AVAILABLE: {
    bg:    "bg-green-50 hover:bg-green-100 border-green-200",
    text:  "text-green-700",
    dot:   "bg-green-500",
    label: "Available",
  },
  OCCUPIED: {
    bg:    "bg-red-50 border-red-200 cursor-not-allowed opacity-70",
    text:  "text-red-700",
    dot:   "bg-red-500",
    label: "Occupied",
  },
  RESERVED: {
    bg:    "bg-yellow-50 border-yellow-200 cursor-not-allowed opacity-70",
    text:  "text-yellow-700",
    dot:   "bg-yellow-500",
    label: "Reserved",
  },
};

const SLOT_TYPE_ICON = {
  EV_CHARGING:   <Zap size={12} />,
  HEAVY_VEHICLE: <Car size={12} />,
  BIKE:          <Accessibility size={12} />,
  REGULAR:       <ParkingSquare size={12} />,
};

const SlotGrid = ({ lotId, initialSlots = [], mode = "customer", onSlotSelect }) => {
  const [slots, setSlots] = useState(initialSlots);

  // Real-time WebSocket updates
  const handleSlotUpdate = useCallback((message) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === message.slotId
          ? { ...slot, status: message.status }
          : slot
      )
    );
  }, []);

  useSlotWebSocket(lotId, handleSlotUpdate);

  const available = slots.filter((s) => s.status === "AVAILABLE").length;
  const occupied  = slots.filter((s) => s.status === "OCCUPIED").length;
  const reserved  = slots.filter((s) => s.status === "RESERVED").length;

  const handleSlotClick = (slot) => {
    if (mode === "customer" && slot.status !== "AVAILABLE") return;
    if (onSlotSelect) onSlotSelect(slot);
  };

  return (
    <div>
      {/* ── Legend & Stats ── */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Available <span className="font-semibold text-gray-900 ml-1">{available}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Occupied <span className="font-semibold text-gray-900 ml-1">{occupied}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
          Reserved <span className="font-semibold text-gray-900 ml-1">{reserved}</span>
        </div>
        <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Live updates
        </span>
      </div>

      {/* ── Slot Grid ── */}
      {slots.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No slots configured for this lot yet.
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {slots.map((slot) => {
            const style = SLOT_STATUS_STYLES[slot.status] || SLOT_STATUS_STYLES.AVAILABLE;
            const isClickable = mode === "customer"
              ? slot.status === "AVAILABLE"
              : true;

            return (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                disabled={mode === "customer" && slot.status !== "AVAILABLE"}
                className={`
                  relative flex flex-col items-center justify-center
                  aspect-square rounded-lg border text-xs font-medium
                  transition-all duration-200
                  ${style.bg} ${style.text}
                  ${isClickable ? "cursor-pointer hover:scale-105 hover:shadow-sm" : ""}
                `}
                title={`${slot.slotNumber} — ${style.label}`}
              >
                {/* Slot type icon */}
                {slot.slotType && slot.slotType !== "REGULAR" && (
                  <span className="absolute top-1 right-1 opacity-60">
                    {SLOT_TYPE_ICON[slot.slotType]}
                  </span>
                )}
                <span className="font-bold text-xs leading-tight">{slot.slotNumber}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${style.dot}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Type Legend ── */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
        {Object.entries(SLOT_TYPE_ICON).map(([type, icon]) => (
          <span key={type} className="flex items-center gap-1 text-xs text-gray-500">
            {icon} {type.replace("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SlotGrid;