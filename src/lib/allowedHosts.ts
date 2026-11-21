/**
 * Sites that upload links may point to (#26).
 * The form shows this list, and the server checks it again before saving.
 * To allow another site, add its exact hostname here.
 */
export const ALLOWED_HOSTS = [
  'drive.google.com',
  'docs.google.com', // Google Docs, Slides and Sheets all use this host
  'github.com',
];

/** The same list in words, for the form's help text. */
export const ALLOWED_SITES_TEXT = 'Google Drive, Google Docs or Slides, or GitHub';

/**
 * True only for an https link whose host is exactly one of ALLOWED_HOSTS (#26).
 * The link is parsed with new URL() and the hostname compared as a whole, never searched as text:
 * "https://drive.google.com.evil.example" contains the right words but its host is evil.example.
 */
export function isAllowedLink(link: string): boolean {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') {
    return false;
  }
  return ALLOWED_HOSTS.includes(url.hostname.toLowerCase());
}
