<template>
  <BaseArmory
    description="Welcome to the Guild2Player trading floor! Here you can buy and sell resources, tokens, and other assets with fellow guild members. Browse available trades, execute transactions, and manage your trading portfolio."
    default-tab="shop"
  >
    <template #default="{ activeTab }">
      <!-- Trades Grid and Execute Trade -->
      <div v-if="guildTrades.length > 0" class="trading-container">
        <!-- Available Trades Grid -->
        <div class="trades-grid">
          <BaseG2PCard
            v-for="trade in guildTrades"
            :key="trade.orderID"
            :orderID="trade.orderID"
            :guildID="trade.guildID"
            :role="trade.role"
            :type="trade.type"
            :amountOffered="trade.amountOffered"
            :tokenIDOffered="trade.tokenIDOffered"
            :resourceIDOffered="trade.resourceIDOffered"
            :tokenImageOffered="trade.tokenImageOffered"
            :amountAsked="trade.amountAsked"
            :resourceIDAsked="trade.resourceIDAsked"
            :tokenIDAsked="trade.tokenIDAsked"
            :tokenImageAsked="trade.tokenImageAsked"
            :status="trade.status"
            :created="trade.created"
            :creator="trade.creator"
            :expiresAt="trade.expiresAt"
            :isActive="trade.isActive"
            :description="trade.description"
            :filledAt="trade.filledAt"
            :filledBy="trade.filledBy"
            size="md"
            :hover="true"
            :clickable="true"
            @click="selectTrade"
            :class="{ 'selected-trade': selectedTrade?.orderID === trade.orderID }"
            :data-tutorial="trade.orderID === 'g1_g2p_0006' ? 'trade-framework' : trade.orderID === 'g1_g2p_0007' ? 'trade-electromagnet' : undefined"
          />
        </div>

        <!-- Execute Trade Component -->
        <div v-if="selectedTrade" class="execute-trade-container">
          <ExecuteTrade
            :orderID="selectedTrade.orderID"
            :guildID="selectedTrade.guildID"
            :role="selectedTrade.role"
            :type="selectedTrade.type"
            :amountOffered="selectedTrade.amountOffered"
            :tokenIDOffered="selectedTrade.tokenIDOffered"
            :resourceIDOffered="selectedTrade.resourceIDOffered"
            :tokenImageOffered="selectedTrade.tokenImageOffered"
            :amountAsked="selectedTrade.amountAsked"
            :resourceIDAsked="selectedTrade.resourceIDAsked"
            :tokenIDAsked="selectedTrade.tokenIDAsked"
            :tokenImageAsked="selectedTrade.tokenImageAsked"
            :status="selectedTrade.status"
            :created="selectedTrade.created"
            :creator="selectedTrade.creator"
            :expiresAt="selectedTrade.expiresAt"
            :isActive="selectedTrade.isActive"
            :description="selectedTrade.description"
            :filledAt="selectedTrade.filledAt"
            :filledBy="selectedTrade.filledBy"
            :walletBalanceOffered="mockWalletBalanceOffered"
            :walletBalanceAsked="mockWalletBalanceAsked"
            @execute="handleTradeExecution"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:buy-card" class="empty-icon" />
        <p v-if="loading">Loading trades...</p>
        <p v-else>No trades available for your guild</p>
        <p class="empty-subtitle">Check back later for new trading opportunities</p>
      </div>
    </template>
  </BaseArmory>

  <!-- Success Popup -->
  <BaseSuccessPopup
    :is-visible="showSuccessPopup"
    :title="successPopupData.title"
    :message="successPopupData.message"
    :details="successPopupData.details"
    @close="closeSuccessPopup"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseG2PCard } from '@/components/base'
import BaseArmory from '@/components/base/BaseArmory.vue'
import BaseSuccessPopup from '@/components/base/BaseSuccessPopup.vue'
import ExecuteTrade from '@/components/ExecuteTrade.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useGuildStore } from '@/stores/guildStore'
import { useTutorialStore } from '@/stores/tutorialStore'
import { getSlpPath } from '@/utils/api'

// Composables
const { colors, spacing, typography, borderRadius } = useDesignTokens()
const guildStore = useGuildStore()
const tutorialStore = useTutorialStore()

// Types
interface G2PTrade {
  orderID: string
  guildID: string
  role: string
  type: 'buy' | 'sell'
  amountOffered: number
  tokenIDOffered?: string
  resourceIDOffered?: string
  tokenImageOffered?: string
  amountAsked: number
  resourceIDAsked?: string
  tokenIDAsked?: string
  tokenImageAsked?: string
  status: string
  created: string
  creator: string
  expiresAt: string
  isActive: boolean
  description: string
  filledAt?: string
  filledBy?: string
}

// Reactive data
const guildTrades = ref<G2PTrade[]>([])
const selectedTrade = ref<G2PTrade | null>(null)
const loading = ref(false)

// Mock wallet balances (in a real app, these would come from a store or API)
const mockWalletBalanceOffered = ref(140) // Updated for tutorial
const mockWalletBalanceAsked = ref(2500) // Updated for tutorial - user has frameworks

// Success popup state
const showSuccessPopup = ref(false)
const successPopupData = ref({
  title: '',
  message: '',
  details: {} as Record<string, string | number>
})

// Computed
const currentGuildId = computed(() => guildStore.guildId || 'guild-1') // Fallback to guild-1 for testing

// Methods
const loadGuildTrades = async () => {
  loading.value = true
  try {
    const guildId = currentGuildId.value
    
    if (!guildId) {
      return
    }

    // Determine guild prefix for file names
    const guildPrefix = guildId === 'guild-1' ? 'g1' : 'g2'
    
    // Load all G2P trade files for this guild
    const tradeFiles = [
      `${guildPrefix}_g2p_0001_buy.json`,
      `${guildPrefix}_g2p_0002_sell.json`,
      `${guildPrefix}_g2p_0003_buy.json`,
      `${guildPrefix}_g2p_0004_sell.json`,
      `${guildPrefix}_g2p_0005_buy.json`,
      `${guildPrefix}_g2p_0006_buy.json`,
      `${guildPrefix}_g2p_0007_buy.json`
    ]

    const trades: G2PTrade[] = []
    
    for (const filename of tradeFiles) {
      try {
        const response = await fetch(getSlpPath(`g2p/${filename}`))
        
        if (response.ok) {
          const tradeData = await response.json()
          // Map the data properties to match component expectations
          const mappedTradeData: G2PTrade = {
            orderID: tradeData.orderID,
            guildID: tradeData.gid || tradeData.guildID || guildId,
            role: tradeData.role,
            type: tradeData.type,
            amountOffered: tradeData.amountOffered,
            tokenIDOffered: tradeData.tokenIDOffered,
            resourceIDOffered: tradeData.resourceIDOffered,
            tokenImageOffered: tradeData.tokenImageOffered,
            amountAsked: tradeData.amountAsked,
            resourceIDAsked: tradeData.resourceIDAsked,
            tokenIDAsked: tradeData.tokenIDAsked,
            tokenImageAsked: tradeData.tokenImageAsked,
            status: tradeData.status,
            created: tradeData.created || tradeData.createdAt || new Date().toISOString(),
            creator: tradeData.creator,
            expiresAt: tradeData.expiresAt,
            isActive: tradeData.isActive,
            description: tradeData.description,
            filledAt: tradeData.filledAt,
            filledBy: tradeData.filledBy
          }
          trades.push(mappedTradeData)
        }
      } catch (error) {
        // Silent fail for missing files
      }
    }
    
    // Show all trades (active and filled)
    guildTrades.value = trades
  } catch (error) {
    // Silent fail
  } finally {
    loading.value = false
  }
}

const selectTrade = (trade: any) => {
  // Find the full trade data from our guildTrades array
  const fullTrade = guildTrades.value.find(t => t.orderID === trade.orderID)
  if (fullTrade) {
    selectedTrade.value = fullTrade
    // Scroll to bottom to show the details section
    setTimeout(() => {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: 'smooth' 
      })
    }, 100)
  }
}

const handleTradeExecution = (executionData: { orderID: string, amount: number, totalCost: number }) => {
  if (!selectedTrade.value) return
  
  // Show success popup
  const tradeName = selectedTrade.value.type === 'buy' ? selectedTrade.value.resourceIDAsked : selectedTrade.value.resourceIDOffered
  const tokenName = selectedTrade.value.type === 'buy' ? selectedTrade.value.tokenIDOffered : selectedTrade.value.tokenIDAsked
  
  successPopupData.value = {
    title: 'Trade Executed Successfully!',
    message: `You have successfully ${selectedTrade.value.type === 'buy' ? 'bought' : 'sold'} ${tradeName}!`,
    details: {
      'Amount': executionData.amount,
      'Item': tradeName || 'Unknown',
      'Total Cost': `${executionData.totalCost} ${tokenName}`,
      'Order ID': executionData.orderID
    }
  }
  showSuccessPopup.value = true
  
  // Auto-advance tutorial if trading frameworks or electromagnets
  if (tutorialStore.isActive) {
    if (selectedTrade.value.orderID === 'g1_g2p_0006' && tutorialStore.currentStep?.id === 'trade-frameworks') {
      tutorialStore.handleButtonAction('trade-framework')
    } else if (selectedTrade.value.orderID === 'g1_g2p_0007' && tutorialStore.currentStep?.id === 'trade-electromagnets') {
      tutorialStore.handleButtonAction('trade-electromagnet')
    }
  }
  
  // Reset selection
  setTimeout(() => {
    selectedTrade.value = null
  }, 2000)
}

const closeSuccessPopup = () => {
  showSuccessPopup.value = false
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
  
  await loadGuildTrades()
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
/* Trading Container */
.trading-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  padding: var(--space-md);
}

/* Trades Grid */
.trades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(21.875rem, 1fr));
  gap: var(--space-lg);
  height: auto;
}

/* Selected Trade Styling */
.selected-trade {
  transform: scale(1.02);
  box-shadow: var(--shadow-xl);
  border-color: var(--secondary-color-0);
}

/* Execute Trade Container */
.execute-trade-container {
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
  .trades-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .trading-container {
    padding: var(--space-sm);
  }
}
</style>
