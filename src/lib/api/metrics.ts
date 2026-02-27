import { FEATURE_FLAGS } from '@/lib/config/feature-flags';

type RefreshReason = 'bootstrap' | 'response_401';

interface MetricsWindow {
  startedAt: number;
  totalRequests: number;
  healthRequests: number;
  unauthorizedResponses: number;
  refreshAttempts: number;
  refreshFailures: number;
  refreshByReason: Record<RefreshReason, number>;
}

const ONE_MINUTE_MS = 60_000;
const shouldCollect = () =>
  typeof window !== 'undefined' && FEATURE_FLAGS.FEATURE_API_DEBUG_METRICS;

let reporterStarted = false;
let state: MetricsWindow = createWindow();

function createWindow(): MetricsWindow {
  return {
    startedAt: Date.now(),
    totalRequests: 0,
    healthRequests: 0,
    unauthorizedResponses: 0,
    refreshAttempts: 0,
    refreshFailures: 0,
    refreshByReason: {
      bootstrap: 0,
      response_401: 0,
    },
  };
}

function resetWindow(nextWindow: MetricsWindow) {
  state = nextWindow;
  if (typeof window !== 'undefined') {
    (window as Window & { __studentApiMetrics?: MetricsWindow }).__studentApiMetrics = state;
  }
}

function summarizeAndRotateWindow() {
  if (!shouldCollect()) return;

  const elapsedMs = Math.max(1, Date.now() - state.startedAt);
  const elapsedMinutes = elapsedMs / ONE_MINUTE_MS;
  const healthPerMinute = state.healthRequests / elapsedMinutes;
  const unauthorizedPerThousand =
    state.totalRequests > 0 ? (state.unauthorizedResponses / state.totalRequests) * 1000 : 0;

  console.info('[Student API Metrics]', {
    windowSeconds: Math.round(elapsedMs / 1000),
    requests: state.totalRequests,
    healthRequests: state.healthRequests,
    healthPerMinute: Number(healthPerMinute.toFixed(2)),
    unauthorizedResponses: state.unauthorizedResponses,
    unauthorizedPerThousandRequests: Number(unauthorizedPerThousand.toFixed(2)),
    refreshAttempts: state.refreshAttempts,
    refreshFailures: state.refreshFailures,
    refreshByReason: state.refreshByReason,
  });

  resetWindow(createWindow());
}

export const apiMetrics = {
  startReporter() {
    if (!shouldCollect() || reporterStarted) return;
    reporterStarted = true;

    setInterval(() => summarizeAndRotateWindow(), ONE_MINUTE_MS);
    resetWindow(state);
  },

  trackRequest(url?: string) {
    if (!shouldCollect()) return;
    state.totalRequests += 1;

    if (url?.includes('/health')) {
      state.healthRequests += 1;
    }
  },

  trackResponseStatus(status?: number) {
    if (!shouldCollect()) return;
    if (status === 401) {
      state.unauthorizedResponses += 1;
    }
  },

  trackRefreshAttempt(reason: RefreshReason) {
    if (!shouldCollect()) return;
    state.refreshAttempts += 1;
    state.refreshByReason[reason] += 1;
  },

  trackRefreshFailure() {
    if (!shouldCollect()) return;
    state.refreshFailures += 1;
  },

  flushWindowNow() {
    summarizeAndRotateWindow();
  },
};
