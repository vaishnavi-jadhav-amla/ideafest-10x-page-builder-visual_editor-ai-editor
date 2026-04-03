export function sanitizeAndNormalizeCss(css: string): string {
  if (!css) return "";

  try {
    let clean = css;

    // Remove escape sequences (\r, \n, \t etc.)
    clean = clean.replace(/\\r|\\n|\\t/g, " ");

    // Remove control characters (non-printable ASCII)
    // eslint-disable-next-line no-control-regex
    clean = clean.replace(/[\x00-\x1F\x7F]/g, " ");

    // Collapse multiple spaces/newlines into one
    clean = clean.replace(/\s+/g, " ");

    // Basic guard against <script> or html injection inside CSS
    clean = clean.replace(/<\/?script.*?>/gi, "");

    // Final trim
    return clean.trim();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("CSS sanitization failed:", e);
    return "";
  }
}