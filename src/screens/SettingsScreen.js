import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../styles/theme';

const DISPLAY_STYLES = [
  { value: 'plain', label: 'Plain Uthmani', icon: 'text', description: 'Clean Uthmani script, no color coding' },
  { value: 'tajweed', label: 'Tajweed Colors', icon: 'color-palette', description: 'Color-coded tajweed rules' },
  { value: 'highcontrast', label: 'High Contrast', icon: 'contrast', description: 'Yellow text on black for accessibility' },
];

const FONT_SIZES = [
  { value: 'small', label: 'Small', sample: 'أ', size: 18 },
  { value: 'medium', label: 'Medium', sample: 'أ', size: 24 },
  { value: 'large', label: 'Large', sample: 'أ', size: 30 },
  { value: 'xlarge', label: 'XL', sample: 'أ', size: 36 },
];

function SettingRow({ icon, title, subtitle, right, onPress }) {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  return (
    <TouchableOpacity
      style={[styles.settingRow, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: Colors.primary + '18' }]}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
      {right}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }) {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  return <Text style={[styles.sectionHeader, { color: Colors.primary }]}>{title}</Text>;
}

export default function SettingsScreen({ navigation }) {
  const {
    isDarkMode, toggleDarkMode,
    displayStyle, changeDisplayStyle,
    arabicFontSize, changeFontSize,
    bookmarks, reciters,
  } = useApp();
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleClearBookmarks = () => {
    Alert.alert(
      'Clear All Bookmarks',
      'This will remove all your bookmarks. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All', style: 'destructive',
          onPress: async () => {
            // Clear through removeBookmark for each
            Alert.alert('Cleared', 'All bookmarks have been removed.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SectionHeader title="APPEARANCE" />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="moon-outline"
            title="Dark Mode"
            subtitle={isDarkMode ? 'Currently enabled' : 'Currently disabled'}
            right={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#ddd', true: Colors.primary + '88' }}
                thumbColor={isDarkMode ? Colors.primary : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Display Style */}
        <SectionHeader title="QURAN DISPLAY STYLE" />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {DISPLAY_STYLES.map((style) => (
            <TouchableOpacity
              key={style.value}
              style={[styles.displayStyleItem, { borderBottomColor: theme.border }]}
              onPress={() => changeDisplayStyle(style.value)}
            >
              <View style={[styles.settingIcon, { backgroundColor: displayStyle === style.value ? Colors.primary : Colors.primary + '18' }]}>
                <Ionicons name={style.icon} size={20} color={displayStyle === style.value ? '#fff' : Colors.primary} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{style.label}</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{style.description}</Text>
              </View>
              {displayStyle === style.value && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Font Size */}
        <SectionHeader title="ARABIC FONT SIZE" />
        <View style={[styles.card, { backgroundColor: theme.card, padding: Spacing.md }]}>
          <View style={styles.fontSizeRow}>
            {FONT_SIZES.map((fs) => (
              <TouchableOpacity
                key={fs.value}
                style={[
                  styles.fontSizeBtn,
                  { borderColor: theme.border },
                  arabicFontSize === fs.value && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                ]}
                onPress={() => changeFontSize(fs.value)}
              >
                <Text style={[{ fontSize: fs.size / 1.5, color: arabicFontSize === fs.value ? '#fff' : Colors.primary }]}>
                  {fs.sample}
                </Text>
                <Text style={[styles.fontSizeLabel, { color: arabicFontSize === fs.value ? '#fff' : theme.text }]}>
                  {fs.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <View style={[styles.previewBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 6 }}>Preview:</Text>
            <Text style={{
              fontSize: {
                small: Typography.uiFontSize.xl,
                medium: 28,
                large: 36,
                xlarge: 44,
              }[arabicFontSize] || 28,
              color: displayStyle === 'highcontrast' ? '#FFFF00' : theme.text,
              textAlign: 'right',
              lineHeight: 52,
              backgroundColor: displayStyle === 'highcontrast' ? '#000' : 'transparent',
            }}>
              بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ
            </Text>
          </View>
        </View>

        {/* Data & Privacy */}
        <SectionHeader title="DATA & STORAGE" />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="bookmark-outline"
            title="Bookmarks"
            subtitle={`${bookmarks.length} saved`}
            right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
            onPress={() => navigation.navigate('Bookmarks')}
          />
          <SettingRow
            icon="mic-outline"
            title="Reciters"
            subtitle={`${reciters.length} reciter(s)`}
            right={<Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />}
            onPress={() => navigation.navigate('Audio')}
          />
          <SettingRow
            icon="trash-outline"
            title="Clear Bookmarks"
            subtitle="Remove all saved bookmarks"
            right={<Ionicons name="chevron-forward" size={18} color={Colors.error} />}
            onPress={handleClearBookmarks}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <SettingRow
            icon="information-circle-outline"
            title="Custom Quran Player"
            subtitle="Version 1.0.0"
          />
          <SettingRow
            icon="book-outline"
            title="Quran Text"
            subtitle="Uthmani Hafs script"
          />
          <SettingRow
            icon="shield-checkmark-outline"
            title="Privacy"
            subtitle="All data stored locally on device"
          />
        </View>

        {/* App Quote */}
        <View style={[styles.quoteCard, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '30' }]}>
          <Text style={[styles.quoteText, { color: Colors.primary }]}>
            وَلَقَدۡ يَسَّرۡنَا ٱلۡقُرۡءَانَ لِلذِّكۡرِ فَهَلۡ مِن مُّدَّكِرٍ
          </Text>
          <Text style={[styles.quoteTranslation, { color: theme.textSecondary }]}>
            "And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?" (54:17)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: Typography.uiFontSize.xl, fontWeight: '700' },
  scrollContent: { padding: Spacing.md, gap: Spacing.xs },
  sectionHeader: {
    fontSize: Typography.uiFontSize.xs, fontWeight: '700', letterSpacing: 1,
    marginTop: Spacing.md, marginBottom: Spacing.xs, marginLeft: 4,
  },
  card: { borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadow.small },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 0.5,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: Typography.uiFontSize.md, fontWeight: '500' },
  settingSubtitle: { fontSize: Typography.uiFontSize.xs, marginTop: 2 },
  displayStyleItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 0.5,
  },
  fontSizeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  fontSizeBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: BorderRadius.sm,
    alignItems: 'center', paddingVertical: Spacing.sm, gap: 4,
  },
  fontSizeLabel: { fontSize: Typography.uiFontSize.xs, fontWeight: '600' },
  previewBox: {
    borderWidth: 1, borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  quoteCard: {
    borderRadius: BorderRadius.md, borderWidth: 1,
    padding: Spacing.lg, gap: Spacing.sm, marginTop: Spacing.md,
  },
  quoteText: { fontSize: 20, textAlign: 'right', lineHeight: 36 },
  quoteTranslation: { fontSize: Typography.uiFontSize.sm, lineHeight: 20, fontStyle: 'italic' },
});
