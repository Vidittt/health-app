// Utilities for string transformations used across the app
export function cleansePatientName(name) {
  if (!name && name !== 0) return "";
  let s = String(name).trim();

  // Remove common title tokens anywhere in the string (case-insensitive), allow optional dot
  s = s.replace(/\b(?:mr|mrs|ms|miss|master|dr|prof|mx|sir|madam)\.?\b/ig, "");

  // Remove common trailing suffixes like Jr, Sr, II, III etc
  s = s.replace(/,?\s*(?:jr|sr|ii|iii|iv|v)\.?$/i, "");

  // Replace runs of dots/underscores/pipe/slashes/commas with a single space to separate initials
  s = s.replace(/[. _\/\\|,]+/g, " ");

  // Remove any characters that are not letters (basic Latin + Latin-1 Supplement), spaces, hyphen or apostrophe
  s = s.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s\-']/g, "");

  // Normalize whitespace
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return "";

  // Capitalize each name part, preserving hyphens and apostrophes correctly
  const capitalizePart = (part) => {
    const lower = part.toLowerCase();
    let out = '';
    for (let i = 0; i < lower.length; i++) {
      const ch = lower[i];
      if (i === 0 || lower[i - 1] === '-' || lower[i - 1] === "'") {
        out += ch.toUpperCase();
      } else {
        out += ch;
      }
    }
    return out;
  };

  const parts = s.split(' ').filter(Boolean).map((part) => capitalizePart(part));
  return parts.join(' ');
}

export function formatYAxisValue(val) {
  if (!Number.isFinite(val)) return String(val);
  // Use up to 2 decimal places but avoid showing unnecessary .00
  return Number(Math.round(val * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
