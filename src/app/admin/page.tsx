"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Calendar, 
  FileText, 
  ShoppingCart, 
  MessageCircle, 
  Settings,
  Bookmark,
  ChevronRight,
  Filter,
  Download,
  Printer,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronDown,
  Edit,
  Trash2,
  Play,
  Pause,
  Music,
  Tag,
  X,
  Check,
  Save,
  ExternalLink,
  RefreshCw,
  Users,
  Send,
  Bell
} from "lucide-react";
import { PraiseNightSong, Comment, PraiseNight, Category } from '../../types/supabase';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { FirebaseAuthService } from '@/lib/firebase-auth';
import { logAdminAction } from '@/lib/admin-activity-logger';
import { versionManager } from '@/utils/versionManager';
import { uploadBannerImage } from '@/utils/imageUpload';
import EditSongModal from '../../components/EditSongModal';
import MediaManager from '../../components/MediaManager';
import SimpleAdminSupport from '../../components/SimpleAdminSupport';
import WhatsAppAdminSupport from '../../components/WhatsAppAdminSupport';
import { ToastContainer, Toast } from '../../components/Toast';

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

export default function AdminPage() {
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Initialize Supabase client
  // Use shared Supabase client to avoid multiple instances

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState('Pages');
  const [selectedPage, setSelectedPage] = useState<PraiseNight | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


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
  }, []);

  // Admin login function
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const admin = ADMIN_USERS.find(
      u => u.username === loginData.username && u.password === loginData.password
    );

    if (admin) {
      setIsAuthenticated(true);
      setCurrentAdmin(admin);

      // Create session with 24 hour expiry
      const session = {
        adminId: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
        loginTime: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      localStorage.setItem('admin_session', JSON.stringify(session));

      // Log the login activity
      logAdminAction.login({
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName
      });

      console.log(`✅ Admin logged in: ${admin.fullName} (${admin.username})`);
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Admin logout function
  const handleAdminLogout = () => {
    // Log the logout activity before clearing session
    if (currentAdmin) {
      logAdminAction.logout({
        id: currentAdmin.id,
        username: currentAdmin.username,
        fullName: currentAdmin.fullName
      });
    }

    console.log(`👋 Admin logged out: ${currentAdmin?.fullName}`);

    // Clear session
    localStorage.removeItem('admin_session');

    // Clear state
    setIsAuthenticated(false);
    setCurrentAdmin(null);

    // Force page reload to show login screen
    window.location.reload();
  };

  
  // Use real-time Supabase data for instant updates
  const { pages: allPraiseNights, loading, error, getCurrentPage, getCurrentSongs, refreshData } = useRealtimeData();
  
  // Categories from database
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  
  // Song data and filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'heard' | 'unheard'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get all songs from Supabase data
  const allSongs = useMemo(() => {
    if (loading || !allPraiseNights) return [];
    
    console.log('🎵 Admin - All Praise Nights:', allPraiseNights.length);
    allPraiseNights.forEach((page, index) => {
      console.log(`🎵 Page ${index}:`, {
        id: page.id,
        name: page.name,
        songsCount: page.songs.length
      });
    });
    
    // Get all songs from all praise nights
    const allSongsWithIds: PraiseNightSong[] = [];
    
    allPraiseNights.forEach(praiseNight => {
      praiseNight.songs.forEach(song => {
        allSongsWithIds.push({
          ...song,
          praiseNightId: praiseNight.id
        });
      });
    });
    
    console.log('🎵 Admin - All Songs Total:', allSongsWithIds.length);
    console.log('🎵 Admin - Selected Page:', selectedPage?.id, selectedPage?.name);
    console.log('🎵 Admin - All Songs Details:', allSongsWithIds.map(song => ({
      id: song.id,
      firebaseId: song.firebaseId,
      title: song.title,
      praiseNightId: song.praiseNightId
    })));
    
    return allSongsWithIds;
  }, [allPraiseNights, loading, selectedPage]);

  // Management state
  const [showPageModal, setShowPageModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PraiseNight | null>(null);
  const [editingPageCategory, setEditingPageCategory] = useState<any | null>(null);
  
  // Delete confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PraiseNight | null>(null);
  const [showDeleteSongDialog, setShowDeleteSongDialog] = useState(false);
  const [songToDelete, setSongToDelete] = useState<PraiseNightSong | null>(null);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDate, setNewPageDate] = useState('');
  const [newPageLocation, setNewPageLocation] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newPageDays, setNewPageDays] = useState(0);
  const [newPageHours, setNewPageHours] = useState(0);
  const [newPageMinutes, setNewPageMinutes] = useState(0);
  const [newPageSeconds, setNewPageSeconds] = useState(0);
  const [newPageCategoryName, setNewPageCategoryName] = useState('');
  const [newPageCategoryDescription, setNewPageCategoryDescription] = useState('');
  const [newPageCategory, setNewPageCategory] = useState<'unassigned' | 'pre-rehearsal' | 'ongoing' | 'archive'>('unassigned');
  const [newPageBannerImage, setNewPageBannerImage] = useState('');
  const [newPageBannerFile, setNewPageBannerFile] = useState<File | null>(null);

  // Song editing state
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<PraiseNightSong | null>(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<{[key: string]: string[]}>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Notifications admin state
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [isLoadingAdminNotifications, setIsLoadingAdminNotifications] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
    priority: 'medium',
    targetAudience: 'all',
    targetGroup: '',
    actionUrl: '',
    expiresAt: ''
  });

  // Support messages state
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // Toast helper functions
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Get all available categories from Supabase songs only
  const allAvailableCategories = useMemo(() => {
    const songCategoryNames = allSongs.map((song: PraiseNightSong) => song.category);
    // Remove duplicates and return unique category names from Supabase
    return [...new Set(songCategoryNames)];
  }, [allSongs]);

  // Get categories from database and songs (combine both sources)
  const allCategories = useMemo(() => {
    // Start with database categories
    const combinedCategories = [...dbCategories];
    
    // Add song-based categories that don't exist in database
    allAvailableCategories.forEach((categoryName: string) => {
      const existsInDb = dbCategories.some(cat => cat.name === categoryName);
      if (!existsInDb) {
        combinedCategories.push({
          id: `song-cat-${categoryName}`,
          name: categoryName,
          description: '',
          icon: 'Music',
          color: '#3B82F6',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    
    return combinedCategories;
  }, [dbCategories, allAvailableCategories]);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await FirebaseDatabaseService.getCollection('categories');
        console.log('🔥 Raw categories from Firebase:', categories);
        
        // Map categories to include both Firebase ID and Supabase ID
        const mappedCategories = categories.map(category => ({
          ...category,
          firebaseId: category.id, // Firebase document ID (string)
          id: category.id, // Keep Firebase ID as primary ID
          supabaseId: category.id // This will be the Firebase ID for now
        }));
        
        console.log('🔥 Mapped categories:', mappedCategories);
        setDbCategories(mappedCategories as Category[]);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Get pages from Firebase (includes unassigned for admin)
  const pages = useMemo(() => {
    if (loading || !allPraiseNights) return [];
    console.log('📄 Admin pages loaded:', allPraiseNights.length, 'pages');
    console.log('📄 All pages data:', allPraiseNights);
    allPraiseNights.forEach((page, index) => {
      console.log(`📄 Page ${index}:`, {
        id: page.id,
        firebaseId: page.firebaseId,
        name: page.name
      });
    });
    return allPraiseNights; // Firebase data includes all pages
  }, [allPraiseNights, loading, showPageModal]); // Refresh when data changes

  // Get page categories for selected page (extract from songs)
  const pageCategories = useMemo(() => {
    if (!selectedPage) return [];
    const pageSongs = allSongs.filter(song => song.praiseNightId === selectedPage.id);
    const uniqueCategories = [...new Set(pageSongs.map(song => song.category))];
    return uniqueCategories.map((categoryName, index) => ({
      id: `cat-${selectedPage.id}-${index}`,
      pageId: selectedPage.id,
      name: categoryName,
      description: `Songs in ${categoryName} category`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }, [selectedPage, allSongs, showCategoryModal]);

  // Get category content for selected category (songs in that category)
  const categoryContent = useMemo(() => {
    if (!selectedCategory || !selectedPage) return [];
    return allSongs.filter(song => 
      song.praiseNightId === selectedPage.id && 
      song.category === selectedCategory
    );
  }, [selectedCategory, selectedPage, allSongs]);

  // Get unique categories for filter dropdown (from songs)
  const songCategories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allSongs.map(song => song.category)));
    return uniqueCategories;
  }, [allSongs]);

  // Filter and search songs
  const filteredSongs = useMemo(() => {
    return allSongs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (song.leadSinger || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (song.writer || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || song.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || song.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [allSongs, searchTerm, statusFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSongs = filteredSongs.slice(startIndex, startIndex + itemsPerPage);

  // Counts for tabs
  const heardCount = allSongs.filter(song => song.status === 'heard').length;
  const unheardCount = allSongs.filter(song => song.status === 'unheard').length;

  // Category management functions (Supabase-based)
  const handleAddCategory = async () => {
    if (newPageCategoryName.trim()) {
      try {
        const newCategory: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> = {
          name: newPageCategoryName.trim(),
          description: '',
          icon: 'Music',
          color: '#3B82F6',
          isActive: true
        };

        const success = await FirebaseDatabaseService.createCategory(newCategory);
        
        if (success) {
          // Reload categories from database
          const categories = await FirebaseDatabaseService.getCollection('categories');
          setDbCategories(categories as Category[]);
          
          addToast({
            type: 'success',
            message: `Category "${newPageCategoryName.trim()}" created successfully!`
          });
          
          setNewPageCategoryName('');
          setShowCategoryModal(false);
        } else {
          throw new Error('Failed to create category');
        }
      } catch (error) {
        console.error('Error creating category:', error);
        addToast({
          type: 'error',
          message: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };

  const handleEditCategory = (categoryName: string) => {
    // Editing category from Supabase songs
    setEditingCategory({ 
      id: `cat-${categoryName}`, 
      name: categoryName, 
      description: '', 
      icon: 'Music', 
      color: '#3B82F6', 
      isActive: true, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    });
    setNewPageCategoryName(categoryName);
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && newPageCategoryName.trim()) {
      const oldCategoryName = editingCategory.name;
      const newCategoryName = newPageCategoryName.trim();
      
      try {
        // Check if this is a database category or song-based category
        const dbCategory = dbCategories.find(cat => cat.name === oldCategoryName);
        
        if (dbCategory) {
          // Update database category using Firebase document ID
          console.log('🔄 Updating category:', {
            oldName: oldCategoryName,
            newName: newCategoryName,
            categoryId: dbCategory.id,
            firebaseId: dbCategory.firebaseId
          });
          
          const categoryId = dbCategory.firebaseId || dbCategory.id;
          const success = await FirebaseDatabaseService.updateCategory(categoryId, {
            name: newCategoryName
          });
          
          if (success) {
            // Reload categories from database
            const categories = await FirebaseDatabaseService.getCollection('categories');
            const mappedCategories = categories.map(category => ({
              ...category,
              firebaseId: category.id,
              id: category.id,
              supabaseId: category.id
            }));
            setDbCategories(mappedCategories as Category[]);
            
            // Also update songs that use this category
            await FirebaseDatabaseService.updateSongsCategory(oldCategoryName, newCategoryName);
            await refreshData();
            
            addToast({
              type: 'success',
              message: `Category "${oldCategoryName}" updated to "${newCategoryName}" successfully!`
            });
          } else {
            throw new Error('Failed to update category in database');
          }
        } else {
          // Update song-based category (legacy behavior)
          const success = await FirebaseDatabaseService.updateSongsCategory(oldCategoryName, newCategoryName);
          if (success) {
            await refreshData();
            
            addToast({
              type: 'success',
              message: `Category "${oldCategoryName}" updated to "${newCategoryName}" successfully!`
            });
          } else {
            throw new Error('Failed to update category');
          }
        }
      } catch (error) {
        console.error('Error updating category:', error);
        addToast({
          type: 'error',
          message: `Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
      
      setEditingCategory(null);
      setNewPageCategoryName('');
      setShowCategoryModal(false);
    }
  };



  // Song management functions
  const handleEditSong = (song: PraiseNightSong) => {
    setEditingSong(song);
    setShowSongModal(true);
  };

  const handleSaveSong = async (songData: PraiseNightSong & { id?: number; firebaseId?: string }) => {
    try {
      console.log('🎵 handleSaveSong called with:', {
        hasId: !!songData.id,
        hasFirebaseId: !!songData.firebaseId,
        id: songData.id,
        firebaseId: songData.firebaseId,
        title: songData.title
      });
      
      // If songData has an ID, it's an existing song being updated
      if (songData.id) {
        console.log('🔄 Updating existing song with ID:', songData.id, 'Firebase ID:', songData.firebaseId);
        // Use firebaseId for Firebase operations
        const firebaseId = songData.firebaseId;
        console.log('🔥 Using Firebase ID for update:', firebaseId);
        const success = await FirebaseDatabaseService.updateSong(firebaseId, songData);
        
        if (success) {
          console.log('✅ Song updated successfully, refreshing data...');

          // Clear all caches
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cached_pages_data');
            localStorage.removeItem('cached_pages_timestamp');
            localStorage.removeItem('cached_songs_data');
            localStorage.removeItem('cached_songs_timestamp');
          }

          await refreshData();
          setTimeout(async () => {
            await refreshData();
            console.log('✅ Second refresh completed');
          }, 500);

          // Handle category changes
          if (selectedCategory && songData.category && selectedCategory !== songData.category) {
            console.log('🔄 Song moved from', selectedCategory, 'to', songData.category);
            setSelectedCategory(null);
            setTimeout(() => {
              const newCategoryExists = pageCategories.some(cat => cat.name === songData.category);
              if (newCategoryExists) {
                setSelectedCategory(songData.category);
              }
            }, 100);
          }

          // Close modal
          setShowSongModal(false);
          setEditingSong(null);

          addToast({
            type: 'success',
            message: 'Song updated successfully! All admins will see changes.'
          });
        } else {
          throw new Error('Failed to update song in database');
        }
        return;
      }

      // Check if this is a new song (no existing song with same title and praiseNightId)
      const songs = await FirebaseDatabaseService.getCollection('songs') as any[];
      const existingSong = songs.find(song => 
        song.praisenightid === songData.praiseNightId && song.title === songData.title
      );


      if (existingSong) {
        // Song exists, update it
        console.log('🔄 Updating existing song:', {
          songId: existingSong.id,
          title: songData.title,
          newCategory: songData.category
        });
        const success = await FirebaseDatabaseService.updateSong(existingSong.id, songData);
        
        if (success) {
          console.log('✅ Song updated successfully, refreshing data...');
          
          // Force a complete refresh to ensure UI updates
          await refreshData();
          
          // Add a small delay and refresh again to ensure state is updated
          setTimeout(async () => {
            await refreshData();
            console.log('✅ Second refresh completed');
          }, 500);
          
          console.log('✅ Data refreshed after song update');
          
          // If we're viewing a specific category and the song's category changed,
          // navigate to show the change
          if (selectedCategory && songData.category && selectedCategory !== songData.category) {
            console.log('🔄 Song moved from', selectedCategory, 'to', songData.category);
            
            // Force clear the current category view first
            setSelectedCategory(null);
            
            // Wait a moment then navigate to new category or stay at page level
            setTimeout(() => {
              const newCategoryExists = pageCategories.some(cat => cat.name === songData.category);
              
              if (newCategoryExists) {
                // Navigate to the new category to show where the song moved
                setSelectedCategory(songData.category);
                addToast({
                  type: 'success',
                  message: `Song "${songData.title}" moved from "${selectedCategory}" to "${songData.category}"!`
                });
              } else {
                // Stay at page level
                addToast({
                  type: 'success',
                  message: `Song "${songData.title}" moved to "${songData.category}" (category updated)!`
                });
              }
            }, 1000); // Give time for data to refresh
          } else {
            // Show regular success toast
            addToast({
              type: 'success',
              message: `Song "${songData.title}" updated successfully!`
            });
          }

          // Reset form
          setEditingSong(null);
          setShowSongModal(false);
        } else {
          throw new Error('Failed to update song in database');
        }
      } else {
        // Song doesn't exist, create it
        console.log('🎵 Creating new song:', songData.title);
        console.log('🎵 Song data being created:', {
          title: songData.title,
          praiseNightId: songData.praiseNightId,
          selectedPageId: selectedPage?.id,
          selectedPageName: selectedPage?.name
        });
        const createdSong = await FirebaseDatabaseService.createSong(songData);
        console.log('🎵 Song creation result:', createdSong);
        
        if (createdSong) {
          console.log('✅ Song created successfully, refreshing data...');
          // Refresh data from Supabase
          await refreshData();
          console.log('✅ Data refreshed');
          
          // Show success toast
          addToast({
            type: 'success',
            message: `Song "${songData.title}" added successfully!`
          });

          // Reset form
          setEditingSong(null);
          setShowSongModal(false);
        } else {
          console.error('❌ Song creation returned null');
          throw new Error('Failed to create song in database');
        }
      }
    } catch (error) {
      console.error('Error saving song:', error);
      addToast({
        type: 'error',
        message: `Failed to save song: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleDeleteSong = (song: PraiseNightSong) => {
    setSongToDelete(song);
    setShowDeleteSongDialog(true);
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete) return;
    
    try {
      console.log('🗑️ Deleting song:', songToDelete.title);
      console.log('🗑️ Song details:', {
        id: songToDelete.id,
        firebaseId: songToDelete.firebaseId,
        title: songToDelete.title,
        praiseNightId: songToDelete.praiseNightId
      });
      
      // Delete from Firebase using the Firebase ID
      const firebaseId = songToDelete.firebaseId || songToDelete.id.toString();
      console.log('🗑️ Using Firebase ID for deletion:', firebaseId);
      const success = await FirebaseDatabaseService.deleteSong(firebaseId);
      
      if (success) {
        console.log('✅ Song deleted successfully');
        
        // Simple refresh without aggressive cache clearing
        await refreshData();
        console.log('🔄 Data refreshed after deletion');
        
        // Show success toast
        addToast({
          type: 'success',
          message: `Song "${songToDelete.title}" deleted successfully!`
        });
        
        // Close dialog
        setShowDeleteSongDialog(false);
        setSongToDelete(null);
      } else {
        console.log('❌ Song deletion failed in Firebase');
        throw new Error('Failed to delete song from database');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      addToast({
        type: 'error',
        message: `Failed to delete song: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const cancelDeleteSong = () => {
    setShowDeleteSongDialog(false);
    setSongToDelete(null);
  };

  const handleToggleSongStatus = async (song: PraiseNightSong) => {
    try {
      const newStatus = song.status === 'heard' ? 'unheard' : 'heard';
      
      // Get the song ID from the database
      const allSongs = await FirebaseDatabaseService.getCollection('songs') as any[];
      const songRecord = allSongs.find(s => 
        s.praisenightid === song.praiseNightId && s.title === song.title
      );

      if (!songRecord) {
        throw new Error(`Could not find song "${song.title}" in database`);
      }

      // Update in Firebase using the song ID
      const success = await FirebaseDatabaseService.updateSong(songRecord.id, { status: newStatus });
      
      if (success) {
        // Refresh data from Supabase
        await refreshData();
        
        // Show success toast
        addToast({
          type: 'success',
          message: `Song "${song.title}" marked as ${newStatus}!`
        });
      } else {
        throw new Error('Failed to update song status in database');
      }
    } catch (error) {
      console.error('Error toggling song status:', error);
      addToast({
        type: 'error',
        message: `Failed to update song status: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  // Page management functions
  const handleAddPage = async () => {
    if (newPageName.trim()) {
      try {
        let bannerImageUrl = '';
        
        // Upload banner image to Supabase if file is selected (WAIT for upload)
        if (newPageBannerFile) {
          console.log('🚀 Starting banner image upload for new page...');

          addToast({
            type: 'info',
            message: 'Uploading banner image...'
          });

          // WAIT for upload to complete - use timestamp as temporary ID
          const tempPageId = Date.now(); // Use timestamp as temporary ID
          const uploadResult = await uploadBannerImage(newPageBannerFile, tempPageId);

          if (uploadResult.success && uploadResult.url) {
            console.log('✅ Banner image uploaded successfully:', uploadResult.url);
            bannerImageUrl = uploadResult.url; // Use the uploaded URL
            addToast({
              type: 'success',
              message: 'Banner image uploaded successfully!'
            });
          } else {
            console.error('❌ Banner image upload failed:', uploadResult.error);
            addToast({
              type: 'error',
              message: `Banner image upload failed: ${uploadResult.error || 'Unknown error'}`
            });
            // Don't create the page if image upload failed
            return;
          }
        }
        
        const newPage = await FirebaseDatabaseService.createPage({
          id: 0, // Will be set by database
          name: newPageName.trim(),
          date: newPageDate || 'TBD',
          location: newPageLocation || 'TBD',
          category: newPageCategory,
          bannerImage: bannerImageUrl,
          countdown: {
            days: newPageDays,
            hours: newPageHours,
            minutes: newPageMinutes,
            seconds: newPageSeconds
          }
        });

        if (newPage) {
          // Clear all caches to ensure fresh data for all admins
          console.log('🧹 Clearing all caches...');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cached_pages_data');
            localStorage.removeItem('cached_pages_timestamp');
            localStorage.removeItem('cached_songs_data');
            localStorage.removeItem('cached_songs_timestamp');
          }

          // Refresh data from Supabase
          console.log('🔄 Refreshing data from Supabase...');
          await refreshData();

          // Force a second refresh after a short delay to ensure all admins see changes
          setTimeout(async () => {
            console.log('🔄 Second refresh for real-time sync...');
            await refreshData();
          }, 500);

          // Show success toast
          addToast({
            type: 'success',
            message: `Page "${newPageName.trim()}" added successfully! All admins will see changes.`
          });

          setNewPageName('');
          setNewPageDate('');
          setNewPageLocation('');
          setNewPageDescription('');
          setNewPageCategory('unassigned');
          setNewPageBannerImage('');
          setNewPageBannerFile(null);
          setNewPageDays(0);
          setNewPageHours(0);
          setNewPageMinutes(0);
          setNewPageSeconds(0);
          setShowPageModal(false);
        } else {
          throw new Error('Failed to create page');
        }
      } catch (error) {
        console.error('Error adding page:', error);
        addToast({
          type: 'error',
          message: `Failed to add page: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };

  const handleEditPage = (page: PraiseNight) => {
    console.log('✏️ handleEditPage called with page:', page);
    console.log('📄 Page countdown data:', page.countdown);
    setEditingPage(page);
    setNewPageName(page.name);
    setNewPageDate(page.date);
    setNewPageLocation(page.location);
    setNewPageDescription(''); // PraiseNight doesn't have description field
    setNewPageCategory(page.category || 'unassigned'); // Default to unassigned if not set
    setNewPageBannerImage(page.bannerImage || '');
    
    // Load countdown data - check both nested and flat structure
    const countdown = page.countdown || {};
    setNewPageDays(countdown.days || 0);
    setNewPageHours(countdown.hours || 0);
    setNewPageMinutes(countdown.minutes || 0);
    setNewPageSeconds(countdown.seconds || 0);
    
    console.log('📄 Loaded countdown values:', {
      days: countdown.days || 0,
      hours: countdown.hours || 0,
      minutes: countdown.minutes || 0,
      seconds: countdown.seconds || 0
    });
    
    setShowPageModal(true);
    console.log('✅ Edit page modal opened, editingPage set to:', page);
  };

  const handleUpdatePage = async () => {
    console.log('🔄 handleUpdatePage called');
    console.log('editingPage:', editingPage);
    console.log('newPageName:', newPageName);

    if (editingPage && newPageName.trim()) {
      try {
        console.log('🚀 Starting page update...');
        let bannerImageUrl = newPageBannerImage; // Keep existing image by default

        // Upload new banner image to Supabase if file is selected (WAIT for upload)
        if (newPageBannerFile) {
          console.log('🚀 Starting banner image upload...');

          addToast({
            type: 'info',
            message: 'Uploading banner image...'
          });

          // WAIT for upload to complete
          const uploadResult = await uploadBannerImage(newPageBannerFile, parseInt(editingPage.firebaseId || editingPage.id.toString()));

          if (uploadResult.success && uploadResult.url) {
            console.log('✅ Banner image uploaded successfully:', uploadResult.url);
            bannerImageUrl = uploadResult.url; // Use the new uploaded URL
            addToast({
              type: 'success',
              message: 'Banner image uploaded successfully!'
            });
          } else {
            console.error('❌ Banner image upload failed:', uploadResult.error);
            addToast({
              type: 'error',
              message: `Banner image upload failed: ${uploadResult.error || 'Unknown error'}`
            });
            // Don't update the page if image upload failed
            return;
          }
        }
        
        console.log('📝 Updating page with data:', {
          id: editingPage.id,
          name: newPageName.trim(),
          date: newPageDate,
          location: newPageLocation,
          category: newPageCategory,
          bannerImage: bannerImageUrl,
          countdown: {
            days: newPageDays,
            hours: newPageHours,
            minutes: newPageMinutes,
            seconds: newPageSeconds
          }
        });
        
        console.log('🔍 Admin Update Debug:');
        console.log('editingPage:', editingPage);
        console.log('editingPage.firebaseId:', editingPage.firebaseId);
        console.log('editingPage.id:', editingPage.id);
        console.log('Using ID:', editingPage.firebaseId || editingPage.id.toString());
        
        const updateData = {
          name: newPageName.trim(),
          date: newPageDate,
          location: newPageLocation,
          category: newPageCategory,
          bannerImage: bannerImageUrl,
          countdownDays: newPageDays,
          countdownHours: newPageHours,
          countdownMinutes: newPageMinutes,
          countdownSeconds: newPageSeconds
        };
        
        console.log('🔍 Update Data:', updateData);
        console.log('🔍 Countdown Values:', {
            days: newPageDays,
            hours: newPageHours,
            minutes: newPageMinutes,
            seconds: newPageSeconds
        });
        
        const success = await FirebaseDatabaseService.updatePage(editingPage.firebaseId || editingPage.id.toString(), updateData);
        
        console.log('✅ Page update result:', success);

        if (success) {
          // Clear all caches to ensure fresh data for all admins
          console.log('🧹 Clearing all caches...');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cached_pages_data');
            localStorage.removeItem('cached_pages_timestamp');
            localStorage.removeItem('cached_songs_data');
            localStorage.removeItem('cached_songs_timestamp');
          }

          // Refresh data from Supabase
          console.log('🔄 Refreshing data from Supabase...');
          await refreshData();

          // Force a second refresh after a short delay to ensure all admins see changes
          setTimeout(async () => {
            console.log('🔄 Second refresh for real-time sync...');
            await refreshData();
          }, 500);

          // Show success toast
          addToast({
            type: 'success',
            message: `Page "${newPageName.trim()}" updated successfully! All admins will see changes.`
          });

          setEditingPage(null);
          setNewPageName('');
          setNewPageDate('');
          setNewPageLocation('');
          setNewPageDescription('');
          setNewPageCategory('unassigned');
          setNewPageBannerImage('');
          setNewPageBannerFile(null);
          setNewPageDays(0);
          setNewPageHours(0);
          setNewPageMinutes(0);
          setNewPageSeconds(0);
          setShowPageModal(false);
        } else {
          throw new Error('Failed to update page');
        }
      } catch (error) {
        console.error('Error updating page:', error);
        addToast({
          type: 'error',
          message: `Failed to update page: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };

  const handleDeletePage = (page: PraiseNight) => {
    setPageToDelete(page);
    setShowDeleteDialog(true);
  };

  const confirmDeletePage = async () => {
    if (!pageToDelete) return;
    
    try {
      const success = await FirebaseDatabaseService.deletePage(pageToDelete.firebaseId || pageToDelete.id.toString());

        if (success) {
        // Refresh data from Firebase
          await refreshData();
          
          // Show success toast
          addToast({
            type: 'success',
          message: `Page "${pageToDelete.name}" deleted successfully!`
          });
        
        // Close dialog
        setShowDeleteDialog(false);
        setPageToDelete(null);
        } else {
          throw new Error('Failed to delete page');
        }
      } catch (error) {
        console.error('Error deleting page:', error);
        addToast({
          type: 'error',
          message: `Failed to delete page: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
  };

  const cancelDeletePage = () => {
    setShowDeleteDialog(false);
    setPageToDelete(null);
  };

  // Category content management functions (simplified for Supabase)
  const handleAddPageCategory = () => {
    addToast({
      type: 'info',
      message: 'Categories are now managed through songs. Add a song to create categories.'
    });
  };

  const handleEditPageCategory = (category: any) => {
    addToast({
      type: 'info',
      message: 'Categories are now managed through songs. Edit songs instead.'
    });
  };

  const handleUpdatePageCategory = () => {
    addToast({
      type: 'info',
      message: 'Categories are now managed through songs. Edit songs instead.'
    });
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      console.log('🗑️ Deleting category:', categoryToDelete);
      console.log('🗑️ Category Firebase ID:', categoryToDelete.firebaseId || categoryToDelete.id);
      
      // Use Firebase document ID for deletion
      const firebaseId = categoryToDelete.firebaseId || categoryToDelete.id;
      const success = await FirebaseDatabaseService.deleteCategory(firebaseId);
      
      if (success) {
        // Reload categories from database
        const categories = await FirebaseDatabaseService.getCollection('categories');
        const mappedCategories = categories.map(category => ({
          ...category,
          firebaseId: category.id,
          id: category.id,
          supabaseId: category.id
        }));
        setDbCategories(mappedCategories as Category[]);
        
        // Move songs to uncategorized
        await FirebaseDatabaseService.handleCategoryDeletion(categoryToDelete.name, 'Uncategorized');
        await refreshData();
        
        addToast({
          type: 'success',
          message: `Category "${categoryToDelete.name}" deleted successfully! Songs moved to "Uncategorized".`
        });
        
        // Close dialog
        setShowDeleteCategoryDialog(false);
        setCategoryToDelete(null);
      } else {
        throw new Error('Failed to delete category from database');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast({
        type: 'error',
        message: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const cancelDeleteCategory = () => {
    setShowDeleteCategoryDialog(false);
    setCategoryToDelete(null);
  };

  const handleDeletePageCategory = (id: string) => {
    addToast({
      type: 'info',
      message: 'Categories are now managed through songs. Delete songs instead.'
    });
  };

  const handleEditCategoryContent = (content: any) => {
    // Convert to PraiseNightSong for editing
    const song: PraiseNightSong = {
      title: content.title,
      status: content.status,
      category: selectedCategory || '',
      praiseNightId: selectedPage?.id || 0,
      lyrics: content.lyrics || '',
      leadSinger: content.leadSinger || '',
      writer: content.writer || '',
      conductor: content.conductor || '',
      key: content.key || '',
      tempo: content.tempo || '',
      leadKeyboardist: content.leadKeyboardist || '',
      // leadGuitarist field kept for data structure
      drummer: content.drummer || '',
      comments: content.comments || [],
      audioFile: content.audioFile || '',
      history: content.history || []
    };
    setEditingSong(song);
    setShowSongModal(true);
  };

  const handleDeleteCategoryContent = (id: string) => {
    addToast({
      type: 'info',
      message: 'Content is now managed through songs. Delete songs instead.'
    });
  };

  // User management functions
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Use DIRECT approach
      console.log('🔄 Using DIRECT approach...');
      await versionManager.checkForUpdates();
      
      console.log('🔄 Loading users with DIRECT query (no complex logic)...');
      
      // Check if current user is admin
      const user = await FirebaseAuthService.getCurrentUser();
      let currentUserProfile = null;
      if (user) {
        currentUserProfile = await FirebaseDatabaseService.getDocument('profiles', user.uid);
      }

      if (!currentUserProfile || (currentUserProfile as any).role !== 'admin') {
        console.error('❌ Admin access denied: Not admin');
        addToast({
          type: 'error',
          message: 'Admin access required to view users'
        });
        return;
      }
      
      // DIRECT QUERY - Simple and direct
      console.log('📋 Direct profiles query...');
      const profilesData = await FirebaseDatabaseService.getCollection('profiles');
      
      console.log('📊 Raw query result:', { data: profilesData });
      
      if (!profilesData) {
        console.error('❌ Profiles query failed');
        addToast({
          type: 'error',
          message: `Database error: Failed to fetch profiles`
        });
        return;
      }
      
      const profiles = profilesData || [];
      console.log('✅ Found profiles:', profiles.length);
      console.log('📋 Profile details:', profiles);
      
      // Use the profiles directly - no complex merging logic
      const allUsers = profiles;
      console.log('📊 Using profiles directly:', allUsers.length, 'users');
      
      // Fetch user groups for all users
      const groups = await FirebaseDatabaseService.getCollection('user_groups');
      
      if (!groups) {
        console.error('❌ Error loading user groups');
        // Don't return here, just log the error and continue
      } else {
        console.log('🏷️ User groups data:', groups);
        
        // Organize groups by user ID
        const groupsByUser: {[key: string]: string[]} = {};
        groups?.forEach((group: any) => {
          if (!groupsByUser[group.user_id]) {
            groupsByUser[group.user_id] = [];
          }
          groupsByUser[group.user_id].push(group.group_name);
        });
        
        setUserGroups(groupsByUser);
      }
      
      setUsers(allUsers);
      
      if (allUsers.length === 0) {
        addToast({
          type: 'warning',
          message: 'No users found. Check console for debugging info.'
        });
      } else {
        addToast({
          type: 'success',
          message: `Loaded ${allUsers.length} users successfully`
        });
      }
      
    } catch (error) {
      console.error('❌ Error loading users:', error);
      addToast({
        type: 'error',
        message: `Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Support message functions
  const loadSupportMessages = async () => {
    setSupportLoading(true);
    try {
      const data = await FirebaseDatabaseService.getCollection('support_messages');

      setSupportMessages(data || []);
    } catch (error) {
      console.error('Error loading support messages:', error);
      addToast({
        type: 'error',
        message: 'Failed to load support messages'
      });
    } finally {
      setSupportLoading(false);
    }
  };

  const handleReplyToMessage = async (messageId: string) => {
    if (!replyText.trim()) return;
    
    setReplying(true);
    try {
      await FirebaseDatabaseService.updateDocument('support_messages', messageId, {
          admin_response: replyText.trim(),
          admin_responded_at: new Date().toISOString(),
          status: 'resolved'
      });

      addToast({
        type: 'success',
        message: 'Reply sent successfully'
      });

      setReplyText('');
      setSelectedMessage(null);
      await loadSupportMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      addToast({
        type: 'error',
        message: 'Failed to send reply'
      });
    } finally {
      setReplying(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      await FirebaseDatabaseService.updateDocument('support_messages', messageId, { status });

      addToast({
        type: 'success',
        message: `Message status updated to ${status}`
      });

      await loadSupportMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      addToast({
        type: 'error',
        message: 'Failed to update message status'
      });
    }
  };

  // Load support messages when Support section is active
  useEffect(() => {
    if (activeSection === 'Support') {
      loadSupportMessages();
    }
  }, [activeSection]);

  // Set up real-time subscription for support messages
  useEffect(() => {
    if (activeSection !== 'Support') return;

    // Firebase doesn't have real-time subscriptions like Supabase
    // We'll use polling instead for support messages
    const interval = setInterval(() => {
      loadSupportMessages();
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [activeSection]);

  // Load users when Users section is active (ALWAYS refresh)
  useEffect(() => {
    if (activeSection === 'Users') {
      console.log('🔄 Users section activated - loading users...');
      loadUsers();
    }
  }, [activeSection]);

  // Load admin notifications
  const loadAdminNotifications = async () => {
    setIsLoadingAdminNotifications(true);
    try {
      console.log('🔔 Loading admin notifications...');

      const data = await FirebaseDatabaseService.getCollection('notifications');

      setAdminNotifications(data || []);
      console.log(`✅ Loaded ${data?.length || 0} notifications`);
    } catch (err) {
      console.error('❌ Unexpected error loading admin notifications:', err);
      addToast({
        type: 'error',
        message: 'Failed to load notifications'
      });
    } finally {
      setIsLoadingAdminNotifications(false);
    }
  };

  // Create notification
  const createNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      addToast({
        type: 'error',
        message: 'Please fill in title and message'
      });
      return;
    }

    try {
      let result;

      if (notificationForm.targetAudience === 'all') {
        // Create notification for all users in Firebase
        result = await FirebaseDatabaseService.createDocument('notifications', Date.now().toString(), {
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          category: notificationForm.category,
          priority: notificationForm.priority,
          action_url: notificationForm.actionUrl || null,
          expires_at: notificationForm.expiresAt || null,
          target_audience: 'all',
          created_at: new Date().toISOString()
        });
      } else if (notificationForm.targetAudience === 'group' && notificationForm.targetGroup) {
        // Create notification for specific group in Firebase
        result = await FirebaseDatabaseService.createDocument('notifications', Date.now().toString(), {
          title: notificationForm.title,
          message: notificationForm.message,
          target_group: notificationForm.targetGroup,
          type: notificationForm.type,
          category: notificationForm.category,
          priority: notificationForm.priority,
          action_url: notificationForm.actionUrl || null,
          expires_at: notificationForm.expiresAt || null,
          target_audience: 'group',
          created_at: new Date().toISOString()
        });
      } else {
        addToast({
          type: 'error',
          message: 'Please select target audience and group (if applicable)'
        });
        return;
      }

      if (result.error) {
        console.error('❌ Error creating notification:', result.error);
        addToast({
          type: 'error',
          message: `Failed to send notification: ${result.error.message}`
        });
        return;
      }

      addToast({
        type: 'success',
        message: 'Notification sent successfully!'
      });

      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        category: 'system',
        priority: 'medium',
        targetAudience: 'all',
        targetGroup: '',
        actionUrl: '',
        expiresAt: ''
      });

      // Reload notifications
      loadAdminNotifications();

    } catch (err) {
      console.error('❌ Unexpected error creating notification:', err);
      addToast({
        type: 'error',
        message: 'Failed to send notification'
      });
    }
  };

  // Delete notification
  const deleteAdminNotification = async (notificationId: string) => {
    try {
      await FirebaseDatabaseService.deleteDocument('notifications', notificationId);

      addToast({
        type: 'success',
        message: 'Notification deleted successfully'
      });

      // Reload notifications
      loadAdminNotifications();

    } catch (err) {
      console.error('❌ Unexpected error deleting notification:', err);
      addToast({
        type: 'error',
        message: 'Failed to delete notification'
      });
    }
  };


  const sidebarItems = [
    { icon: Home, label: 'Home', active: false },
    { icon: FileText, label: 'Pages', active: activeSection === 'Pages' },
    { icon: Tag, label: 'Categories', active: activeSection === 'Categories' },
    { icon: Users, label: 'Users', active: activeSection === 'Users' },
    { icon: Bell, label: 'Notifications', active: activeSection === 'Notifications' },
    { icon: MessageCircle, label: 'Support', active: activeSection === 'Support' },
    { icon: Music, label: 'Media', active: activeSection === 'Media' },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading admin data</p>
          <p className="text-slate-600 text-sm mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show admin login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h1>
              <p className="text-gray-600 text-sm">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                  placeholder="Enter password"
                  required
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl hover:bg-purple-700 active:scale-95"
              >
                Login
              </button>
            </form>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm flex items-center justify-center"
        >
          <ChevronRight className={`w-5 h-5 text-purple-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-white/20 backdrop-blur-md z-40"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-sm transition-all duration-300 ${
        sidebarCollapsed ? 'w-0 lg:w-16' : 'w-64 lg:w-64'
      } ${sidebarCollapsed ? 'lg:block' : 'block'} ${
        sidebarCollapsed ? 'hidden lg:block' : 'block'
      } fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto`}>
        <div className="p-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 items-center justify-center transition-colors"
          >
            <ChevronRight className={`w-4 h-4 text-purple-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="px-3 space-y-1">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.label === 'Pages') setActiveSection('Pages');
                else if (item.label === 'Categories') setActiveSection('Categories');
                else if (item.label === 'Users') setActiveSection('Users');
                else if (item.label === 'Support') setActiveSection('Support');
                else if (item.label === 'Media') setActiveSection('Media');
                // Auto-close sidebar on mobile after clicking
                setSidebarCollapsed(true);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.active 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
          
          {/* Current Admin Info */}
          {!sidebarCollapsed && currentAdmin && (
            <div className="pt-4 border-t border-slate-200 mb-4">
              <div className="px-3 py-2 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 font-medium mb-1">Logged in as:</p>
                <p className="text-sm font-semibold text-gray-900">{currentAdmin.fullName}</p>
                <p className="text-xs text-gray-500">@{currentAdmin.username}</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 capitalize">{currentAdmin.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50"
            >
              <X className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:ml-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-4 mt-16 lg:mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button
                onClick={() => {
                  setSelectedPage(null);
                  setSelectedCategory(null);
                }}
                className="hover:text-purple-600"
              >
                Admin
              </button>
              {!selectedPage && activeSection !== 'Pages' && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900 font-medium">{activeSection}</span>
                </>
              )}
              {selectedPage && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="hover:text-purple-600"
                  >
                    {selectedPage.name}
                  </button>
                </>
              )}
              {selectedCategory && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-900 font-medium">{selectedCategory}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Current Admin Badge */}
              {currentAdmin && (
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-900">{currentAdmin.fullName}</span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full capitalize">
                    {currentAdmin.role.replace('_', ' ')}
                  </span>
                </div>
              )}

              <a
                href="/home"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">View Site</span>
              </a>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Export</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Print</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            {selectedPage ? (selectedCategory ? selectedCategory : selectedPage.name) : 
             activeSection === 'Categories' ? 'Categories' : 
             activeSection === 'Media' ? 'Media Library' :
             activeSection === 'Users' ? 'User Management' :
             activeSection === 'Support' ? 'Support Messages' :
             activeSection === 'Pages' ? 'Pages' : 
             'Admin Dashboard'}
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-auto overflow-y-auto">
          {activeSection === 'Categories' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-semibold text-slate-900">Manage Categories</h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCategories.map((category) => (
                  <div key={category.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{category.name}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditCategory(category.name)}
                          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{category.description || 'No description'}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Media' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200 p-6">
              <MediaManager />
            </div>
          )}

          {activeSection === 'Users' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200 p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                  <p className="text-slate-600 mt-1">
                    View and manage all user profiles 
                    {users.length > 0 && (
                      <span className="ml-2 text-purple-600 font-medium">
                        ({users.length} users found)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={loadUsers}
                    disabled={isLoadingUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={async () => {
                      console.log('🔍 DEBUG: Current users state:', users);
                      console.log('🔍 DEBUG: User groups state:', userGroups);
                      console.log('🔍 DEBUG: Loading state:', isLoadingUsers);
                      
                      // Test direct query
                      console.log('🔍 DEBUG: Testing direct query...');
                      const data = await FirebaseDatabaseService.getCollection('profiles');
                      
                      console.log('🔍 DEBUG: Direct query result:', { data });
                      console.log('🔍 DEBUG: Data length:', data?.length || 0);
                      
                      if (data && data.length > 0) {
                        console.log('🔍 DEBUG: First user:', data[0]);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Debug
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Debug Info */}
              {users.length === 0 && !isLoadingUsers && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="text-yellow-800 font-medium mb-2">Debug Information</h3>
                  <p className="text-yellow-700 text-sm mb-2">
                    No users found. This could mean:
                  </p>
                  <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                    <li>No users have signed up yet</li>
                    <li>Users exist in auth.users but haven't completed profiles</li>
                    <li>Database connection issue</li>
                    <li>RLS policies blocking access</li>
                    <li>Admin permissions not configured for auth.users access</li>
                  </ul>
                  <div className="mt-3 space-x-3">
                    <button
                      onClick={loadUsers}
                      className="text-yellow-800 underline hover:text-yellow-900"
                    >
                      Retry loading users
                    </button>
                    <span className="text-yellow-600">|</span>
                    <span className="text-yellow-600 text-sm">
                      Check browser console for detailed logs
                    </span>
                  </div>
                </div>
              )}

              {/* Users List */}
              {isLoadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users
                    .filter(user => {
                      const matchesSearch = !userSearchTerm || 
                        user.first_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.last_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        user.phone_number?.toLowerCase().includes(userSearchTerm.toLowerCase());
                      
                      return matchesSearch;
                    })
                    .map((user) => (
                      <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {user.first_name} {user.middle_name} {user.last_name}
                                </h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                                <p className="text-sm font-medium">{user.phone_number || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                                <p className="text-sm font-medium">{user.gender || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Birthday</p>
                                <p className="text-sm font-medium">{user.birthday || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Region</p>
                                <p className="text-sm font-medium">{user.region || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Zone</p>
                                <p className="text-sm font-medium">{user.zone || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Church</p>
                                <p className="text-sm font-medium">{user.church || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Designation</p>
                                <p className="text-sm font-medium">{user.designation || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Administration</p>
                                <p className="text-sm font-medium">{user.administration || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Groups</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {userGroups[user.id]?.length > 0 ? (
                                    userGroups[user.id].map((group, index) => (
                                      <span key={index} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                        {group}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-500">No groups</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-2 h-2 rounded-full ${user.profile_completed ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                <span className="text-sm text-gray-600">
                                  {user.profile_completed ? 'Profile Completed' : 'Profile Incomplete'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {users.filter(user => {
                    const matchesSearch = !userSearchTerm || 
                      user.first_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.last_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.phone_number?.toLowerCase().includes(userSearchTerm.toLowerCase());
                    
                    return matchesSearch;
                  }).length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No users found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === 'Notifications' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200 p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Notifications Management</h2>
                  <p className="text-slate-600 mt-1">
                    Create and manage notifications for all users or specific groups
                    {adminNotifications.length > 0 && (
                      <span className="ml-2 text-purple-600 font-medium">
                        ({adminNotifications.length} notifications)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={loadAdminNotifications}
                  disabled={isLoadingAdminNotifications}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingAdminNotifications ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Create Notification Form */}
              <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Notification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter notification title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={notificationForm.category}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="system">System</option>
                      <option value="rehearsal">Rehearsal</option>
                      <option value="announcement">Announcement</option>
                      <option value="reminder">Reminder</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={notificationForm.priority}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter notification message"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <select
                      value={notificationForm.targetAudience}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="group">Specific Group</option>
                    </select>
                  </div>
                  {notificationForm.targetAudience === 'group' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                      <input
                        type="text"
                        value={notificationForm.targetGroup}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, targetGroup: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter group name"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action URL (Optional)</label>
                    <input
                      type="url"
                      value={notificationForm.actionUrl}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, actionUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expires At (Optional)</label>
                    <input
                      type="datetime-local"
                      value={notificationForm.expiresAt}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={createNotification}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Send Notification
                </button>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>

                {isLoadingAdminNotifications ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading notifications...</p>
                  </div>
                ) : adminNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No notifications sent yet</p>
                  </div>
                ) : (
                  adminNotifications.map((notification) => (
                    <div key={notification.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {notification.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              notification.category === 'admin' ? 'bg-purple-100 text-purple-700' :
                              notification.category === 'system' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {notification.category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Target: {notification.target_audience === 'all' ? 'All Users' : notification.target_group || 'Individual'}</span>
                            <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAdminNotification(notification.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === 'Support' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200 p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Support Messages</h2>
                  <p className="text-slate-600 mt-1">
                    Manage customer support messages and responses
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={loadSupportMessages}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Support Messages List */}
              <WhatsAppAdminSupport />
            </div>
          )}

          {activeSection === 'Pages' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-lg shadow-sm border border-slate-200 p-6">

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  {!selectedPage && (
                    <button
                      onClick={() => setShowPageModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Page
                    </button>
                  )}
                  {selectedPage && !selectedCategory && (
                    <button
                      onClick={() => {
                        setEditingSong(null);
                        setShowSongModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Song
                    </button>
                  )}
                  {selectedCategory && (
                    <button
                      onClick={() => {
                        setEditingSong(null);
                        setShowSongModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add Content
                    </button>
                  )}
              </div>

              {/* Main Content Area */}
              {!selectedPage && (
                /* Pages List */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {pages.map((page) => (
                    <div 
                      key={page.id} 
                      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:border-purple-200 transition-all duration-200 cursor-pointer group"
                      onClick={() => setSelectedPage(page)}
                    >
                      {/* Header with Icon and Title */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div 
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: '#8B5CF6' }}
                          >
                            <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-slate-900 text-base sm:text-lg truncate group-hover:text-purple-700 transition-colors">
                              {page.name}
                            </h3>
                            <p className="text-sm text-slate-600 truncate mt-0.5">{page.date}</p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPage(page);
                            }}
                            className="p-2 sm:p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Songs"
                          >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPage(page);
                            }}
                            className="p-2 sm:p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Page"
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(page);
                            }}
                            className="p-2 sm:p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <p className="text-sm text-slate-600 font-medium">Praise Night Event</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                            </div>
                            <span className="truncate">{page.location}</span>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap flex-shrink-0">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPage && !selectedCategory && (
                <div>
                  {/* Page Songs View */}
                  <div className="mb-8">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                      <select 
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'heard' | 'unheard')}
                      >
                        <option value="all">All Status</option>
                        <option value="heard">Heard</option>
                        <option value="unheard">Unheard</option>
                      </select>
                      <select 
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {pageCategories.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                      <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 w-full sm:w-auto">
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Saved filters</span>
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
                      <button 
                        className={`pb-3 font-medium transition-colors ${
                          statusFilter === 'all' 
                            ? 'border-b-2 border-purple-600 text-purple-600' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        onClick={() => setStatusFilter('all')}
                      >
                        All Songs {(() => {
                          const filteredSongs = allSongs.filter(song => song.praiseNightId === selectedPage.id);
                          console.log('🎵 Admin - Filtered Songs for Page', selectedPage?.id, ':', filteredSongs.length, filteredSongs.map(s => s.title));
                          return filteredSongs.length;
                        })()}
                      </button>
                      <button 
                        className={`pb-3 font-medium transition-colors ${
                          statusFilter === 'heard' 
                            ? 'border-b-2 border-purple-600 text-purple-600' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        onClick={() => setStatusFilter('heard')}
                      >
                        Heard {allSongs.filter(song => song.praiseNightId === selectedPage.id && song.status === 'heard').length}
                      </button>
                      <button 
                        className={`pb-3 font-medium transition-colors ${
                          statusFilter === 'unheard' 
                            ? 'border-b-2 border-purple-600 text-purple-600' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        onClick={() => setStatusFilter('unheard')}
                      >
                        Unheard {allSongs.filter(song => song.praiseNightId === selectedPage.id && song.status === 'unheard').length}
                      </button>
                    </div>

                    {/* Songs Table - Desktop */}
                    <div className="hidden lg:block overflow-x-auto overflow-y-auto max-h-[60vh]">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Song</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Lead Singer</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Writer</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Conductor</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Key</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Tempo</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allSongs
                            .filter(song => song.praiseNightId === selectedPage.id)
                            .filter(song => {
                              const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
                              const matchesStatus = statusFilter === 'all' || song.status === statusFilter;
                              const matchesCategory = categoryFilter === 'all' || song.category === categoryFilter;
                              return matchesSearch && matchesStatus && matchesCategory;
                            })
                            .slice(startIndex, startIndex + itemsPerPage)
                            .map((song, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-slate-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Music className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">{song.title}</div>
                                    <div className="text-sm text-gray-500">
                                      {song.leadKeyboardist} • {song.leadGuitarist} • {song.drummer}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-blue-800 whitespace-nowrap">
                                  {song.category}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <button
                                  onClick={() => handleToggleSongStatus(song)}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                    song.status === 'heard' 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  }`}
                                >
                                  {song.status === 'heard' ? 'Heard' : 'Unheard'}
                                </button>
                              </td>
                              <td className="py-4 px-4 text-sm text-slate-900">{song.leadSinger}</td>
                              <td className="py-4 px-4 text-sm text-slate-900">{song.writer}</td>
                              <td className="py-4 px-4 text-sm text-slate-900">{song.conductor}</td>
                              <td className="py-4 px-4 text-sm text-slate-900">{song.key}</td>
                              <td className="py-4 px-4 text-sm text-slate-900">{song.tempo}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleEditSong(song)}
                                    className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteSong(song)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Songs Cards - Mobile */}
                    <div className="lg:hidden space-y-4 overflow-y-auto max-h-[60vh]">
                      {allSongs
                        .filter(song => song.praiseNightId === selectedPage.id)
                        .filter(song => {
                          const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesStatus = statusFilter === 'all' || song.status === statusFilter;
                          const matchesCategory = categoryFilter === 'all' || song.category === categoryFilter;
                          return matchesSearch && matchesStatus && matchesCategory;
                        })
                        .slice(startIndex, startIndex + itemsPerPage)
                        .map((song, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Music className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 truncate">{song.title}</h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-blue-800 whitespace-nowrap">
                                    {song.category}
                                  </span>
                                  <button
                                    onClick={() => handleToggleSongStatus(song)}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                      song.status === 'heard' 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    }`}
                                  >
                                    {song.status === 'heard' ? 'Heard' : 'Unheard'}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEditSong(song)}
                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSong(song)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-slate-500">Lead Singer:</span>
                              <p className="font-medium text-slate-900 truncate">{song.leadSinger}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Writer:</span>
                              <p className="font-medium text-slate-900 truncate">{song.writer}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Conductor:</span>
                              <p className="font-medium text-slate-900 truncate">{song.conductor}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Key:</span>
                              <p className="font-medium text-slate-900">{song.key}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                              <span className="font-medium">Musicians:</span> {song.leadKeyboardist} • {song.leadGuitarist} • {song.drummer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {Math.ceil(allSongs.filter(song => song.praiseNightId === selectedPage.id).length / itemsPerPage) > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Page {currentPage} of {Math.ceil(allSongs.filter(song => song.praiseNightId === selectedPage.id).length / itemsPerPage)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(allSongs.filter(song => song.praiseNightId === selectedPage.id).length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                  page === currentPage 
                                    ? 'bg-purple-600 text-white' 
                                    : 'text-slate-600 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPage(Math.min(Math.ceil(allSongs.filter(song => song.praiseNightId === selectedPage.id).length / itemsPerPage), currentPage + 1))}
                            disabled={currentPage === Math.ceil(allSongs.filter(song => song.praiseNightId === selectedPage.id).length / itemsPerPage)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories in this Page</h3>
                    <div className="flex flex-wrap gap-2">
                      {pageCategories.map((category) => (
                        <div
                          key={category.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                          onClick={() => setSelectedCategory(category.name)}
                          title={`${allSongs.filter(song => song.praiseNightId === selectedPage.id && song.category === category.name).length} items in this category`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full bg-purple-500"
                          ></div>
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-500">
                            ({allSongs.filter(song => song.praiseNightId === selectedPage.id && song.category === category.name).length})
                          </span>
                        </div>
                      ))}
                      {pageCategories.length === 0 && (
                        <div className="text-sm text-gray-500 italic">
                          No categories found. Use the Categories section to create categories.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory && (
                /* Content List */
                <div className="space-y-4">
                  {categoryContent.map((content, index) => (
                    <div key={`${content.title}-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{content.title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                              <span>Lead: {content.leadSinger || 'N/A'}</span>
                              <span>Writer: {content.writer || 'N/A'}</span>
                              <span>Key: {content.key || 'N/A'}</span>
                              <span>Tempo: {content.tempo || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                            content.status === 'heard' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {content.status}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCategoryContent(content)}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Content"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategoryContent(content.title)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Content"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {categoryContent.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No content in this category yet.</p>
                      <p className="text-sm">Click "Add Song" to get started.</p>
                    </div>
                  )}
                </div>
              )}





            </div>
          )}
        </main>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="bg-white w-full h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                {(editingPageCategory || editingCategory) ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingPageCategory(null);
                  setEditingCategory(null);
                  setNewPageCategoryName('');
                }}
                className="text-slate-400 hover:text-slate-600 p-2 -mr-2"
              >
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                    Category Name
                </label>
                <input
                  type="text"
                value={newPageCategoryName}
                onChange={(e) => setNewPageCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                  placeholder="Enter category name"
                />
              </div>
              
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                  <button
                    onClick={(editingPageCategory || editingCategory) ? (editingPageCategory ? handleUpdatePageCategory : handleUpdateCategory) : (activeSection === 'Categories' ? handleAddCategory : handleAddPageCategory)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm sm:text-base">{(editingPageCategory || editingCategory) ? 'Update' : 'Add'} Category</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingPageCategory(null);
                      setEditingCategory(null);
                      setNewPageCategoryName('');
                    }}
                    className="w-full sm:w-auto px-4 py-3 border border-gray-300 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Praise Night Modal */}
      {/* Page Modal */}
      {showPageModal && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="bg-white w-full h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                {editingPage ? 'Edit Page' : 'Add New Page'}
              </h3>
              <button
                onClick={() => {
                  setShowPageModal(false);
                  setEditingPage(null);
                  setNewPageName('');
                  setNewPageDate('');
                  setNewPageLocation('');
                  setNewPageDescription('');
                  setNewPageCategory('unassigned');
                  setNewPageBannerImage('');
                  setNewPageBannerFile(null);
                  setNewPageDays(0);
                  setNewPageHours(0);
                  setNewPageMinutes(0);
                  setNewPageSeconds(0);
                  // Reset file input
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="text-slate-400 hover:text-slate-600 p-2 -mr-2"
              >
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                  Page Name
                </label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                  placeholder="e.g., Your Loveworld Special"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                  Date
                </label>
                <input
                  type="text"
                  value={newPageDate}
                  onChange={(e) => setNewPageDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                  placeholder="e.g., 21st September 2025"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                  Location
                </label>
                <input
                  type="text"
                  value={newPageLocation}
                  onChange={(e) => setNewPageLocation(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                  placeholder="e.g., Oasis Studio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                  Description
                </label>
                <textarea
                  value={newPageDescription}
                  onChange={(e) => setNewPageDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                  placeholder="Enter description for this page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                  Banner Image
                </label>

                {/* Hidden file input */}
                <input
                  id="banner-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Store the actual file for upload
                      setNewPageBannerFile(file);
                      // Create a preview URL for the uploaded image
                      const previewUrl = URL.createObjectURL(file);
                      setNewPageBannerImage(previewUrl);
                    }
                  }}
                  className="hidden"
                />

                {/* Choose Image Button */}
                <button
                  type="button"
                  onClick={() => document.getElementById('banner-image-input')?.click()}
                  className="w-full px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg border-2 border-purple-300 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {newPageBannerFile ? 'Change Image' : 'Choose Image'}
                </button>

                {newPageBannerImage && (
                  <div className="mt-3">
                    <img
                      src={newPageBannerImage}
                      alt="Banner preview"
                      className="w-full h-40 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-600">
                        {newPageBannerFile ? `Selected: ${newPageBannerFile.name}` : 'Current banner image'}
                      </p>
                      {newPageBannerFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewPageBannerFile(null);
                            setNewPageBannerImage(editingPage?.bannerImage || '');
                            const fileInput = document.getElementById('banner-image-input') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Upload a banner image for this page (JPG, PNG, WebP - Max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                  Category
                </label>
                <select
                  value={newPageCategory}
                  onChange={(e) => setNewPageCategory(e.target.value as 'unassigned' | 'pre-rehearsal' | 'ongoing' | 'archive')}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="pre-rehearsal">Pre-Rehearsal</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="archive">Archive</option>
                </select>
              </div>
            </div>

            {/* Countdown Timer Section */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Countdown Timer</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                    Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPageDays}
                    onChange={(e) => setNewPageDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                    Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newPageHours}
                    onChange={(e) => setNewPageHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newPageMinutes}
                    onChange={(e) => setNewPageMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 transition-all duration-200">
                    Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newPageSeconds}
                    onChange={(e) => setNewPageSeconds(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            </div>
              
            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => {
                  console.log('🔘 Update/Add button clicked');
                  console.log('editingPage:', editingPage);
                  if (editingPage) {
                    console.log('🔄 Calling handleUpdatePage');
                    handleUpdatePage();
                  } else {
                    console.log('➕ Calling handleAddPage');
                    handleAddPage();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm sm:text-base">{editingPage ? 'Update' : 'Add'} Page</span>
              </button>
              <button
                onClick={() => {
                  setShowPageModal(false);
                  setEditingPage(null);
                  setNewPageName('');
                  setNewPageDate('');
                  setNewPageLocation('');
                  setNewPageDescription('');
                  setNewPageCategory('unassigned');
                  setNewPageBannerImage('');
                  setNewPageBannerFile(null);
                  setNewPageDays(0);
                  setNewPageHours(0);
                  setNewPageMinutes(0);
                  setNewPageSeconds(0);
                  // Reset file input
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 text-gray-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Message Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Reply to Support Message</h3>
                <p className="text-sm text-gray-600 mt-1">From: {selectedMessage.user_name}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setReplyText('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Original Message:</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">{selectedMessage.subject}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Category: {selectedMessage.category}</span>
                    <span>Priority: {selectedMessage.priority}</span>
                    <span>Date: {new Date(selectedMessage.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedMessage.admin_response && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Previous Response:</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 whitespace-pre-wrap">{selectedMessage.admin_response}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Sent on {new Date(selectedMessage.admin_responded_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedMessage.admin_response ? 'Update Response:' : 'Your Response:'}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setReplyText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReplyToMessage(selectedMessage.id)}
                disabled={replying || !replyText.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {replying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Song Edit Modal */}
      <EditSongModal
        isOpen={showSongModal}
        onClose={() => {
          setShowSongModal(false);
          setEditingSong(null);
        }}
        song={editingSong}
        categories={allCategories}
         praiseNightCategories={pages.map(page => ({ id: page.id, name: page.name, description: 'Praise Night Event', date: page.date, location: page.location, icon: 'Music', color: '#8B5CF6', isActive: true, createdAt: new Date(), updatedAt: new Date(), countdown: page.countdown }))}
        onUpdate={handleSaveSong}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && pageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Page</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the page:
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{pageToDelete.name}</p>
                <p className="text-sm text-gray-500">{pageToDelete.location}</p>
                <p className="text-sm text-gray-500">{pageToDelete.date}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeletePage}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePage}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Song Confirmation Dialog */}
      {showDeleteSongDialog && songToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Song</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the song:
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{songToDelete.title}</p>
                <p className="text-sm text-gray-500">Lead Singer: {songToDelete.leadSinger || 'Not specified'}</p>
                <p className="text-sm text-gray-500">Status: {songToDelete.status}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteSong}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSong}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Song
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      {showDeleteCategoryDialog && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the category:
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900">{categoryToDelete.name}</p>
                <p className="text-sm text-gray-500">{categoryToDelete.description}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteCategory}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}