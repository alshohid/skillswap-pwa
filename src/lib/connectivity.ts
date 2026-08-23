'use client';

/**
 * Client-side connectivity state, richer than `navigator.onLine` alone.
 *
 * Three states (see OfflineBanner):
 *   - 'online'             browser online AND server reachable (or unknown-good)
 *   - 'browser-offline'    navigator.onLine === false
 *   - 'server-unreachable' browser claims online but the API host cannot be
 *                          reached (DNS down, server down, timeout…)
 *
 * Reachability is verified with a `mode: 'no-cors'` HEAD probe: any HTTP
 * response — even an opaque one blocked by CORS policy — proves the host is
 * reachable, while DNS/TCP failure or timeout proves it is not. This keeps
 * CORS configuration irrelevant to connectivity detection.
 */

export type ConnectivityState =
  | 'online'
  | 'browser-offline'
  | 'server-unreachable';

type Listener = (state: ConnectivityState) => void;

const listeners = new Set<Listener>();

let state: ConnectivityState =
  typeof navigator !== 'undefined' && !navigator.onLine
    ? 'browser-offline'
    : 'online';

let probeTimer: ReturnType<typeof setTimeout> | undefined;
let initialized = false;

export function getConnectivity(): ConnectivityState {
  return state;
}

/** Subscribe to connectivity changes; immediately invoked with current state. */
export function subscribeConnectivity(listener: Listener): () => void {
  listeners.add(listener);
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}

function setState(next: ConnectivityState): void {
  if (next === state) return;
  state = next;
  listeners.forEach((listener) => listener(state));
}

function clearProbe(): void {
  if (probeTimer !== undefined) {
    clearTimeout(probeTimer);
    probeTimer = undefined;
  }
}

function scheduleProbe(delayMs: number): void {
  if (probeTimer !== undefined) return;
  probeTimer = setTimeout(runProbe, delayMs);
}

async function runProbe(): Promise<void> {
  probeTimer = undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const base = (
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
    ).replace(/\/+$/, '');
    await fetch(base, {
      method: 'HEAD',
      mode: 'no-cors', // opaque response still proves the host answered
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    setState('online');
  } catch {
    clearTimeout(timeout);
    setState('server-unreachable');
    scheduleProbe(15_000); // keep re-checking every 15 s while unreachable
  }
}

/** Called by the RTK Query base query when a fetch fails at network level. */
export function reportApiFailure(): void {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    clearProbe();
    setState('browser-offline');
    return;
  }
  scheduleProbe(0);
}

/** Called by the RTK Query base query after any successful HTTP round-trip. */
export function reportApiSuccess(): void {
  clearProbe();
  setState(
    typeof navigator !== 'undefined' && !navigator.onLine
      ? 'browser-offline'
      : 'online',
  );
}

/** Idempotently wires browser online/offline events. Called from the banner. */
export function initConnectivity(): void {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  window.addEventListener('offline', () => {
    clearProbe();
    setState('browser-offline');
  });

  // Optimistically flip back online, then confirm with a probe; the banner
  // will re-appear within seconds if the network still isn't usable.
  window.addEventListener('online', () => {
    setState('online');
    scheduleProbe(0);
  });
}