import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

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
    return currentTheme.value?.emergencyColor || '#ef4444'
  }

  const getBorderRadius = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    return currentTheme.value?.borderRadius?.[size] || '6px'
  }

  const getBorderWidth = (size: 'thin' | 'medium' | 'thick' = 'thin') => {
    return currentTheme.value?.borderWidth?.[size] || '1px'
  }

  const getBackgroundColor = () => {
    return currentTheme.value?.backgroundColor || 'rgba(0, 0, 0, 1)'
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
    getBorderWidth,
    getBackgroundColor
  }
}
