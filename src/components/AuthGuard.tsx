'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireCompleteProfile?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireCompleteProfile = true,
  redirectTo
}: AuthGuardProps) {
  const { user, profile, isLoading, isProfileComplete } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    console.log('AuthGuard: Checking auth state...', { 
      isLoading, 
      user: !!user, 
      profile: !!profile, 
      isProfileComplete,
      requireAuth,
      requireCompleteProfile 
    });

    // Don't do anything while loading
    if (isLoading) {
      console.log('AuthGuard: Still loading...');
      return;
    }

    // If auth is required but user is not authenticated
    if (requireAuth && !user) {
      console.log('AuthGuard: No user, redirecting to auth');
      router.push(redirectTo || '/auth');
      return;
    }

    // If user exists but no profile yet, allow access (profile might be created)
    if (user && !profile) {
      console.log('AuthGuard: User exists but no profile yet, allowing access');
      setShouldRender(true);
      return;
    }

    // If complete profile is required but profile is not complete
        if (requireCompleteProfile && user && profile && profile.profile_completed === false) {
          console.log('AuthGuard: Profile incomplete, redirecting to profile completion page');
          console.log('AuthGuard: Profile data:', profile);
          console.log('AuthGuard: profile_completed value:', profile.profile_completed);
          console.log('AuthGuard: Redirecting to /profile-completion');
          router.push('/profile-completion');
          return;
        }

    // If complete profile is required but profile is not complete (check isProfileComplete)
    if (requireCompleteProfile && user && profile && !isProfileComplete) {
      console.log('AuthGuard: Profile incomplete (isProfileComplete=false), redirecting to profile completion page');
      console.log('AuthGuard: isProfileComplete:', isProfileComplete);
      console.log('AuthGuard: Redirecting to /profile-completion');
      router.push('/profile-completion');
      return;
    }

    // If we get here, all requirements are met
    console.log('AuthGuard: All requirements met, rendering children');
    setShouldRender(true);
  }, [user, profile, isLoading, isProfileComplete, requireAuth, requireCompleteProfile, redirectTo, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until auth check is complete
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
