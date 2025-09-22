import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FOUNDRY_TABS, FOUNDRY_ICONS, FOUNDRY_DESCRIPTIONS } from '@/constants/foundry'

export interface FoundryTab {
  id: string
  title: string
  icon: string
  route: string
  description?: string
}

export const useFoundryStore = defineStore('foundry', () => {
  // State
  const currentFoundryTab = ref<string>(FOUNDRY_TABS.NFT)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Available foundry tabs
  const availableTabs = ref<FoundryTab[]>([
    {
      id: FOUNDRY_TABS.NFT,
      title: 'NFT',
      icon: FOUNDRY_ICONS.NFT,
      route: '/foundry/nft',
      description: FOUNDRY_DESCRIPTIONS.NFT
    },
    {
      id: FOUNDRY_TABS.TOKEN1,
      title: 'Token 1',
      icon: FOUNDRY_ICONS.TOKEN1,
      route: '/foundry/token1',
      description: FOUNDRY_DESCRIPTIONS.TOKEN1
    },
    {
      id: FOUNDRY_TABS.TOKEN2,
      title: 'Token 2',
      icon: FOUNDRY_ICONS.TOKEN2,
      route: '/foundry/token2',
      description: FOUNDRY_DESCRIPTIONS.TOKEN2
    },
    {
      id: FOUNDRY_TABS.CUSTOM,
      title: 'Custom',
      icon: FOUNDRY_ICONS.CUSTOM,
      route: '/foundry/custom',
      description: FOUNDRY_DESCRIPTIONS.CUSTOM
    }
  ])

  // Getters
  const hasActiveTab = computed(() => !!currentFoundryTab.value)
  const currentTab = computed(() => 
    availableTabs.value.find(tab => tab.id === currentFoundryTab.value)
  )
  const currentTabIndex = computed(() => 
    availableTabs.value.findIndex(tab => tab.id === currentFoundryTab.value)
  )

  // Actions
  const setCurrentTab = (tabId: string) => {
    const tab = availableTabs.value.find(t => t.id === tabId)
    if (tab) {
      currentFoundryTab.value = tabId
      error.value = null
    } else {
      error.value = `Tab with id '${tabId}' not found`
    }
  }

  const nextTab = () => {
    const currentIndex = currentTabIndex.value
    const nextIndex = (currentIndex + 1) % availableTabs.value.length
    setCurrentTab(availableTabs.value[nextIndex].id)
  }

  const previousTab = () => {
    const currentIndex = currentTabIndex.value
    const prevIndex = currentIndex === 0 
      ? availableTabs.value.length - 1 
      : currentIndex - 1
    setCurrentTab(availableTabs.value[prevIndex].id)
  }

  const addTab = (tab: FoundryTab) => {
    const existingIndex = availableTabs.value.findIndex(t => t.id === tab.id)
    if (existingIndex === -1) {
      availableTabs.value.push(tab)
    } else {
      availableTabs.value[existingIndex] = tab
    }
  }

  const removeTab = (tabId: string) => {
    const index = availableTabs.value.findIndex(t => t.id === tabId)
    if (index !== -1) {
      availableTabs.value.splice(index, 1)
      // If we removed the current tab, switch to the first available tab
      if (currentFoundryTab.value === tabId && availableTabs.value.length > 0) {
        setCurrentTab(availableTabs.value[0].id)
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    currentFoundryTab,
    isLoading,
    error,
    availableTabs,
    
    // Getters
    hasActiveTab,
    currentTab,
    currentTabIndex,
    
    // Actions
    setCurrentTab,
    nextTab,
    previousTab,
    addTab,
    removeTab,
    clearError
  }
})
