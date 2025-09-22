import { computed } from 'vue'
import { useSkinTheme } from './useSkinTheme'

export function useDesignTokens() {
  const { currentTheme, getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

  // Spacing tokens
  const spacing = {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    '2xl': 'var(--space-2xl)',
    '3xl': 'var(--space-3xl)'
  }

  // Typography tokens
  const typography = {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
    '4xl': 'var(--text-4xl)',
    '5xl': 'var(--text-5xl)'
  }

  // Font weight tokens
  const fontWeights = {
    thin: 'var(--font-thin)',
    light: 'var(--font-light)',
    normal: 'var(--font-normal)',
    medium: 'var(--font-medium)',
    semibold: 'var(--font-semibold)',
    bold: 'var(--font-bold)',
    extrabold: 'var(--font-extrabold)',
    black: 'var(--font-black)'
  }

  // Border radius tokens - use skin values when available, fallback to CSS vars
  const borderRadius = {
    none: 'var(--radius-none)',
    sm: getBorderRadius('sm'),
    md: getBorderRadius('md'),
    lg: getBorderRadius('lg'),
    xl: getBorderRadius('xl'),
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)'
  }

  // Border width tokens - use skin values when available, fallback to CSS vars
  const borderWidth = {
    thin: 'var(--border-width-thin)',
    medium: 'var(--border-width-medium)',
    thick: 'var(--border-width-thick)'
  }

  // Shadow tokens
  const shadows = {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)'
  }

  // Z-index tokens
  const zIndex = {
    dropdown: 'var(--z-dropdown)',
    sticky: 'var(--z-sticky)',
    fixed: 'var(--z-fixed)',
    modalBackdrop: 'var(--z-modal-backdrop)',
    modal: 'var(--z-modal)',
    popover: 'var(--z-popover)',
    tooltip: 'var(--z-tooltip)',
    toast: 'var(--z-toast)'
  }

  // Transition tokens
  const transitions = {
    fast: 'var(--transition-fast)',
    normal: 'var(--transition-normal)',
    slow: 'var(--transition-slow)',
    bounce: 'var(--transition-bounce)'
  }

  // Theme-aware color tokens - only using colors from skin JSON
  const colors = computed(() => ({
    primary: {
      0: getPrimaryColor(0),
      1: getPrimaryColor(1),
      2: getPrimaryColor(2)
    },
    secondary: {
      0: getSecondaryColor(0),
      1: getSecondaryColor(1),
      2: getSecondaryColor(2)
    },
    text: {
      0: getTextColor(0),
      1: getTextColor(1),
      2: getTextColor(2)
    },
    background: currentTheme.value?.backgroundColor || 'rgba(0, 0, 0, 1)',
    emergency: currentTheme.value?.emergencyColor || '#ef4444'
  }))

  // Component size variants
  const componentSizes = {
    xs: {
      padding: spacing.xs,
      fontSize: typography.xs,
      borderRadius: borderRadius.sm,
      gap: spacing.xs
    },
    sm: {
      padding: spacing.sm,
      fontSize: typography.sm,
      borderRadius: borderRadius.md,
      gap: spacing.sm
    },
    md: {
      padding: spacing.md,
      fontSize: typography.base,
      borderRadius: borderRadius.lg,
      gap: spacing.md
    },
    lg: {
      padding: spacing.lg,
      fontSize: typography.lg,
      borderRadius: borderRadius.xl,
      gap: spacing.lg
    },
    xl: {
      padding: spacing.xl,
      fontSize: typography.xl,
      borderRadius: borderRadius['2xl'],
      gap: spacing.xl
    }
  }

  // Get component styles for a specific size and variant
  const getComponentStyles = (size: keyof typeof componentSizes, variant?: string) => {
    const sizeTokens = componentSizes[size]
    const themeColors = colors.value

    return {
      padding: sizeTokens.padding,
      fontSize: sizeTokens.fontSize,
      borderRadius: sizeTokens.borderRadius,
      gap: sizeTokens.gap,
      ...(variant && {
        '--primary-color-0': themeColors.primary[0],
        '--primary-color-1': themeColors.primary[1],
        '--secondary-color-0': themeColors.secondary[0],
        '--secondary-color-1': themeColors.secondary[1],
        '--secondary-color-2': themeColors.secondary[2]
      })
    }
  }

  // Responsive breakpoints
  const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }

  // Media query helpers
  const mediaQuery = {
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`,
    '2xl': `@media (min-width: ${breakpoints['2xl']})`
  }

  return {
    spacing,
    typography,
    fontWeights,
    borderRadius,
    borderWidth,
    shadows,
    zIndex,
    transitions,
    colors,
    componentSizes,
    getComponentStyles,
    breakpoints,
    mediaQuery
  }
}
