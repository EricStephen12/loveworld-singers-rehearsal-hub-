// Admin Activity Logger
// Tracks all admin actions for accountability and debugging
import { AdminUser } from './admin-service';

export interface AdminActivity {
  id: string;
  adminId: string;
  adminUsername: string;
  adminFullName: string;
  action: string;
  details: string;
  section: string;
  timestamp: string;
  ipAddress?: string;
}

class AdminActivityLogger {
  private static STORAGE_KEY = 'admin_activity_log';
  private static MAX_LOGS = 1000; // Keep last 1000 activities

  // Log an admin activity
  static log(
    adminId: string,
    adminUsername: string,
    adminFullName: string,
    action: string,
    details: string,
    section: string
  ): void {
    if (typeof window === 'undefined') return;

    const activity: AdminActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      adminId,
      adminUsername,
      adminFullName,
      action,
      details,
      section,
      timestamp: new Date().toISOString()
    };

    try {
      const logs = this.getLogs();
      logs.unshift(activity); // Add to beginning

      // Keep only last MAX_LOGS entries
      if (logs.length > this.MAX_LOGS) {
        logs.splice(this.MAX_LOGS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));

      // Console log for debugging
      console.log(`📝 [${adminUsername}] ${action}: ${details}`);
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }

  // Get all activity logs
  static getLogs(): AdminActivity[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting activity logs:', error);
    }

    return [];
  }

  // Get logs for specific admin
  static getLogsByAdmin(adminId: string): AdminActivity[] {
    return this.getLogs().filter(log => log.adminId === adminId);
  }

  // Get logs for specific section
  static getLogsBySection(section: string): AdminActivity[] {
    return this.getLogs().filter(log => log.section === section);
  }

  // Get logs for specific date range
  static getLogsByDateRange(startDate: Date, endDate: Date): AdminActivity[] {
    return this.getLogs().filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  // Get recent logs (last N entries)
  static getRecentLogs(count: number = 50): AdminActivity[] {
    return this.getLogs().slice(0, count);
  }

  // Clear all logs
  static clearLogs(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Export logs as JSON
  static exportLogs(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  // Get activity summary
  static getSummary(): {
    totalActivities: number;
    adminActivities: { [adminId: string]: number };
    sectionActivities: { [section: string]: number };
    recentActivity: AdminActivity | null;
  } {
    const logs = this.getLogs();
    const adminActivities: { [adminId: string]: number } = {};
    const sectionActivities: { [section: string]: number } = {};

    logs.forEach(log => {
      adminActivities[log.adminId] = (adminActivities[log.adminId] || 0) + 1;
      sectionActivities[log.section] = (sectionActivities[log.section] || 0) + 1;
    });

    return {
      totalActivities: logs.length,
      adminActivities,
      sectionActivities,
      recentActivity: logs[0] || null
    };
  }
}

// Helper to extract admin info from AdminUser
const getAdminInfo = (admin: AdminUser) => ({
  id: admin.id,
  username: admin.email,
  fullName: `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.email
});

// Helper functions for common actions
export const logAdminAction = {
  // Page actions
  createPage: (admin: AdminUser, pageName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'CREATE_PAGE',
      `Created page: ${pageName}`,
      'Pages'
    );
  },

  updatePage: (admin: AdminUser, pageName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'UPDATE_PAGE',
      `Updated page: ${pageName}`,
      'Pages'
    );
  },

  deletePage: (admin: AdminUser, pageName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'DELETE_PAGE',
      `Deleted page: ${pageName}`,
      'Pages'
    );
  },

  // Category actions
  createCategory: (admin: AdminUser, categoryName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'CREATE_CATEGORY',
      `Created category: ${categoryName}`,
      'Categories'
    );
  },

  updateCategory: (admin: AdminUser, categoryName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'UPDATE_CATEGORY',
      `Updated category: ${categoryName}`,
      'Categories'
    );
  },

  deleteCategory: (admin: AdminUser, categoryName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'DELETE_CATEGORY',
      `Deleted category: ${categoryName}`,
      'Categories'
    );
  },

  // Song actions
  addSong: (admin: AdminUser, songTitle: string, category: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'ADD_SONG',
      `Added song: ${songTitle} to ${category}`,
      'Songs'
    );
  },

  updateSong: (admin: AdminUser, songTitle: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'UPDATE_SONG',
      `Updated song: ${songTitle}`,
      'Songs'
    );
  },

  deleteSong: (admin: AdminUser, songTitle: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'DELETE_SONG',
      `Deleted song: ${songTitle}`,
      'Songs'
    );
  },

  // Media actions
  uploadMedia: (admin: AdminUser, fileName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'UPLOAD_MEDIA',
      `Uploaded media: ${fileName}`,
      'Media'
    );
  },

  deleteMedia: (admin: AdminUser, fileName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'DELETE_MEDIA',
      `Deleted media: ${fileName}`,
      'Media'
    );
  },

  // User actions
  updateUser: (admin: AdminUser, userName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'UPDATE_USER',
      `Updated user: ${userName}`,
      'Users'
    );
  },

  deleteUser: (admin: AdminUser, userName: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'DELETE_USER',
      `Deleted user: ${userName}`,
      'Users'
    );
  },

  // Support actions
  replySupport: (admin: AdminUser, messageId: string) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'REPLY_SUPPORT',
      `Replied to support message: ${messageId}`,
      'Support'
    );
  },

  // Login/Logout
  login: (admin: AdminUser) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'LOGIN',
      `Logged in to admin panel`,
      'Authentication'
    );
  },

  logout: (admin: AdminUser) => {
    const info = getAdminInfo(admin);
    AdminActivityLogger.log(
      info.id,
      info.username,
      info.fullName,
      'LOGOUT',
      `Logged out from admin panel`,
      'Authentication'
    );
  }
};

export default AdminActivityLogger;

