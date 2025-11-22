# KingsChat Authentication Flow

## Simple Approach - No Forced Linking

### User Types
1. **Email/Password Users** - Keep their separate accounts (no forced linking)
2. **KingsChat Users** - Use KingsChat OAuth authentication
3. **Mixed Users** - Can have both types of accounts separately

### KingsChat Authentication Flow

#### 1. User Clicks "Continue with KingsChat"
- Opens KingsChat OAuth modal
- User authenticates with KingsChat
- System generates OTP code

#### 2. OTP Verification
- User enters 6-digit OTP code
- System verifies OTP and extracts KingsChat ID from saved auth data

#### 3. Account Check
```typescript
// Check for existing account with this KingsChat ID
const existingUser = await FirebaseDatabaseService.findUserByKingsChatId(kingschatUserId)

if (existingUser) {
  // Found existing account - sign them in
  // This includes temp email accounts (@kingschat.temp)
  signInExistingUser(existingUser, kingschatUserId)
} else {
  // New user - redirect to profile completion
  redirectToProfileCompletion(kingschatUserId, userProfile)
}
```

#### 4. Existing User Sign-In
- Uses existing email and password/KingsChat ID
- Handles temp email accounts automatically
- Sets authentication flags and redirects to home

#### 5. New User Flow
- Stores KingsChat data in localStorage
- Redirects to profile completion page
- User completes profile setup with real KingsChat data

### Key Benefits

✅ **No Forced Linking** - Users choose their preferred auth method
✅ **Backward Compatible** - Old accounts continue working
✅ **Automatic Detection** - Finds existing accounts by KingsChat ID
✅ **Handles Temp Accounts** - Seamlessly works with old temp email accounts
✅ **Simple UX** - Clear flow for both existing and new users

### Technical Implementation

#### Auth Page (`src/app/auth/page.tsx`)
- `handleKingsChatLoginSuccess()` - Main KingsChat auth handler
- `processCompletedAuth()` - Handles OTP verification results
- Both functions use same logic for account checking

#### KingsChat Modal (`src/components/KingsChatOAuthModal.tsx`)
- Handles OAuth flow and OTP verification
- Calls success handler with auth data

#### Auth Session Storage
- Saves KingsChat ID and user profile data
- Used for account lookup after OTP verification

### Database Queries

#### Finding Existing Users
```typescript
// Checks both kingschat_id and kingschatUserId fields
FirebaseDatabaseService.findUserByKingsChatId(kingschatUserId)
```

#### Temp Email Detection
```typescript
// Identifies old temp accounts
if (signInEmail.includes('@kingschat.temp')) {
  signInPassword = kingschatUserId
}
```

### User Experience

#### For Existing Users
1. Click "Continue with KingsChat"
2. Authenticate with KingsChat
3. Enter OTP code
4. **Automatically signed into existing account**
5. Redirected to home

#### For New Users
1. Click "Continue with KingsChat"
2. Authenticate with KingsChat
3. Enter OTP code
4. **Redirected to profile completion**
5. Complete profile with KingsChat data
6. Account created and signed in

### No Migration Prompts
- No automatic migration prompts
- No forced account linking
- Users can optionally link accounts manually in profile settings
- Clean, simple user experience

This approach respects user choice while providing seamless authentication for both existing and new users.