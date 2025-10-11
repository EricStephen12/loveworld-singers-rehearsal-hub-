# Offline Indicator Fix

## Changes Made

Updated `src/components/OfflineIndicator.tsx` to:

1. **When ONLINE**: Show "🌐 Online" for 3 seconds, then hide completely
2. **When OFFLINE**: Show "📴 Offline" and keep it visible until back online

## Code Changes

### Before:
- Always showed the indicator (Online or Offline)
- Never hid automatically

### After:
- Shows "Online" for 3 seconds when connection is restored, then hides
- Shows "Offline" permanently when no connection
- Returns `null` when online and notification timeout has passed

## File Modified
- `src/components/OfflineIndicator.tsx`

