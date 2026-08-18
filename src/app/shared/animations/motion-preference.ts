export const MOBILE_MOTION_QUERY = '(max-width: 767px)';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Decorative motion is desktop-only, while accessibility preferences win everywhere. */
export function shouldDisableMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;

  return (
    window.matchMedia(MOBILE_MOTION_QUERY).matches ||
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}
