const DEFAULT_PORT = 3000;
const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_RESEND_FROM = 'Verso <onboarding@resend.dev>';
const DEFAULT_APP_URL = 'http://localhost:5173';
const DEFAULT_PASSWORD_RESET_TTL_MINUTES = 60;

function requiredString(env: Record<string, unknown>, key: string): string {
  const value = env[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
}

function optionalStringFromEnv(
  env: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = env[key];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function positiveIntegerFromEnv(
  env: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const raw = env[key];

  if (raw === undefined || raw === '') {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${key} must be a positive integer`);
  }

  return value;
}

export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
  const nodeEnv = typeof env.NODE_ENV === 'string' ? env.NODE_ENV : 'development';

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, test, production');
  }

  const port = Number(env.PORT ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const jwtSecret = requiredString(env, 'JWT_SECRET');

  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long`,
    );
  }

  return {
    ...env,
    NODE_ENV: nodeEnv,
    PORT: port,
    API_PREFIX: typeof env.API_PREFIX === 'string' ? env.API_PREFIX : 'api',
    CORS_ORIGIN: typeof env.CORS_ORIGIN === 'string' ? env.CORS_ORIGIN : 'http://localhost:5173',
    DATABASE_URL: requiredString(env, 'DATABASE_URL'),
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN:
      typeof env.JWT_EXPIRES_IN === 'string' ? env.JWT_EXPIRES_IN : '7d',
    RESEND_API_KEY: optionalStringFromEnv(env, 'RESEND_API_KEY', ''),
    RESEND_FROM_EMAIL: optionalStringFromEnv(
      env,
      'RESEND_FROM_EMAIL',
      DEFAULT_RESEND_FROM,
    ),
    APP_URL: optionalStringFromEnv(env, 'APP_URL', DEFAULT_APP_URL),
    PASSWORD_RESET_TOKEN_TTL_MINUTES: positiveIntegerFromEnv(
      env,
      'PASSWORD_RESET_TOKEN_TTL_MINUTES',
      DEFAULT_PASSWORD_RESET_TTL_MINUTES,
    ),
  };
}
