import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';
import { SURAHS, getSurahById } from '../data/surahs';
import { SAMPLE_AYAHS, BISMI } from '../data/quranData';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];

function AyahItem({ ayah, isHighlighted, displayStyle, fontSize, theme, onPress, onBookmark, isBookmarked }) {
  const getAyahStyle = () => {
    switch (displayStyle) {
      case 'tajweed':
        return { color: Colors.tajweed.default, fontSize, lineHeight: fontSize + 22 };
      case 'highcontrast':
        return { color: '#FFFF00', backgroundColor: '#000000', fontSize, lineHeight: fontSize + 22 };
      default:
        return { color: theme.text, fontSize, lineHeight: fontSize + 22 };
    }
  };

  const bgColor = isHighlighted
    ? Colors.primary + '22'
    : 'transparent';

  return (
    <TouchableOpacity
      style={[styles.ayahItem, { backgroundColor: bgColor, borderColor: isHighlighted ? Colors.primary : 'transparent' }]}
      onPress={() => onPress(ayah)}
      activeOpacity={0.7}
    >
      <View style={styles.ayahContent}>
        {/* Ayah Number Badge */}
        <View style={[styles.ayahBadge, { borderColor: Colors.primary }]}>
          <Text style={[styles.ayahBadgeText, { color: Colors.primary }]}>{ayah.ayahNumber}</Text>
        </View>

        {/* Arabic Text */}
        <Text
          style={[
            styles.arabicText,
            getAyahStyle(),
            displayStyle === 'highcontrast' && styles.highContrastText,
          ]}
        >
          {ayah.text}
        </Text>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.bookmarkBtn}
        onPress={() => onBookmark(ayah)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={isBookmarked ? Colors.accent : theme.textSecondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function ReadScreen({ route, navigation }) {
  const { surahId: routeSurahId } = route.params || {};
  const { isDarkMode, displayStyle, arabicFontSize, updateLastRead, addBookmark, removeBookmark, isBookmarked, activeReciter, playbackSpeed, updatePlaybackSpeed } = useApp();
  const { loadAndPlay, currentAyahId, currentSurahId, changeSpeed } = useAudio();
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [currentSurahId_, setCurrentSurahId_] = useState(routeSurahId || 1);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const flatListRef = useRef(null);

  const currentSurah = getSurahById(currentSurahId_);
  const ayahs = SAMPLE_AYAHS[currentSurahId_] || [];
  const hasData = ayahs.length > 0;

  useEffect(() => {
    if (routeSurahId) setCurrentSurahId_(routeSurahId);
  }, [routeSurahId]);

  const handleAyahPress = useCallback((ayah) => {
    if (!activeReciter) return;
    const ayahsWithAudio = ayahs.map((a) => {
      const audioFile = activeReciter.audioFiles?.find(
        (f) => f.surahId === a.surahId && f.ayahNumber === a.ayahNumber
      );
      return { ...a, audioUri: audioFile?.uri || null };
    });
    const index = ayahsWithAudio.findIndex((a) => a.id === ayah.id);
    const currentAyah = ayahsWithAudio[index];
    if (currentAyah?.audioUri) {
      loadAndPlay(currentAyah, currentSurahId_, ayahsWithAudio, index);
    }
    updateLastRead(currentSurahId_, ayah.id);
  }, [activeReciter, ayahs, currentSurahId_, loadAndPlay, updateLastRead]);

  const handleBookmark = useCallback((ayah) => {
    if (isBookmarked(ayah.id)) {
      removeBookmark(ayah.id);
    } else {
      addBookmark({
        ayahId: ayah.id,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber,
        surahName: currentSurah?.name,
        arabicName: currentSurah?.arabicName,
        text: ayah.text,
        pageNumber: ayah.pageNumber,
      });
    }
  }, [isBookmarked, removeBookmark, addBookmark, currentSurah]);

  const handleSpeedChange = useCallback(async (speed) => {
    await updatePlaybackSpeed(speed);
    await changeSpeed(speed);
    setShowSpeedPicker(false);
  }, [updatePlaybackSpeed, changeSpeed]);

  const currentFontSize = Typography.arabicFontSize[arabicFontSize] || Typography.arabicFontSize.medium;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.surahTitle} onPress={() => setShowSurahPicker(true)}>
          <Text style={[styles.surahNameText, { color: theme.text }]}>{currentSurah?.name}</Text>
          <Text style={[styles.surahArabicText, { color: Colors.primary }]}>{currentSurah?.arabicName}</Text>
          <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowSpeedPicker(true)} style={styles.speedBtn}>
            <Text style={[styles.speedBtnText, { color: Colors.primary }]}>{playbackSpeed}x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Audio')} style={styles.audioBtn}>
            <Ionicons name="musical-notes" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Surah Header */}
      {hasData && (
        <View style={[styles.surahHeader, { backgroundColor: Colors.primary }]}>
          <Text style={styles.bismillah}>{BISMI}</Text>
          <Text style={styles.surahMetaText}>
            {currentSurah?.totalAyah} Ayahs · {currentSurah?.revelationType}
          </Text>
        </View>
      )}

      {/* No reciter notice */}
      {!activeReciter && (
        <View style={[styles.noticeBar, { backgroundColor: Colors.warning + '22', borderColor: Colors.warning }]}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
          <Text style={[styles.noticeText, { color: Colors.warning }]}>
            Add a reciter in the Audio tab to enable playback
          </Text>
        </View>
      )}

      {/* Ayah List */}
      {hasData ? (
        <FlatList
          ref={flatListRef}
          data={ayahs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AyahItem
              ayah={item}
              isHighlighted={currentAyahId === item.id && currentSurahId === currentSurahId_}
              displayStyle={displayStyle}
              fontSize={currentFontSize}
              theme={theme}
              onPress={handleAyahPress}
              onBookmark={handleBookmark}
              isBookmarked={isBookmarked(item.id)}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Full Text Coming Soon</Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            This surah's text will be available in the next update.{'\n'}
            Sample surahs: Al-Fatihah (1), Ya-Sin (36), Al-Mulk (67), Al-Ikhlas (112), Al-Falaq (113), An-Nas (114)
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: Colors.primary }]}
            onPress={() => setCurrentSurahId_(1)}
          >
            <Text style={styles.emptyBtnText}>Read Al-Fatihah</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Surah Picker Modal */}
      {showSurahPicker && (
        <View style={[styles.pickerModal, { backgroundColor: theme.surface }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.pickerTitle, { color: theme.text }]}>Select Surah</Text>
            <TouchableOpacity onPress={() => setShowSurahPicker(false)}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={SURAHS}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, { borderBottomColor: theme.border }, item.id === currentSurahId_ && { backgroundColor: Colors.primary + '15' }]}
                onPress={() => { setCurrentSurahId_(item.id); setShowSurahPicker(false); }}
              >
                <Text style={[styles.pickerItemNum, { color: Colors.primary }]}>{item.id}.</Text>
                <Text style={[styles.pickerItemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.pickerItemArabic, { color: Colors.primary }]}>{item.arabicName}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          />
        </View>
      )}

      {/* Speed Picker Modal */}
      {showSpeedPicker && (
        <View style={[styles.speedModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.speedModalTitle, { color: theme.text }]}>Playback Speed</Text>
          {SPEED_OPTIONS.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[styles.speedOption, playbackSpeed === speed && { backgroundColor: Colors.primary }]}
              onPress={() => handleSpeedChange(speed)}
            >
              <Text style={[styles.speedOptionText, { color: playbackSpeed === speed ? '#fff' : theme.text }]}>
                {speed}x {speed === 1.0 ? '(Normal)' : ''}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.speedCancel} onPress={() => setShowSpeedPicker(false)}>
            <Text style={{ color: theme.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: { padding: Spacing.sm },
  surahTitle: { flex: 1, alignItems: 'center' },
  surahNameText: { fontSize: Typography.uiFontSize.lg, fontWeight: '700' },
  surahArabicText: { fontSize: 16, marginVertical: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  speedBtn: {
    backgroundColor: Colors.primary + '18', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  speedBtnText: { fontSize: Typography.uiFontSize.sm, fontWeight: '700' },
  audioBtn: { padding: Spacing.sm },
  surahHeader: {
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md, alignItems: 'center',
  },
  bismillah: { color: '#fff', fontSize: 26, textAlign: 'center', marginBottom: 6 },
  surahMetaText: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.uiFontSize.sm },
  noticeBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.md, marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm, borderWidth: 1,
  },
  noticeText: { fontSize: Typography.uiFontSize.xs, flex: 1 },
  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  ayahItem: {
    marginBottom: Spacing.sm, borderRadius: BorderRadius.md,
    borderWidth: 1.5, padding: Spacing.md,
  },
  ayahContent: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  ayahBadge: {
    width: 32, height: 32, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
    flexShrink: 0, marginTop: 4,
  },
  ayahBadgeText: { fontSize: Typography.uiFontSize.xs, fontWeight: '700' },
  arabicText: {
    flex: 1, fontSize: Typography.arabicFontSize.medium,
    lineHeight: Typography.arabicLineHeight.medium,
    textAlign: 'right', writingDirection: 'rtl',
  },
  highContrastText: { padding: 4, borderRadius: 4 },
  bookmarkBtn: { alignSelf: 'flex-end', padding: Spacing.xs },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: Typography.uiFontSize.xl, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm },
  emptyDesc: { fontSize: Typography.uiFontSize.sm, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  emptyBtn: { borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm + 2 },
  emptyBtnText: { color: '#fff', fontSize: Typography.uiFontSize.md, fontWeight: '600' },
  pickerModal: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  pickerTitle: { fontSize: Typography.uiFontSize.lg, fontWeight: '700' },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 0.5,
  },
  pickerItemNum: { fontSize: Typography.uiFontSize.sm, fontWeight: '700', width: 30 },
  pickerItemName: { flex: 1, fontSize: Typography.uiFontSize.md },
  pickerItemArabic: { fontSize: 18 },
  speedModal: {
    position: 'absolute', bottom: 80, left: Spacing.md, right: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1,
    ...Shadow.large,
  },
  speedModalTitle: { fontSize: Typography.uiFontSize.md, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  speedOption: {
    borderRadius: BorderRadius.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs, alignItems: 'center',
  },
  speedOptionText: { fontSize: Typography.uiFontSize.md, fontWeight: '500' },
  speedCancel: { alignItems: 'center', paddingTop: Spacing.sm },
});
