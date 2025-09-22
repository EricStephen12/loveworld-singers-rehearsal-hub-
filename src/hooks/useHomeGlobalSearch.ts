import { useState, useMemo } from 'react';
import { useRealtimeData } from './useRealtimeData';
import { PraiseNightSong, PraiseNight } from '@/types/supabase';

export interface HomeSearchResult {
  id: string;
  type: 'song' | 'page' | 'category' | 'feature' | 'faq' | 'about';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  pageId?: number;
  category?: string;
  status?: 'heard' | 'unheard';
  icon?: string;
}

export function useHomeGlobalSearch() {
  const { pages } = useRealtimeData();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: HomeSearchResult[] = [];

    // Search through all pages and songs
    pages.forEach(page => {
      // Search page names
      if (page.name.toLowerCase().includes(query)) {
        results.push({
          id: `page-${page.id}`,
          type: 'page',
          title: page.name,
          subtitle: 'Praise Night Event',
          description: `${page.location} • ${page.date}`,
          url: `/pages/praise-night?page=${page.id}`,
          pageId: page.id,
          icon: 'Calendar'
        });
      }

      // Search songs within each page
      page.songs.forEach(song => {
        const matchesTitle = song.title.toLowerCase().includes(query);
        const matchesWriter = song.writer?.toLowerCase().includes(query);
        const matchesLeadSinger = song.leadSinger?.toLowerCase().includes(query);
        const matchesConductor = song.conductor?.toLowerCase().includes(query);
        const matchesCategory = song.category.toLowerCase().includes(query);
        const matchesKey = song.key?.toLowerCase().includes(query);

        if (matchesTitle || matchesWriter || matchesLeadSinger || matchesConductor || matchesCategory || matchesKey) {
          let matchReason = '';
          if (matchesTitle) matchReason = 'Song Title';
          else if (matchesWriter) matchReason = `Writer: ${song.writer}`;
          else if (matchesLeadSinger) matchReason = `Lead Singer: ${song.leadSinger}`;
          else if (matchesConductor) matchReason = `Conductor: ${song.conductor}`;
          else if (matchesCategory) matchReason = `Category: ${song.category}`;
          else if (matchesKey) matchReason = `Key: ${song.key}`;

          results.push({
            id: `song-${song.title}-${page.id}`,
            type: 'song',
            title: song.title,
            subtitle: matchReason,
            description: `${page.name} • ${song.category} • ${song.status}`,
            url: `/pages/praise-night?page=${page.id}&song=${encodeURIComponent(song.title)}`,
            pageId: page.id,
            category: song.category,
            status: song.status,
            icon: 'Music'
          });
        }
      });

      // Search categories
      const categories = [...new Set(page.songs.map(song => song.category))];
      categories.forEach(category => {
        if (category.toLowerCase().includes(query)) {
          const songsInCategory = page.songs.filter(song => song.category === category);
          results.push({
            id: `category-${category}-${page.id}`,
            type: 'category',
            title: category,
            subtitle: 'Song Category',
            description: `${page.name} • ${songsInCategory.length} songs`,
            url: `/pages/praise-night?page=${page.id}&category=${encodeURIComponent(category)}`,
            pageId: page.id,
            category: category,
            icon: 'Flag'
          });
        }
      });
    });

    // Search app features
    const features = [
      { title: 'Rehearsals', url: '/pages/rehearsals', icon: 'Calendar' },
      { title: 'Profile', url: '/pages/profile', icon: 'User' },
      { title: 'Push Notifications', url: '#', icon: 'Bell' },
      { title: 'Groups', url: '#', icon: 'Users' },
      { title: 'Submit Song', url: '#', icon: 'Music' },
      { title: 'Media', url: '#', icon: 'Play' },
      { title: 'Ministry Calendar', url: '#', icon: 'Calendar' },
      { title: 'Analytics', url: '#', icon: 'BarChart3' },
      { title: 'Admin Support', url: '#', icon: 'HelpCircle' }
    ];

    features.forEach(feature => {
      if (feature.title.toLowerCase().includes(query)) {
        results.push({
          id: `feature-${feature.title}`,
          type: 'feature',
          title: feature.title,
          subtitle: 'App Feature',
          description: 'Navigate to this feature',
          url: feature.url,
          icon: feature.icon
        });
      }
    });

    // Search FAQ content
    const faqItems = [
      { question: 'How do I join a rehearsal?', answer: 'Check the Rehearsals section for upcoming sessions and register through the calendar.' },
      { question: 'Where can I find song lyrics?', answer: 'Access song lyrics and audio resources in the AudioLabs section.' },
      { question: 'How do I get support?', answer: 'Use the Support section or contact your ministry coordinator for assistance.' }
    ];

    faqItems.forEach((faq, index) => {
      if (faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)) {
        results.push({
          id: `faq-${index}`,
          type: 'faq',
          title: faq.question,
          subtitle: 'FAQ',
          description: faq.answer,
          url: '/home#faq',
          icon: 'HelpCircle'
        });
      }
    });

    // Search About content
    const aboutContent = [
      { title: 'What is LoveWorld Singers Rehearsal Hub?', description: 'A comprehensive platform for managing rehearsal schedules, song collections, and ministry activities.' }
    ];

    aboutContent.forEach((about, index) => {
      if (about.title.toLowerCase().includes(query) || about.description.toLowerCase().includes(query)) {
        results.push({
          id: `about-${index}`,
          type: 'about',
          title: about.title,
          subtitle: 'About',
          description: about.description,
          url: '/home#about',
          icon: 'Info'
        });
      }
    });

    // Sort results by relevance
    return results.sort((a, b) => {
      // Exact matches first
      const aExact = a.title.toLowerCase() === query;
      const bExact = b.title.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then by type priority (songs > features > pages > categories > faq > about)
      const typePriority = { song: 0, feature: 1, page: 2, category: 3, faq: 4, about: 5 };
      const aPriority = typePriority[a.type];
      const bPriority = typePriority[b.type];
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Then alphabetically
      return a.title.localeCompare(b.title);
    }).slice(0, 15); // Limit to 15 results for home search
  }, [searchQuery, pages]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    hasResults: searchResults.length > 0
  };
}
