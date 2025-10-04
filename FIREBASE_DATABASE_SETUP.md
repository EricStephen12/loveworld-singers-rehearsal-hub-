# 🔥 Firebase Database Setup - CHOOSE TEST MODE

## When Creating Firestore Database:

### ✅ SELECT THIS:
**"Start in test mode"** (Simple Querying)

```
✅ Start in test mode
   - Anyone with your database reference can read/write
   - Good for development
   - Expires after 30 days (we'll update before then)

❌ Start in production mode  
   - Locked by default
   - Need to write security rules first
   - Too complex for initial setup
```

## After Selecting Test Mode:

### 1. Choose Location:
- **us-central1** (if in USA)
- **europe-west1** (if in Europe)
- **asia-southeast1** (if in Asia/Africa)

### 2. Click "Enable"

## Security Rules (Auto-Generated):
```javascript
// Test mode rules (temporary - 30 days)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 1, 30);
    }
  }
}
```

## After Migration, Update to Production Rules:
```javascript
// Production rules (add after testing)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone authenticated can read praise nights
    match /praise_nights/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Anyone authenticated can read songs
    match /songs/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## Timeline:
1. **Now**: Use test mode for easy setup
2. **After Migration**: Test everything works
3. **Before 30 days**: Update to production rules
4. **Production**: Secure with proper rules

## That's it! Choose "Test Mode" and continue! 🚀

