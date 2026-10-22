// Minimal className merge helper (no external dependency needed).
export function twMerge(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
