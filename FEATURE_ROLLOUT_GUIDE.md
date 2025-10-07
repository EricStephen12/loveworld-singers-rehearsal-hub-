# Feature Rollout System - Like Instagram PWA

This system handles feature updates and cache invalidation just like Instagram and other major PWAs.

## How It Works

### 1. **Automatic Feature Detection**
- Checks for new features every 2 minutes
- Automatically clears relevant caches when new features are detected
- Shows update notifications to users

### 2. **Gradual Rollout**
- Control which users see new features (like Instagram's A/B testing)
- Rollout percentage control (0-100%)
- Consistent user experience (same user always sees same features)

### 3. **Smart Cache Management**
- Only clears caches related to changed features
- Preserves user data and preferences
- Automatic service worker cache invalidation

## Adding New Features

### Step 1: Update Version
In `src/utils/feature-update-manager.ts`:

```typescript
private readonly CURRENT_VERSION: AppVersion = {
  version: '3.2.0', // ← Increment this
  buildTime: new Date().toISOString(),
  features: [
    'video-calls',
    'enhanced-chat',
    'improved-navigation',
    'viewport-fixes',
    'new-awesome-feature' // ← Add your new feature
  ],
  forceUpdate: false // Set to true for emergency updates
};
```

### Step 2: Define Feature
Add your feature to the `FEATURES` array:

```typescript
{
  featureId: 'new-awesome-feature',
  version: '3.2.0',
  rolloutPercentage: 50, // 50% of users will see this
  enabled: true,
  cacheKeys: ['feature-cache', 'ui-cache'], // Caches to clear
  description: 'Your awesome new feature'
}
```

### Step 3: Use Feature Flag
In your component:

```typescript
import { useFeatureFlag } from '@/components/FeatureUpdateChecker';

function MyComponent() {
  const isNewFeatureEnabled = useFeatureFlag('new-awesome-feature');
  
  return (
    <div>
      {isNewFeatureEnabled && (
        <div>Your new feature UI</div>
      )}
    </div>
  );
}
```

## Rollout Strategies

### 1. **Gradual Rollout (Recommended)**
```typescript
rolloutPercentage: 10, // Start with 10% of users
```
- Start small, monitor for issues
- Gradually increase to 50%, then 100%

### 2. **Instant Rollout**
```typescript
rolloutPercentage: 100, // All users immediately
```

### 3. **Emergency Rollout**
```typescript
forceUpdate: true, // Forces all users to update immediately
```

## Cache Management

### Feature-Specific Caches
Only clear caches related to your feature:
```typescript
cacheKeys: ['chat-cache', 'messages-cache'] // Only these caches cleared
```

### Global Cache Clear
For major updates:
```typescript
cacheKeys: ['*'] // Clears all caches
```

## Developer Tools

### Feature Rollout Manager
- Shows current version and enabled features
- Force refresh all users
- Check for updates manually
- Available in development mode

### Console Commands
```javascript
// Check current features
featureUpdateManager.getEnabledFeatures()

// Force refresh (emergency)
featureUpdateManager.forceRefresh()

// Check if feature enabled
featureUpdateManager.isFeatureEnabled('video-calls')
```

## Best Practices

### 1. **Version Management**
- Always increment version when adding features
- Use semantic versioning (3.1.0 → 3.2.0)
- Update buildTime for each release

### 2. **Feature Rollout**
- Start with small rollout percentage
- Monitor user feedback and errors
- Gradually increase rollout
- Have rollback plan ready

### 3. **Cache Strategy**
- Be specific with cache keys
- Don't clear user data unnecessarily
- Test cache invalidation thoroughly

### 4. **User Experience**
- Show update notifications
- Don't break existing functionality
- Provide fallbacks for disabled features

## Example: Adding Video Calls

### 1. Update Version
```typescript
version: '3.1.0',
features: ['video-calls', 'enhanced-chat', ...]
```

### 2. Define Feature
```typescript
{
  featureId: 'video-calls',
  version: '3.1.0',
  rolloutPercentage: 100, // Full rollout
  enabled: true,
  cacheKeys: ['chat-cache', 'media-cache'],
  description: 'Video call functionality in chat'
}
```

### 3. Use in Chat Component
```typescript
import { useFeatureFlag } from '@/components/FeatureUpdateChecker';

function ChatActions() {
  const isVideoCallEnabled = useFeatureFlag('video-calls');
  
  return (
    <div className="chat-actions">
      <button>Send Message</button>
      {isVideoCallEnabled && (
        <button onClick={startVideoCall}>Video Call</button>
      )}
    </div>
  );
}
```

## Monitoring

### Check Feature Status
```typescript
// In browser console
featureUpdateManager.getVersionInfo()
featureUpdateManager.getEnabledFeatures()
```

### Force Update (Emergency)
```typescript
// In browser console
featureUpdateManager.forceRefresh()
```

## Benefits

✅ **Instant Feature Updates** - Users get new features without app store updates
✅ **Gradual Rollout** - Test features with small user groups first
✅ **Smart Caching** - Only clear relevant caches, preserve user data
✅ **Consistent Experience** - Same user always sees same features
✅ **Emergency Control** - Force updates when needed
✅ **Developer Friendly** - Easy to add and manage features

This system works exactly like Instagram, Facebook, and other major PWAs! 🚀
