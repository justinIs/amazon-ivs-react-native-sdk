/**
 * Design tokens for the example app.
 *
 * A tiny, dependency-free design system: components read these instead of
 * hard-coding colors/spacing, so the look stays consistent and is easy to
 * retheme in one place.
 */

export const colors = {
  bg: '#0b0b0f',
  surface: '#16171d',
  surfaceAlt: '#1e1f27',
  border: '#26272e',
  text: '#ffffff',
  textMuted: '#9aa0a6',
  textFaint: '#6b7280',
  primary: '#2f6fed',
  onPrimary: '#ffffff',
  success: '#1f9d55',
  warning: '#d9a300',
  danger: '#f97066',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
} as const;

export const mono = 'monospace';
