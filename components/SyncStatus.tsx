'use client';

import { SyncStatus as SyncStatusType } from '@/lib/types';
import { useEffect, useState } from 'react';

interface SyncStatusProps {
  status: SyncStatusType;
}

export function SyncStatus({ status }: SyncStatusProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show/hide logic: Show when syncing or error, auto-hide after sync
  useEffect(() => {
    if (status.isSyncing || status.error) {
      setIsVisible(true);
    } else if (status.lastSyncTime) {
      // Auto-hide after 2 seconds when synced successfully
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {status.isSyncing && (
        <>
          <div className="w-3 h-3 border-2 border-cube-yellow border-t-transparent rounded-full animate-spin" />
          <span className="text-cube-cement">Syncing...</span>
        </>
      )}

      {!status.isSyncing && !status.error && status.lastSyncTime && (
        <>
          <svg
            className="w-3 h-3 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-cube-cement">Synced</span>
        </>
      )}

      {status.error && (
        <>
          <svg
            className="w-3 h-3 text-cube-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-cube-red" title={status.error}>
            {status.error}
          </span>
        </>
      )}
    </div>
  );
}
