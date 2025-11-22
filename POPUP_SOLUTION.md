# KingsChat OAuth Popup Solution

## The Problem
You were trying to use an iframe to house the KingsChat OAuth flow, but iframes have security restrictions (X-Frame-Options, CSP) that prevent external sites like KingsChat from being embedded.

## The Solution - Popup Window

Instead of an iframe, we use a **popup window** which:
- ✅ Avoids iframe security restrictions
- ✅ Keeps users in your app context (they see your app in the background)
- ✅ Works in React Native WebView (popup opens within the WebView)
- ✅ Uses postMessage for secure communication
- ✅ Automatically closes after authentication

## How It Works

### 1. User clicks "Continue with KingsChat"
```javascript
// Opens a centered popup window
const popup = window.open(
  kingsChatAuthUrl,
  'KingsChat Login',
  'width=500,height=600,left=...,top=...'
)
```

### 2. User authenticates in the popup
- Popup shows KingsChat login page
- User enters credentials
- KingsChat redirects to your callback URL

### 3. Callback page communicates back
```javascript
// In callback page
window.opener.postMessage({
  type: 'KINGSCHAT_AUTH_SUCCESS',
  code: authorizationCode
}, window.location.origin)

window.close() // Auto-close popup
```

### 4. Main page receives the message
```javascript
// Listen for message from popup
window.addEventListener('message', (event) => {
  if (event.data.type === 'KINGSCHAT_AUTH_SUCCESS') {
    // Exchange code for token
    // Sign in user
    // Close popup
  }
})
```

## Files Created/Modified

### Created:
- `src/app/auth/kingschat/callback/page.tsx` - Callback page that receives OAuth redirect and sends message to opener

### Modified:
- `src/app/auth/page.tsx` - Changed from iframe modal to popup window approach

## Benefits for React Native WebView

When your web app runs in a React Native WebView:
- Popup opens **within the WebView** (not in external browser)
- User never leaves your app
- Seamless authentication experience
- No deep linking complications

## Testing

1. **In Browser**: Popup opens as a separate window
2. **In WebView**: Popup opens within the WebView container
3. **Popup Blocked**: Shows error message asking user to allow popups

## Security

- postMessage only accepts messages from same origin
- Authorization code is exchanged server-side
- Popup auto-closes after success/error
- No sensitive data stored in localStorage during OAuth flow
