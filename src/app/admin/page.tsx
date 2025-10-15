"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Music, Tag, Users } from "lucide-react";
import { PraiseNightSong, Comment, PraiseNight, Category } from '../../types/supabase';
import { useAdminData } from '../../hooks/useAdminData';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { FirebaseAuthService } from '@/lib/firebase-auth';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'; // NEW FRESH SERVICE!
import { logAdminAction } from '@/lib/admin-activity-logger';
import { versionManager } from '@/utils/versionManager';
import { uploadBannerImage } from '@/utils/imageUpload';
import { ToastContainer, Toast } from '../../components/Toast';

// Import admin components
import AdminAuth, { AdminUser, ADMIN_USERS } from '../../components/admin/AdminAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
import PagesSection from '../../components/admin/PagesSection';
import CategoriesSection from '../../components/admin/CategoriesSection';
import MediaSection from '../../components/admin/MediaSection';
import MembersSection from '../../components/admin/MembersSection';
import SimpleNotificationsSection from '../../components/admin/SimpleNotificationsSection';
import AdminModals from '../../components/admin/AdminModals';

export default function AdminPage() {
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // UI state
  const [activeSection, setActiveSection] = useState('Pages');
  const [selectedPage, setSelectedPage] = useState<PraiseNight | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [showPageModal, setShowPageModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PraiseNight | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPageCategory, setEditingPageCategory] = useState<any | null>(null);
  const [editingSong, setEditingSong] = useState<PraiseNightSong | null>(null);

  // Form states for new page
  const [newPageName, setNewPageName] = useState('');
  const [newPageDate, setNewPageDate] = useState('');
  const [newPageLocation, setNewPageLocation] = useState('');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newPageCategory, setNewPageCategory] = useState<'unassigned' | 'pre-rehearsal' | 'ongoing' | 'archive'>('unassigned');
  const [newPageDays, setNewPageDays] = useState(0);
  const [newPageHours, setNewPageHours] = useState(0);
  const [newPageMinutes, setNewPageMinutes] = useState(0);
  const [newPageSeconds, setNewPageSeconds] = useState(0);
  const [newPageBannerImage, setNewPageBannerImage] = useState('');
  const [newPageBannerFile, setNewPageBannerFile] = useState<File | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Form states for new category
  const [newPageCategoryName, setNewPageCategoryName] = useState('');

  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteSongDialog, setShowDeleteSongDialog] = useState(false);
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PraiseNight | null>(null);
  const [songToDelete, setSongToDelete] = useState<PraiseNightSong | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'heard' | 'unheard'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Get admin data (optimized for fast loading)
  const {
    pages: allPraiseNights,
    loading,
    error,
    getCurrentPage,
    getCurrentSongs,
    refreshData
  } = useAdminData();

  // Songs for the selected page (loaded on demand)
  const [allSongs, setAllSongs] = useState<PraiseNightSong[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  // Load songs when a page is selected
  useEffect(() => {
    if (selectedPage) {
      setLoadingSongs(true);
      // Force refresh songs (don't use cache) to avoid showing deleted songs
      getCurrentSongs(selectedPage.id, true).then(songs => {
        console.log(`📊 Loaded ${songs.length} songs for page ${selectedPage.id}`);
        setAllSongs(songs);
        setLoadingSongs(false);
      }).catch(error => {
        console.error('Error loading songs:', error);
        setAllSongs([]);
        setLoadingSongs(false);
      });
    } else {
      setAllSongs([]);
    }
  }, [selectedPage, getCurrentSongs]);

  // Categories from database
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // Get all available categories from songs (only when songs are loaded)
  const allAvailableCategories = useMemo(() => {
    if (allSongs.length === 0) return [];
    const songCategoryNames = allSongs.map((song: PraiseNightSong) => song.category);
    // Remove duplicates and return unique category names
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
        setDbCategories(mappedCategories as any);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Check for existing admin session on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem('adminSession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        const admin = ADMIN_USERS.find(u => u.id === sessionData.adminId);
        if (admin && sessionData.timestamp && (Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000)) {
          setCurrentAdmin(admin);
          setIsAuthenticated(true);
          console.log('🔐 Admin session restored:', admin.username);
        } else {
          localStorage.removeItem('adminSession');
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        localStorage.removeItem('adminSession');
      }
    }
  }, []);

  // Get pages from Firebase (includes unassigned for admin)
  const pages = useMemo(() => {
    console.log('🔍 Pages useMemo triggered:', { loading, allPraiseNights: allPraiseNights?.length, showPageModal });
    
    if (loading) {
      console.log('⏳ Still loading...');
      return [];
    }
    
    if (!allPraiseNights) {
      console.log('❌ No allPraiseNights data');
      return [];
    }
    
    console.log('📄 Admin pages loaded:', allPraiseNights.length, 'pages');
    console.log('📄 All pages data:', allPraiseNights);
    return allPraiseNights;
  }, [allPraiseNights, loading]);

  // Toast helper functions
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Note: Authentication is now handled by the AdminAuth component
  // But we still need handleAdminLogout for the sidebar
  const handleAdminLogout = () => {
    if (currentAdmin) {
      console.log('🔐 Admin logged out:', currentAdmin.username);
    }

    setCurrentAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');

    addToast({
      type: 'info',
      message: 'You have been successfully logged out.'
    });

    // Force page reload to show login screen
    window.location.reload();
  };

  // Category management functions
  const handleAddCategory = async () => {
    console.log('🎯 handleAddCategory called with name:', newPageCategoryName);

    if (!newPageCategoryName.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a category name'
      });
      return;
    }

    try {
      const newCategory: Omit<Category, 'id'> = {
        name: newPageCategoryName.trim(),
        description: `Category: ${newPageCategoryName.trim()}`,
        icon: 'Tag',
        color: '#8B5CF6',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await FirebaseDatabaseService.createCategory(newCategory);

      if (result.success) {
        console.log('✅ Category added successfully');
        addToast({
          type: 'success',
          message: 'Category added successfully'
        });

        // Reload categories from database
        const categories = await FirebaseDatabaseService.getCollection('categories');
        setDbCategories(categories as any);

        setNewPageCategoryName('');
        setShowCategoryModal(false);
        refreshData(); // Refresh all data to ensure UI is updated

        // Log admin action
        if (currentAdmin) {
          logAdminAction.createCategory(currentAdmin, newCategory.name);
        }
      } else {
        throw new Error(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('❌ Error adding category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add category'
      });
    }
  };

  const handleEditCategory = (categoryName: string) => {
    const category = allCategories.find(c => c.name === categoryName);
    if (category) {
      // Check if this is a real database category or a song-based category
      const isDbCategory = dbCategories.some(dbCat => dbCat.id === category.id);

      if (!isDbCategory) {
        // This is a song-based category that doesn't exist in the database yet
        addToast({
          type: 'error',
          message: 'This category only exists in songs. Please create it in the database first to edit it.'
        });
        return;
      }

      setEditingCategory(category);
      setNewPageCategoryName(category.name);
      setShowCategoryModal(true);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newPageCategoryName.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter a category name'
      });
      return;
    }

    try {
      console.log('🔄 Updating category with ID:', editingCategory.id, 'Name:', newPageCategoryName.trim());

      // Prepare update data (only the fields that can be updated)
      const updateData = {
        name: newPageCategoryName.trim(),
        description: `Category: ${newPageCategoryName.trim()}`,
        updatedAt: new Date().toISOString()
      };

      // Use the Firebase document ID directly
      const result = await FirebaseDatabaseService.updateCategory(editingCategory.id, updateData);

      if (result.success) {
        console.log('✅ Category updated successfully');
        addToast({
          type: 'success',
          message: 'Category updated successfully'
        });

        // Reload categories from database
        const categories = await FirebaseDatabaseService.getCollection('categories');
        setDbCategories(categories as any);

        setEditingCategory(null);
        setNewPageCategoryName('');
        setShowCategoryModal(false);
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.updateCategory(currentAdmin, `Updated category: ${newPageCategoryName.trim()}`);
        }
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('❌ Error updating category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update category'
      });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    // Check if this is a real database category or a song-based category
    const isDbCategory = dbCategories.some(dbCat => dbCat.id === category.id);

    if (!isDbCategory) {
      // This is a song-based category that doesn't exist in the database
      addToast({
        type: 'error',
        message: 'This category only exists in songs and cannot be deleted from here. Update the songs to remove this category.'
      });
      return;
    }

    setCategoryToDelete(category);
    setShowDeleteCategoryDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      console.log('🗑️ Deleting category with ID:', categoryToDelete.id);

      // Use the Firebase document ID directly
      const result = await FirebaseDatabaseService.deleteCategory(categoryToDelete.id);

      if (result.success) {
        console.log('✅ Category deleted successfully');
        addToast({
          type: 'success',
          message: 'Category deleted successfully'
        });

        // Reload categories from database
        const categories = await FirebaseDatabaseService.getCollection('categories');
        setDbCategories(categories as any);

        setShowDeleteCategoryDialog(false);
        setCategoryToDelete(null);
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.deleteCategory(currentAdmin, `Deleted category: ${categoryToDelete.name}`);
        }
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete category'
      });
    }
  };

  const cancelDeleteCategory = () => {
    setShowDeleteCategoryDialog(false);
    setCategoryToDelete(null);
  };

  // Page management functions
  const handleAddPage = async () => {
    if (!newPageName.trim() || !newPageDate.trim() || !newPageLocation.trim()) {
      addToast({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsCreatingPage(true);

    try {
      // Create the page first to get a Firebase-generated ID for banner upload
      const newPage: Omit<PraiseNight, 'id'> = {
        name: newPageName.trim(),
        date: newPageDate.trim(),
        location: newPageLocation.trim(),
        category: newPageCategory,
        countdown: {
          days: newPageDays,
          hours: newPageHours,
          minutes: newPageMinutes,
          seconds: newPageSeconds
        },
        songs: [],
        bannerImage: newPageBannerImage,
        firebaseId: ''
      };

      console.log('🔥 Creating page with data:', newPage);
      const result = await FirebaseDatabaseService.addPraiseNight(newPage);

      if (result.success && result.id) {
        console.log('✅ Page created with Firebase-generated ID:', result.id);

        // Upload banner image if a new file was selected
        let bannerImageUrl = newPageBannerImage;
        if (newPageBannerFile) {
          console.log('📤 Uploading banner image for Firebase ID:', result.id);
          const uploadResult = await uploadBannerImage(newPageBannerFile, result.id);
          if (uploadResult.success && uploadResult.url) {
            bannerImageUrl = uploadResult.url;
            console.log('✅ Banner image uploaded:', bannerImageUrl);

            // Update the page with the banner image URL
            await FirebaseDatabaseService.updatePraiseNight(result.id, {
              bannerImage: bannerImageUrl
            });
          } else {
            console.warn('⚠️ Banner image upload failed:', uploadResult.error);
          }
        }

        addToast({
          type: 'success',
          message: 'Page created successfully!'
        });

        // Reset form
        setNewPageName('');
        setNewPageDate('');
        setNewPageLocation('');
        setNewPageDescription('');
        setNewPageCategory('unassigned');
        setNewPageDays(0);
        setNewPageHours(0);
        setNewPageMinutes(0);
        setNewPageSeconds(0);
        setNewPageBannerImage('');
        setNewPageBannerFile(null);
        setShowPageModal(false);
        refreshData();

        console.log('✅ Page creation completed successfully');
      } else {
        throw new Error('Failed to add page');
      }
    } catch (error) {
      console.error('❌ Error adding page:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add page'
      });
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleEditPage = (page: PraiseNight) => {
    setEditingPage(page);
    setNewPageName(page.name);
    setNewPageDate(page.date);
    setNewPageLocation(page.location);
    setNewPageDescription(''); // Description not supported in PraiseNight type
    setNewPageCategory(page.category);

    // Use countdown object directly
    setNewPageDays(page.countdown.days);
    setNewPageHours(page.countdown.hours);
    setNewPageMinutes(page.countdown.minutes);
    setNewPageSeconds(page.countdown.seconds);
    setNewPageBannerImage(page.bannerImage || '');
    setNewPageBannerFile(null);
    setShowPageModal(true);
  };

  const handleUpdatePage = async () => {
    if (!editingPage || !newPageName.trim() || !newPageDate.trim() || !newPageLocation.trim()) {
      addToast({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsCreatingPage(true);

    try {
      let bannerImageUrl = newPageBannerImage;

      // Upload banner image if a new file was selected
      if (newPageBannerFile) {
        console.log('📤 Uploading banner image...');
        const uploadResult = await uploadBannerImage(newPageBannerFile, editingPage.id);
        if (uploadResult.success && uploadResult.url) {
          bannerImageUrl = uploadResult.url;
          console.log('✅ Banner image uploaded:', bannerImageUrl);
        } else {
          throw new Error(uploadResult.error || 'Failed to upload banner image');
        }
      }

      const updatedPageData = {
        name: newPageName.trim(),
        date: newPageDate.trim(),
        location: newPageLocation.trim(),
        category: newPageCategory,
        countdown: {
          days: newPageDays,
          hours: newPageHours,
          minutes: newPageMinutes,
          seconds: newPageSeconds
        },
        bannerImage: bannerImageUrl
      };

      const result = await FirebaseDatabaseService.updatePraiseNight(editingPage.firebaseId || editingPage.id.toString(), updatedPageData);

      if (result.success) {
        console.log('✅ Page updated successfully');
        addToast({
          type: 'success',
          message: 'Page updated successfully'
        });

        // Reset form
        setEditingPage(null);
        setNewPageName('');
        setNewPageDate('');
        setNewPageLocation('');
        setNewPageDescription('');
        setNewPageCategory('unassigned');
        setNewPageDays(0);
        setNewPageHours(0);
        setNewPageMinutes(0);
        setNewPageSeconds(0);
        setNewPageBannerImage('');
        setNewPageBannerFile(null);
        setShowPageModal(false);
        refreshData();

        console.log('✅ Page update completed successfully');
      } else {
        throw new Error('Failed to update page');
      }
    } catch (error) {
      console.error('❌ Error updating page:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update page'
      });
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleDeletePage = (page: PraiseNight) => {
    setPageToDelete(page);
    setShowDeleteDialog(true);
  };

  const confirmDeletePage = async () => {
    if (!pageToDelete) return;

    try {
      const result = await FirebaseDatabaseService.deletePraiseNight(pageToDelete.firebaseId || pageToDelete.id.toString());

      if (result.success) {
        console.log('✅ Page deleted successfully');
        addToast({
          type: 'success',
          message: 'Page deleted successfully'
        });

        setShowDeleteDialog(false);
        setPageToDelete(null);
        if (selectedPage?.id === pageToDelete.id) {
          setSelectedPage(null);
        }
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.deletePage(currentAdmin, `Deleted page: ${pageToDelete.name}`);
        }
      } else {
        throw new Error('Failed to delete page');
      }
    } catch (error) {
      console.error('❌ Error deleting page:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete page'
      });
    }
  };

  const cancelDeletePage = () => {
    setShowDeleteDialog(false);
    setPageToDelete(null);
  };

  // Song management functions
  const handleEditSong = (song: PraiseNightSong) => {
    console.log('🎵 [FRESH] Editing song:', song.title, 'ID:', song.id);
    setEditingSong(song);
    setShowSongModal(true);
  };

  const handleDeleteSong = (song: PraiseNightSong) => {
    setSongToDelete(song);
    setShowDeleteSongDialog(true);
  };

  const handleToggleSongStatus = async (song: PraiseNightSong) => {
    try {
      const newStatus = song.status === 'heard' ? 'unheard' : 'heard';

      if (!song.id) {
        throw new Error('Invalid song ID for status update');
      }

      const result = await PraiseNightSongsService.updateSongStatus(song.id, newStatus);

      if (result.success) {
        console.log('✅ [FRESH] Song status updated successfully');
        addToast({
          type: 'success',
          message: `Song marked as ${newStatus}`
        });
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.updateSong(currentAdmin, `Updated song status: ${song.title} -> ${newStatus}`);
        }
      } else {
        throw new Error(result.error || 'Failed to update song status');
      }
    } catch (error) {
      console.error('❌ Error updating song status:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update song status'
      });
    }
  };

  const handleToggleSongActive = async (song: PraiseNightSong) => {
    try {
      const newActiveStatus = !(song as any).isActive;

      if (!song.id) {
        throw new Error('Invalid song ID for active status update');
      }

      const result = await PraiseNightSongsService.updateSong(song.id, {
        isActive: newActiveStatus
      });

      if (result.success) {
        console.log('✅ [FRESH] Song active status updated successfully');
        addToast({
          type: 'success',
          message: newActiveStatus ? `🔴 ${song.title} is now ACTIVE (users see blinking border)` : `Song deactivated`
        });
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.updateSong(currentAdmin, `Set song active status: ${song.title} -> ${newActiveStatus ? 'ACTIVE' : 'INACTIVE'}`);
        }
      } else {
        throw new Error(result.error || 'Failed to update song active status');
      }
    } catch (error) {
      console.error('❌ Error updating song active status:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update song active status'
      });
    }
  };

  const handleSaveSong = async (songData: PraiseNightSong) => {
    try {
      console.log('💾 [FRESH] Saving song:', songData.title);

      let result;

      // SIMPLE: Check if we're editing (has ID) or creating (no ID)
      const isEditingExistingSong = editingSong && editingSong.id;

      if (isEditingExistingSong) {
        // UPDATE existing song
        console.log('🔄 [FRESH] Updating song ID:', editingSong.id);

        result = await PraiseNightSongsService.updateSong(editingSong.id!, songData);

        if (result.success) {
          console.log('✅ [FRESH] Song updated successfully');
          addToast({
            type: 'success',
            message: 'Song updated successfully'
          });

          // Log admin action
          if (currentAdmin) {
            logAdminAction.updateSong(currentAdmin, `Updated song: ${songData.title}`);
          }
        } else {
          console.error('❌ [FRESH] Song update failed:', result.error);
          addToast({
            type: 'error',
            message: result.error || 'Failed to update song'
          });
        }
      } else {
        // CREATE new song
        console.log('➕ [FRESH] Creating new song');

        // Ensure praiseNightId is set
        const newSongData = {
          ...songData,
          praiseNightId: selectedPage?.firebaseId || selectedPage?.id || songData.praiseNightId
        };

        result = await PraiseNightSongsService.createSong(newSongData);

        if (result.success) {
          console.log('✅ [FRESH] Song created with ID:', result.id);
          addToast({
            type: 'success',
            message: 'Song added successfully'
          });

          // Log admin action
          if (currentAdmin) {
            logAdminAction.addSong(currentAdmin, songData.title, songData.category);
          }
        } else {
          console.error('❌ [FRESH] Song creation failed:', result.error);
          addToast({
            type: 'error',
            message: result.error || 'Failed to create song'
          });
        }
      }

      if (result?.success) {
        console.log('✅ Song operation successful, refreshing data...');
        console.log('🎵 Result from song operation:', result);
        setEditingSong(null);
        setShowSongModal(false);
        
        // Add a small delay to ensure Firebase has processed the change
        setTimeout(() => {
          console.log('🔄 Calling refreshData after delay...');
          refreshData();
        }, 500);
      } else {
        throw new Error('Failed to save song');
      }
    } catch (error) {
      console.error('❌ Error saving song:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save song'
      });
    }
  };

  const confirmDeleteSong = async () => {
    if (!songToDelete) return;

    try {
      if (!songToDelete.id) {
        throw new Error('No valid song ID found for deletion');
      }

      console.log('🗑️ [FRESH] Deleting song:', songToDelete.title, 'ID:', songToDelete.id);

      const deleteResult = await PraiseNightSongsService.deleteSong(songToDelete.id);

      if (deleteResult.success) {
        console.log('✅ [FRESH] Song deleted successfully');
        addToast({
          type: 'success',
          message: 'Song deleted successfully'
        });

        setShowDeleteSongDialog(false);
        setSongToDelete(null);
        refreshData();

        // Log admin action
        if (currentAdmin) {
          logAdminAction.deleteSong(currentAdmin, songToDelete.title);
        }
      } else {
        throw new Error(deleteResult.error || 'Failed to delete song');
      }
    } catch (error) {
      console.error('❌ Error deleting song:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete song'
      });
    }
  };

  const cancelDeleteSong = () => {
    setShowDeleteSongDialog(false);
    setSongToDelete(null);
  };

  // Additional category functions for page categories
  const handleAddPageCategory = async () => {
    // Same as handleAddCategory but for page-specific categories
    await handleAddCategory();
  };

  const handleUpdatePageCategory = async () => {
    // Same as handleUpdateCategory but for page-specific categories
    await handleUpdateCategory();
  };

  const handleEditCategoryContent = (content: any) => {
    // Handle editing category content (songs)
    if (content && content.id) {
      handleEditSong(content);
    }
  };

  const handleDeleteCategoryContent = (id: string) => {
    // Handle deleting category content (songs)
    const song = allSongs.find(s => s.id?.toString() === id);
    if (song) {
      handleDeleteSong(song);
    }
  };

  // Show loading state only for initial page load
  if (loading && allPraiseNights.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
          <p className="text-slate-400 text-sm mt-2">This should be much faster now!</p>
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
            <FileText className="w-8 h-8 text-red-600" />
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
      <AdminAuth
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        currentAdmin={currentAdmin}
        setCurrentAdmin={setCurrentAdmin}
      />
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar
        sidebarCollapsed={!isSidebarOpen}
        setSidebarCollapsed={(collapsed) => setIsSidebarOpen(!collapsed)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeSection === 'Pages' && (
          <PagesSection
            allPraiseNights={allPraiseNights}
            loading={loading}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            allSongs={allSongs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            showPageModal={showPageModal}
            setShowPageModal={setShowPageModal}
            editingPage={editingPage}
            setEditingPage={setEditingPage}
            newPageName={newPageName}
            setNewPageName={setNewPageName}
            newPageDate={newPageDate}
            setNewPageDate={setNewPageDate}
            newPageLocation={newPageLocation}
            setNewPageLocation={setNewPageLocation}
            newPageDescription={newPageDescription}
            setNewPageDescription={setNewPageDescription}
            newPageCategory={newPageCategory}
            setNewPageCategory={setNewPageCategory}
            newPageDays={newPageDays}
            setNewPageDays={setNewPageDays}
            newPageHours={newPageHours}
            setNewPageHours={setNewPageHours}
            newPageMinutes={newPageMinutes}
            setNewPageMinutes={setNewPageMinutes}
            newPageSeconds={newPageSeconds}
            setNewPageSeconds={setNewPageSeconds}
            newPageBannerImage={newPageBannerImage}
            setNewPageBannerImage={setNewPageBannerImage}
            newPageBannerFile={newPageBannerFile}
            setNewPageBannerFile={setNewPageBannerFile}
            isCreatingPage={isCreatingPage}
            showDeleteDialog={showDeleteDialog}
            setShowDeleteDialog={setShowDeleteDialog}
            pageToDelete={pageToDelete}
            setPageToDelete={setPageToDelete}
            handleAddPage={handleAddPage}
            handleEditPage={handleEditPage}
            handleUpdatePage={handleUpdatePage}
            handleDeletePage={handleDeletePage}
            confirmDeletePage={confirmDeletePage}
            cancelDeletePage={cancelDeletePage}
            handleEditSong={handleEditSong}
            handleDeleteSong={handleDeleteSong}
            handleToggleSongStatus={handleToggleSongStatus}
            handleToggleSongActive={handleToggleSongActive}
            allCategories={allCategories}
            addToast={addToast}
          />
        )}

        {activeSection === 'Categories' && (
          <CategoriesSection
            allCategories={allCategories}
            allSongs={allSongs}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            showCategoryModal={showCategoryModal}
            setShowCategoryModal={setShowCategoryModal}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            newPageCategoryName={newPageCategoryName}
            setNewPageCategoryName={setNewPageCategoryName}
            showDeleteCategoryDialog={showDeleteCategoryDialog}
            setShowDeleteCategoryDialog={setShowDeleteCategoryDialog}
            categoryToDelete={categoryToDelete}
            setCategoryToDelete={setCategoryToDelete}
            handleAddCategory={handleAddCategory}
            handleEditCategory={handleEditCategory}
            handleUpdateCategory={handleUpdateCategory}
            handleDeleteCategory={handleDeleteCategory}
            confirmDeleteCategory={confirmDeleteCategory}
            cancelDeleteCategory={cancelDeleteCategory}
            handleEditCategoryContent={handleEditCategoryContent}
            handleDeleteCategoryContent={handleDeleteCategoryContent}
            addToast={addToast}
          />
        )}

        {activeSection === 'Members' && <MembersSection />}
        {activeSection === 'Media' && <MediaSection />}
        {activeSection === 'Notifications' && <SimpleNotificationsSection />}
      </div>

      {/* Modals */}
      <AdminModals
        showPageModal={showPageModal}
        setShowPageModal={setShowPageModal}
        editingPage={editingPage}
        setEditingPage={setEditingPage}
        newPageName={newPageName}
        setNewPageName={setNewPageName}
        newPageDate={newPageDate}
        setNewPageDate={setNewPageDate}
        newPageLocation={newPageLocation}
        setNewPageLocation={setNewPageLocation}
        newPageDescription={newPageDescription}
        setNewPageDescription={setNewPageDescription}
        newPageCategory={newPageCategory}
        setNewPageCategory={setNewPageCategory}
        newPageDays={newPageDays}
        setNewPageDays={setNewPageDays}
        newPageHours={newPageHours}
        setNewPageHours={setNewPageHours}
        newPageMinutes={newPageMinutes}
        setNewPageMinutes={setNewPageMinutes}
        newPageSeconds={newPageSeconds}
        setNewPageSeconds={setNewPageSeconds}
        newPageBannerImage={newPageBannerImage}
        setNewPageBannerImage={setNewPageBannerImage}
        newPageBannerFile={newPageBannerFile}
        setNewPageBannerFile={setNewPageBannerFile}
        handleAddPage={handleAddPage}
        handleUpdatePage={handleUpdatePage}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        editingPageCategory={editingPageCategory}
        setEditingPageCategory={setEditingPageCategory}
        newPageCategoryName={newPageCategoryName}
        setNewPageCategoryName={setNewPageCategoryName}
        handleAddCategory={handleAddCategory}
        handleUpdateCategory={handleUpdateCategory}
        handleAddPageCategory={handleAddPageCategory}
        handleUpdatePageCategory={handleUpdatePageCategory}
        activeSection={activeSection}
        showSongModal={showSongModal}
        setShowSongModal={setShowSongModal}
        editingSong={editingSong}
        setEditingSong={setEditingSong}
        allCategories={allCategories}
        pages={pages}
        handleSaveSong={handleSaveSong}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        pageToDelete={pageToDelete}
        setPageToDelete={setPageToDelete}
        confirmDeletePage={confirmDeletePage}
        cancelDeletePage={cancelDeletePage}
        showDeleteSongDialog={showDeleteSongDialog}
        setShowDeleteSongDialog={setShowDeleteSongDialog}
        songToDelete={songToDelete}
        setSongToDelete={setSongToDelete}
        confirmDeleteSong={confirmDeleteSong}
        cancelDeleteSong={cancelDeleteSong}
        showDeleteCategoryDialog={showDeleteCategoryDialog}
        setShowDeleteCategoryDialog={setShowDeleteCategoryDialog}
        categoryToDelete={categoryToDelete}
        setCategoryToDelete={setCategoryToDelete}
        confirmDeleteCategory={confirmDeleteCategory}
        cancelDeleteCategory={cancelDeleteCategory}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
