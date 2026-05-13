/**
 * validators.js — Centralised input validation for SmartParking
 * Import what you need; each function returns { valid: boolean, message: string }
 */

// ─── Email ────────────────────────────────────────────────────────────────────
// Standard format check beyond the browser's built-in (catches edge cases)
export const validateEmail = (raw = "") => {
  const email = raw.trim().toLowerCase();
  if (!email) return { valid: false, message: "Email is required" };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return { valid: false, message: "Enter a valid email address" };
  return { valid: true, message: "" };
};

// ─── Password ─────────────────────────────────────────────────────────────────
// Min 8 chars · at least 1 uppercase · at least 1 number
export const validatePassword = (pw = "") => {
  if (!pw) return { valid: false, message: "Password is required" };
  if (pw.length < 8) return { valid: false, message: "Password must be at least 8 characters" };
  if (!/[A-Z]/.test(pw)) return { valid: false, message: "Password must contain at least one uppercase letter" };
  if (!/[0-9]/.test(pw)) return { valid: false, message: "Password must contain at least one number" };
  return { valid: true, message: "" };
};

// Password strength label (for UI hints, optional)
export const passwordStrength = (pw = "") => {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Weak",   color: "bg-red-400" };
  if (score === 3) return { label: "Fair",   color: "bg-yellow-400" };
  if (score === 4) return { label: "Good",   color: "bg-blue-400" };
  return              { label: "Strong", color: "bg-green-500" };
};

// ─── Indian Mobile Number ────────────────────────────────────────────────────
// Accepts: 9876543210  |  +919876543210  |  +91 98765 43210
// Rules: 10 digits after stripping country code; must start with 6-9
export const validatePhone = (raw = "") => {
  if (!raw.trim()) return { valid: false, message: "Phone number is required" };
  // Strip country code (+91 or 91), spaces, and dashes
  const digits = raw.replace(/[\s\-\(\)]/g, "").replace(/^(\+91|91)/, "");
  if (!/^\d{10}$/.test(digits)) return { valid: false, message: "Enter a valid 10-digit mobile number" };
  if (!/^[6-9]/.test(digits))   return { valid: false, message: "Mobile number must start with 6, 7, 8, or 9" };
  return { valid: true, message: "" };
};

// ─── Indian Vehicle Number Plate ─────────────────────────────────────────────
// Format: MH12AB1234  (spaces allowed between segments, e.g. MH 12 AB 1234)
// State (2L) · District (2D) · Series (1-3L) · Number (4D)
// Covers standard private + commercial plates
export const validateLicensePlate = (raw = "") => {
  if (!raw.trim()) return { valid: false, message: "License plate is required" };
  // Strip spaces and convert to uppercase
  const plate = raw.replace(/\s/g, "").toUpperCase();
  const re = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
  if (!re.test(plate)) return { valid: false, message: "Enter a valid plate (e.g. MH 12 AB 3456)" };
  return { valid: true, message: "" };
};