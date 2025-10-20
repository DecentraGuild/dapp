import { NAVIGATION_HEADER_INDEX } from '@/config/navigation'
import type { SkinTheme } from '@/types'

/**
 * Maps common navigation references in tutorial text to their navigation item IDs
 * This allows us to replace hardcoded names with skin-aware equivalents
 */
const NAVIGATION_TEXT_MAPPINGS: Record<string, string> = {
  'Gatekeeping': 'gatekeeping',
  'Command Center': 'commandcenter',
  'Trophy Room': 'trophy-room',
  'Quest Board': 'questboard',
  'Mission Control': 'questboard', // Alternative name for Quest Board in tutorials
  'DAO Voting': 'dao-voting',
  'DAO': 'dao-voting',
  'Armory': 'armory',
  'Community Hub': 'community-hub',
  'Tavern': 'tavern',
  'Foundry': 'foundry',
  'Integrations': 'integrations',
  'Vaults': 'vaults',
  'Observatory': 'observatory',
  'Dashboard': 'dashboard'
}

/**
 * Replaces navigation item references in text with skin-aware names
 * 
 * @param text - The original text containing navigation references
 * @param currentTheme - The active skin theme
 * @returns Text with navigation references replaced with skin-specific names
 * 
 * @example
 * // With Castle skin:
 * replaceTutorialNavigationText('Go to the Armory', castleTheme)
 * // Returns: 'Go to the Armory'
 * 
 * // With Spacebase skin:
 * replaceTutorialNavigationText('Go to the Armory', spacebaseTheme)
 * // Returns: 'Go to the Hanger'
 */
export function replaceTutorialNavigationText(
  text: string,
  currentTheme: SkinTheme | null
): string {
  if (!text || !currentTheme?.navigationHeaders) {
    return text
  }

  let processedText = text

  // Iterate through all navigation text mappings
  for (const [originalName, itemId] of Object.entries(NAVIGATION_TEXT_MAPPINGS)) {
    // Get the index for this navigation item
    const headerIndex = NAVIGATION_HEADER_INDEX[itemId]
    
    if (headerIndex !== undefined) {
      // Get the skin-specific name from navigationHeaders
      const skinAwareName = currentTheme.navigationHeaders[headerIndex]
      
      if (skinAwareName && skinAwareName !== originalName) {
        // Create a regex that matches the original name as a whole word
        // This prevents partial matches (e.g., "Armory" won't match in "Armory/G2P")
        const regex = new RegExp(`\\b${escapeRegExp(originalName)}\\b`, 'g')
        processedText = processedText.replace(regex, skinAwareName)
      }
    }
  }

  return processedText
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Gets the skin-aware navigation header for a specific navigation item ID
 * This is a helper function for direct lookups
 * 
 * @param itemId - The navigation item ID (e.g., 'armory', 'questboard')
 * @param currentTheme - The active skin theme
 * @returns The skin-specific name for the navigation item
 */
export function getNavigationHeaderById(
  itemId: string,
  currentTheme: SkinTheme | null
): string {
  if (!currentTheme?.navigationHeaders) {
    // Fallback to the original mapping
    const originalName = Object.keys(NAVIGATION_TEXT_MAPPINGS).find(
      key => NAVIGATION_TEXT_MAPPINGS[key] === itemId
    )
    return originalName || itemId
  }

  const headerIndex = NAVIGATION_HEADER_INDEX[itemId]
  
  if (headerIndex !== undefined) {
    return currentTheme.navigationHeaders[headerIndex] || itemId
  }

  return itemId
}

