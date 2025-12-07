'use client';

import { useState } from 'react';
import { SignInButton } from './Auth/SignInButton';
import { SyncStatus as SyncStatusComponent } from './SyncStatus';
import { SyncStatus } from '@/lib/types';

interface SettingsProps {
  inspectionEnabled: boolean;
  onToggleInspection: (enabled: boolean) => void;
  syncStatus?: SyncStatus;
}

export function Settings({ inspectionEnabled, onToggleInspection, syncStatus }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Settings button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-2 text-cube-cement hover:text-cube-yellow
          transition-colors duration-200
          group
        "
        aria-label="Settings"
      >
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Settings panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="
            absolute right-0 top-full mt-2 z-50
            w-72 p-4
            bg-cube-black border-2 border-cube-gray
            shadow-brutal animate-slide-down
          ">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-brutal text-sm tracking-[0.2em] text-cube-white">
                SETTINGS
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-cube-cement hover:text-cube-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-px bg-cube-gray mb-4" />

            {/* Inspection toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="font-mono text-sm text-cube-white block">
                  15s Inspection
                </label>
                <span className="font-mono text-xs text-cube-cement">
                  WCA-style countdown
                </span>
              </div>
              <button
                onClick={() => onToggleInspection(!inspectionEnabled)}
                className={`
                  relative w-12 h-6 rounded-none
                  border-2 transition-colors duration-200
                  ${inspectionEnabled
                    ? 'bg-cube-green border-cube-green'
                    : 'bg-cube-gray border-cube-gray'
                  }
                `}
                role="switch"
                aria-checked={inspectionEnabled}
              >
                <span
                  className={`
                    absolute top-0.5 w-4 h-4 bg-cube-black
                    transition-transform duration-200
                    ${inspectionEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                  `}
                />
              </button>
            </div>

            {inspectionEnabled && (
              <div className="mt-3 p-2 bg-cube-gray/30 border border-cube-gray">
                <p className="font-mono text-xs text-cube-cement">
                  Hold space → Release to start 15s inspection → Hold space again → Release to start timer
                </p>
              </div>
            )}

            <div className="h-px bg-cube-gray my-4" />

            {/* Account & Sync section */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs text-cube-cement tracking-wider">ACCOUNT & SYNC</h4>

              <SignInButton />

              {syncStatus && (
                <div className="mt-2">
                  <SyncStatusComponent status={syncStatus} />
                </div>
              )}

              {syncStatus?.lastSyncTime && (
                <p className="font-mono text-xs text-cube-cement">
                  Last synced: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
