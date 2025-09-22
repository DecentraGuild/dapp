<template>
  <div class="execute-trade" :style="componentStyles">
    <!-- Trade Input Section -->
    <div class="trade-input-section">
      <h3 class="section-title">Execute Trade</h3>
      
      <div class="input-group">
        <label class="input-label">Amount to {{ tradeType === 'buy' ? 'Buy' : 'Sell' }}</label>
        <div class="input-container">
          <div class="input-with-buttons">
            <input 
              v-model="tradeAmount"
              type="number"
              class="amount-input"
              :placeholder="`Amount to ${tradeType === 'buy' ? 'buy' : 'sell'}`"
              min="0"
              :max="maxAmount"
              step="0.01"
            />
            <div class="quick-amounts-inside">
              <button 
                class="quick-btn-inside"
                @click="setAmount(0.25)"
                type="button"
              >
                25%
              </button>
              <button 
                class="quick-btn-inside"
                @click="setAmount(0.5)"
                type="button"
              >
                50%
              </button>
              <button 
                class="quick-btn-inside"
                @click="setAmount(1)"
                type="button"
              >
                MAX
              </button>
            </div>
          </div>
          <div class="token-button">
            {{ tokenNameAsked }}
          </div>
        </div>
      </div>

      <!-- Wallet and Balance Information -->
      <div class="wallet-info">
        <div class="wallet-balance-row">
          <span class="balance-label">Wallet Balance:</span>
          <span class="balance-value">{{ walletBalance }} {{ tokenNameOffered }}</span>
        </div>
      </div>

      <!-- Execute Button -->
      <BaseButton
        :variant="tradeType === 'buy' ? 'accent' : 'danger'"
        size="lg"
        :icon="tradeType === 'buy' ? 'mdi:rocket' : 'mdi:swap-horizontal'"
        @click="handleExecuteTrade"
        :disabled="!canExecute"
        class="execute-button"
      >
        {{ tradeType === 'buy' ? 'Buy' : 'Sell' }}
      </BaseButton>
    </div>

    <!-- Trade Summary Section -->
    <div class="trade-summary-section">
      <h3 class="section-title">Trade Summary</h3>
      
      <div class="summary-details">
        <div class="summary-item">
          <span class="summary-label">Action:</span>
          <span class="summary-value" :class="`action-${tradeType}`">
            {{ tradeType === 'buy' ? 'Buy' : 'Sell' }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Item:</span>
          <span class="summary-value">{{ tokenNameAsked }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Amount:</span>
          <span class="summary-value">{{ tradeAmount || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Cost:</span>
          <span class="summary-value">{{ totalCost }} {{ tokenNameOffered }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BaseButton } from '@/components/base'
import { useDesignTokens } from '@/composables/useDesignTokens'
import { useSkinTheme } from '@/composables/useSkinTheme'

interface Props {
  // Trade data
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
  
  // Wallet balances (mock data for now)
  walletBalanceOffered?: number
  walletBalanceAsked?: number
}

const props = withDefaults(defineProps<Props>(), {
  walletBalanceOffered: 1000,
  walletBalanceAsked: 100
})

const emit = defineEmits<{
  execute: [tradeData: { orderID: string, amount: number, totalCost: number }]
}>()

const { colors, spacing, typography, borderRadius, shadows, componentSizes } = useDesignTokens()
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

// Reactive data
const tradeAmount = ref<number>(0)

// Computed properties
const tradeType = computed(() => props.type)

const tokenNameOffered = computed(() => {
  if (props.type === 'buy') {
    return props.tokenIDOffered
  } else {
    return props.tokenIDAsked
  }
})

const tokenNameAsked = computed(() => {
  if (props.type === 'buy') {
    return props.resourceIDAsked
  } else {
    return props.resourceIDOffered
  }
})

const walletBalance = computed(() => props.walletBalanceOffered)
const tokenBalanceAsked = computed(() => props.walletBalanceAsked)

const unitPrice = computed(() => {
  if (props.type === 'buy') {
    return props.amountOffered / props.amountAsked
  } else {
    return props.amountAsked / props.amountOffered
  }
})

const totalCost = computed(() => {
  if (!tradeAmount.value) return 0
  return (tradeAmount.value * unitPrice.value).toFixed(2)
})

const maxAmount = computed(() => {
  if (props.type === 'buy') {
    // For buying, limited by wallet balance and available amount
    const maxByWallet = props.walletBalanceOffered / unitPrice.value
    return Math.min(maxByWallet, props.amountAsked)
  } else {
    // For selling, limited by available balance and offered amount
    return Math.min(props.walletBalanceAsked, props.amountOffered)
  }
})

const canExecute = computed(() => {
  return tradeAmount.value > 0 && 
         tradeAmount.value <= maxAmount.value &&
         props.isActive
})

// Component styling
const componentStyles = computed(() => {
  const sizeConfig = componentSizes.lg
  
  return {
    '--primary-color-0': getPrimaryColor(0),
    '--primary-color-1': getPrimaryColor(1),
    '--primary-color-2': getPrimaryColor(2),
    '--secondary-color-0': getSecondaryColor(0),
    '--secondary-color-1': getSecondaryColor(1),
    '--secondary-color-2': getSecondaryColor(2),
    '--text-color-0': getTextColor(0),
    '--text-color-1': getTextColor(1),
    '--text-color-2': getTextColor(2),
    '--background': colors.value.background,
    '--padding': sizeConfig.padding,
    '--font-size': sizeConfig.fontSize,
    '--border-radius': sizeConfig.borderRadius,
    '--gap': sizeConfig.gap
  }
})

// Methods
const setAmount = (percentage: number) => {
  if (percentage === 1) {
    tradeAmount.value = maxAmount.value
  } else {
    tradeAmount.value = Math.floor(maxAmount.value * percentage * 100) / 100
  }
}

const handleExecuteTrade = () => {
  if (!canExecute.value) return
  
  emit('execute', {
    orderID: props.orderID,
    amount: tradeAmount.value,
    totalCost: parseFloat(totalCost.value.toString())
  })
  
  // Reset form after execution
  tradeAmount.value = 0
}

// Watch for trade changes to reset amount
watch(() => props.orderID, () => {
  tradeAmount.value = 0
})
</script>

<style scoped>
.execute-trade {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  padding: var(--space-lg);
  background: var(--background);
  border: var(--border-width-thin) solid var(--text-color-2);
  border-radius: var(--border-radius-lg);
}

/* Trade Input Section */
.trade-input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.input-label {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
}

.input-container {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.input-with-buttons {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.amount-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  padding-right: 120px; /* Make space for buttons */
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--border-radius-md);
  background: var(--primary-color-1);
  color: var(--text-color-0);
  font-size: var(--text-base);
  transition: border-color var(--transition-normal);
}

.amount-input:focus {
  outline: none;
  border-color: var(--secondary-color-0);
}

.quick-amounts-inside {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: var(--space-xs);
}

.quick-btn-inside {
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  color: var(--text-color-1);
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: underline;
}

.quick-btn-inside:hover {
  color: var(--secondary-color-0);
  background: var(--primary-color-2);
}

.token-button {
  padding: var(--space-sm) var(--space-md);
  background: var(--primary-color-2);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--border-radius-md);
  color: var(--text-color-0);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

/* Wallet Info */
.wallet-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--background);
  border-radius: var(--border-radius-md);
  border: var(--border-width-thin) solid var(--text-color-2);
}

.wallet-balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
}

.balance-value {
  font-size: var(--text-sm);
  color: var(--secondary-color-0);
  font-weight: var(--font-semibold);
}


/* Execute Button */
.execute-button {
  width: 100%;
  margin-top: var(--space-md);
}

/* Trade Summary Section */
.trade-summary-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--primary-color-1);
  border-radius: var(--border-radius-md);
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) 0;
}

.summary-label {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.summary-value {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

.action-buy {
  color: #10B981;
}

.action-sell {
  color: #EF4444;
}

/* Responsive Design */
@media (max-width: 768px) {
  .execute-trade {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    padding: var(--space-md);
  }
  
  .input-container {
    flex-direction: column;
  }
  
  .quick-amounts {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .execute-trade {
    padding: var(--space-sm);
    gap: var(--space-md);
  }
  
  .section-title {
    font-size: var(--text-lg);
  }
}
</style>
