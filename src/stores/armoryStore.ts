import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ARMORY_TABS, ARMORY_ICONS, ARMORY_DESCRIPTIONS } from '@/constants/armory'

export interface ArmoryTab {
  id: string
  title: string
  icon: string
  route: string
  description?: string
}

export const useArmoryStore = defineStore('armory', () => {
  // State
  const currentArmoryTab = ref<string>(ARMORY_TABS.CLAIM)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Available armory tabs
  const availableTabs = ref<ArmoryTab[]>([
    {
      id: ARMORY_TABS.CLAIM,
      title: 'Claim',
      icon: ARMORY_ICONS.CLAIM,
      route: '/armory/claim',
      description: ARMORY_DESCRIPTIONS.CLAIM
    },
    {
      id: ARMORY_TABS.SHOP,
      title: 'Shop',
      icon: ARMORY_ICONS.SHOP,
      route: '/armory/g2p',
      description: ARMORY_DESCRIPTIONS.SHOP
    },
    {
      id: ARMORY_TABS.USE,
      title: 'Use',
      icon: ARMORY_ICONS.USE,
      route: '/armory/gear',
      description: ARMORY_DESCRIPTIONS.USE
    }
  ])

  // Getters
  const hasActiveTab = computed(() => !!currentArmoryTab.value)
  const currentTab = computed(() => 
    availableTabs.value.find(tab => tab.id === currentArmoryTab.value)
  )
  const currentTabIndex = computed(() => 
    availableTabs.value.findIndex(tab => tab.id === currentArmoryTab.value)
  )

  // Actions
  const setCurrentTab = (tabId: string) => {
    const tab = availableTabs.value.find(t => t.id === tabId)
    if (tab) {
      currentArmoryTab.value = tabId
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

  const addTab = (tab: ArmoryTab) => {
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
      if (currentArmoryTab.value === tabId && availableTabs.value.length > 0) {
        setCurrentTab(availableTabs.value[0].id)
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    currentArmoryTab,
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
