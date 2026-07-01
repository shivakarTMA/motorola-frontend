/**
 * Input restriction helpers
 * --------------------------------------------------------------
 * Two helpers per input type:
 *  - `blockXxxKeys`   -> use on `onKeyDown` to stop disallowed
 *                        characters from being typed at all
 *  - `sanitizeXxx`    -> use on `onChange` to strip out any
 *                        disallowed characters from pasted /
 *                        autofilled / IME input that bypasses
 *                        onKeyDown
 *
 * Always wire BOTH for a field — onKeyDown alone won't catch
 * paste events, and onChange alone allows a flash of the bad
 * character before it's stripped.
 *
 * Usage:
 *   <input
 *     onKeyDown={blockOnlyTextKeys}
 *     onChange={(e) => formik.setFieldValue("name", sanitizeOnlyText(e.target.value))}
 *   />
 */

const NAV_KEYS = [
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
];

const isNavOrShortcutKey = (e) => {
  if (NAV_KEYS.includes(e.key)) return true;
  // Allow copy/paste/cut/select-all/undo
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())) {
    return true;
  }
  return false;
};

/* ----------------------------- Only Text ----------------------------- */
// Letters + spaces only (e.g. Name, Title where numbers make no sense)

export const blockOnlyTextKeys = (e) => {
  if (isNavOrShortcutKey(e)) return;
  if (!/^[a-zA-Z\s]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeOnlyText = (value) => {
  if (!value) return "";
  return value.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " ");
};

/* ---------------------------- Only Numeric ---------------------------- */
// Digits only, no decimal point, no leading zeros, no minus sign
// (e.g. Position, Quantity, OTP)

export const blockOnlyNumericKeys = (e) => {
  if (isNavOrShortcutKey(e)) return;
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeOnlyNumeric = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

// Strict positive integer (no leading zeros, e.g. "0", "00" not allowed)
export const sanitizePositiveInteger = (value) => {
  if (!value) return "";
  const digitsOnly = value.replace(/\D/g, "");
  const noLeadingZeros = digitsOnly.replace(/^0+(?=\d)/, "");
  return noLeadingZeros;
};

// Block "-", "+", "e", "E", "." which the native number input still allows
export const blockInvalidNumberKeys = (e) => {
  if (["-", "+", "e", "E", "."].includes(e.key)) {
    e.preventDefault();
  }
};

/* ------------------------- Text with Numeric ------------------------- */
// Letters, numbers, and spaces (e.g. Title fields that may include
// model numbers, version tags, etc — no special characters)

export const blockTextWithNumberKeys = (e) => {
  if (isNavOrShortcutKey(e)) return;
  if (!/^[a-zA-Z0-9\s]$/.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeTextWithNumbers = (value) => {
  if (!value) return "";
  return value.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s{2,}/g, " ");
};

// kept for backwards-compat with existing imports elsewhere in the codebase
export const blockNonLettersAndNumbers = blockTextWithNumberKeys;

/* ------------------- Text + Number + Special Characters ------------------- */
// Letters, digits, spaces, and a SAFE allow-listed set of punctuation —
// for fields like Address, Company Name, Tagline, Designation, where users
// legitimately need things like apostrophes, hyphens, ampersands, slashes.
//
// Deliberately EXCLUDED (VAPT / XSS-relevant): < > " ` = ; \ { } $
// These are the characters that let an input value break out of an HTML
// attribute/tag context, form a script-ish payload, or close/open markup.
// If a use case genuinely needs one of these characters, don't loosen this
// helper — add a dedicated, narrowly-scoped helper instead so the blast
// radius of "what's now allowed" stays obvious and auditable.
//
// Allowed special characters: . , - _ ' & ( ) / # @ : ! ? +
const SAFE_SPECIAL_CHARS = `.,\\-_'&()/#@:!?+`;
const TEXT_NUMBER_SPECIAL_REGEX = new RegExp(`^[a-zA-Z0-9\\s${SAFE_SPECIAL_CHARS}]$`);
const TEXT_NUMBER_SPECIAL_STRIP_REGEX = new RegExp(`[^a-zA-Z0-9\\s${SAFE_SPECIAL_CHARS}]`, "g");

export const blockTextNumberSpecialKeys = (e) => {
  if (isNavOrShortcutKey(e)) return;
  if (e.key.length === 1 && !TEXT_NUMBER_SPECIAL_REGEX.test(e.key)) {
    e.preventDefault();
  }
};

export const sanitizeTextNumberSpecial = (value) => {
  if (!value) return "";
  return value
    .replace(TEXT_NUMBER_SPECIAL_STRIP_REGEX, "")
    .replace(/\s{2,}/g, " ");
};

/* --------------------------- Free text (XSS-safe) ----------------------------- */
// For genuinely free-text fields (Bio, Description, Notes, Comments) where
// users need punctuation but must NOT be able to inject markup or scripts.
//
// Strategy (defense in depth, all 3 steps run every time):
//   1. Strip <script>...</script> and <style>...</style> blocks entirely
//      (including their content — a tag-only strip would leave the JS/CSS
//      text behind as visible text, which is fine but this is cleaner)
//   2. Strip ALL remaining HTML tags (<div>, <img onerror=...>, etc.)
//   3. Strip dangerous URL schemes / inline event handlers that can
//      survive as plain text and get reinterpreted if the value is later
//      dropped into an href/src or an HTML sink (javascript:, data:text/html,
//      vbscript:, on<word>=)
//
// IMPORTANT: this is a client-side UX guard only. It stops accidental/lazy
// payloads and improves the typing experience, but it is NOT a substitute
// for server-side sanitization — a user can always bypass client JS
// entirely (disable JS, edit the request in devtools, hit the API
// directly with curl/Postman). The backend MUST re-sanitize/validate
// (e.g. DOMPurify on the server, or an allow-list sanitizer like
// `sanitize-html`) and the render layer MUST escape on output
// (React does this by default via JSX — never use dangerouslySetInnerHTML
// on user-supplied content without sanitizing it first).

const SCRIPT_OR_STYLE_BLOCK = /<(script|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi;
const ANY_HTML_TAG = /<\/?[^>]+(>|$)/g;
const DANGEROUS_URL_SCHEME = /\b(javascript|vbscript|data):/gi;
const INLINE_EVENT_HANDLER = /\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

export const stripHtmlTags = (value) => {
  if (!value) return "";
  return value
    .replace(SCRIPT_OR_STYLE_BLOCK, "")
    .replace(ANY_HTML_TAG, "");
};

export const sanitizeFreeText = (value) => {
  if (!value) return "";
  return value
    .replace(SCRIPT_OR_STYLE_BLOCK, "")
    .replace(ANY_HTML_TAG, "")
    .replace(INLINE_EVENT_HANDLER, "")
    .replace(DANGEROUS_URL_SCHEME, "");
};

// Use when you need to safely DISPLAY untrusted text inside HTML you build
// yourself (e.g. string-templated markup, dangerouslySetInnerHTML, PDF/CSV
// export, server-rendered email templates). Not needed for normal JSX
// text content — React already escapes that automatically.
export const escapeHtml = (value) => {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};