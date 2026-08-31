// Modern UI Theme & Design Tokens for Leave App

export const colors = {
  // Brand & Accent Colors
  primary: '#6366f1', // Indigo
  primaryDark: '#4f46e5',
  primaryLight: '#eef2ff',
  primaryGlow: 'rgba(99, 102, 241, 0.15)',
  
  secondary: '#06b6d4', // Cyan
  secondaryLight: '#ecfeff',
  
  accentViolet: '#8b5cf6', // Violet / Purple
  accentVioletLight: '#f5f3ff',

  // Status Colors
  success: '#10b981', // Emerald
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  successText: '#047857',

  warning: '#f59e0b', // Amber
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  warningText: '#b45309',

  danger: '#ef4444', // Rose/Red
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  dangerText: '#b91c1c',

  info: '#3b82f6', // Blue
  infoBg: '#eff6ff',
  infoBorder: '#bfdbfe',
  infoText: '#1d4ed8',

  // Neutral Colors
  bgPage: '#f8fafc',
  bgCard: '#ffffff',
  bgCardHover: '#f1f5f9',
  bgElevated: '#ffffff',
  
  borderLight: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  borderFocus: '#6366f1',

  // Text Hierarchy
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textWhite: '#ffffff',

  // Role Pill Colors
  roleStudent: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
  roleTeacher: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  roleHod: { bg: '#f3e8ff', text: '#5b21b6', border: '#ddd6fe' },
  roleAdmin: { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' },

  // Type Badges
  typeLeave: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  typeOd: { bg: '#fae8ff', text: '#86198f', border: '#f5d0fe' },
};

export const shadows = {
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
};

export const theme = {
  colors,
  shadows,
  radius,
};

export default theme;
