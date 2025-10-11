"use client";

import React, { useState, useEffect } from 'react';
import { Users } from "lucide-react";

// Admin users database (in production, this should be in Supabase)
interface AdminUser {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin'; // All admins have full access
  createdAt: string;
}

const ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'superadmin',
    email: 'superadmin@lwsrhp.com',
    password: '@superadmin2024@',
    fullName: 'Super Administrator',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-2',
    username: 'admin1',
    email: 'admin1@lwsrhp.com',
    password: '@admin1_2024@',
    fullName: 'Admin User 1',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-3',
    username: 'admin2',
    email: 'admin2@lwsrhp.com',
    password: '@admin2_2024@',
    fullName: 'Admin User 2',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-4',
    username: 'admin3',
    email: 'admin3@lwsrhp.com',
    password: '@admin3_2024@',
    fullName: 'Admin User 3',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-5',
    username: 'admin4',
    email: 'admin4@lwsrhp.com',
    password: '@admin4_2024@',
    fullName: 'Admin User 4',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

interface AdminAuthProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentAdmin: AdminUser | null;
  setCurrentAdmin: (admin: AdminUser | null) => void;
}

export default function AdminAuth({ 
  isAuthenticated, 
  setIsAuthenticated, 
  currentAdmin, 
  setCurrentAdmin 
}: AdminAuthProps) {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const admin = ADMIN_USERS.find(u => u.id === session.adminId);
        if (admin && session.expiresAt > Date.now()) {
          setCurrentAdmin(admin);
          setIsAuthenticated(true);
          console.log('✅ Admin session restored:', admin.fullName);
        } else {
          // Session expired or invalid
          console.log('❌ Admin session expired or invalid');
          localStorage.removeItem('admin_session');
        }
      } catch (error) {
        console.error('Invalid admin session:', error);
        localStorage.removeItem('admin_session');
      }
    } else {
      console.log('❌ No admin session found');
    }
  }, [setCurrentAdmin, setIsAuthenticated]);

  // Admin login function
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const admin = ADMIN_USERS.find(
      u => u.username === loginData.username && u.password === loginData.password
    );

    if (admin) {
      const session = {
        adminId: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
        loginTime: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      localStorage.setItem('admin_session', JSON.stringify(session));

      setCurrentAdmin(admin);
      setIsAuthenticated(true);
      setLoginData({ username: '', password: '' });
      console.log(`✅ Admin logged in: ${admin.fullName} (${admin.username})`);
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Admin logout function
  const handleAdminLogout = () => {
    localStorage.removeItem('admin_session');
    
    if (currentAdmin) {
      console.log(`👋 Admin logged out: ${currentAdmin.fullName}`);
    }

    // Clear state
    setIsAuthenticated(false);
    setCurrentAdmin(null);

    // Force page reload to show login screen
    window.location.reload();
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">
            {currentAdmin?.fullName}
          </span>
        </div>
        <button
          onClick={handleAdminLogout}
          className="px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Login</h1>
            <p className="text-slate-600">Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Admin access only. Contact system administrator for credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ADMIN_USERS };
export type { AdminUser };
