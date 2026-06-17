import { Tags } from "exiftool-vendored";

/**
 * Strips whitespace chunks or trailing binary padding down to a single space
 */
export function cleanString(val: any): string {
  if (!val) return "";
  return String(val).replace(/\s+/g, " ").trim();
}

/**
 * Formats focal lengths into native or 35mm equivalents
 */
export function formatFocal(tags: Tags): string {
  const actual = tags.FocalLength ? parseFloat(tags.FocalLength.toString()) : 0;
  const equiv = tags.FocalLengthIn35mmFormat
    ? parseFloat(tags.FocalLengthIn35mmFormat.toString())
    : undefined;

  if (!actual) return "Unknown";
  if (equiv && equiv !== actual) {
    return `${actual} mm (equiv: ${equiv} mm)`;
  }
  return `${actual} mm`;
}

/**
 * Formats shutter speeds into fractions or full seconds
 */
export function formatShutter(tags: Tags): string {
  if (!tags.ExposureTime) return "Unknown";
  const exp =
    typeof tags.ExposureTime === "number"
      ? tags.ExposureTime
      : parseFloat(tags.ExposureTime.toString());
  return exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
}

/**
 * Formats exposure bias value with sign symbols
 */
export function formatBias(tags: Tags): string {
  const biasNum = parseFloat(
    String(tags.ExposureCompensation ?? (tags as any).ExposureBiasValue ?? 0),
  );
  if (biasNum === 0) return "0 EV";
  return biasNum > 0 ? `+${biasNum.toFixed(2)} EV` : `${biasNum.toFixed(2)} EV`;
}

/**
 * Translates standard ratings or Windows OS percent tags into a clean 0-5 metric
 */
export function extractRating(tags: Tags): number {
  const rRaw = tags.Rating ?? (tags as any)["RatingPercent"] ?? 0;
  if (rRaw >= 1 && rRaw <= 5) return rRaw;
  if (rRaw > 5) {
    if (rRaw >= 99) return 5;
    if (rRaw >= 75) return 4;
    if (rRaw >= 50) return 3;
    if (rRaw >= 25) return 2;
    return 1;
  }
  return 0;
}

/**
 * Safely normalizes EXIF time strings into a standard calendar layout
 * Rules: Matches "YYYY-MM-DD HH:MM:SS" on success, falls back to cleaned text on failure
 */
export function formatExifDate(rawDate: any): string {
  if (!rawDate) return "Unknown";

  // Convert to string and handle standard EXIF colon separators (e.g. "2023:01:26")
  // into standard ISO slashes so JavaScript's Date constructor reads it natively
  let dateString = String(rawDate).trim();

  // Quick pre-check: ExifTool often returns complex objects (like ExifDateTime).
  // If it has a rawValue, check that instead.
  if (rawDate.rawValue) {
    dateString = String(rawDate.rawValue).trim();
  }

  // Replace standard EXIF "YYYY:MM:DD" with "YYYY/MM/DD" for cross-browser Date parsing stability
  const normalizedString = dateString.replace(
    /^(\d{4}):(\d{2}):(\d{2})/,
    "$1/$2/$3",
  );

  // 1. Attempt to parse the content to a valid JavaScript Date object
  const parsedDate = new Date(normalizedString);

  if (!isNaN(parsedDate.getTime())) {
    // Zero-pad numbers to guarantee consistent structural layout widths
    const pad = (num: number) => String(num).padStart(2, "0");

    const year = parsedDate.getFullYear();
    const month = pad(parsedDate.getMonth() + 1);
    const day = pad(parsedDate.getDate());
    const hours = pad(parsedDate.getHours());
    const minutes = pad(parsedDate.getMinutes());
    const seconds = pad(parsedDate.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 2. If parsing fails, fall back to the cleaned raw string, handling 'T' and messy spaces
  // 2. If parsing fails, fall back to the cleaned raw string, safely handling ISO 'T' anchors
  return dateString
    .replace(/(\d)[tT](\d)/g, "$1 $2") // Only replace T when wedged exactly between two digits
    .replace(/\s+/g, " ") // Collapse multiple consecutive spaces down to one
    .trim(); // Trim leading and trailing spaces out completely
}
