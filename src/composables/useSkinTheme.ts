import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { getImagePath } from '@/utils/api'

export function useSkinTheme() {
  const themeStore = useThemeStore()
  
  const currentTheme = computed(() => themeStore.currentTheme)
  const availableThemes = computed(() => themeStore.availableThemes)
  const currentThemeId = computed(() => themeStore.themeId)

  const setTheme = async (themeId: string) => {
    await themeStore.loadTheme(themeId)
  }

  const getPrimaryColor = (index: number = 0) => {
    const colors = currentTheme.value?.primaryColor
    return colors?.[index] || colors?.[0] || 'rgba(45, 55, 72, 0.3)'
  }

  const getSecondaryColor = (index: number = 0) => {
    const colors = currentTheme.value?.secondaryColor
    return colors?.[index] || colors?.[0] || 'rgba(0, 255, 255, 0.9)'
  }

  const getTextColor = (index: number = 0) => {
    const colors = currentTheme.value?.textColor
    return colors?.[index] || colors?.[0] || 'rgba(229, 231, 235, 1)'
  }

  const getSvgFile = () => {
    return currentTheme.value?.svgFile || ''
  }

  const getEmergencyColor = () => {
    return currentTheme.value?.emergencyColor || 'var(--color-error)'
  }

  const getBorderRadius = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    return currentTheme.value?.borderRadius?.[size] || '6px'
  }

  // Get theme-aware CSS variables for radius
  const getThemeRadiusVars = () => {
    const theme = currentTheme.value
    return {
      '--theme-radius-sm': theme?.borderRadius?.sm || 'var(--radius-sm)',
      '--theme-radius-md': theme?.borderRadius?.md || 'var(--radius-md)',
      '--theme-radius-lg': theme?.borderRadius?.lg || 'var(--radius-lg)',
      '--theme-radius-xl': theme?.borderRadius?.xl || 'var(--radius-xl)'
    }
  }

  const getBorderWidth = (size: 'thin' | 'medium' | 'thick' = 'thin') => {
    return currentTheme.value?.borderWidth?.[size] || '1px'
  }

  const getBackgroundColor = () => {
    return currentTheme.value?.backgroundColor || 'rgba(0, 0, 0, 1)'
  }

  const getDaoToken1Color = () => {
    return currentTheme.value?.daoColors?.token1Color || 'rgba(0, 255, 255, 0.9)'
  }

  const getDaoToken2Color = () => {
    return currentTheme.value?.daoColors?.token2Color || 'rgba(255, 165, 0, 0.9)'
  }

  const getDaoGuildColor = () => {
    return currentTheme.value?.daoColors?.guildColor || 'rgba(138, 43, 226, 0.9)'
  }

  const getImagePaths = () => {
    const images = currentTheme.value?.images || []
    return images.map(imagePath => getImagePath(imagePath))
  }

  return {
    currentTheme,
    currentThemeId,
    availableThemes,
    setTheme,
    getPrimaryColor,
    getSecondaryColor,
    getTextColor,
    getSvgFile,
    getEmergencyColor,
    getBorderRadius,
    getThemeRadiusVars,
    getBorderWidth,
    getBackgroundColor,
    getDaoToken1Color,
    getDaoToken2Color,
    getDaoGuildColor,
    getImagePaths
  }
}
