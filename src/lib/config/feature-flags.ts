const parseBooleanFlag = (value: string | undefined, fallback: boolean): boolean => {
  if (typeof value === 'undefined') return fallback;
  return value === 'true' || value === '1';
};

export const FEATURE_FLAGS = {
  FEATURE_HEALTH_POLLING_V2: parseBooleanFlag(
    process.env.NEXT_PUBLIC_FEATURE_HEALTH_POLLING_V2,
    true
  ),
  FEATURE_AUTH_READINESS_GUARD: parseBooleanFlag(
    process.env.NEXT_PUBLIC_FEATURE_AUTH_READINESS_GUARD,
    true
  ),
  FEATURE_REFRESH_SINGLE_FLIGHT: parseBooleanFlag(
    process.env.NEXT_PUBLIC_FEATURE_REFRESH_SINGLE_FLIGHT,
    true
  ),
  FEATURE_ENROLL_STATE_SYNC: parseBooleanFlag(
    process.env.NEXT_PUBLIC_FEATURE_ENROLL_STATE_SYNC,
    true
  ),
  FEATURE_EMAIL_VERIFICATION_GATE: parseBooleanFlag(
    process.env.NEXT_PUBLIC_FEATURE_EMAIL_VERIFICATION_GATE,
    true
  ),
  FEATURE_AUTH_NOSTORE: parseBooleanFlag(
    process.env.NEXT_PUBLIC_FEATURE_AUTH_NOSTORE,
    true
  ),
  FEATURE_API_DEBUG_METRICS: parseBooleanFlag(
    process.env.NEXT_PUBLIC_FEATURE_API_DEBUG_METRICS,
    process.env.NODE_ENV === 'development'
  ),
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

