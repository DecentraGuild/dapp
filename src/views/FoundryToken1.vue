<template>
  <BaseFoundry>
    <div class="foundry-token1-content">
      <!-- Token Info Card -->
      <BaseCard 
        v-if="tokenData"
        variant="primary" 
        size="lg"
        class="token-info-card"
      >
        <div class="token-header">
          <img 
            :src="tokenData.image" 
            :alt="tokenData.name"
            class="token-image"
          />
          <div class="token-details">
            <h2 class="token-name">{{ tokenData.name }}</h2>
            <p class="token-description">{{ tokenData.description }}</p>
          </div>
        </div>
      </BaseCard>

      <!-- Token Stats Grid -->
      <BaseCard 
        v-if="tokenData"
        variant="neutral" 
        size="lg"
        class="token-stats-card"
      >
        <BaseListGrid
          :items="tokenStatsItems"
          :columns="4"
          :hover="true"
          size="md"
          variant="primary"
        />
      </BaseCard>

      <!-- Redemption Section -->
      <BaseCard 
        variant="neutral" 
        size="lg"
        class="redemption-card"
      >
        <h3 class="section-title">Token1 Redemption</h3>
        
        <div class="redemption-content">
          <!-- Input Section -->
          <div class="input-section">
            <div class="input-group">
              <div class="input-container">
                <input 
                  v-model="redemptionAmount"
                  type="number"
                  class="amount-input"
                  placeholder="Amount to Redeem"
                  min="1"
                  :max="walletBalance"
                />
                <div class="balance-info">
                  <span class="balance-label">Wallet Balance:</span>
                  <span class="balance-value">{{ walletBalance }} {{ tokenData?.symbol || 'CCC' }}</span>
                </div>
                <div class="quick-amounts">
                  <button 
                    class="quick-btn"
                    @click="setAmount(0.25)"
                  >
                    25%
                  </button>
                  <button 
                    class="quick-btn"
                    @click="setAmount(0.5)"
                  >
                    50%
                  </button>
                  <button 
                    class="quick-btn"
                    @click="setAmount(1)"
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>
            <BaseButton
              variant="accent"
              size="lg"
              icon="mdi:swap-horizontal"
              @click="handleRedemption"
              :disabled="!canRedeem"
            >
              Redeem
            </BaseButton>
          </div>

          <!-- Calculation Results -->
          <div class="calculation-section">
            <div class="calculation-results">
              <div class="calculation-item">
                <span class="calc-label">Amount Input:</span>
                <span class="calc-value">{{ redemptionAmount || 0 }} {{ tokenData?.symbol || 'CCC' }}</span>
              </div>
              <div class="calculation-item">
                <span class="calc-label">Exchange Rate:</span>
                <span class="calc-value">{{ exchangeRate }}</span>
              </div>
              <div class="calculation-item">
                <span class="calc-label">Asset Backing to Receive:</span>
                <span class="calc-value">{{ assetBackingAmount.toFixed(2) }} {{ tokenData?.assetbacking || 'ATLAS' }}</span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </BaseFoundry>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseFoundry from '@/components/BaseFoundry.vue'
import { BaseCard, BaseButton, BaseListGrid } from '@/components/base'
import { useSkinTheme } from '@/composables/useSkinTheme'
import { useGuildStore } from '@/stores/guildStore'
import { getSlpPath } from '@/utils/api'

// Types
interface TokenData {
  tokenID: string
  guildID: string
  name: string
  symbol: string
  description: string
  image: string
  decimals: number
  circulatingSupply: number
  assetbacking: string
  vaultHolding: number
  exchangeRatio: [number, number]
  createdAt: string
  isActive: boolean
  contractAddress: string
}


// Composables
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius, getDaoToken1Color } = useSkinTheme()
const guildStore = useGuildStore()

// State
const tokenData = ref<TokenData | null>(null)
const redemptionAmount = ref<number>(0)
const walletBalance = ref<number>(1000) // Mock wallet balance

// Computed
const tokenStatsItems = computed(() => {
  if (!tokenData.value) return []
  
  return [
    {
      id: 'exchange-rate',
      icon: 'mdi:swap-horizontal',
      title: 'Exchange Rate',
      subtitle: `${tokenData.value.exchangeRatio[0]} : ${tokenData.value.exchangeRatio[1]}`,
      value: '',
      description: 'Token to Asset ratio'
    },
    {
      id: 'asset-backing',
      icon: 'mdi:shield',
      title: 'Asset Backing',
      subtitle: tokenData.value.assetbacking,
      value: '',
      description: 'Backing asset type'
    },
    {
      id: 'vault-holding',
      icon: 'mdi:bank',
      title: 'Vault Holding',
      subtitle: tokenData.value.vaultHolding.toLocaleString(),
      value: '',
      description: 'Total vault balance'
    },
    {
      id: 'circulating-supply',
      icon: 'mdi:currency-usd',
      title: 'Circulating Supply',
      subtitle: tokenData.value.circulatingSupply.toLocaleString(),
      value: '',
      description: 'Total supply in circulation'
    }
  ]
})

const exchangeRate = computed(() => {
  if (!tokenData.value) return '1 : 100'
  return `${tokenData.value.exchangeRatio[0]} : ${tokenData.value.exchangeRatio[1]}`
})

const assetBackingAmount = computed(() => {
  if (!tokenData.value || !redemptionAmount.value) return 0
  // Token1 redemption: amount input * exchange rate = total amount of asset backing to receive
  // 1 CCC = 100 ATLAS, so 10 CCC = 1000 ATLAS
  return redemptionAmount.value * tokenData.value.exchangeRatio[1]
})

const canRedeem = computed(() => {
  return tokenData.value && 
         redemptionAmount.value > 0 && 
         redemptionAmount.value <= walletBalance.value
})

// Methods
const loadTokenData = async () => {
  try {
    const response = await fetch(getSlpPath('guildtoken/guild-1_token1.json'))
    if (response.ok) {
      tokenData.value = await response.json()
    }
  } catch (error) {
    // Handle error silently in production
    // Could implement proper error handling/notification system here
  }
}


const setAmount = (percentage: number) => {
  if (percentage === 1) {
    redemptionAmount.value = walletBalance.value
  } else {
    redemptionAmount.value = Math.floor(walletBalance.value * percentage)
  }
}


const handleRedemption = () => {
  if (!canRedeem.value || !tokenData.value) {
    return
  }
  
  // Demo: Show redemption calculation
  // TODO: Show success notification
  // This should use a proper notification system instead of alert
}

// Lifecycle
onMounted(async () => {
  await loadTokenData()
  // Load guild colors to ensure they're available
  const { useThemeStore } = await import('@/stores/themeStore')
  const themeStore = useThemeStore()
  if (guildStore.guildId) {
    await themeStore.loadGuildColors(guildStore.guildId)
  }
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.foundry-token1-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  min-height: 100%;
  background: var(--theme-background);
}

/* Token Info Card */
.token-info-card {
  width: 100%;
  max-width: 100%;
}

.token-header {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

.token-image {
  flex-shrink: 0;
  width: var(--space-3xl);
  height: var(--space-3xl);
  object-fit: contain;
}

.token-details {
  flex: 1;
}

.token-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-sm);
}

.token-description {
  font-size: var(--text-base);
  color: var(--text-color-1);
  margin-bottom: var(--space-md);
  line-height: var(--leading-relaxed);
}

/* Token Stats Card */
.token-stats-card {
  width: 100%;
  max-width: 100%;
}

/* Redemption Card */
.redemption-card {
  width: 100%;
  max-width: 100%;
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  text-align: center;
  margin-bottom: var(--space-lg);
}

.redemption-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

/* Input Section */
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}


.input-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.amount-input {
  padding: var(--space-sm) var(--space-md);
  border: var(--component-border-width) solid var(--theme-dao-token1);
  border-radius: var(--theme-radius-md);
  background: var(--primary-color-1);
  color: var(--text-color-0);
  font-size: var(--text-base);
  transition: border-color var(--transition-normal);
}

.amount-input:focus {
  outline: none;
  border-color: var(--theme-dao-token1);
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  background: var(--theme-background);
  border-radius: var(--theme-radius-sm);
  border: var(--component-border-width) solid var(--theme-dao-token1);
}

.balance-label {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.balance-value {
  font-size: var(--text-xs);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

.quick-amounts {
  display: flex;
  gap: var(--space-xs);
  justify-content: flex-end;
}

.quick-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--theme-background);
  border: var(--component-border-width) solid var(--theme-dao-token1);
  border-radius: var(--theme-radius-sm);
  color: var(--text-color-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-btn:hover {
  background: var(--theme-dao-token1);
  border-color: var(--theme-dao-token1);
  color: var(--primary-color-0);
}

/* Calculation Section */
.calculation-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}


.calculation-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--theme-background);
  border-radius: var(--theme-radius-md);
  border: var(--component-border-width) solid var(--secondary-color-2);
}

.calculation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.calc-label {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.calc-value {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}


/* Responsive Design */
@media (max-width: 768px) {
  .foundry-token1-content {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .token-info-card,
  .token-stats-card,
  .redemption-card {
    width: 100%;
  }
  
  .token-header {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .redemption-content {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .quick-amounts {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .foundry-token1-content {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
}

/* Custom styling for token info card border only */
.token-info-card {
  border-color: var(--theme-dao-token1) !important;
}

/* Custom styling for stats cards - BaseListGrid */
:deep(.base-list-grid .grid-item) {
  border-color: var(--theme-dao-token1) !important;
}

:deep(.base-list-grid .grid-item-icon) {
  background: var(--theme-dao-token1) !important;
  border-color: var(--theme-dao-token1) !important;
}

:deep(.base-list-grid .icon) {
  color: var(--primary-color-0) !important;
}

:deep(.base-list-grid .grid-item-subtitle) {
  color: var(--theme-dao-token1) !important;
}

:deep(.base-list-grid .grid-item-value) {
  color: var(--theme-dao-token1) !important;
}

/* Custom button styling for token1 colors - only for Redeem button */
.redemption-card :deep(.button-accent) {
  background: var(--theme-dao-token1) !important;
  color: var(--text-color-2) !important;
}

.redemption-card :deep(.button-accent:hover:not(.button-disabled)) {
  background: var(--theme-dao-token1) !important;
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--theme-dao-token1);
}

/* Wide screen margin - matching armory pattern */
@media (min-width: 1400px) {
  .foundry-token1-content {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}
</style>