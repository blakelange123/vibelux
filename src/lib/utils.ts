// Minimal utils for build testing
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}