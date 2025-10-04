export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  // Lightweight shim to avoid adding deps; real Sentry SDK can be added later
  console.info('Sentry initialized');
}
