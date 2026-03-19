import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, FlatList, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useApp } from '../context/AppContext';
import { useAudio } from '../context/AudioContext';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../styles/theme';
import { SURAHS, getSurahById } from '../data/surahs';
import { SAMPLE_AYAHS } from '../data/quranData';

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
];

function formatTime(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function ProgressBar({ position, duration, onSeek, theme }) {
  const pct = duration > 0 ? (position / duration) * 100 : 0;
  return (
    <View style={styles.progressContainer}>
      <Text style={[styles.progressTime, { color: theme.textSecondary }]}>{formatTime(position)}</Text>
      <View
        style={[styles.progressTrack, { backgroundColor: theme.border }]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const { locationX, nativeEvent } = e;
          // Simple seek based on touch position
          if (duration > 0) {
            const width = e.nativeEvent.target ? 200 : 200;
            const ratio = Math.max(0, Math.min(1, locationX / 200));
            onSeek(ratio * duration);
          }
        }}
      >
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: Colors.primary }]} />
        <View style={[styles.progressThumb, { left: `${pct}%`, backgroundColor: Colors.primary }]} />
      </View>
      <Text style={[styles.progressTime, { color: theme.textSecondary }]}>{formatTime(duration)}</Text>
    </View>
  );
}

export default function AudioScreen({ navigation }) {
  const {
    isDarkMode, reciters, activeReciter, activeReciterId,
    addReciter, removeReciter, selectReciter,
    playbackSpeed, updatePlaybackSpeed,
  } = useApp();
  const {
    isPlaying, isLoading, currentAyahId, currentSurahId,
    duration, position, togglePlayPause, stop, handleNext, handlePrev,
    seek, changeSpeed, isLoopAyah, isLoopSurah, toggleLoopAyah, toggleLoopSurah,
    loadAndPlay,
  } = useAudio();
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [showAddReciter, setShowAddReciter] = useState(false);
  const [selectedSurahForUpload, setSelectedSurahForUpload] = useState(1);
  const [showSurahPicker, setShowSurahPicker] = useState(false);

  const currentAyah = currentAyahId
    ? Object.values(SAMPLE_AYAHS).flat().find((a) => a.id === currentAyahId)
    : null;
  const currentSurah = currentSurahId ? getSurahById(currentSurahId) : null;

  const handleAddAudioFile = useCallback(async () => {
    if (!activeReciter) {
      Alert.alert('No Reciter Selected', 'Please select or create a reciter first.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/*'],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Parse filename: expect format like "001_001.mp3" (surah_ayah)
      const fileName = file.name.replace(/\.[^.]+$/, '');
      const parts = fileName.split('_');
      let surahNum = selectedSurahForUpload;
      let ayahNum = 1;

      if (parts.length >= 2) {
        surahNum = parseInt(parts[0], 10) || selectedSurahForUpload;
        ayahNum = parseInt(parts[1], 10) || 1;
      }

      // Copy file to app directory
      const destDir = `${FileSystem.documentDirectory}reciters/${activeReciter.id}/`;
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
      const destPath = `${destDir}${surahNum}_${ayahNum}${file.name.substring(file.name.lastIndexOf('.'))}`;
      await FileSystem.copyAsync({ from: file.uri, to: destPath });

      // Update reciter audio files
      const updatedAudioFiles = [
        ...(activeReciter.audioFiles || []).filter(
          (f) => !(f.surahId === surahNum && f.ayahNumber === ayahNum)
        ),
        { surahId: surahNum, ayahNumber: ayahNum, uri: destPath, fileName: file.name },
      ];

      const updatedReciters = reciters.map((r) =>
        r.id === activeReciter.id ? { ...r, audioFiles: updatedAudioFiles } : r
      );

      // Re-add to update
      await addReciter({ ...activeReciter, audioFiles: updatedAudioFiles });

      Alert.alert('Audio Added', `Mapped to Surah ${surahNum}, Ayah ${ayahNum}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add audio file: ' + error.message);
    }
  }, [activeReciter, addReciter, reciters, selectedSurahForUpload]);

  const handleCreateReciter = useCallback(async () => {
    const id = `reciter_${Date.now()}`;
    const name = `Reciter ${reciters.length + 1}`;
    const newReciter = { id, name, audioFiles: [], createdAt: Date.now() };
    await addReciter(newReciter);
    await selectReciter(id);
    setShowAddReciter(false);
  }, [reciters, addReciter, selectReciter]);

  const handleDeleteReciter = useCallback((reciter) => {
    Alert.alert(
      'Delete Reciter',
      `Are you sure you want to delete "${reciter.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await removeReciter(reciter.id);
            // Clean up files
            try {
              const dir = `${FileSystem.documentDirectory}reciters/${reciter.id}/`;
              await FileSystem.deleteAsync(dir, { idempotent: true });
            } catch (e) { /* ignore */ }
          },
        },
      ]
    );
  }, [removeReciter]);

  const handleSpeedChange = useCallback(async (speed) => {
    await updatePlaybackSpeed(speed);
    await changeSpeed(speed);
  }, [updatePlaybackSpeed, changeSpeed]);

  const handlePlaySurah = useCallback((surahId) => {
    if (!activeReciter) {
      Alert.alert('No Reciter', 'Please select a reciter to play audio.');
      return;
    }
    const ayahs = SAMPLE_AYAHS[surahId] || [];
    if (ayahs.length === 0) {
      Alert.alert('No Data', 'Ayah data not available for this surah.');
      return;
    }
    const ayahsWithAudio = ayahs.map((a) => {
      const audioFile = activeReciter.audioFiles?.find(
        (f) => f.surahId === a.surahId && f.ayahNumber === a.ayahNumber
      );
      return { ...a, audioUri: audioFile?.uri || null };
    });
    const firstWithAudio = ayahsWithAudio.find((a) => a.audioUri);
    if (!firstWithAudio) {
      Alert.alert('No Audio', 'No audio files found for this surah. Upload audio files first.');
      return;
    }
    const idx = ayahsWithAudio.indexOf(firstWithAudio);
    loadAndPlay(firstWithAudio, surahId, ayahsWithAudio, idx);
  }, [activeReciter, loadAndPlay]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Audio Player</Text>
        <TouchableOpacity onPress={() => setShowAddReciter(true)}>
          <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Now Playing */}
        <View style={[styles.nowPlayingCard, { backgroundColor: Colors.primary }]}>
          <View style={styles.nowPlayingIcon}>
            <Ionicons name="musical-notes" size={48} color="rgba(255,255,255,0.3)" />
          </View>
          <Text style={styles.nowPlayingLabel}>
            {isLoading ? 'Loading...' : currentSurah ? 'Now Playing' : 'No Audio Playing'}
          </Text>
          <Text style={styles.nowPlayingSurah}>
            {currentSurah?.name || 'Select a surah to play'}
          </Text>
          {currentAyah && (
            <Text style={styles.nowPlayingAyah} numberOfLines={2}>
              {currentAyah.text}
            </Text>
          )}
          {activeReciter && (
            <Text style={styles.nowPlayingReciter}>🎙 {activeReciter.name}</Text>
          )}
        </View>

        {/* Progress Bar */}
        {currentAyahId && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <ProgressBar position={position} duration={duration} onSeek={seek} theme={theme} />
          </View>
        )}

        {/* Playback Controls */}
        <View style={[styles.controlsCard, { backgroundColor: theme.card }]}>
          {/* Loop controls */}
          <View style={styles.loopRow}>
            <TouchableOpacity
              style={[styles.loopBtn, isLoopAyah && { backgroundColor: Colors.primary + '22' }]}
              onPress={toggleLoopAyah}
            >
              <Ionicons name="repeat" size={18} color={isLoopAyah ? Colors.primary : theme.textSecondary} />
              <Text style={[styles.loopBtnText, { color: isLoopAyah ? Colors.primary : theme.textSecondary }]}>
                Loop Ayah
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.loopBtn, isLoopSurah && { backgroundColor: Colors.primary + '22' }]}
              onPress={toggleLoopSurah}
            >
              <Ionicons name="repeat-outline" size={18} color={isLoopSurah ? Colors.primary : theme.textSecondary} />
              <Text style={[styles.loopBtnText, { color: isLoopSurah ? Colors.primary : theme.textSecondary }]}>
                Loop Surah
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Controls */}
          <View style={styles.mainControls}>
            <TouchableOpacity style={styles.controlBtn} onPress={handlePrev} disabled={!currentAyahId}>
              <Ionicons name="play-skip-back" size={28} color={currentAyahId ? theme.icon : theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playPauseBtn, { backgroundColor: Colors.primary, opacity: isLoading ? 0.5 : 1 }]}
              onPress={togglePlayPause}
              disabled={!currentAyahId || isLoading}
            >
              <Ionicons
                name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
                size={32}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={handleNext} disabled={!currentAyahId}>
              <Ionicons name="play-skip-forward" size={28} color={currentAyahId ? theme.icon : theme.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={stop} disabled={!currentAyahId}>
              <Ionicons name="stop" size={24} color={currentAyahId ? Colors.error : theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Speed Control */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Playback Speed</Text>
          <View style={styles.speedRow}>
            {SPEED_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.speedChip,
                  { borderColor: theme.border },
                  playbackSpeed === value && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                ]}
                onPress={() => handleSpeedChange(value)}
              >
                <Text style={[
                  styles.speedChipText,
                  { color: playbackSpeed === value ? '#fff' : theme.text },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reciters Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Reciters</Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: Colors.primary }]}
              onPress={handleCreateReciter}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>New Reciter</Text>
            </TouchableOpacity>
          </View>

          {reciters.length === 0 ? (
            <View style={styles.emptyReciters}>
              <Ionicons name="mic-outline" size={36} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No reciters yet. Tap "New Reciter" to get started.
              </Text>
            </View>
          ) : (
            reciters.map((reciter) => (
              <View
                key={reciter.id}
                style={[
                  styles.reciterItem,
                  { borderColor: activeReciterId === reciter.id ? Colors.primary : theme.border },
                  activeReciterId === reciter.id && { backgroundColor: Colors.primary + '10' },
                ]}
              >
                <TouchableOpacity style={styles.reciterInfo} onPress={() => selectReciter(reciter.id)}>
                  <View style={[styles.reciterAvatar, { backgroundColor: Colors.primary + '22' }]}>
                    <Ionicons name="mic" size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.reciterMeta}>
                    <Text style={[styles.reciterName, { color: theme.text }]}>{reciter.name}</Text>
                    <Text style={[styles.reciterFiles, { color: theme.textSecondary }]}>
                      {reciter.audioFiles?.length || 0} audio files
                    </Text>
                  </View>
                  {activeReciterId === reciter.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteReciter(reciter)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Upload Audio Section */}
        {activeReciter && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Upload Audio Files</Text>
            <Text style={[styles.uploadInfo, { color: theme.textSecondary }]}>
              Upload MP3 or WAV files for {activeReciter.name}.{'\n'}
              Naming convention: <Text style={{ fontWeight: '600' }}>001_001.mp3</Text> (surah_ayah)
            </Text>
            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: Colors.primary }]}
              onPress={handleAddAudioFile}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.uploadBtnText}>Choose Audio File</Text>
            </TouchableOpacity>

            {/* Audio file list */}
            {activeReciter.audioFiles && activeReciter.audioFiles.length > 0 && (
              <View style={styles.filesList}>
                <Text style={[styles.filesTitle, { color: theme.text }]}>
                  Uploaded Files ({activeReciter.audioFiles.length})
                </Text>
                {activeReciter.audioFiles.slice(0, 5).map((file, idx) => (
                  <View key={idx} style={[styles.fileItem, { borderColor: theme.border }]}>
                    <Ionicons name="musical-note" size={16} color={Colors.primary} />
                    <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
                      {file.fileName || `Surah ${file.surahId}, Ayah ${file.ayahNumber}`}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handlePlaySurah(file.surahId)}
                      style={styles.filePlayBtn}
                    >
                      <Ionicons name="play-circle" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
                {activeReciter.audioFiles.length > 5 && (
                  <Text style={[styles.moreFiles, { color: theme.textSecondary }]}>
                    +{activeReciter.audioFiles.length - 5} more files
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Quick Play Surahs */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Quick Play (Sample Surahs)</Text>
          {Object.keys(SAMPLE_AYAHS).map((surahId) => {
            const surah = getSurahById(parseInt(surahId));
            return surah ? (
              <TouchableOpacity
                key={surahId}
                style={[styles.quickPlayItem, { borderColor: theme.border }]}
                onPress={() => handlePlaySurah(parseInt(surahId))}
              >
                <View style={[styles.quickPlayNum, { backgroundColor: Colors.primary + '18' }]}>
                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 12 }}>{surah.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: theme.text, fontWeight: '600' }]}>{surah.name}</Text>
                  <Text style={[{ color: theme.textSecondary, fontSize: 12 }]}>{surah.totalAyah} ayahs</Text>
                </View>
                <Text style={{ color: Colors.primary, fontSize: 18 }}>{surah.arabicName}</Text>
                <Ionicons name="play-circle-outline" size={24} color={Colors.primary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ) : null;
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: Typography.uiFontSize.xl, fontWeight: '700' },
  scrollContent: { padding: Spacing.md, gap: Spacing.sm },
  nowPlayingCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
  },
  nowPlayingIcon: { marginBottom: Spacing.sm },
  nowPlayingLabel: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.uiFontSize.sm },
  nowPlayingSurah: { color: '#fff', fontSize: Typography.uiFontSize.xxl, fontWeight: '700', textAlign: 'center' },
  nowPlayingAyah: { color: 'rgba(255,255,255,0.8)', fontSize: 18, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  nowPlayingReciter: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.uiFontSize.sm, marginTop: 4 },
  sectionCard: { borderRadius: BorderRadius.md, padding: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionLabel: { fontSize: Typography.uiFontSize.md, fontWeight: '700', marginBottom: Spacing.sm },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressTime: { fontSize: Typography.uiFontSize.xs, width: 36 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', position: 'relative' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressThumb: {
    position: 'absolute', top: -4, width: 12, height: 12,
    borderRadius: 6, marginLeft: -6,
  },
  controlsCard: { borderRadius: BorderRadius.md, padding: Spacing.md },
  loopRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  loopBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm, justifyContent: 'center',
  },
  loopBtnText: { fontSize: Typography.uiFontSize.sm },
  mainControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  controlBtn: { padding: Spacing.sm },
  playPauseBtn: {
    width: 64, height: 64, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  speedRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  speedChip: {
    borderWidth: 1.5, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  speedChipText: { fontSize: Typography.uiFontSize.sm, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 6,
  },
  addBtnText: { color: '#fff', fontSize: Typography.uiFontSize.sm, fontWeight: '600' },
  emptyReciters: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  emptyText: { fontSize: Typography.uiFontSize.sm, textAlign: 'center' },
  reciterItem: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm, padding: Spacing.sm,
  },
  reciterInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reciterAvatar: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  reciterMeta: { flex: 1 },
  reciterName: { fontSize: Typography.uiFontSize.md, fontWeight: '600' },
  reciterFiles: { fontSize: Typography.uiFontSize.xs },
  deleteBtn: { padding: Spacing.sm },
  uploadInfo: { fontSize: Typography.uiFontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadius.md, padding: Spacing.md, justifyContent: 'center',
  },
  uploadBtnText: { color: '#fff', fontSize: Typography.uiFontSize.md, fontWeight: '600' },
  filesList: { marginTop: Spacing.md },
  filesTitle: { fontSize: Typography.uiFontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  fileItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderBottomWidth: 0.5, paddingVertical: Spacing.sm,
  },
  fileName: { flex: 1, fontSize: Typography.uiFontSize.sm },
  filePlayBtn: { padding: 4 },
  moreFiles: { fontSize: Typography.uiFontSize.xs, textAlign: 'center', marginTop: 4 },
  quickPlayItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderBottomWidth: 0.5, paddingVertical: Spacing.sm,
  },
  quickPlayNum: {
    width: 32, height: 32, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
});
