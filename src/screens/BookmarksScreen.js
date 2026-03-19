import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../styles/theme';

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BookmarksScreen({ navigation }) {
  const { isDarkMode, bookmarks, removeBookmark } = useApp();
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleNavigate = useCallback((bookmark) => {
    navigation.navigate('Read', { surahId: bookmark.surahId });
  }, [navigation]);

  const handleDelete = useCallback((bookmark) => {
    Alert.alert(
      'Remove Bookmark',
      `Remove bookmark for ${bookmark.surahName} Ayah ${bookmark.ayahNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeBookmark(bookmark.ayahId) },
      ]
    );
  }, [removeBookmark]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.bookmarkCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadow.small]}
      onPress={() => handleNavigate(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.accentBar, { backgroundColor: Colors.accent }]} />
      <View style={styles.bookmarkContent}>
        <View style={styles.bookmarkHeader}>
          <View>
            <Text style={[styles.surahName, { color: theme.text }]}>{item.surahName}</Text>
            <Text style={[styles.ayahRef, { color: theme.textSecondary }]}>
              Ayah {item.ayahNumber} · Page {item.pageNumber}
            </Text>
          </View>
          <View style={styles.bookmarkActions}>
            <Text style={[styles.arabicName, { color: Colors.primary }]}>{item.arabicName}</Text>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.deleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {item.text && (
          <Text style={[styles.ayahText, { color: theme.text }]} numberOfLines={2}>
            {item.text}
          </Text>
        )}

        <View style={styles.bookmarkFooter}>
          <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            Bookmarked {formatDate(item.createdAt)}
          </Text>
          <TouchableOpacity
            style={[styles.readBtn, { backgroundColor: Colors.primary }]}
            onPress={() => handleNavigate(item)}
          >
            <Text style={styles.readBtnText}>Read</Text>
            <Ionicons name="chevron-forward" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Bookmarks</Text>
        <View style={[styles.countBadge, { backgroundColor: Colors.accent + '22' }]}>
          <Text style={[styles.countText, { color: Colors.accent }]}>{bookmarks.length}</Text>
        </View>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={72} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Bookmarks Yet</Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            While reading the Quran, tap the bookmark icon{'\n'}
            next to any ayah to save it here.
          </Text>
          <TouchableOpacity
            style={[styles.readNowBtn, { backgroundColor: Colors.primary }]}
            onPress={() => navigation.navigate('Read', { surahId: 1 })}
          >
            <Ionicons name="book-outline" size={18} color="#fff" />
            <Text style={styles.readNowBtnText}>Start Reading</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookmarks.sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={(item) => item.ayahId}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.listHeader, { color: theme.textSecondary }]}>
              {bookmarks.length} saved {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: Typography.uiFontSize.xl, fontWeight: '700', flex: 1 },
  countBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  countText: { fontSize: Typography.uiFontSize.sm, fontWeight: '700' },
  listContent: { padding: Spacing.md, gap: Spacing.sm },
  listHeader: { fontSize: Typography.uiFontSize.sm, marginBottom: Spacing.xs },
  bookmarkCard: {
    flexDirection: 'row', borderRadius: BorderRadius.md,
    borderWidth: 1, overflow: 'hidden',
  },
  accentBar: { width: 4 },
  bookmarkContent: { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  bookmarkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  surahName: { fontSize: Typography.uiFontSize.md, fontWeight: '700' },
  ayahRef: { fontSize: Typography.uiFontSize.xs, marginTop: 2 },
  bookmarkActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  arabicName: { fontSize: 18 },
  deleteBtn: { padding: 4 },
  ayahText: {
    fontSize: 18, lineHeight: 36, textAlign: 'right',
    writingDirection: 'rtl', color: '#333',
  },
  bookmarkFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: Typography.uiFontSize.xs, flex: 1 },
  readBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  readBtnText: { color: '#fff', fontSize: Typography.uiFontSize.xs, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: Typography.uiFontSize.xxl, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm },
  emptyDesc: { fontSize: Typography.uiFontSize.sm, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  readNowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm + 2,
  },
  readNowBtnText: { color: '#fff', fontSize: Typography.uiFontSize.md, fontWeight: '600' },
});
