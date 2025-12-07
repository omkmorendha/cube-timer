'use client';

import { Settings, SyncStatus } from '@/lib/types';
import { CubeTypeSelector } from './CubeTypeSelector';
import { ToggleSwitch } from './ToggleSwitch';
import { StatsVisibilityToggles } from './StatsVisibilityToggles';
import { SignInButton } from './Auth/SignInButton';
import { SyncStatus as SyncStatusComponent } from './SyncStatus';
import { ThemeToggle } from './ThemeToggle';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (partial: Partial<Settings>) => void;
  onClearSession: () => void;
  syncStatus?: SyncStatus;
}

export function SettingsPanel({
  settings,
  onUpdateSettings,
  onClearSession,
  syncStatus,
}: SettingsPanelProps) {
  // Safety check: ensure settings is defined
  if (!settings) {
    return null;
  }

  // Provide default values if visibleStats is undefined
  const visibleStats = settings.visibleStats || {
    best: true,
    worst: true,
    ao5: true,
    ao12: true,
    mean: true,
  };

  return (
    <div className="sticky top-4 space-y-6" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <header>
        <h2 className="font-brutal text-sm tracking-[0.3em] text-cube-white">
          SETTINGS
        </h2>
        <div className="h-px bg-cube-gray mt-2" />
      </header>

      {/* Section: Puzzle Type */}
      <section>
        <h3 className="font-mono text-xs text-cube-cement mb-3 tracking-wider">
          PUZZLE TYPE
        </h3>
        <CubeTypeSelector
          value={settings.cubeType}
          onChange={(type) => onUpdateSettings({ cubeType: type })}
        />
      </section>

      {/* Section: Timer Settings */}
      <section>
        <h3 className="font-mono text-xs text-cube-cement mb-3 tracking-wider">
          TIMER
        </h3>
        <div className="space-y-2">
          <ToggleSwitch
            label="15s Inspection"
            description="WCA-style countdown"
            checked={settings.inspectionEnabled}
            onChange={(val) => onUpdateSettings({ inspectionEnabled: val })}
          />
          <ToggleSwitch
            label="Millisecond Precision"
            description="Show full precision"
            checked={settings.showMilliseconds}
            onChange={(val) => onUpdateSettings({ showMilliseconds: val })}
          />
        </div>
        {settings.inspectionEnabled && (
          <div className="mt-3 p-2 bg-cube-gray/30 border border-cube-gray">
            <p className="font-mono text-xs text-cube-cement">
              Hold space → Release to start inspection → Hold space again → Release to start timer
            </p>
          </div>
        )}
      </section>

      {/* Section: Display Preferences */}
      <section>
        <h3 className="font-mono text-xs text-cube-cement mb-3 tracking-wider">
          DISPLAY
        </h3>
        <div className="space-y-4">
          <ThemeToggle
            theme={settings.theme || 'dark'}
            onChange={(theme) => onUpdateSettings({ theme })}
          />
          <div className="h-px bg-cube-gray my-3" />
          <StatsVisibilityToggles
            visible={visibleStats}
            onChange={(stats) => onUpdateSettings({ visibleStats: stats })}
          />
        </div>
      </section>

      {/* Section: Account & Sync */}
      <section>
        <h3 className="font-mono text-xs text-cube-cement mb-3 tracking-wider">
          ACCOUNT & SYNC
        </h3>
        <div className="space-y-3">
          <SignInButton />

          {syncStatus && (
            <div>
              <SyncStatusComponent status={syncStatus} />
            </div>
          )}

          {syncStatus?.lastSyncTime && (
            <p className="font-mono text-xs text-cube-cement">
              Last synced: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      </section>

      {/* Section: Session Management */}
      <section>
        <h3 className="font-mono text-xs text-cube-cement mb-3 tracking-wider">
          SESSION
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClearSession();
          }}
          className="w-full px-3 py-2 border-2 border-cube-red text-cube-red
                     font-brutal text-xs tracking-[0.2em]
                     hover:bg-cube-red hover:text-cube-black
                     transition-colors"
        >
          CLEAR ALL SOLVES
        </button>
      </section>
    </div>
  );
}
