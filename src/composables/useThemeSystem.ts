import { computed, ref, watch } from 'vue'
import { useSkinTheme } from './useSkinTheme'
import { useDesignTokens } from './useDesignTokens'

export interface ThemeVariant {
  id: string
  name: string
  colors: {
    primary: string[]
    secondary: string[]
    accent?: string[]
    neutral?: string[]
  }
  typography?: {
    fontFamily?: string
    fontSize?: {
      base: string
      scale: number
    }
  }
  spacing?: {
    base: string
    scale: number
  }
  borderRadius?: {
    base: string
    scale: number
  }
  shadows?: {
    base: string
    intensity: number
  }
}

export function useThemeSystem() {
  const { currentTheme, setTheme, getPrimaryColor, getSecondaryColor } = useSkinTheme()
  const { colors, getComponentStyles } = useDesignTokens()

  // Theme variants for different component states
  const themeVariants = ref<Record<string, ThemeVariant>>({
    default: {
      id: 'default',
      name: 'Default',
      colors: {
        primary: [getPrimaryColor(0), getPrimaryColor(1), getPrimaryColor(2)],
        secondary: [getSecondaryColor(0), getSecondaryColor(1), getSecondaryColor(2)]
      }
    },
    muted: {
      id: 'muted',
      name: 'Muted',
      colors: {
        primary: [getPrimaryColor(0) + '80', getPrimaryColor(1) + '60', getPrimaryColor(2) + '40'],
        secondary: [getSecondaryColor(0) + '80', getSecondaryColor(1) + '60', getSecondaryColor(2) + '40']
      }
    },
    vibrant: {
      id: 'vibrant',
      name: 'Vibrant',
      colors: {
        primary: [getPrimaryColor(0), getPrimaryColor(1), getPrimaryColor(2)],
        secondary: [getSecondaryColor(0), getSecondaryColor(1), getSecondaryColor(2)],
        accent: ['#ff6b6b', '#4ecdc4', '#45b7d1']
      }
    }
  })

  // Current theme variant
  const currentVariant = ref<string>('default')

  // Computed theme colors based on current variant
  const themeColors = computed(() => {
    const variant = themeVariants.value[currentVariant.value] || themeVariants.value.default
    return {
      primary: variant.colors.primary,
      secondary: variant.colors.secondary,
      accent: variant.colors.accent || variant.colors.secondary,
      background: colors.value.background,
      emergency: colors.value.emergency
    }
  })

  // Get color with opacity
  const getColorWithOpacity = (color: string, opacity: number = 1) => {
    if (color.includes('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`)
    }
    if (color.includes('#')) {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  }

  // Generate CSS custom properties for a component
  const getComponentTheme = (componentName: string, variant?: string) => {
    const variantName = variant || currentVariant.value
    const variantColors = themeVariants.value[variantName] || themeVariants.value.default
    
    return {
      [`--${componentName}-primary-0`]: variantColors.colors.primary[0],
      [`--${componentName}-primary-1`]: variantColors.colors.primary[1],
      [`--${componentName}-primary-2`]: variantColors.colors.primary[2],
      [`--${componentName}-secondary-0`]: variantColors.colors.secondary[0],
      [`--${componentName}-secondary-1`]: variantColors.colors.secondary[1],
      [`--${componentName}-secondary-2`]: variantColors.colors.secondary[2],
      [`--${componentName}-accent-0`]: variantColors.colors.accent?.[0] || variantColors.colors.secondary[0],
      [`--${componentName}-accent-1`]: variantColors.colors.accent?.[1] || variantColors.colors.secondary[1],
      [`--${componentName}-accent-2`]: variantColors.colors.accent?.[2] || variantColors.colors.secondary[2]
    }
  }

  // Get component styles with theme integration
  const getThemedComponentStyles = (componentName: string, size: string, variant?: string) => {
    const baseStyles = getComponentStyles(size as any, variant)
    const themeStyles = getComponentTheme(componentName, variant)
    
    return {
      ...baseStyles,
      ...themeStyles
    }
  }

  // Set theme variant
  const setThemeVariant = (variantId: string) => {
    if (themeVariants.value[variantId]) {
      currentVariant.value = variantId
    }
  }

  // Create a new theme variant
  const createThemeVariant = (variant: ThemeVariant) => {
    themeVariants.value[variant.id] = variant
  }

  // Update existing theme variant
  const updateThemeVariant = (variantId: string, updates: Partial<ThemeVariant>) => {
    if (themeVariants.value[variantId]) {
      themeVariants.value[variantId] = {
        ...themeVariants.value[variantId],
        ...updates
      }
    }
  }

  // Get contrast color (light or dark) for a given background color
  const getContrastColor = (backgroundColor: string) => {
    // Simple contrast calculation - in a real app you'd use a proper contrast algorithm
    if (backgroundColor.includes('rgba')) {
      const alpha = parseFloat(backgroundColor.match(/[\d.]+\)$/)?.[0]?.replace(')', '') || '1')
      if (alpha < 0.5) return '#ffffff'
    }
    
    // Check if color is light or dark based on RGB values
    const rgb = backgroundColor.match(/\d+/g)
    if (rgb && rgb.length >= 3) {
      const [r, g, b] = rgb.map(Number)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 128 ? '#000000' : '#ffffff'
    }
    
    return '#ffffff'
  }

  // Watch for theme changes and update variants
  watch(currentTheme, (newTheme) => {
    // Update default variant with new theme colors
    themeVariants.value.default.colors.primary = [
      getPrimaryColor(0),
      getPrimaryColor(1),
      getPrimaryColor(2)
    ]
    themeVariants.value.default.colors.secondary = [
      getSecondaryColor(0),
      getSecondaryColor(1),
      getSecondaryColor(2)
    ]
  })

  return {
    currentTheme,
    currentVariant,
    themeVariants,
    themeColors,
    getColorWithOpacity,
    getComponentTheme,
    getThemedComponentStyles,
    setThemeVariant,
    createThemeVariant,
    updateThemeVariant,
    getContrastColor
  }
}
