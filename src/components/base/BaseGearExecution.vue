<template>
  <div class="base-gear-execution">
    <!-- Main Container Card -->
    <BaseCard 
      variant="primary" 
      size="xl"
      class="main-container-card"
    >
      <!-- Gear Summary Card -->
      <BaseCard 
        variant="neutral" 
        size="lg"
        class="gear-summary-card"
      >
        <template #header>
          <div class="gear-summary">
            <img :src="getImageUrl(image)" :alt="name" class="gear-thumbnail" />
            <div class="gear-details">
              <h3 class="gear-name">{{ name }}</h3>
              <p class="gear-type">{{ type.toUpperCase() }} • {{ rarity.toUpperCase() }}</p>
            </div>
          </div>
        </template>
      </BaseCard>

      <!-- Execution Content -->
      <div class="execution-content">
      <!-- Action Selection -->
      <div class="action-selection">
        <div class="action-tabs">
          <button 
            :class="['action-tab', { 'action-tab--active': selectedAction === 'borrow' }]"
            @click="selectedAction = 'borrow'"
            :disabled="amountAvailable === 0"
          >
            <Icon icon="mdi:handshake" class="action-icon" />
            <span>Borrow Gear</span>
          </button>
          <button 
            :class="['action-tab', { 'action-tab--active': selectedAction === 'return' }]"
            @click="selectedAction = 'return'"
            :disabled="!isCurrentlyHeld"
          >
            <Icon icon="mdi:undo" class="action-icon" />
            <span>Return Gear</span>
          </button>
        </div>
      </div>

      <!-- Requirements and Summary Side by Side -->
      <div class="main-sections">
        <!-- Borrow/Return Requirements Card -->
        <BaseCard 
          variant="neutral" 
          size="md"
          class="requirements-card"
        >
          <template #header>
            <div class="info-header">
              <Icon icon="mdi:information" class="info-icon" />
              <h4>{{ selectedAction === 'borrow' ? 'Borrow Requirements' : 'Return Gear' }}</h4>
            </div>
          </template>
          
          <div class="info-content">
            <div v-if="selectedAction === 'borrow'">
              <div class="requirement-row">
                <span class="requirement-label">Deposit Required:</span>
                <span class="requirement-value">{{ depositRequired.toLocaleString() }} {{ depositToken }}</span>
              </div>
              <div v-if="rentalFee > 0" class="requirement-row">
                <span class="requirement-label">Daily Rental Fee:</span>
                <span class="requirement-value">{{ rentalFee.toLocaleString() }} {{ rentalFeeToken }}</span>
              </div>
              <div v-else class="requirement-row">
                <span class="requirement-label">Rental Fee:</span>
                <span class="requirement-value">Free</span>
              </div>
              <div class="requirement-row">
                <span class="requirement-label">Available Units:</span>
                <span class="requirement-value">{{ amountAvailable }}</span>
              </div>
              <div class="requirement-row">
                <span class="requirement-label">Max per Member:</span>
                <span class="requirement-value">{{ maxPerMember }}</span>
              </div>
            </div>
            <div v-else>
              <p class="return-description">
                Return this gear to get back your {{ depositRequired.toLocaleString() }} {{ depositToken }} deposit.
              </p>
              <div class="return-details">
                <div class="detail-row">
                  <span class="detail-label">Deposit to Return:</span>
                  <span class="detail-value">{{ depositRequired.toLocaleString() }} {{ depositToken }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Gear Condition:</span>
                  <span class="detail-value">Good</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Transaction Summary Card -->
        <BaseCard 
          variant="neutral" 
          size="md"
          class="transaction-card"
        >
          <template #header>
            <div class="summary-header">
              <Icon icon="mdi:calculator" class="summary-icon" />
              <h4>Transaction Summary</h4>
            </div>
          </template>
          
          <div class="summary-content">
            <div class="summary-row">
              <span class="summary-label">Action:</span>
              <span class="summary-value">{{ selectedAction === 'borrow' ? 'Borrow Gear' : 'Return Gear' }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Gear:</span>
              <span class="summary-value">{{ name }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">{{ selectedAction === 'borrow' ? 'Deposit Required:' : 'Deposit Returned:' }}</span>
              <span class="summary-value">{{ depositRequired.toLocaleString() }} {{ depositToken }}</span>
            </div>
            <div v-if="selectedAction === 'borrow' && rentalFee > 0" class="summary-row">
              <span class="summary-label">Daily Rental Fee:</span>
              <span class="summary-value">{{ rentalFee.toLocaleString() }} {{ rentalFeeToken }}</span>
            </div>
            <div v-if="selectedAction === 'borrow' && rentalFee === 0" class="summary-row">
              <span class="summary-label">Rental Fee:</span>
              <span class="summary-value">Free</span>
            </div>
            <div class="summary-row summary-total">
              <span class="summary-label">Total {{ selectedAction === 'borrow' ? 'Cost' : 'Refund' }}:</span>
              <span class="summary-value">
                {{ selectedAction === 'borrow' 
                  ? `${depositRequired.toLocaleString()} ${depositToken}${rentalFee > 0 ? ` + ${rentalFee.toLocaleString()} ${rentalFeeToken}/day` : ''}` 
                  : `${depositRequired.toLocaleString()} ${depositToken}` 
                }}
              </span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Bottom Row: Wallet Balance and Execute Button -->
      <div class="bottom-row">
        <div class="wallet-balance">
          <div class="balance-header">
            <Icon icon="mdi:wallet" class="balance-icon" />
            <span>Your Balance</span>
          </div>
          <div class="balance-amount">
            {{ walletBalance.toLocaleString() }} {{ depositToken }}
          </div>
        </div>

        <div class="execute-actions">
          <BaseButton 
            v-if="selectedAction === 'borrow'"
            variant="secondary"
            size="lg"
            icon="mdi:handshake"
            :disabled="!canBorrow"
            @click="executeBorrow"
          >
            Borrow Gear
          </BaseButton>
          <BaseButton 
            v-if="selectedAction === 'return'"
            variant="secondary"
            size="lg"
            icon="mdi:undo"
            @click="executeReturn"
          >
            Return Gear
          </BaseButton>
        </div>
      </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseButton } from '@/components/base'
import { getSlpPath } from '@/utils/api'

// Props
interface Props {
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
  walletBalance: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  execute: [data: { gearID: string, action: 'borrow' | 'return', amount: number, totalCost: number }]
}>()

// Reactive data
const selectedAction = ref<'borrow' | 'return'>('borrow')

// Computed
const getImageUrl = (imagePath: string): string => {
  return imagePath.startsWith('http') 
    ? imagePath 
    : getSlpPath(`resources/${imagePath}`)
}

const isCurrentlyHeld = computed(() => {
  // In a real app, this would check if the current user is in the currentlyHeldBy array
  // For now, we'll simulate this based on some logic
  return props.currentlyHeldBy.length > 0 && props.currentlyHeldBy.includes('current-user')
})

const canBorrow = computed(() => {
  return props.amountAvailable > 0 && 
         props.walletBalance >= props.depositRequired &&
         !isCurrentlyHeld.value
})

// Methods
const executeBorrow = () => {
  if (!canBorrow.value) return
  
  emit('execute', {
    gearID: props.gearID,
    action: 'borrow',
    amount: 1,
    totalCost: props.depositRequired
  })
}

const executeReturn = () => {
  emit('execute', {
    gearID: props.gearID,
    action: 'return',
    amount: 1,
    totalCost: props.depositRequired
  })
}
</script>

<style scoped>
.base-gear-execution {
  width: 100%;
}

/* Main Container Card */
.main-container-card {
  width: 100%;
}

/* Gear Summary Card */
.gear-summary-card {
  width: 100%;
  margin-bottom: var(--space-lg);
}

.gear-summary {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.gear-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  border: 2px solid var(--border-color);
}

.gear-details {
  flex: 1;
}

.gear-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color-1);
  margin: 0 0 var(--space-xs) 0;
}

.gear-type {
  font-size: 0.875rem;
  color: var(--text-color-2);
  margin: 0;
}

/* Execution Content */
.execution-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Action Selection */
.action-selection {
  margin-bottom: var(--space-md);
}

.action-tabs {
  display: flex;
  background: var(--background-2);
  border-radius: var(--border-radius-sm);
  padding: 4px;
  gap: 4px;
}

.action-tab {
  flex: 1;
  background: transparent;
  border: none;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color-2);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
}

.action-tab:hover:not(:disabled) {
  background: var(--background-3);
  color: var(--text-color-1);
}

.action-tab--active {
  background: var(--primary-color-0);
  color: white;
}

.action-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* Main Sections Side by Side */
.main-sections {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.requirements-card,
.transaction-card {
  flex: 1;
  width: 40%;
}

.info-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.info-icon {
  width: 20px;
  height: 20px;
  color: var(--info-color-0);
}

.info-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-1);
  margin: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.requirement-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.requirement-label {
  color: var(--text-color-2);
  font-weight: 500;
}

.requirement-value {
  color: var(--text-color-1);
  font-weight: 600;
}

.return-description {
  color: var(--text-color-2);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 var(--space-md) 0;
}

.return-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--text-color-2);
  font-weight: 500;
}

.detail-value {
  color: var(--text-color-1);
  font-weight: 600;
}

/* Bottom Row: Wallet Balance and Execute Button */
.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md);
  background: var(--background-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.wallet-balance {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.balance-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  color: var(--text-color-2);
  font-weight: 500;
}

.balance-icon {
  width: 16px;
  height: 16px;
  color: var(--success-color-0);
}

.balance-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color-1);
}

.execute-actions {
  display: flex;
  gap: var(--space-sm);
}

/* Transaction Summary */
.transaction-summary {
  background: var(--background-2);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: var(--space-md);
  margin-top: var(--space-md);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.summary-icon {
  width: 20px;
  height: 20px;
  color: var(--info-color-0);
}

.summary-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-1);
  margin: 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.summary-label {
  color: var(--text-color-2);
  font-weight: 500;
}

.summary-value {
  color: var(--text-color-1);
  font-weight: 600;
}

.summary-total {
  border-top: 1px solid var(--border-color);
  padding-top: var(--space-sm);
  margin-top: var(--space-sm);
  font-size: 1rem;
  font-weight: 700;
}


/* Responsive Design */
@media (max-width: 768px) {
  .main-sections {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .requirements-card,
  .transaction-card {
    width: 100%;
  }
  
  .bottom-row {
    flex-direction: column;
    gap: var(--space-md);
    align-items: stretch;
  }
  
  .wallet-balance {
    justify-content: center;
  }
  
  .execute-actions {
    justify-content: center;
  }
  
  .action-tabs {
    flex-direction: column;
  }
}
</style>
