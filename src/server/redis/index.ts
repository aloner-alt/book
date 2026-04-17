import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ─── Login attempt helpers ────────────────────────────────────────────────────

const ATTEMPTS_KEY = (login: string) => `login_attempts:${login}`;
const MAX_ATTEMPTS = 5;
const BLOCK_SECONDS = 900; // 15 minutes

export async function getLoginAttempts(login: string): Promise<number> {
  const val = await redis.get(ATTEMPTS_KEY(login));
  return val ? parseInt(val, 10) : 0;
}

export async function incrementLoginAttempts(login: string): Promise<number> {
  const key = ATTEMPTS_KEY(login);
  const attempts = await redis.incr(key);
  if (attempts === 1) {
    await redis.expire(key, BLOCK_SECONDS);
  }
  return attempts;
}

export async function resetLoginAttempts(login: string): Promise<void> {
  await redis.del(ATTEMPTS_KEY(login));
}

export async function isLoginBlocked(login: string): Promise<boolean> {
  const attempts = await getLoginAttempts(login);
  return attempts >= MAX_ATTEMPTS;
}

export async function getBlockTtl(login: string): Promise<number> {
  return redis.ttl(ATTEMPTS_KEY(login));
}
