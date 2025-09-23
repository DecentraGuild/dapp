import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSlpPath } from '@/utils/api'
import { useGuildStore } from './guildStore'

export interface ThemeData {
  id: string
  name: string
  description: string
  images: string[]
  svgFile: string
  shapeCoordinates: {
    imageSize: {
      width: number
      height: number
    }
  }
  headers: string[]
  icons: string[]
  primaryColor: string[]
  secondaryColor: string[]
  textColor: string[]
  backgroundColor: string
  emergencyColor: string
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderWidth?: {
    thin: string
    medium: string
    thick: string
  }
  metadata: {
    rarity: string
    creator: string
    mintedAt: string
    version: string
    category: string
    tags: string[]
  }
}

export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref<ThemeData | null>(null)
  const availableThemes = ref<ThemeData[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isOverride = ref(false) // Whether user has manually overridden theme

  // Getters
  const hasTheme = computed(() => !!currentTheme.value)
  const themeName = computed(() => currentTheme.value?.name || '')
  const themeId = computed(() => currentTheme.value?.id || '')
  const primaryColors = computed(() => currentTheme.value?.primaryColor || ['rgba(45, 55, 72, 0.3)', 'rgba(74, 85, 104, 0.45)', 'rgba(113, 128, 150, 0.6)'])
  const secondaryColors = computed(() => currentTheme.value?.secondaryColor || ['rgba(0, 255, 255, 0.9)', 'rgba(0, 230, 230, 0.5)', 'rgba(0, 204, 204, 0.2)'])
  const textColors = computed(() => currentTheme.value?.textColor || ['rgba(229, 231, 235, 1)', 'rgba(156, 163, 175, 1)', 'rgba(107, 114, 128, 1)'])
  const backgroundColor = computed(() => currentTheme.value?.backgroundColor || 'rgba(0, 0, 0, 1)')
  const emergencyColor = computed(() => currentTheme.value?.emergencyColor || '#ef4444')
  const borderRadius = computed(() => currentTheme.value?.borderRadius || {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px'
  })
  const borderWidth = computed(() => currentTheme.value?.borderWidth || {
    thin: '1px',
    medium: '2px',
    thick: '4px'
  })
  const themeHeaders = computed(() => currentTheme.value?.headers || [])
  const themeIcons = computed(() => currentTheme.value?.icons || [])
  const themeImages = computed(() => currentTheme.value?.images || [])
  const svgFile = computed(() => currentTheme.value?.svgFile || '')

  // CSS custom properties for theming
  const cssVariables = computed(() => {
    if (!currentTheme.value) return {}
    
    return {
      '--theme-primary-1': primaryColors.value[0],
      '--theme-primary-2': primaryColors.value[1],
      '--theme-primary-3': primaryColors.value[2],
      '--theme-secondary-1': secondaryColors.value[0],
      '--theme-secondary-2': secondaryColors.value[1],
      '--theme-secondary-3': secondaryColors.value[2],
      '--theme-text-1': textColors.value[0],
      '--theme-text-2': textColors.value[1],
      '--theme-text-3': textColors.value[2],
      '--theme-background': backgroundColor.value,
      '--theme-emergency': emergencyColor.value,
      '--theme-border-radius-sm': borderRadius.value.sm,
      '--theme-border-radius-md': borderRadius.value.md,
      '--theme-border-radius-lg': borderRadius.value.lg,
      '--theme-border-radius-xl': borderRadius.value.xl,
      '--theme-border-width-thin': borderWidth.value.thin,
      '--theme-border-width-medium': borderWidth.value.medium,
      '--theme-border-width-thick': borderWidth.value.thick
    }
  })

  // Actions
  const loadAvailableThemes = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // Load available themes from SLP assets
      const themeFiles = [
        'skin_castle_medieval.json',
        'skin_castle_shadowsun.json',
        'skin_castle_whitesun.json',
        'skin_spaceship_redknight.json'
      ]
      
      const themes: ThemeData[] = []
      
      for (const file of themeFiles) {
        try {
          const response = await fetch(getSlpPath(`skin/${file}`))
          if (response.ok) {
            const themeData = await response.json()
            // Process hardcoded paths in theme data
            themeData.images = themeData.images.map((img: string) => 
              img.startsWith('/SLP/') ? getSlpPath(img.replace('/SLP/', '')) : img
            )
            themeData.svgFile = themeData.svgFile.startsWith('/SLP/') 
              ? getSlpPath(themeData.svgFile.replace('/SLP/', '')) 
              : themeData.svgFile
            themes.push(themeData)
          } else {
          }
        } catch (err) {
        }
      }
      
      availableThemes.value = themes
      
      // Initialize default theme if none is currently loaded
      await initializeDefaultTheme()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load themes'
      console.error('Error loading themes:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadTheme = async (themeId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Find theme in available themes
      let theme = availableThemes.value.find(t => t.id === themeId)
      
      if (!theme) {
        // Try to load theme directly from file - handle both castle and spaceship themes
        let fileName = `skin_castle_${themeId}.json`
        if (themeId.includes('spaceship')) {
          fileName = `skin_spaceship_${themeId}.json`
        }
        
        const response = await fetch(getSlpPath(`skin/${fileName}`))
        if (response.ok) {
          theme = await response.json()
          // Process hardcoded paths in theme data
          if (theme) {
            theme.images = theme.images.map((img: string) => 
              img.startsWith('/SLP/') ? getSlpPath(img.replace('/SLP/', '')) : img
            )
            theme.svgFile = theme.svgFile.startsWith('/SLP/') 
              ? getSlpPath(theme.svgFile.replace('/SLP/', '')) 
              : theme.svgFile
          }
        } else {
          throw new Error('Theme not found')
        }
      }
      
      currentTheme.value = theme || null
      isOverride.value = true
      
      // Apply CSS variables to document
      applyThemeToDocument()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load theme'
      console.error('Error loading theme:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadGuildTheme = async (guildId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const guildStore = useGuildStore()
      const guild = guildStore.availableGuilds.find(g => g.id === guildId)
      
      if (!guild) {
        throw new Error('Guild not found')
      }
      
      // Load theme based on guild theme setting
      await loadTheme(guild.theme)
      isOverride.value = false // This is the guild's default theme
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load guild theme'
      console.error('Error loading guild theme:', err)
    } finally {
      isLoading.value = false
    }
  }

  const applyThemeToDocument = () => {
    if (!currentTheme.value) return
    
    const root = document.documentElement
    Object.entries(cssVariables.value).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }

  const resetToGuildTheme = async () => {
    const guildStore = useGuildStore()
    if (guildStore.hasActiveGuild) {
      await loadGuildTheme(guildStore.guildId!)
    }
  }

  const clearTheme = () => {
    currentTheme.value = null
    isOverride.value = false
    error.value = null
  }

  const initializeDefaultTheme = async () => {
    // If no theme is loaded and we have available themes, load castle_medieval as default
    if (!currentTheme.value && availableThemes.value.length > 0) {
      const defaultTheme = availableThemes.value.find(t => t.id === 'castle_medieval')
      if (defaultTheme) {
        currentTheme.value = defaultTheme
        applyThemeToDocument()
      }
    }
  }

  const getHeaderText = (index: number) => {
    return themeHeaders.value[index] || ''
  }

  const getIconName = (index: number) => {
    return themeIcons.value[index] || 'game-icons:question-mark'
  }

  const getThemeImage = (index: number = 0) => {
    return themeImages.value[index] || ''
  }

  return {
    // State
    currentTheme,
    availableThemes,
    isLoading,
    error,
    isOverride,
    
    // Getters
    hasTheme,
    themeName,
    themeId,
    primaryColors,
    secondaryColors,
    textColors,
    backgroundColor,
    emergencyColor,
    borderRadius,
    borderWidth,
    themeHeaders,
    themeIcons,
    themeImages,
    svgFile,
    cssVariables,
    
    // Actions
    loadAvailableThemes,
    loadTheme,
    loadGuildTheme,
    applyThemeToDocument,
    resetToGuildTheme,
    clearTheme,
    initializeDefaultTheme,
    getHeaderText,
    getIconName,
    getThemeImage
  }
})
