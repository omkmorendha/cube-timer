import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserSolves,
  setUserSolves,
  getUserSettings,
  setUserSettings,
  getLastSync,
  isKVConfigured,
} from '@/lib/kv';
import { Solve, Settings } from '@/lib/types';

// Validation functions
function validateSolves(solves: unknown): solves is Solve[] {
  if (!Array.isArray(solves)) return false;
  return solves.every(
    (s) =>
      typeof s.id === 'string' &&
      typeof s.time === 'number' &&
      typeof s.scramble === 'string' &&
      typeof s.date === 'string' &&
      typeof s.dnf === 'boolean' &&
      typeof s.plusTwo === 'boolean'
  );
}

function validateSettings(settings: unknown): settings is Settings {
  if (typeof settings !== 'object' || settings === null) return false;
  const s = settings as Settings;
  return typeof s.inspectionEnabled === 'boolean' && typeof s.inspectionTime === 'number';
}

/**
 * GET /api/sync - Fetch user data from KV
 */
export async function GET(request: NextRequest) {
  try {
    // Check if KV is configured
    if (!isKVConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'KV storage not configured',
          solves: [],
          settings: null,
          lastSync: null,
        },
        { status: 200 }
      );
    }

    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch data from KV
    const [solves, settings, lastSync] = await Promise.all([
      getUserSolves(userId),
      getUserSettings(userId),
      getLastSync(userId),
    ]);

    return NextResponse.json({
      success: true,
      solves,
      settings,
      lastSync,
    });
  } catch (error) {
    console.error('Error in GET /api/sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data',
        solves: [],
        settings: null,
        lastSync: null,
      },
      { status: 200 }
    );
  }
}

/**
 * POST /api/sync - Save user data to KV
 */
export async function POST(request: NextRequest) {
  try {
    // Check if KV is configured
    if (!isKVConfigured()) {
      return NextResponse.json(
        { success: false, error: 'KV storage not configured' },
        { status: 200 }
      );
    }

    // Get user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { solves, settings } = body;

    // Validate data
    if (solves !== undefined && !validateSolves(solves)) {
      return NextResponse.json({ success: false, error: 'Invalid solves data' }, { status: 400 });
    }

    if (settings !== undefined && !validateSettings(settings)) {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Save to KV
    const savePromises: Promise<void>[] = [];

    if (solves !== undefined) {
      savePromises.push(setUserSolves(userId, solves));
    }

    if (settings !== undefined) {
      savePromises.push(setUserSettings(userId, settings));
    }

    await Promise.all(savePromises);

    // Get updated lastSync timestamp
    const lastSync = await getLastSync(userId);

    return NextResponse.json({
      success: true,
      lastSync,
    });
  } catch (error) {
    console.error('Error in POST /api/sync:', error);
    return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 200 });
  }
}
