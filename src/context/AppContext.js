import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  THEME: '@quran_theme',
  DISPLAY_STYLE: '@quran_display_style',
  FONT_SIZE: '@quran_font_size',
  LAST_READ: '@quran_last_read',
  RECITERS: '@quran_reciters',
  ACTIVE_RECITER: '@quran_active_reciter',
  BOOKMARKS: '@quran_bookmarks',
  PLAYBACK_SPEED: '@quran_playback_speed',
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [displayStyle, setDisplayStyle] = useState('plain'); // 'plain' | 'tajweed' | 'highcontrast'
  const [arabicFontSize, setArabicFontSize] = useState('medium'); // 'small' | 'medium' | 'large' | 'xlarge'
  const [lastRead, setLastRead] = useState({ surahId: 1, ayahId: '1:1' });
  const [reciters, setReciters] = useState([]);
  const [activeReciterId, setActiveReciterId] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted settings on startup
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [
        theme, style, fontSize, lastReadData,
        recitersData, activeReciter, bookmarksData, speed,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_STYLE),
        AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_READ),
        AsyncStorage.getItem(STORAGE_KEYS.RECITERS),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_RECITER),
        AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS),
        AsyncStorage.getItem(STORAGE_KEYS.PLAYBACK_SPEED),
      ]);

      if (theme) setIsDarkMode(theme === 'dark');
      if (style) setDisplayStyle(style);
      if (fontSize) setArabicFontSize(fontSize);
      if (lastReadData) setLastRead(JSON.parse(lastReadData));
      if (recitersData) setReciters(JSON.parse(recitersData));
      if (activeReciter) setActiveReciterId(activeReciter);
      if (bookmarksData) setBookmarks(JSON.parse(bookmarksData));
      if (speed) setPlaybackSpeed(parseFloat(speed));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = useCallback(async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, newVal ? 'dark' : 'light');
  }, [isDarkMode]);

  const changeDisplayStyle = useCallback(async (style) => {
    setDisplayStyle(style);
    await AsyncStorage.setItem(STORAGE_KEYS.DISPLAY_STYLE, style);
  }, []);

  const changeFontSize = useCallback(async (size) => {
    setArabicFontSize(size);
    await AsyncStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
  }, []);

  const updateLastRead = useCallback(async (surahId, ayahId) => {
    const data = { surahId, ayahId };
    setLastRead(data);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(data));
  }, []);

  const addReciter = useCallback(async (reciter) => {
    setReciters((prev) => {
      const updated = [...prev, reciter];
      AsyncStorage.setItem(STORAGE_KEYS.RECITERS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeReciter = useCallback(async (reciterId) => {
    setReciters((prev) => {
      const updated = prev.filter((r) => r.id !== reciterId);
      AsyncStorage.setItem(STORAGE_KEYS.RECITERS, JSON.stringify(updated));
      return updated;
    });
    if (activeReciterId === reciterId) {
      setActiveReciterId(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_RECITER);
    }
  }, [activeReciterId]);

  const selectReciter = useCallback(async (reciterId) => {
    setActiveReciterId(reciterId);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_RECITER, reciterId);
  }, []);

  const addBookmark = useCallback(async (bookmark) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.ayahId === bookmark.ayahId);
      if (exists) return prev;
      const updated = [...prev, { ...bookmark, createdAt: Date.now() }];
      AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBookmark = useCallback(async (ayahId) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.ayahId !== ayahId);
      AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((ayahId) => {
    return bookmarks.some((b) => b.ayahId === ayahId);
  }, [bookmarks]);

  const updatePlaybackSpeed = useCallback(async (speed) => {
    setPlaybackSpeed(speed);
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYBACK_SPEED, speed.toString());
  }, []);

  const activeReciter = reciters.find((r) => r.id === activeReciterId) || null;

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        displayStyle,
        changeDisplayStyle,
        arabicFontSize,
        changeFontSize,
        lastRead,
        updateLastRead,
        reciters,
        addReciter,
        removeReciter,
        activeReciter,
        activeReciterId,
        selectReciter,
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        playbackSpeed,
        updatePlaybackSpeed,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
