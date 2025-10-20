import { defineStore } from 'pinia'
import { useThemeStore } from './themeStore'
import { ref, computed } from 'vue'

export interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector or route to highlight
  action?: string // Action to perform
  position?: 'center' | 'right' | 'left' | 'top' | 'bottom'
  targetRoute?: string // Route that should trigger auto-advancement
  autoAdvance?: boolean // Whether to auto-advance when route is reached
}

export interface Tutorial {
  id: string
  name: string
  description: string
  steps: TutorialStep[]
  isActive: boolean
  isCompleted: boolean
}

export const useTutorialStore = defineStore('tutorial', () => {
  // State
  const isActive = ref(false)
  const isMinimized = ref(false)
  const hasCompletedTutorial = ref(false)
  const hasSeenWelcome = ref(false)

  // Tutorial definitions - loaded from JSON files
  const tutorials = ref<Tutorial[]>([])

  // Load tutorials from JSON files
  const loadTutorials = async () => {
    try {
      const welcomeTutorial = await import('@/tutorials/welcome.json')
      const questTutorial = await import('@/tutorials/quest-tutorial.json')
      const guildQuestTutorial = await import('@/tutorials/guild-quest-tutorial.json')
      const groupQuestTutorial = await import('@/tutorials/group-quest-tutorial.json')
      
      tutorials.value = [
        welcomeTutorial.default as Tutorial,
        questTutorial.default as Tutorial,
        guildQuestTutorial.default as Tutorial,
        groupQuestTutorial.default as Tutorial
      ]
    } catch (error) {
      // Failed to load tutorials - continue with empty array
      // Fallback to empty array if loading fails
      tutorials.value = []
    }
  }

  // Initialize tutorials on store creation
  loadTutorials()

  // Current tutorial and step tracking
  const currentTutorialId = ref<string | null>(null)
  const currentStepIndex = ref(0)

  // Local storage keys
  const STORAGE_KEYS = {
    TUTORIAL_PROGRESS: 'dguild_tutorial_progress',
    TUTORIAL_STATE: 'dguild_tutorial_state'
  }

  // Tutorial progress persistence
  const saveTutorialProgress = () => {
    const progress = {
      currentTutorialId: currentTutorialId.value,
      currentStepIndex: currentStepIndex.value,
      hasCompletedTutorial: hasCompletedTutorial.value,
      hasSeenWelcome: hasSeenWelcome.value,
      isActive: isActive.value,
      isMinimized: isMinimized.value,
      tutorialQuestState: tutorialQuestState.value
    }
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_PROGRESS, JSON.stringify(progress))
  }

  const loadTutorialProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TUTORIAL_PROGRESS)
      if (saved) {
        const progress = JSON.parse(saved)
        currentTutorialId.value = progress.currentTutorialId
        currentStepIndex.value = progress.currentStepIndex || 0
        hasCompletedTutorial.value = progress.hasCompletedTutorial || false
        hasSeenWelcome.value = progress.hasSeenWelcome || false
        isActive.value = progress.isActive || false
        isMinimized.value = progress.isMinimized || false
        tutorialQuestState.value = progress.tutorialQuestState || {
          isSignedUp: false,
          isAssigned: false,
          hasBorrowedMaxhog: false,
          isDelivered: false,
          isVerified: false,
          hasClaimed: false
        }
      }
    } catch (error) {
      console.warn('Failed to load tutorial progress from localStorage:', error)
    }
  }

  const clearTutorialProgress = () => {
    localStorage.removeItem(STORAGE_KEYS.TUTORIAL_PROGRESS)
  }

  // Current tutorial getters
  const currentTutorial = computed(() => {
    return tutorials.value.find(t => t.id === currentTutorialId.value) || null
  })

  const currentSteps = computed(() => {
    return currentTutorial.value?.steps || []
  })

  // Getters
  const currentStep = computed(() => currentSteps.value[currentStepIndex.value] || null)
  const progress = computed(() => ((currentStepIndex.value + 1) / currentSteps.value.length) * 100)
  const isLastStep = computed(() => currentStepIndex.value === currentSteps.value.length - 1)
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const totalSteps = computed(() => currentSteps.value.length)

  // Actions
  const startTutorial = (tutorialId?: string) => {
    if (tutorialId) {
      currentTutorialId.value = tutorialId
      const tutorial = tutorials.value.find(t => t.id === tutorialId)
      if (tutorial) {
        tutorial.isActive = true
      }
    } else {
      // Default to welcome tutorial
      currentTutorialId.value = 'welcome'
      const welcomeTutorial = tutorials.value.find(t => t.id === 'welcome')
      if (welcomeTutorial) {
        welcomeTutorial.isActive = true
      }
    }
    
    isActive.value = true
    isMinimized.value = false
    currentStepIndex.value = 0
    hasSeenWelcome.value = true
    
    // Save progress
    saveTutorialProgress()
  }

  const startQuestTutorial = () => {
    startTutorial('quest-tutorial')
  }

  const startGuildQuestTutorial = () => {
    startTutorial('guild-quest-tutorial')
  }

  const startGroupQuestTutorial = () => {
    startTutorial('group-quest-tutorial')
  }

  const loadSpacebaseYellowSkin = async () => {
    try {
      // Load the Spacebase Yellow skin using theme store
      const themeStore = useThemeStore()
      
      // Load the Spacebase Yellow skin
      await themeStore.loadTheme('spacebase_yellow')
    } catch (error) {
      console.error('Failed to load Spacebase Yellow skin:', error)
    }
  }

  const nextStep = () => {
    // Special handling for skin loading step
    if (currentStep.value?.id === 'vote-has-passed') {
      loadSpacebaseYellowSkin()
    }
    
    if (currentStepIndex.value < currentSteps.value.length - 1) {
      currentStepIndex.value++
    } else {
      // Only auto-complete if the current step has autoAdvance: true
      if (currentStep.value?.autoAdvance !== false) {
        completeTutorial()
      }
      // If autoAdvance is false, the user needs to manually complete via completeTutorialManually()
    }
    
    // Save progress
    saveTutorialProgress()
  }

  const previousStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
      // Save progress
      saveTutorialProgress()
    }
  }

  const goToStep = (index: number) => {
    if (index >= 0 && index < currentSteps.value.length) {
      currentStepIndex.value = index
      // Save progress
      saveTutorialProgress()
    }
  }

  const skipTutorial = () => {
    isActive.value = false
    hasSeenWelcome.value = true
    // Save progress
    saveTutorialProgress()
  }

  const completeTutorial = () => {
    if (currentTutorialId.value) {
      const tutorial = tutorials.value.find(t => t.id === currentTutorialId.value)
      if (tutorial) {
        tutorial.isCompleted = true
        tutorial.isActive = false
      }
    }
    
    isActive.value = false
    hasCompletedTutorial.value = true
    currentStepIndex.value = 0
    currentTutorialId.value = null
    
    // Save progress
    saveTutorialProgress()
  }

  const completeTutorialManually = () => {
    completeTutorial()
  }

  const toggleMinimize = () => {
    isMinimized.value = !isMinimized.value
  }

  const minimize = () => {
    isMinimized.value = true
  }

  const maximize = () => {
    isMinimized.value = false
  }

  const moveToRight = () => {
    if (currentStep.value && currentStep.value.position === 'center') {
      // Create a modified step with right position
      const modifiedStep = { ...currentStep.value, position: 'right' as const }
      // Update the current step in the tutorial steps array
      if (currentTutorial.value) {
        const stepIndex = currentStepIndex.value
        currentTutorial.value.steps[stepIndex] = modifiedStep
      }
    }
  }

  const reset = () => {
    isActive.value = false
    isMinimized.value = false
    currentStepIndex.value = 0
    hasCompletedTutorial.value = false
    hasSeenWelcome.value = false
    currentTutorialId.value = null
    resetTutorialQuestState()
    
    // Clear saved progress
    clearTutorialProgress()
    
    // Clear quest status from quest store
    import('./questStore').then(({ useQuestStore }) => {
      const questStore = useQuestStore()
      questStore.clearTutorialQuestStatus()
    })
  }

  const checkRouteAndAdvance = (currentRoute: string) => {
    if (!isActive.value || !currentStep.value) return

    const step = currentStep.value
    if (step.autoAdvance && step.targetRoute && currentRoute === step.targetRoute) {
      // Auto-advance to next step after a short delay
      setTimeout(() => {
        nextStep()
      }, 800)
    }
  }


  // Tutorial-specific quest state management
  const tutorialQuestState = ref({
    isSignedUp: false,
    isAssigned: false,
    hasBorrowedMaxhog: false,
    isDelivered: false,
    isVerified: false,
    hasClaimed: false
  })

  const updateTutorialQuestState = (action: string) => {
    switch (action) {
      case 'signup':
        tutorialQuestState.value.isSignedUp = true
        break
      case 'assign':
        tutorialQuestState.value.isAssigned = true
        break
      case 'borrow-maxhog':
        tutorialQuestState.value.hasBorrowedMaxhog = true
        break
      case 'deliver':
        tutorialQuestState.value.isDelivered = true
        break
      case 'verify':
        tutorialQuestState.value.isVerified = true
        break
      case 'claim':
        tutorialQuestState.value.hasClaimed = true
        break
    }
  }

  const resetTutorialQuestState = () => {
    tutorialQuestState.value = {
      isSignedUp: false,
      isAssigned: false,
      hasBorrowedMaxhog: false,
      isDelivered: false,
      isVerified: false,
      hasClaimed: false
    }
  }

  // Methods to handle specific tutorial actions
  const handleMaxhogBorrow = () => {
    updateTutorialQuestState('borrow-maxhog')
  }

  const handleClaimTutorialReward = () => {
    updateTutorialQuestState('claim')
  }

  const handleClaimTutorialResources = () => {
    // No longer used - handled by handleButtonAction
  }

  const handleTutorialQuestDelivery = () => {
    // No longer used - handled by handleButtonAction
  }

  const handleGearBorrow = () => {
    // No longer used - handled by handleButtonAction
  }

  const handleTutorialSignup = () => {
    // No longer used - handled by handleButtonAction
  }

  // Generic method to handle button-based auto-advance
  const handleButtonAction = (actionId: string) => {
    if (!isActive.value || !currentStep.value) return
    
    // Map action IDs to step IDs for auto-advance
    const actionToStepMap: Record<string, string> = {
      'signup-tutorial-quest': 'signup-tutorial-quest',
      'claim-quest-resources': 'claim-quest-resources',
      'borrow-maxhog': 'borrow-maxhog',
      'deliver-quest': 'submit-quest-delivery',
      'claim-tutorial-reward': 'claim-rewards',
      'tutorial-quest-reward': 'claim-rewards',
      'raid-ticket': 'buy-raid-ticket',
      'raid-signup': 'signup-raid-event',
      'redeem-chi': 'redeem-chi',
      'trade-framework': 'trade-frameworks',
      'trade-electromagnet': 'trade-electromagnets',
      'vote-yes-skin': 'vote-yes-skin',
      'discord-interaction': 'discord-interaction',
      'filter-guild-vault': 'filter-guild-vault'
    }
    
    const expectedStepId = actionToStepMap[actionId]
    
    // Only proceed if this action matches the current step
    if (expectedStepId && currentStep.value.id === expectedStepId) {
      // Emit event to show success banner
      const event = new CustomEvent('tutorial-action-completed', { 
        detail: { actionId, stepId: expectedStepId } 
      })
      window.dispatchEvent(event)
      
      // Only auto-advance if the current step has autoAdvance: true
      if (currentStep.value.autoAdvance === true) {
        // Single timeout for clean advancement
        setTimeout(() => {
          nextStep()
        }, 1200)
      }
    }
  }

  // Initialize tutorial progress from localStorage
  loadTutorialProgress()

  return {
    // State
    isActive,
    isMinimized,
    currentStepIndex,
    hasCompletedTutorial,
    hasSeenWelcome,
    tutorialQuestState,

    // Getters
    currentStep,
    progress,
    isLastStep,
    isFirstStep,
    totalSteps,

    // Actions
    startTutorial,
    startQuestTutorial,
    startGuildQuestTutorial,
    startGroupQuestTutorial,
    loadSpacebaseYellowSkin,
    nextStep,
    previousStep,
    goToStep,
    skipTutorial,
    completeTutorial,
    completeTutorialManually,
    toggleMinimize,
    minimize,
    maximize,
    moveToRight,
    reset,
    checkRouteAndAdvance,
    updateTutorialQuestState,
    resetTutorialQuestState,
    handleClaimTutorialReward,
    handleTutorialQuestDelivery,
    handleTutorialSignup,
    handleButtonAction,

    // Tutorial management
    tutorials,
    currentTutorial,
    currentTutorialId,

    // Persistence
    saveTutorialProgress,
    loadTutorialProgress,
    clearTutorialProgress
  }
})

