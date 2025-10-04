# 🚀 FIREBASE QUICK SETUP - DO THIS NOW!

## Step 1: Create Firebase Project (5 minutes)
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Name it: "loveworld-singers-app"
4. Disable Google Analytics (for now)
5. Click "Create project"

## Step 2: Enable Services (2 minutes)
1. Click "Authentication" → "Get started"
2. Enable "Email/Password" provider
3. Click "Firestore Database" → "Create database"
4. Choose "Start in test mode" (we'll secure later)
5. Select location: "us-central1"

## Step 3: Get Your Config (1 minute)
1. Click Settings (gear icon) → "Project settings"
2. Scroll down to "Your apps" → Click "</>" (Web)
3. Register app name: "LoveWorld Singers PWA"
4. Copy the config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 4: For Audio/Images - Use Cloudinary (FREE)
Since Firebase Storage has limits, use Cloudinary:
1. Go to https://cloudinary.com/
2. Sign up for FREE account
3. Get 25GB storage + 25GB bandwidth FREE
4. Copy your credentials

## That's it! You're ready!

