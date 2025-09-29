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
  Send
} from "lucide-react";
import { PraiseNightSong, Comment, PraiseNight, Category } from '../../types/supabase';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { createPage, updatePage, deletePage, createSong, updateSong, deleteSong, updateSongsCategory, handleCategoryDeletion, getAllCategories, createCategory, updateCategory, deleteCategory } from '../../lib/database';
import { supabase } from '@/lib/supabase';
import { clearAllCaches } from '@/utils/cacheBuster';
import { versionManager } from '@/utils/versionManager';
import { smartCache } from '@/utils/smartCache';
import { uploadBannerImage } from '@/utils/imageUpload';
import EditSongModal from '../../components/EditSongModal';
import MediaManager from '../../components/MediaManager';
import SimpleAdminSupport from '../../components/SimpleAdminSupport';
import { ToastContainer, Toast } from '../../components/Toast';

export default function AdminPage() {
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Admin login function
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginData.username === 'admin' && loginData.password === '@admin1234@') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // Admin logout function
  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
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
    
    return allSongsWithIds;
  }, [allPraiseNights, loading]);

  // Management state
  const [showPageModal, setShowPageModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PraiseNight | null>(null);
  const [editingPageCategory, setEditingPageCategory] = useState<any | null>(null);
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
        const categories = await getAllCategories();
        setDbCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Get pages from Supabase (includes unassigned for admin)
  const pages = useMemo(() => {
    if (loading || !allPraiseNights) return [];
    return allPraiseNights; // Supabase data includes all pages
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

        const success = await createCategory(newCategory);
        
        if (success) {
          // Reload categories from database
          const categories = await getAllCategories();
          setDbCategories(categories);
          
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
          // Update database category
          const success = await updateCategory(parseInt(dbCategory.id), {
            name: newCategoryName
          });
          
          if (success) {
            // Reload categories from database
            const categories = await getAllCategories();
            setDbCategories(categories);
            
            // Also update songs that use this category
            await updateSongsCategory(oldCategoryName, newCategoryName);
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
          const success = await updateSongsCategory(oldCategoryName, newCategoryName);
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

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? All songs in this category will be moved to "Uncategorized".`)) {
      try {
        // Check if this is a database category or song-based category
        const dbCategory = dbCategories.find(cat => cat.name === categoryName);
        
        if (dbCategory) {
          // Delete from database
          const success = await deleteCategory(parseInt(dbCategory.id));
          
          if (success) {
            // Reload categories from database
            const categories = await getAllCategories();
            setDbCategories(categories);
            
            // Move songs to uncategorized
            await handleCategoryDeletion(categoryName, 'Uncategorized');
            await refreshData();
            
            addToast({
              type: 'success',
              message: `Category "${categoryName}" deleted successfully! Songs moved to "Uncategorized".`
            });
          } else {
            throw new Error('Failed to delete category from database');
          }
        } else {
          // Handle song-based category (legacy behavior)
          const success = await handleCategoryDeletion(categoryName, 'Uncategorized');
          
          if (success) {
            await refreshData();
            
            addToast({
              type: 'success',
              message: `Category "${categoryName}" deleted successfully! Songs moved to "Uncategorized".`
            });
          } else {
            throw new Error('Failed to delete category');
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        addToast({
          type: 'error',
          message: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };


  // Song management functions
  const handleEditSong = (song: PraiseNightSong) => {
    setEditingSong(song);
    setShowSongModal(true);
  };

  const handleSaveSong = async (songData: PraiseNightSong & { id?: number }) => {
    try {
      // If songData has an ID, it's an existing song being updated
      if (songData.id) {
        console.log('🔄 Updating existing song with ID:', songData.id);
        const success = await updateSong(songData.id, songData);
        
        if (success) {
          console.log('✅ Song updated successfully, refreshing data...');
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
          
          addToast({
            type: 'success',
            message: 'Song updated successfully!'
          });
        } else {
          throw new Error('Failed to update song in database');
        }
        return;
      }

      // Check if this is a new song (no existing song with same title and praiseNightId)
      const { data: existingSong, error: fetchError } = await supabase
        .from('songs')
        .select('id')
        .eq('praisenightid', songData.praiseNightId)
        .eq('title', songData.title)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new songs
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (existingSong) {
        // Song exists, update it
        console.log('🔄 Updating existing song:', {
          songId: existingSong.id,
          title: songData.title,
          newCategory: songData.category
        });
        const success = await updateSong(existingSong.id, songData);
        
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
        const createdSong = await createSong(songData);
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

  const handleDeleteSong = async (songTitle: string) => {
    if (confirm(`Are you sure you want to delete "${songTitle}"?`)) {
      try {
        // Find the song to get its page ID
        const songToDelete = allSongs.find(song => song.title === songTitle);
        if (!songToDelete) {
          throw new Error(`Song "${songTitle}" not found in current data`);
        }

        // Get the song ID from the database
        const { data: songs, error: fetchError } = await supabase
          .from('songs')
          .select('id')
          .eq('praisenightid', songToDelete.praiseNightId)
          .eq('title', songTitle)
          .single();

        if (fetchError || !songs) {
          throw new Error(`Could not find song "${songTitle}" in database`);
        }

        // Delete from Supabase using the song ID
        const success = await deleteSong(songs.id);
        
        if (success) {
          // Refresh data from Supabase
          await refreshData();
          
          // Show success toast
          addToast({
            type: 'success',
            message: `Song "${songTitle}" deleted successfully!`
          });
        } else {
          throw new Error('Failed to delete song from database');
        }
      } catch (error) {
        console.error('Error deleting song:', error);
        addToast({
          type: 'error',
          message: `Failed to delete song: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
  };

  const handleToggleSongStatus = async (song: PraiseNightSong) => {
    try {
      const newStatus = song.status === 'heard' ? 'unheard' : 'heard';
      
      // Get the song ID from the database
      const { data: songs, error: fetchError } = await supabase
        .from('songs')
        .select('id')
        .eq('praisenightid', song.praiseNightId)
        .eq('title', song.title)
        .single();

      if (fetchError || !songs) {
        throw new Error(`Could not find song "${song.title}" in database`);
      }

      // Update in Supabase using the song ID
      const success = await updateSong(songs.id, { status: newStatus });
      
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
        
        // Upload banner image to Supabase if file is selected (non-blocking)
        if (newPageBannerFile) {
          console.log('🚀 Starting fast banner image upload for new page...');
          
          // Start upload in background (non-blocking)
          uploadBannerImage(newPageBannerFile, 0) // 0 is temporary, will be updated after page creation
            .then((uploadResult) => {
              if (uploadResult.success) {
                console.log('✅ Banner image uploaded successfully:', uploadResult.url);
                addToast({
                  type: 'success',
                  message: 'Banner image uploaded successfully!'
                });
              } else {
                console.error('❌ Banner image upload failed:', uploadResult.error);
                addToast({
                  type: 'error',
                  message: `Banner image upload failed: ${uploadResult.error}`
                });
              }
            })
            .catch((error) => {
              console.error('❌ Banner upload error:', error);
              addToast({
                type: 'error',
                message: 'Banner image upload failed'
              });
            });
          
          // Continue with page creation immediately (don't wait for image upload)
          console.log('⚡ Continuing with page creation while image uploads in background...');
        }
        
        const newPage = await createPage({
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
          // Refresh data from Supabase
          await refreshData();
          
          // Show success toast
          addToast({
            type: 'success',
            message: `Page "${newPageName.trim()}" added successfully!`
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
    setEditingPage(page);
    setNewPageName(page.name);
    setNewPageDate(page.date);
    setNewPageLocation(page.location);
    setNewPageDescription(''); // PraiseNight doesn't have description field
    setNewPageCategory(page.category || 'unassigned'); // Default to unassigned if not set
    setNewPageBannerImage(page.bannerImage || '');
    setNewPageDays(page.countdown.days);
    setNewPageHours(page.countdown.hours);
    setNewPageMinutes(page.countdown.minutes);
    setNewPageSeconds(page.countdown.seconds);
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
        
        // Upload new banner image to Supabase if file is selected (non-blocking)
        if (newPageBannerFile) {
          console.log('🚀 Starting fast banner image upload...');
          
          // Start upload in background (non-blocking)
          uploadBannerImage(newPageBannerFile, editingPage.id)
            .then((uploadResult) => {
              if (uploadResult.success) {
                console.log('✅ Banner image uploaded successfully:', uploadResult.url);
                // Update the page with the new banner URL
                updatePage(editingPage.id, { bannerImage: uploadResult.url });
                addToast({
                  type: 'success',
                  message: 'Banner image uploaded successfully!'
                });
              } else {
                console.error('❌ Banner image upload failed:', uploadResult.error);
                addToast({
                  type: 'error',
                  message: `Banner image upload failed: ${uploadResult.error}`
                });
              }
            })
            .catch((error) => {
              console.error('❌ Banner upload error:', error);
              addToast({
                type: 'error',
                message: 'Banner image upload failed'
              });
            });
          
          // Continue with page update immediately (don't wait for image upload)
          console.log('⚡ Continuing with page update while image uploads in background...');
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
        
        const success = await updatePage(editingPage.id, {
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
        
        console.log('✅ Page update result:', success);

        if (success) {
          // Refresh data from Supabase
          await refreshData();
          
          // Show success toast
          addToast({
            type: 'success',
            message: `Page "${newPageName.trim()}" updated successfully!`
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

  const handleDeletePage = async (id: number) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        const page = pages.find(p => p.id === id);
        const success = await deletePage(id);

        if (success) {
          // Refresh data from Supabase
          await refreshData();
          
          // Show success toast
          addToast({
            type: 'success',
            message: `Page "${page?.name || 'Unknown'}" deleted successfully!`
          });
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
    }
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
      leadGuitarist: content.leadGuitarist || '',
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
      // Clear cache and use DIRECT approach
      console.log('🔄 Clearing cache and using DIRECT approach...');
      await versionManager.checkForUpdates();
      smartCache.clearCache('admin-users-cache');
      
      console.log('🔄 Loading users with DIRECT query (no complex logic)...');
      
      // DIRECT QUERY - Simple and direct
      console.log('📋 Direct profiles query...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 Raw query result:', { data: profilesData, error: profilesError });
      
      if (profilesError) {
        console.error('❌ Profiles query failed:', profilesError);
        addToast({
          type: 'error',
          message: `Database error: ${profilesError.message}`
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
      const { data: groups, error: groupsError } = await supabase
        .from('user_groups')
        .select('user_id, group_name');
      
      if (groupsError) {
        console.error('❌ Error loading user groups:', groupsError);
        // Don't return here, just log the error and continue
      } else {
        console.log('🏷️ User groups data:', groups);
        
        // Organize groups by user ID
        const groupsByUser: {[key: string]: string[]} = {};
        groups?.forEach(group => {
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
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      const { error } = await supabase
        .from('support_messages')
        .update({
          admin_response: replyText.trim(),
          admin_responded_at: new Date().toISOString(),
          status: 'resolved'
        })
        .eq('id', messageId);

      if (error) throw error;

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
      const { error } = await supabase
        .from('support_messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;

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

    const channel = supabase
      .channel('admin_support_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages'
        },
        (payload) => {
          console.log('Support message updated:', payload);
          loadSupportMessages(); // Reload messages when there's an update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSection]);

  // Load users when Users section is active (ALWAYS refresh)
  useEffect(() => {
    if (activeSection === 'Users') {
      console.log('🔄 Users section activated - loading users...');
      loadUsers();
    }
  }, [activeSection]);

  const sidebarItems = [
    { icon: Home, label: 'Home', active: false },
    { icon: FileText, label: 'Pages', active: activeSection === 'Pages' },
    { icon: Tag, label: 'Categories', active: activeSection === 'Categories' },
    { icon: Music, label: 'Media', active: activeSection === 'Media' },
    { icon: Users, label: 'Users', active: activeSection === 'Users' },
    { icon: MessageCircle, label: 'Support', active: activeSection === 'Support' },
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
                else if (item.label === 'Media') setActiveSection('Media');
                else if (item.label === 'Users') setActiveSection('Users');
                else if (item.label === 'Support') setActiveSection('Support');
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
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:ml-0">
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
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-auto">
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
                          onClick={() => handleDeleteCategory(category.name)}
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
            <div className="fixed inset-0 z-50 bg-white overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <h2 className="text-xl font-semibold text-gray-900">Media Library</h2>
                  <button
                    onClick={() => setActiveSection('Pages')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <MediaManager />
                </div>
              </div>
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
                      const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .order('created_at', { ascending: false });
                      
                      console.log('🔍 DEBUG: Direct query result:', { data, error });
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
              </div>

              {/* Support Messages List */}
              <SimpleAdminSupport />
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
                              handleDeletePage(page.id);
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
                        All Songs {allSongs.filter(song => song.praiseNightId === selectedPage.id).length}
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
                    <div className="hidden lg:block overflow-x-auto">
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
                                    onClick={() => handleDeleteSong(song.title)}
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
                    <div className="lg:hidden space-y-4">
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
                                onClick={() => handleDeleteSong(song.title)}
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
                <input
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
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                />
                {newPageBannerImage && (
                  <div className="mt-2">
                    <img
                      src={newPageBannerImage}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Banner image preview
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload a banner image for this page (JPG, PNG, etc.)
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

      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}