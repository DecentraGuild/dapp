<template>
  <BaseArmory
    description="Welcome to the Claim Center! Here you can claim your rewards, airdrops, and benefits based on your guild membership and token holdings. Claims are distributed based on snapshots taken at deployment."
    default-tab="claim"
    @tab-change="handleTabChange"
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
            :canClaim="canUserClaim(claim)"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseClaim } from '@/components/base'
import BaseArmory from '@/components/base/BaseArmory.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useGuildStore } from '@/stores/guildStore'
import { getSlpPath } from '@/utils/api'

// Composables
const { colors, spacing, typography, borderRadius } = useDesignTokens()
const guildStore = useGuildStore()

// Types
interface ClaimItem {
  claimID: string
  guildID: string
  name: string
  description: string
  image: string
  resourceID: string
  type: 'role' | 'token'
  period: 'daily' | 'weekly' | 'monthly' | 'onetime'
  requiredRoleID?: string
  requiredTokenID?: string
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
      'guild-1_claim_weekly_ammo.json',
      'guild-1_claim_monthly_token2_staking.json',
      'guild-1_claim_onetime_pearcex4.json'
    ]

    const claims: ClaimItem[] = []
    
    for (const filename of claimFiles) {
      try {
        const response = await fetch(getSlpPath(`claims/${filename}`))
        
        if (response.ok) {
          const claimData = await response.json()
          claims.push(claimData)
        }
      } catch (error) {
        // Silent fail for missing files
      }
    }
    
    // Filter claims that are active and user is eligible for
    availableClaims.value = claims.filter(claim => 
      claim.isActive && 
      isUserEligible(claim) &&
      isClaimPeriodActive(claim)
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
  }
  return false
}

const isClaimPeriodActive = (claim: ClaimItem): boolean => {
  const now = new Date()
  const start = new Date(claim.claimPeriod.start)
  const end = new Date(claim.claimPeriod.end)
  return now >= start && now <= end
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
  return userAmount > 0 && claim.rewardPool.remainingAmount > 0
}

const handleClaim = (claimData: { claimID: string, amount: number }) => {
  // In a real app, this would:
  // 1. Validate the claim
  // 2. Check permissions
  // 3. Execute the blockchain transaction
  // 4. Update claim status
  // 5. Refresh the claims list
  
  alert(`Claim successful!\nClaim: ${claimData.claimID}\nAmount: ${claimData.amount}`)
  
  // Refresh claims
  loadAvailableClaims()
}

const handleTabChange = (tab: string) => {
  // Navigate to the appropriate armory page
  if (tab === 'shop') {
    window.location.href = '/armory/g2p'
  } else if (tab === 'use') {
    window.location.href = '/armory/gear'
  }
  // 'claim' tab is already active, no navigation needed
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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-md);
  color: var(--secondary-color-0);
}

.empty-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: var(--space-xs);
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
