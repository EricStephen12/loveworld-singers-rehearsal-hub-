# LoveWorld Singers Rehearsal Hub - Database Setup

## Prerequisites
1. Make sure you have a Supabase project created
2. Your `.env.local` file should have the correct Supabase credentials

## Database Setup

### 1. Run the Authentication Schema
Execute the SQL in `auth-schema-clean.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `auth-schema-clean.sql`
4. Click "Run" to execute the SQL

**Note**: Use `auth-schema-clean.sql` instead of `auth-schema.sql` to avoid permission issues.

This will create:
- `profiles` table for user information
- `user_groups` table for ministry groups
- `attendance` table for rehearsal tracking
- `achievements` table for user achievements
- Row Level Security policies
- Automatic profile creation trigger

### 2. Configure Google OAuth (Optional)
To enable Google login:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URL to: `https://your-domain.com/auth/callback`

### 3. Test the Authentication Flow

1. Start your development server: `npm run dev`
2. Navigate to `/auth`
3. Try signing up with email/password
4. Complete the profile information
5. Test Google login (if configured)

## Features Implemented

### Authentication
- ✅ Email/password signup and login
- ✅ Google OAuth integration
- ✅ KingsChat placeholder (ready for future implementation)
- ✅ Automatic profile creation on signup
- ✅ Session management with Supabase

### Profile Management
- ✅ 3-step profile completion flow
- ✅ Personal information (name, gender, birthday, phone)
- ✅ Location information (region, zone, church)
- ✅ Ministry information (designation, administration)
- ✅ Skip option for later completion
- ✅ Profile completion tracking

### Database Schema
- ✅ User profiles with all required fields
- ✅ Row Level Security for data protection
- ✅ Automatic timestamps and triggers
- ✅ Achievement system
- ✅ Attendance tracking structure

### User Experience
- ✅ Real-time form validation
- ✅ Loading states and error handling
- ✅ Responsive mobile-first design
- ✅ Seamless navigation flow
- ✅ OAuth callback handling

## Next Steps

1. **Run the SQL**: Execute `auth-schema-clean.sql` in your Supabase project
2. **Test Signup**: Try creating a new account
3. **Configure Google**: Set up Google OAuth if needed
4. **Customize**: Modify the profile fields as needed for your organization

## Troubleshooting

### Common Issues:
1. **"User already registered"**: This means the email is already in use
2. **OAuth redirect errors**: Check your redirect URLs in Supabase settings
3. **Profile not found**: Make sure the trigger is working correctly
4. **RLS errors**: Verify the Row Level Security policies are applied

### Database Verification:
Check if tables were created successfully:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_groups', 'attendance', 'achievements');
```

The authentication system is now fully functional with real Supabase integration!