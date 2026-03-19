import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, StatusBar, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../styles/theme';
import { SURAHS } from '../data/surahs';

export default function HomeScreen({ navigation }) {
  const { isDarkMode, lastRead, bookmarks } = useApp();
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = SURAHS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arabicName.includes(searchQuery) ||
      s.id.toString() === searchQuery
  );

  const lastReadSurah = SURAHS.find((s) => s.id === lastRead?.surahId);

  const handleSurahPress = useCallback((surah) => {
    navigation.navigate('Read', { surahId: surah.id });
  }, [navigation]);

  const renderSurahItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.surahItem, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.small]}
      onPress={() => handleSurahPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.surahNumber, { backgroundColor: Colors.primary + '18' }]}>
        <Text style={[styles.surahNumberText, { color: Colors.primary }]}>{item.id}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={[styles.surahName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.surahMeta, { color: theme.textSecondary }]}>
          {item.totalAyah} Ayahs · {item.revelationType}
        </Text>
      </View>
      <Text style={[styles.surahArabicName, { color: Colors.primary }]}>{item.arabicName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>السلام عليكم</Text>
          <Text style={[styles.appTitle, { color: Colors.primary }]}>Custom Quran Player</Text>
        </View>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>

      {/* Continue Reading Card */}
      {lastReadSurah && (
        <TouchableOpacity
          style={[styles.continueCard, { backgroundColor: Colors.primary }]}
          onPress={() => navigation.navigate('Read', { surahId: lastRead.surahId })}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.continueLabel}>Continue Reading</Text>
            <Text style={styles.continueSurahName}>{lastReadSurah.name}</Text>
            <Text style={styles.continueAyah}>Ayah {lastRead.ayahId?.split(':')[1] || 1}</Text>
          </View>
          <View style={styles.continueMeta}>
            <Text style={styles.continueArabic}>{lastReadSurah.arabicName}</Text>
            <Ionicons name="book-outline" size={36} color="rgba(255,255,255,0.4)" />
          </View>
        </TouchableOpacity>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card }, Shadow.small]}>
          <Ionicons name="bookmark" size={20} color={Colors.accent} />
          <Text style={[styles.statValue, { color: theme.text }]}>{bookmarks.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Bookmarks</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }, Shadow.small]}>
          <Ionicons name="list" size={20} color={Colors.primaryLight} />
          <Text style={[styles.statValue, { color: theme.text }]}>114</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Surahs</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }, Shadow.small]}>
          <Ionicons name="layers" size={20} color={Colors.info} />
          <Text style={[styles.statValue, { color: theme.text }]}>604</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pages</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search surah by name or number..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Surah List */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSurahItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: theme.text }]}>All Surahs</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: Typography.uiFontSize.sm, marginBottom: 2 },
  appTitle: { fontSize: Typography.uiFontSize.xl, fontWeight: '700' },
  settingsBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  continueCard: {
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.uiFontSize.sm, marginBottom: 4 },
  continueSurahName: { color: '#fff', fontSize: Typography.uiFontSize.xl, fontWeight: '700', marginBottom: 2 },
  continueAyah: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.uiFontSize.sm },
  continueMeta: { alignItems: 'flex-end' },
  continueArabic: { color: 'rgba(255,255,255,0.9)', fontSize: 22, marginBottom: 8 },
  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: {
    flex: 1, borderRadius: BorderRadius.md, padding: Spacing.md,
    alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: Typography.uiFontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: Typography.uiFontSize.xs },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.md, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
    borderWidth: 1, marginBottom: Spacing.sm,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: Typography.uiFontSize.md, paddingVertical: Spacing.xs },
  sectionTitle: { fontSize: Typography.uiFontSize.lg, fontWeight: '600', marginBottom: Spacing.sm },
  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xs },
  surahItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1,
  },
  surahNumber: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  surahNumberText: { fontSize: Typography.uiFontSize.sm, fontWeight: '700' },
  surahInfo: { flex: 1 },
  surahName: { fontSize: Typography.uiFontSize.md, fontWeight: '600', marginBottom: 2 },
  surahMeta: { fontSize: Typography.uiFontSize.xs },
  surahArabicName: { fontSize: 18, fontWeight: '500' },
});
