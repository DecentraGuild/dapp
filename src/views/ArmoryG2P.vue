<template>
  <div class="armory-g2p">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Guild2Player Trading" 
      subtitle="Trade resources and tokens with other guild members"
      variant="primary" 
      size="lg"
      class="g2p-header-card"
    >
      <div class="g2p-header-content">
        <div class="g2p-description">
          <p>Welcome to the Guild2Player trading floor! Here you can buy and sell resources, tokens, and other assets with fellow guild members. Browse available trades, execute transactions, and manage your trading portfolio.</p>
        </div>
      </div>
    </BaseCard>

    <!-- Main Trading Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="g2p-main-card"
    >
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
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard } from '@/components/base'
import BaseG2PCard from '@/components/base/BaseG2PCard.vue'
import ExecuteTrade from '@/components/ExecuteTrade.vue'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useGuildStore } from '@/stores/guildStore'
import { getSlpPath } from '@/utils/api'

// Composables
const { colors, spacing, typography, borderRadius } = useDesignTokens()
const guildStore = useGuildStore()

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
const mockWalletBalanceOffered = ref(1000)
const mockWalletBalanceAsked = ref(100)

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
      `${guildPrefix}_g2p_0005_buy.json`
    ]

    const trades: G2PTrade[] = []
    
    for (const filename of tradeFiles) {
      try {
        const response = await fetch(getSlpPath(`g2p/${filename}`))
        
        if (response.ok) {
          const tradeData = await response.json()
          trades.push(tradeData)
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
  }
}

const handleTradeExecution = (executionData: { orderID: string, amount: number, totalCost: number }) => {
  // In a real app, this would:
  // 1. Validate the trade
  // 2. Check permissions
  // 3. Execute the blockchain transaction
  // 4. Update balances
  // 5. Refresh the trade list
  
  // For now, just show a success message
  alert(`Trade executed successfully!\nOrder: ${executionData.orderID}\nAmount: ${executionData.amount}\nTotal Cost: ${executionData.totalCost}`)
  
  // Reset selection
  selectedTrade.value = null
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
.armory-g2p {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
  min-height: 100%;
}

/* Header Card */
.g2p-header-card {
  width: 100%;
  max-width: 100%;
}

.g2p-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.g2p-description {
  flex: 1;
}

.g2p-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

/* Main Card */
.g2p-main-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

/* Wide screen margin - matching other pages */
@media (min-width: 1400px) {
  .g2p-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .g2p-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .armory-g2p {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .armory-g2p {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .g2p-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .trades-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .trading-container {
    padding: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .armory-g2p {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
}
</style>
