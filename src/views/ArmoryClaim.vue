<template>
  <BaseArmory
    description="Welcome to the Claim Center! Here you can claim your rewards, airdrops, and benefits based on your guild membership and token holdings. Claims are distributed based on snapshots taken at deployment."
    default-tab="claim"
  >
    <template #default="{ activeTab }">
      <!-- Claims Grid -->
      <div v-if="availableClaims.length > 0" class="claims-container">
        <div class="claims-grid">
          <BaseClaim
            v-for="claim in availableClaims"
            :key="claim.claimID"
            :claimID="claim.claimID"
            :guildID="claim.guildID"
            :name="claim.name"
            :description="claim.description"
            :image="claim.image"
            :resourceID="claim.resourceID"
            :type="claim.type"
            :period="claim.period"
            :claimAmount="claim.claimAmount"
            :claimPeriod="claim.claimPeriod"
            :snapshotBegin="claim.snapshotBegin"
            :snapshotEnd="claim.snapshotEnd"
            :isActive="claim.isActive"
            :userClaimAmount="getUserClaimAmount(claim)"
            :canClaim="canUserClaim(claim) && !claimedItems.has(claim.claimID)"
            :data-tutorial="claim.claimID === 'g1_claim_tutorial' ? 'tutorial-claim' : claim.claimID === 'g1-claim-tutorial-resources' ? 'tutorial-claim-resources' : undefined"
            :class="{ 'claim-faded': claimedItems.has(claim.claimID) }"
            @claim="handleClaim"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:gift" class="empty-icon" />
        <p v-if="loading">Loading claims...</p>
        <p v-else>No claims available for you</p>
        <p class="empty-subtitle">Check back later for new rewards</p>
      </div>
    </template>
  </BaseArmory>

  <!-- Claim Success Popup -->
  <BaseSuccessPopup
    v-if="claimSuccessData"
    :is-visible="showClaimSuccessPopup"
    :title="claimSuccessData.title"
    :message="claimSuccessData.message"
    :details="claimSuccessData.details"
    icon="mdi:gift"
    button-text="Awesome!"
    :auto-close="true"
    :auto-close-delay="4000"
    @close="closeClaimSuccessPopup"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseClaim } from '@/components/base'
import BaseSuccessPopup from '@/components/base/BaseSuccessPopup.vue'
import BaseArmory from '@/components/base/BaseArmory.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useGuildStore } from '@/stores/guildStore'
import { useTutorialStore } from '@/stores/tutorialStore'
import { useQuestStore } from '@/stores/questStore'
import { triggerTutorialAction, TUTORIAL_ACTIONS } from '@/utils/tutorialActions'
import { getSlpPath } from '@/utils/api'

// Composables
const { colors, spacing, typography, borderRadius } = useDesignTokens()
const guildStore = useGuildStore()
const tutorialStore = useTutorialStore()
const questStore = useQuestStore()

// Types
interface ClaimItem {
  claimID: string
  guildID: string
  name: string
  description: string
  image: string
  resourceID: string
  type: 'role' | 'token' | 'quest_completion' | 'quest_supplies'
  period: 'daily' | 'weekly' | 'monthly' | 'onetime' | 'one_time'
  requiredRoleID?: string
  requiredTokenID?: string
  questRequirement?: string
  questStatusRequired?: string
  tutorialClaim?: boolean
  resources?: {
    ammo?: number
    questMaxhogToken?: number
  }
  snapshotBegin: string
  snapshotEnd: string
  claimPeriod: {
    start: string
    end: string
  }
  claimAmount: number
  memberList: Record<string, any>
  rewardPool: {
    totalAmount: number
    remainingAmount: number
    claimedAmount: number
  }
  claimHistory: any[]
  createdAt: string
  isActive: boolean
  contractAddress: string
}

// Reactive data
const availableClaims = ref<ClaimItem[]>([])
const loading = ref(false)

// Claim success popup state
const showClaimSuccessPopup = ref(false)
const claimSuccessData = ref<{
  title: string
  message: string
  details: Record<string, string | number>
} | null>(null)

// Fade out state for claimed items
const claimedItems = ref<Set<string>>(new Set())

// Mock user data (in a real app, this would come from a store or API)
const mockUserRole = ref('member')
const mockUserTokens = ref<Record<string, number>>({
  'guild-1-token-2': 1000
})

// Computed
const currentGuildId = computed(() => guildStore.guildId || 'guild-1')

// Methods
const loadAvailableClaims = async () => {
  loading.value = true
  try {
    const guildId = currentGuildId.value
    
    if (!guildId) {
      return
    }

    // Load all claim files for this guild
    const claimFiles = [
      'guild-1_claim_daily_food.json',
      'guild-1_claim_weekly_fuel.json',
      'guild-1_claim_monthly_token2_staking.json',
      'guild-1_claim_onetime_pearcex4.json',
      'guild-1_claim_tutorial_quest.json',
      'guild-1_claim_tutorial_resources.json'
    ]

    const claims: ClaimItem[] = []
    
    for (const filename of claimFiles) {
      try {
        const response = await fetch(getSlpPath(`claims/${filename}`))
        
        if (response.ok) {
          const claimData = await response.json()
          // Map the data properties to match component expectations
          const mappedClaimData: ClaimItem = {
            claimID: claimData.claimID,
            guildID: claimData.gid || claimData.guildID || guildId,
            name: claimData.name,
            description: claimData.description,
            image: claimData.image,
            resourceID: claimData.resourceID,
            type: claimData.type,
            period: claimData.period,
            claimAmount: claimData.claimAmount,
            claimPeriod: claimData.claimPeriod,
            snapshotBegin: claimData.snapshotBegin,
            snapshotEnd: claimData.snapshotEnd,
            isActive: claimData.isActive,
            requiredRoleID: claimData.requiredRoleID,
            requiredTokenID: claimData.requiredTokenID,
            questRequirement: claimData.questRequirement,
            questStatusRequired: claimData.questStatusRequired,
            memberList: claimData.memberList || {},
            rewardPool: claimData.rewardPool || { totalAmount: 0, remainingAmount: 0, claimedAmount: 0 },
            claimHistory: claimData.claimHistory || [],
            createdAt: claimData.created || claimData.createdAt || new Date().toISOString(),
            contractAddress: claimData.contractAddress
          }
          claims.push(mappedClaimData)
        }
      } catch (error) {
        // Silent fail for missing files
      }
    }
    
    // Filter claims that are active and user is eligible for
    availableClaims.value = claims.filter(claim => 
      claim.isActive && 
      isUserEligible(claim) &&
      isClaimPeriodActive(claim) &&
      shouldShowClaim(claim)
    )
  } catch (error) {
    // Silent fail
  } finally {
    loading.value = false
  }
}

const isUserEligible = (claim: ClaimItem): boolean => {
  if (claim.type === 'role') {
    // Check if user has the required role or higher
    if (!claim.requiredRoleID) return true
    
    const roleHierarchy = ['prospect', 'member', 'officer', 'council', 'founder']
    const userRoleIndex = roleHierarchy.indexOf(mockUserRole.value)
    const requiredRoleIndex = roleHierarchy.indexOf(claim.requiredRoleID)
    
    return userRoleIndex >= requiredRoleIndex
  } else if (claim.type === 'token') {
    // Check if user has the required token
    return claim.requiredTokenID ? (mockUserTokens.value[claim.requiredTokenID] || 0) > 0 : true
  } else if (claim.type === 'quest_completion' || claim.type === 'quest_supplies') {
    // Check quest status requirements
    if (!claim.questRequirement || !claim.questStatusRequired) return true
    
    const quest = questStore.getQuestById(claim.questRequirement)
    if (!quest) return false
    
    return quest.status === claim.questStatusRequired
  }
  return false
}

const isClaimPeriodActive = (claim: ClaimItem): boolean => {
  const now = new Date()
  const start = new Date(claim.claimPeriod.start)
  const end = new Date(claim.claimPeriod.end)
  return now >= start && now <= end
}

const shouldShowClaim = (claim: ClaimItem): boolean => {
  // Hide Tutorial Quest Resources claim if tutorial quest is completed
  if (claim.claimID === 'g1-claim-tutorial-resources') {
    const tutorialQuest = questStore.getQuestById('g1_q_tutorial')
    return !tutorialQuest || tutorialQuest.status !== 'completed'
  }
  
  // Hide Tutorial Quest Reward claim if tutorial quest is completed
  if (claim.claimID === 'g1_claim_tutorial') {
    const tutorialQuest = questStore.getQuestById('g1_q_tutorial')
    return !tutorialQuest || tutorialQuest.status !== 'completed'
  }
  
  // Show all other claims
  return true
}

const getUserClaimAmount = (claim: ClaimItem): number => {
  // In a real app, this would calculate based on user's actual holdings/role
  if (claim.type === 'role') {
    // For role-based claims, all eligible users get the same amount
    return claim.claimAmount
  } else if (claim.type === 'token') {
    const userEntry = Object.values(claim.memberList).find((member: any) => 
      member.walletAddress === 'mock-wallet-address'
    )
    return userEntry ? userEntry.finalScore : 0
  }
  return 0
}

const canUserClaim = (claim: ClaimItem): boolean => {
  const userAmount = getUserClaimAmount(claim)
  
  // Special case for tutorial quest claim - disable until quest is completed
  if (claim.claimID === 'g1_claim_tutorial') {
    const tutorialQuest = questStore.getQuestById('g1_q_tutorial')
    if (!tutorialQuest) return false
    
    // Only enable if quest is completed (delivered, rewarded, or completed)
    const isQuestCompleted = ['delivered', 'rewarded', 'completed'].includes(tutorialQuest.status)
    return isQuestCompleted && userAmount > 0 && claim.rewardPool.remainingAmount > 0
  }
  
  return userAmount > 0 && claim.rewardPool.remainingAmount > 0
}

const handleClaim = (claimData: { claimID: string, amount: number }) => {
  // In a real app, this would:
  // 1. Validate the claim
  // 2. Check permissions
  // 3. Execute the blockchain transaction
  // 4. Update claim status
  // 5. Refresh the claims list
  
  // Find the claim details
  const claim = availableClaims.value.find(c => c.claimID === claimData.claimID)
  if (!claim) return
  
  // Add to claimed items for fade-out effect
  claimedItems.value.add(claimData.claimID)
  
  // Show success popup
  claimSuccessData.value = {
    title: 'Claim Successful!',
    message: `You have successfully claimed ${claim.name}. ${claim.claimID === 'g1-claim-tutorial-resources' ? 'You now have the resources needed for your quest!' : 'Your rewards have been added to your account!'}`,
    details: {
      'Claim': claim.name,
      'Amount': claimData.amount,
      'Resource': claim.resourceID,
      'Transaction ID': `TX-${Date.now().toString(36).toUpperCase()}`
    }
  }
  
  showClaimSuccessPopup.value = true
  
  // Handle tutorial claims with button action system
  if (claimData.claimID === 'g1_claim_tutorial') {
    triggerTutorialAction(TUTORIAL_ACTIONS.CLAIM_REWARD)
    // Also update quest status to completed when claiming from armory
    questStore.handleTutorialQuestAction('claim_rewards', 'tutorial_user')
  } else if (claimData.claimID === 'g1-claim-tutorial-resources') {
    triggerTutorialAction(TUTORIAL_ACTIONS.CLAIM_RESOURCES)
  }
  
  // Refresh claims after a delay to show the fade effect
  setTimeout(() => {
    loadAvailableClaims()
  }, 2000)
}

const closeClaimSuccessPopup = () => {
  showClaimSuccessPopup.value = false
  claimSuccessData.value = null
}

// Lifecycle
onMounted(async () => {
  // Load available guilds if not already loaded
  if (guildStore.availableGuilds.length === 0) {
    await guildStore.loadAvailableGuilds()
  }
  
  // Select guild-1 if no guild is selected
  if (!guildStore.guildId) {
    await guildStore.selectGuild('guild-1')
  }
  
  await loadAvailableClaims()
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* Claims Container */
.claims-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  padding: var(--space-md);
}

/* Claims Grid */
.claims-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(21.875rem, 1fr));
  gap: var(--space-lg);
  height: auto;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--text-color-1);
  opacity: 0.6;
  padding: var(--space-xl);
}

.empty-icon {
  width: var(--space-3xl);
  height: var(--space-3xl);
  margin-bottom: var(--space-md);
  color: var(--secondary-color-0);
}

.empty-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: var(--space-xs);
}

/* Claim Fade Effect */
.claim-faded {
  opacity: 0.3;
  transform: scale(0.95);
  transition: all 0.5s ease;
  pointer-events: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .claims-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .claims-container {
    padding: var(--space-sm);
  }
}
</style>
