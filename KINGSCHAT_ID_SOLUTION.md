# KingsChat OAuth Modal Solution

## The Problem

When using React Native WebView to house the web app, KingsChat OAuth redirects open in the system browser instead of staying within the WebView, breaking the user experience and preventing users from returning to the app after authentication.

## The Solution - In-App OAuth Modal

Instead of external redirects, we've implemented a modal-based OAuth flow that keeps everything within the web app (and thus within your React Native WebView).

### Key Features:
- **Modal-based OAuth**: Authentication happens in a modal window within your app
- **No external browser**: Everything stays within your React Native WebView
- **PostMessage communication**: Secure communication between OAuth iframe and parent window
- **Seamless UX**: Users never leave your app during authentication
- **Fallback support**: Still works in regular web browsers

## Implementation Details

### 1. **KingsChat OAuth Modal** (`/src/components/KingsChatOAuthModal.tsx`)
A modal component that handles KingsChat OAuth flow within an iframe.

**Features:**
- Opens KingsChat OAuth in an iframe within a modal
- Uses postMessage for secure communication
- Handles success/error states with proper UI feedback
- Automatically processes authorization codes
- Exchanges codes for access tokens via API routes

### 2. **OAuth API Routes**
Server-side API routes to handle OAuth token exchange and profile fetching.

**Routes:**
- `/api/auth/kingschat/token` - Exchanges authorization code for access token
- `/api/auth/kingschat/profile` - Fetches user profile using access token

### 3. **OAuth Callback Page** (`/auth/kingschat/callback`)
A dedicated callback page that receives OAuth redirects and communicates with the parent modal.

**Features:**
- Receives OAuth authorization codes or errors
- Sends results to parent window via postMessage
- Provides user-friendly success/error UI
- Handles edge cases and error scenarios

## How It Works

### In React Native WebView:
1. User opens your React Native app
2. App loads the web app in a WebView
3. User clicks "Continue with KingsChat" on login page
4. **Modal opens within the WebView** (no external browser!)
5. User authenticates with KingsChat in the modal iframe
6. OAuth callback sends results via postMessage
7. Modal processes authentication and closes
8. User is logged in seamlessly within your app

### OAuth Flow Details:
1. **Modal Opens**: KingsChat OAuth URL loads in iframe within modal
2. **User Authenticates**: User logs in to KingsChat within the iframe
3. **Callback Received**: KingsChat redirects to `/auth/kingschat/callback`
4. **PostMessage Communication**: Callback page sends auth code to parent modal
5. **Token Exchange**: Modal calls API to exchange code for access token
6. **Profile Fetch**: API fetches user profile from KingsChat
7. **Account Linking**: System finds or creates user account
8. **Success**: User is logged in and modal closes

### For React Native WebView:
- **No external browser jumps** - everything stays in your app
- **Seamless user experience** - users never leave your WebView
- **Reliable authentication** - no deep link complications
- **Works offline-capable** - can be cached like the rest of your app

## Files Modified/Created

### Created:
- `src/app/pages/add-kingschat-id/page.tsx` - Dedicated page for adding KingsChat ID

### Modified:
- `src/app/home/page.tsx` - Added banner component for old users
- `src/app/pages/profile/page.tsx` - Removed complex linking UI, kept simple status display
- `src/app/auth/page.tsx` - Fixed syntax error in KingsChat login flow

## User Communication

### Announcement Message (for in-app notification):
```
🎉 New Feature: KingsChat Login!

You can now sign in faster using your KingsChat account. 

To enable this feature, please add your KingsChat ID to your profile:
1. Go to Home
2. Click "Add KingsChat ID" on the banner
3. Enter your KingsChat ID
4. Done! You can now use KingsChat login

This is a one-time setup for existing users.
```

### Email Template (optional):
```
Subject: New Feature: Sign in with KingsChat

Hi [Name],

We've added a new way to sign in to LoveWorld Singers Rehearsal Hub - using your KingsChat account!

To enable this feature, simply:
1. Log in to the app
2. Look for the purple banner on your home page
3. Click "Add KingsChat ID"
4. Enter your KingsChat ID
5. You're all set!

This is a one-time setup. Once done, you can use "Continue with KingsChat" on the login page.

Questions? Contact support through the app.

Blessings,
LWSRH Team
```

## Benefits

✅ **Simple**: One-time setup, easy to understand
✅ **Non-intrusive**: Banner can be dismissed if user doesn't want to add it now
✅ **Secure**: Validates KingsChat ID isn't already used
✅ **Flexible**: Users can add it anytime, no pressure
✅ **Future-proof**: New users automatically get it during signup

## Technical Notes

- KingsChat ID is stored in `profiles` collection under `kingschat_id` field
- Banner dismissal is stored in localStorage as `kingschatBannerDismissed`
- The `findUserByKingsChatId()` function in `FirebaseDatabaseService` is used to search for users
- No changes needed to existing authentication flow - it's purely additive
