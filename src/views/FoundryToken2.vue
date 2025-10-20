<template>
  <BaseFoundry>
    <div class="foundry-token2-content">
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

      <!-- Minting Section -->
      <BaseCard 
        variant="neutral" 
        size="lg"
        class="minting-card"
      >
        <h3 class="section-title">Token2 Mint</h3>
        
        <div class="minting-content">
          <!-- Input Section -->
          <div class="input-section">
            <div class="input-group">
              <div class="input-container">
                <input 
                  v-model="assetBackingAmount"
                  type="number"
                  class="amount-input"
                  placeholder="Amount to Mint"
                  min="1"
                  :max="maxAssetBacking"
                />
                <div class="balance-info">
                  <span class="balance-label">Wallet Balance:</span>
                  <span class="balance-value">{{ walletBalance }} {{ tokenData?.assetbacking || 'POLIS' }}</span>
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
              icon="mdi:plus-circle"
              @click="handleMinting"
              :disabled="!canMint"
            >
              Mint
            </BaseButton>
          </div>

          <!-- Calculation Results -->
          <div class="calculation-section">
            <div class="calculation-results">
              <div class="calculation-item">
                <span class="calc-label">Asset Backing Input:</span>
                <span class="calc-value">{{ assetBackingAmount || 0 }} {{ tokenData?.assetbacking || 'POLIS' }}</span>
              </div>
              <div class="calculation-item">
                <span class="calc-label">Exchange Rate:</span>
                <span class="calc-value">{{ exchangeRate }}</span>
              </div>
              <div class="calculation-item">
                <span class="calc-label">Tokens to Receive:</span>
                <span class="calc-value">{{ tokenAmount.toFixed(2) }} {{ tokenData?.symbol || guildStore.token2Symbol }}</span>
              </div>
            </div>
            
            <!-- Vault Allocations -->
            <div class="vault-allocations">
              <h5 class="vault-title">Vault Allocations</h5>
              <div class="vault-list">
                <div 
                  v-for="(allocation, vault) in vaultAllocations" 
                  :key="vault"
                  class="vault-item"
                >
                  <span class="vault-name">{{ getVaultName(String(vault)) }}</span>
                  <span class="vault-percentage">{{ allocation }}%</span>
                  <span class="vault-amount">{{ (assetBackingAmount * allocation / 100).toFixed(2) }} {{ tokenData?.assetbacking || 'POLIS' }}</span>
                </div>
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
import { useThemeStore } from '@/stores/themeStore'
import { getSlpPath } from '@/utils/api'

// Types
interface TokenData {
  tokenID: string
  gid: string
  name: string
  symbol: string
  description: string
  image: string
  decimals: number
  circulatingSupply: number
  maxSupply?: number
  vaultHolding: number
  assetbacking: string
  exchangeRatio: [number, number]
  color: string
  created: string
  isActive: boolean
  contractAddress: string
}

interface VaultAllocation {
  [key: string]: number
}

// Composables
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius, getDaoToken2Color } = useSkinTheme()
const guildStore = useGuildStore()

// State
const tokenData = ref<TokenData | null>(null)
const assetBackingAmount = ref<number>(0)
const walletBalance = ref<number>(50000) // Mock wallet balance in asset backing
const vaultAllocations = ref<VaultAllocation>({
  guild_vault: 50,
  token1_vault: 20,
  token2_vault: 30
})

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
      description: 'Asset to Token ratio'
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
      subtitle: `${tokenData.value.circulatingSupply.toLocaleString()} / ${tokenData.value.maxSupply?.toLocaleString() || 'N/A'}`,
      value: '',
      description: 'Current vs Max supply'
    }
  ]
})

const exchangeRate = computed(() => {
  if (!tokenData.value) return '1.1 : 1'
  return `${tokenData.value.exchangeRatio[0]} : ${tokenData.value.exchangeRatio[1]}`
})

const maxAssetBacking = computed(() => {
  return walletBalance.value
})

const tokenAmount = computed(() => {
  if (!tokenData.value || !assetBackingAmount.value) return 0
  // Token2 mint: asset backing amount / exchange rate = tokens to receive
  // 1 CCC = 100 ATLAS, so 1 ATLAS = 0.01 CCC
  return assetBackingAmount.value / tokenData.value.exchangeRatio[1]
})

const canMint = computed(() => {
  return tokenData.value && 
         assetBackingAmount.value > 0 && 
         assetBackingAmount.value <= maxAssetBacking.value
})

// Methods
const loadTokenData = async () => {
  try {
    // Use guildStore token data if available, otherwise fallback to direct fetch
    if (guildStore.token2) {
      tokenData.value = guildStore.token2
    } else {
      const response = await fetch(getSlpPath('guildtoken/guild-1_token2.json'))
      if (response.ok) {
        tokenData.value = await response.json()
      }
    }
  } catch (error) {
    // Handle error silently in production
    // Could implement proper error handling/notification system here
  }
}

const loadGuildAllocations = async () => {
  try {
    const guildId = guildStore.guildId || 'guild-1'
    const response = await fetch(getSlpPath(`guildprofiles/${guildId}_profile.json`))
    if (response.ok) {
      const guildData = await response.json()
      if (guildData.token2Allocation) {
        vaultAllocations.value = guildData.token2Allocation
      }
    }
  } catch (error) {
    // Handle error silently in production
    // Could implement proper error handling/notification system here
  }
}

const setAmount = (percentage: number) => {
  if (percentage === 1) {
    assetBackingAmount.value = maxAssetBacking.value
  } else {
    assetBackingAmount.value = Math.floor(maxAssetBacking.value * percentage)
  }
}

const getVaultName = (vault: string): string => {
  const vaultNames: Record<string, string> = {
    guild_vault: 'Guild Vault',
    token1_vault: 'Token1 Vault',
    token2_vault: 'Token2 Vault'
  }
  return vaultNames[vault] || vault
}

const handleMinting = () => {
  if (!canMint.value || !tokenData.value) {
    return
  }
  
  // Demo: Show minting calculation
  // TODO: Show success notification
  // This should use a proper notification system instead of alert
}

// Lifecycle
onMounted(async () => {
  await loadTokenData()
  await loadGuildAllocations()
  // Load guild colors to ensure they're available
  const themeStore = useThemeStore()
  if (guildStore.guildId) {
    await themeStore.loadGuildColors(guildStore.guildId)
  }
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.foundry-token2-content {
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

/* Minting Card */
.minting-card {
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

.minting-content {
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
  border: var(--component-border-width) solid var(--theme-dao-token2);
  border-radius: var(--theme-radius-md);
  background: var(--primary-color-1);
  color: var(--text-color-0);
  font-size: var(--text-base);
  transition: border-color var(--transition-normal);
}

.amount-input:focus {
  outline: none;
  border-color: var(--theme-dao-token2);
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  background: var(--theme-background);
  border-radius: var(--theme-radius-sm);
  border: var(--component-border-width) solid var(--theme-dao-token2);
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
  border: var(--component-border-width) solid var(--theme-dao-token2);
  border-radius: var(--theme-radius-sm);
  color: var(--text-color-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-btn:hover {
  background: var(--theme-dao-token2);
  border-color: var(--theme-dao-token2);
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

/* Vault Allocations */
.vault-allocations {
  margin-top: var(--space-md);
}

.vault-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin-bottom: var(--space-sm);
}

.vault-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.vault-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--theme-background);
  border-radius: var(--theme-radius-sm);
  border: var(--component-border-width) solid var(--secondary-color-2);
  align-items: center;
}

.vault-name {
  font-size: var(--text-xs);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
}

.vault-percentage {
  font-size: var(--text-xs);
  color: var(--theme-dao-token2);
  font-weight: var(--font-semibold);
}

.vault-amount {
  font-size: var(--text-xs);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* Responsive Design */
@media (max-width: 768px) {
  .foundry-token2-content {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .token-info-card,
  .token-stats-card,
  .minting-card {
    width: 100%;
  }
  
  .token-header {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .minting-content {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .quick-amounts {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .foundry-token2-content {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .vault-item {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
    text-align: center;
  }
}

/* Custom styling for token info card border only */
.token-info-card {
  border-color: var(--theme-dao-token2) !important;
}

/* Custom styling for stats cards - BaseListGrid */
:deep(.base-list-grid .grid-item) {
  border-color: var(--theme-dao-token2) !important;
}

:deep(.base-list-grid .grid-item-icon) {
  background: var(--theme-dao-token2) !important;
  border-color: var(--theme-dao-token2) !important;
}

:deep(.base-list-grid .icon) {
  color: var(--primary-color-0) !important;
}

:deep(.base-list-grid .grid-item-subtitle) {
  color: var(--theme-dao-token2) !important;
}

:deep(.base-list-grid .grid-item-value) {
  color: var(--theme-dao-token2) !important;
}

/* Custom button styling for token2 colors - only for Mint button */
.minting-card :deep(.button-accent) {
  background: var(--theme-dao-token2) !important;
  color: var(--text-color-2) !important;
}

.minting-card :deep(.button-accent:hover:not(.button-disabled)) {
  background: var(--theme-dao-token2) !important;
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--theme-dao-token2);
}

/* Wide screen margin - matching armory pattern */
@media (min-width: 1400px) {
  .foundry-token2-content {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}
</style>