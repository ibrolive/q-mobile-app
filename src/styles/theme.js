export const Colors = {
  // Primary palette
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryDark: '#0A3311',
  accent: '#D4AF37',
  accentLight: '#FFD700',

  // Light mode
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textMuted: '#BDBDBD',
    border: '#E0E0E0',
    icon: '#616161',
    navBar: '#FFFFFF',
    statusBar: 'dark',
  },

  // Dark mode
  dark: {
    background: '#0D1117',
    surface: '#161B22',
    card: '#21262D',
    text: '#E6EDF3',
    textSecondary: '#8B949E',
    textMuted: '#484F58',
    border: '#30363D',
    icon: '#8B949E',
    navBar: '#161B22',
    statusBar: 'light',
  },

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Tajweed colors
  tajweed: {
    ghunna: '#FF6B6B',
    ikhfaa: '#4ECDC4',
    idgham: '#45B7D1',
    iqlab: '#96CEB4',
    qalqala: '#FFEAA7',
    maddWajib: '#DDA0DD',
    maddJaiz: '#98FB98',
    default: '#212121',
  },
};

export const Typography = {
  arabicFont: 'System',
  arabicFontSize: {
    small: 22,
    medium: 28,
    large: 36,
    xlarge: 44,
  },
  arabicLineHeight: {
    small: 48,
    medium: 58,
    large: 70,
    xlarge: 82,
  },
  uiFontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 30,
  full: 9999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
};
