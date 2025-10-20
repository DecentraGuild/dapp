import { useTutorialStore } from '@/stores/tutorialStore'

/**
 * Utility function to trigger tutorial auto-advance from any component
 * Just call this function when a button is clicked that should advance the tutorial
 */
export const triggerTutorialAction = (actionId: string) => {
  const tutorialStore = useTutorialStore()
  if (tutorialStore.isActive) {
    tutorialStore.handleButtonAction(actionId)
  }
}

/**
 * Predefined action IDs for common tutorial actions
 */
export const TUTORIAL_ACTIONS = {
  SIGNUP_QUEST: 'signup-tutorial-quest',
  CLAIM_RESOURCES: 'claim-quest-resources',
  BORROW_GEAR: 'borrow-maxhog',
  DELIVER_QUEST: 'deliver-quest',
  CLAIM_REWARD: 'claim-tutorial-reward'
} as const

/**
 * Helper function to trigger tutorial action with predefined action ID
 */
export const triggerTutorialActionById = (actionId: keyof typeof TUTORIAL_ACTIONS) => {
  triggerTutorialAction(TUTORIAL_ACTIONS[actionId])
}
