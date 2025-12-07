import { Redis } from '@upstash/redis';
import { Solve, Settings } from './types';

// Initialize Upstash Redis client
// Falls back to null if env vars not set or invalid (for local dev without KV)
function createKVClient() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // Check if credentials are configured and valid
  if (!url || !token || url.includes('your-') || token.includes('your-')) {
    console.warn('KV credentials not configured. Cloud sync will be disabled.');
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch (error) {
    console.error('Failed to initialize KV client:', error);
    return null;
  }
}

const kv = createKVClient();

// Key patterns for Redis
const keys = {
  solves: (userId: string) => `user:${userId}:solves`,
  settings: (userId: string) => `user:${userId}:settings`,
  lastSync: (userId: string) => `user:${userId}:lastSync`,
};

/**
 * Get user's solves from KV
 */
export async function getUserSolves(userId: string): Promise<Solve[]> {
  if (!kv) return [];

  try {
    const solves = await kv.get<Solve[]>(keys.solves(userId));
    return solves || [];
  } catch (error) {
    console.error('Error fetching solves from KV:', error);
    return [];
  }
}

/**
 * Save user's solves to KV
 */
export async function setUserSolves(userId: string, solves: Solve[]): Promise<void> {
  if (!kv) throw new Error('KV client not configured');

  try {
    await kv.set(keys.solves(userId), solves);
    await setLastSync(userId, new Date().toISOString());
  } catch (error) {
    console.error('Error saving solves to KV:', error);
    throw error;
  }
}

/**
 * Get user's settings from KV
 */
export async function getUserSettings(userId: string): Promise<Settings | null> {
  if (!kv) return null;

  try {
    const settings = await kv.get<Settings>(keys.settings(userId));
    return settings;
  } catch (error) {
    console.error('Error fetching settings from KV:', error);
    return null;
  }
}

/**
 * Save user's settings to KV
 */
export async function setUserSettings(userId: string, settings: Settings): Promise<void> {
  if (!kv) throw new Error('KV client not configured');

  try {
    await kv.set(keys.settings(userId), settings);
    await setLastSync(userId, new Date().toISOString());
  } catch (error) {
    console.error('Error saving settings to KV:', error);
    throw error;
  }
}

/**
 * Get last sync timestamp for user
 */
export async function getLastSync(userId: string): Promise<string | null> {
  if (!kv) return null;

  try {
    const lastSync = await kv.get<string>(keys.lastSync(userId));
    return lastSync;
  } catch (error) {
    console.error('Error fetching lastSync from KV:', error);
    return null;
  }
}

/**
 * Set last sync timestamp for user
 */
export async function setLastSync(userId: string, timestamp: string): Promise<void> {
  if (!kv) return;

  try {
    await kv.set(keys.lastSync(userId), timestamp);
  } catch (error) {
    console.error('Error setting lastSync in KV:', error);
  }
}

/**
 * Check if KV is configured and available
 */
export function isKVConfigured(): boolean {
  return kv !== null;
}
