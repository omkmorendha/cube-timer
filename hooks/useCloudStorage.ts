'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { SyncStatus } from '@/lib/types';

interface UseCloudStorageOptions {
  syncInterval?: number; // milliseconds, default 30000 (30s)
  enableAutoSync?: boolean; // default true
}

type SetValue<T> = (value: T | ((prev: T) => T)) => void;
type ClearFn = () => void;

const DEFAULT_SYNC_INTERVAL = 30000; // 30 seconds
const SYNC_DEBOUNCE_DELAY = 2000; // 2 seconds after last change

/**
 * Cloud-synced storage hook that replaces useLocalStorage
 * Maintains localStorage as primary storage with background sync to Vercel KV
 */
export function useCloudStorage<T>(
  key: string,
  initialValue: T,
  options: UseCloudStorageOptions = {}
): [T, SetValue<T>, ClearFn, SyncStatus] {
  const { syncInterval = DEFAULT_SYNC_INTERVAL, enableAutoSync = true } = options;

  const { data: session, status: sessionStatus } = useSession();
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  // Sync to cloud (with retry logic)
  const syncToCloud = useCallback(
    async (data: T, isRetry = false) => {
      if (sessionStatus !== 'authenticated' || !session?.user?.id) {
        // Not authenticated, skip cloud sync
        return;
      }

      if (!navigator.onLine) {
        setSyncStatus((prev) => ({
          ...prev,
          error: 'Offline - data saved locally',
        }));
        return;
      }

      try {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

        const payload: Record<string, T> = {};
        if (key === 'cube-timer-solves') {
          payload.solves = data;
        } else if (key === 'cube-timer-settings') {
          payload.settings = data;
        }

        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
          setSyncStatus({
            isSyncing: false,
            lastSyncTime: Date.now(),
            error: null,
          });
          retryCountRef.current = 0; // Reset retry count on success
        } else {
          throw new Error(result.error || 'Sync failed');
        }
      } catch (error) {
        console.error('Error syncing to cloud:', error);

        // Retry logic with exponential backoff
        if (retryCountRef.current < MAX_RETRIES && !isRetry) {
          retryCountRef.current += 1;
          const backoffDelay = Math.min(2000 * Math.pow(2, retryCountRef.current - 1), 30000);

          setTimeout(() => {
            syncToCloud(data, true);
          }, backoffDelay);
        } else {
          setSyncStatus((prev) => ({
            ...prev,
            isSyncing: false,
            error: error instanceof Error ? error.message : 'Sync failed',
          }));
        }
      }
    },
    [session, sessionStatus, key]
  );

  // Fetch from cloud on mount (after localStorage is loaded)
  useEffect(() => {
    if (!isInitialized || sessionStatus !== 'authenticated') return;

    const fetchFromCloud = async () => {
      try {
        const response = await fetch('/api/sync');
        const result = await response.json();

        if (result.success) {
          let cloudData: T | null = null;

          if (key === 'cube-timer-solves' && result.solves) {
            cloudData = result.solves as T;
          } else if (key === 'cube-timer-settings' && result.settings) {
            cloudData = result.settings as T;
          }

          // If cloud has data, check if it's newer than local
          if (cloudData && result.lastSync) {
            const cloudSyncTime = new Date(result.lastSync).getTime();
            const localSyncTime = syncStatus.lastSyncTime || 0;

            if (cloudSyncTime > localSyncTime) {
              // Cloud is newer, update local
              setStoredValue(cloudData);
              window.localStorage.setItem(key, JSON.stringify(cloudData));
              setSyncStatus((prev) => ({
                ...prev,
                lastSyncTime: cloudSyncTime,
              }));
              console.log(`Synced ${key} from cloud (cloud was newer)`);
            } else {
              // Local is newer or same, upload to cloud
              syncToCloud(storedValue);
            }
          } else if (!cloudData && storedValue !== initialValue) {
            // No cloud data but we have local data - auto migration
            console.log(`Migrating ${key} to cloud (first sync)`);
            syncToCloud(storedValue);
          }
        }
      } catch (error) {
        console.error('Error fetching from cloud:', error);
      }
    };

    fetchFromCloud();
  }, [isInitialized, sessionStatus, key]);

  // Save to localStorage and schedule cloud sync
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Update state
        setStoredValue(valueToStore);

        // Save to localStorage immediately
        if (typeof window !== 'undefined' && isInitialized) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }

        // Debounce cloud sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
          syncToCloud(valueToStore);
        }, SYNC_DEBOUNCE_DELAY);
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [storedValue, isInitialized, key, syncToCloud]
  );

  // Clear function
  const clear: ClearFn = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }

    // Clear from cloud as well
    syncToCloud(initialValue);
  }, [key, initialValue, syncToCloud]);

  // Periodic background sync
  useEffect(() => {
    if (!enableAutoSync || sessionStatus !== 'authenticated') return;

    intervalRef.current = setInterval(() => {
      syncToCloud(storedValue);
    }, syncInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableAutoSync, sessionStatus, storedValue, syncInterval, syncToCloud]);

  // Sync on page visibility change (tab focus)
  useEffect(() => {
    if (!enableAutoSync) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionStatus === 'authenticated') {
        syncToCloud(storedValue);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableAutoSync, sessionStatus, storedValue, syncToCloud]);

  // Sync before unload
  useEffect(() => {
    if (!enableAutoSync) return;

    const handleBeforeUnload = () => {
      if (sessionStatus === 'authenticated') {
        // Use navigator.sendBeacon for sync on unload (non-blocking)
        const payload: Record<string, T> = {};
        if (key === 'cube-timer-solves') {
          payload.solves = storedValue;
        } else if (key === 'cube-timer-settings') {
          payload.settings = storedValue;
        }

        navigator.sendBeacon('/api/sync', JSON.stringify(payload));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enableAutoSync, sessionStatus, key, storedValue]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, error: null }));
      // Retry sync when coming back online
      syncToCloud(storedValue);
    };

    const handleOffline = () => {
      setSyncStatus((prev) => ({
        ...prev,
        error: 'Offline - data saved locally',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [storedValue, syncToCloud]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return [storedValue, setValue, clear, syncStatus];
}
