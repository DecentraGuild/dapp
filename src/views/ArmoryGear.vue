<template>
  <BaseArmory
    description="Welcome to the Gear Lending system! Here you can borrow powerful gear and equipment by depositing collateral. Return the gear safely to get your deposit back. Each member can hold one piece of each gear type."
    default-tab="use"
  >
    <template #default="{ activeTab }">
      <!-- Gear Grid and Execute Trade -->
      <div v-if="guildGear.length > 0" class="gear-container">
        <!-- Available Gear Grid -->
        <div class="gear-grid">
          <BaseGear
            v-for="gear in guildGear"
            :key="gear.gearID"
            :gearID="gear.gearID"
            :guildID="gear.guildID"
            :name="gear.name"
            :description="gear.description"
            :image="gear.image"
            :type="gear.type"
            :rarity="gear.rarity"
            :depositRequired="gear.depositRequired"
            :depositToken="gear.depositToken"
            :rentalFee="gear.rentalFee"
            :rentalFeeToken="gear.rentalFeeToken"
            :amountAvailable="gear.amountAvailable"
            :maxPerMember="gear.maxPerMember"
            :currentlyHeldBy="gear.currentlyHeldBy"
            :isActive="gear.isActive"
            :createdAt="gear.createdAt"
            :data-tutorial="gear.name.toLowerCase().includes('maxhog') ? 'maxhog-vehicle' : undefined"
            size="md"
            :hover="true"
            :clickable="true"
            :selected="selectedGear?.gearID === gear.gearID"
            @click="selectGear"
          />
        </div>

        <!-- Execute Gear Transaction Component -->
        <div v-if="selectedGear" class="execute-gear-container">
          <BaseGearExecution
            :gearID="selectedGear.gearID"
            :guildID="selectedGear.guildID"
            :name="selectedGear.name"
            :description="selectedGear.description"
            :image="selectedGear.image"
            :type="selectedGear.type"
            :rarity="selectedGear.rarity"
            :depositRequired="selectedGear.depositRequired"
            :depositToken="selectedGear.depositToken"
            :rentalFee="selectedGear.rentalFee"
            :rentalFeeToken="selectedGear.rentalFeeToken"
            :amountAvailable="selectedGear.amountAvailable"
            :maxPerMember="selectedGear.maxPerMember"
            :currentlyHeldBy="selectedGear.currentlyHeldBy"
            :isActive="selectedGear.isActive"
            :createdAt="selectedGear.createdAt"
            :walletBalance="mockWalletBalance"
            @execute="handleGearExecution"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:armor" class="empty-icon" />
        <p v-if="loading">Loading gear...</p>
        <p v-else>No gear available for your guild</p>
        <p class="empty-subtitle">Check back later for new equipment</p>
      </div>
    </template>
  </BaseArmory>

  <!-- Success Popup -->
  <BaseSuccessPopup
    v-if="successPopupData"
    :is-visible="showSuccessPopup"
    :title="successPopupData.title"
    :message="successPopupData.message"
    :details="successPopupData.details"
    icon="mdi:check-circle"
    button-text="Got it!"
    :auto-close="true"
    :auto-close-delay="5000"
    @close="closeSuccessPopup"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseGear, BaseGearExecution } from '@/components/base'
import BaseSuccessPopup from '@/components/base/BaseSuccessPopup.vue'
import BaseArmory from '@/components/base/BaseArmory.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useGuildStore } from '@/stores/guildStore'
import { useTutorialStore } from '@/stores/tutorialStore'
import { triggerTutorialAction, TUTORIAL_ACTIONS } from '@/utils/tutorialActions'
import { getSlpPath } from '@/utils/api'

// Composables
const { colors, spacing, typography, borderRadius } = useDesignTokens()
const guildStore = useGuildStore()
const tutorialStore = useTutorialStore()

// Types
interface GearItem {
  gearID: string
  guildID: string
  name: string
  description: string
  image: string
  type: string
  rarity: string
  depositRequired: number
  depositToken: string
  rentalFee: number
  rentalFeeToken: string
  amountAvailable: number
  maxPerMember: number
  currentlyHeldBy: string[]
  isActive: boolean
  createdAt: string
  contractAddress: string
}

// Reactive data
const guildGear = ref<GearItem[]>([])
const selectedGear = ref<GearItem | null>(null)
const loading = ref(false)

// Success popup state
const showSuccessPopup = ref(false)
const successPopupData = ref<{
  title: string
  message: string
  details: Record<string, string | number>
} | null>(null)

// Mock wallet balance (in a real app, this would come from a store or API)
const mockWalletBalance = ref(5000)

// Computed
const currentGuildId = computed(() => guildStore.guildId || 'guild-1') // Fallback to guild-1 for testing

// Methods
const loadGuildGear = async () => {
  loading.value = true
  try {
    const guildId = currentGuildId.value
    
    if (!guildId) {
      return
    }

    // Determine guild prefix for file names
    const guildPrefix = guildId === 'guild-1' ? 'g1' : 'g2'
    
    // Load all gear files for this guild
    const gearFiles = [
      `guild-1_gear_pearcex4.json`,
      `guild-1_gear_maxhog.json`,
      `guild-1_gear_pearcex5.json`,
      `guild-1_gear_pearcex6.json`,
      `guild-1_gear_opaljet.json`
    ]

    const gear: GearItem[] = []
    
    for (const filename of gearFiles) {
      try {
        const response = await fetch(getSlpPath(`gear/${filename}`))
        
        if (response.ok) {
          const gearData = await response.json()
          // Map the data properties to match component expectations
          const mappedGearData: GearItem = {
            gearID: gearData.gearID,
            guildID: gearData.gid || gearData.guildID || guildId,
            name: gearData.name,
            description: gearData.description,
            image: gearData.image,
            type: gearData.type,
            rarity: gearData.rarity,
            depositRequired: gearData.depositRequired,
            depositToken: gearData.depositToken,
            rentalFee: gearData.rentalFee,
            rentalFeeToken: gearData.rentalFeeToken,
            amountAvailable: gearData.amountAvailable,
            maxPerMember: gearData.maxPerMember,
            currentlyHeldBy: gearData.currentlyHeldBy || [],
            isActive: gearData.isActive,
            createdAt: gearData.created || gearData.createdAt || new Date().toISOString(),
            contractAddress: gearData.contractAddress
          }
          gear.push(mappedGearData)
        }
      } catch (error) {
        // Silent fail for missing files
      }
    }
    guildGear.value = gear
  } catch (error) {
    // Silent fail
  } finally {
    loading.value = false
  }
}

const selectGear = (gear: any) => {
  // Find the full gear data from our guildGear array
  const fullGear = guildGear.value.find(g => g.gearID === gear.gearID)
  if (fullGear) {
    selectedGear.value = fullGear
    // Scroll to bottom to show the details section
    setTimeout(() => {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: 'smooth' 
      })
    }, 100)
  }
}

const handleGearExecution = (executionData: { gearID: string, action: 'borrow' | 'return', amount: number, totalCost: number }) => {
  // In a real app, this would:
  // 1. Validate the transaction
  // 2. Check permissions
  // 3. Execute the blockchain transaction
  // 4. Update balances and gear availability
  // 5. Refresh the gear list
  
  // Find the gear details for the popup
  const gear = guildGear.value.find(g => g.gearID === executionData.gearID)
  const actionText = executionData.action === 'borrow' ? 'borrowed' : 'returned'
  
  // Show success popup
  successPopupData.value = {
    title: `Gear ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Successfully!`,
    message: `You have successfully ${actionText} the ${gear?.name || 'gear'}. ${executionData.action === 'borrow' ? 'Remember to return it when you\'re done!' : 'Thank you for returning the gear!'}`,
    details: {
      'Gear Name': gear?.name || 'Unknown',
      'Action': actionText.charAt(0).toUpperCase() + actionText.slice(1),
      'Deposit': `${executionData.totalCost} ${gear?.depositToken || 'tokens'}`,
      'Transaction ID': `TX-${Date.now().toString(36).toUpperCase()}`
    }
  }
  
  showSuccessPopup.value = true
  
  // Handle tutorial auto-advance for gear borrowing
  if (executionData.action === 'borrow') {
    triggerTutorialAction(TUTORIAL_ACTIONS.BORROW_GEAR)
  }
  
  // Reset selection
  selectedGear.value = null
}

const closeSuccessPopup = () => {
  showSuccessPopup.value = false
  successPopupData.value = null
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
  
  await loadGuildGear()
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* Gear Container */
.gear-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  padding: var(--space-md);
}

/* Gear Grid */
.gear-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(21.875rem, 1fr));
  gap: var(--space-lg);
  height: auto;
}

/* Selected Gear Styling */
.selected-gear {
  transform: scale(1.02);
  box-shadow: var(--shadow-xl);
  border-color: var(--secondary-color-0);
}

/* Execute Gear Container */
.execute-gear-container {
  width: 100%;
  margin-top: var(--space-lg);
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

/* Responsive Design */
@media (max-width: 768px) {
  .gear-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .gear-container {
    padding: var(--space-sm);
  }
}
</style>
