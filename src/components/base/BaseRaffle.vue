<template>
  <BaseCard variant="primary" size="md" class="base-raffle">
    <!-- Status Badge -->
    <div class="raffle-status-container">
      <div 
        class="raffle-status-badge"
        :class="statusClass"
      >
        <Icon :icon="statusIcon" class="status-icon" />
        {{ statusText }}
      </div>
    </div>

    <!-- Raffle Image -->
    <div class="raffle-image-container">
      <img 
        :src="imageUrl" 
        :alt="title"
        class="raffle-image"
        @error="handleImageError"
      />
    </div>

    <!-- Raffle Content -->
    <div class="raffle-content">
      <!-- Title -->
      <h3 class="raffle-title">{{ title }}</h3>

      <!-- Description -->
      <p class="raffle-description">{{ description }}</p>

      <!-- Reward Section -->
      <div class="raffle-reward">
        <div class="reward-label">Prize:</div>
        <div class="reward-value">
          <Icon icon="game-icons:treasure" class="reward-icon" />
          {{ rewardAmount }}x {{ rewardTokenName }}
        </div>
      </div>

      <!-- Tickets Progress -->
      <div class="raffle-progress">
        <div class="progress-header">
          <span class="progress-label">{{ ticketsSold }}/{{ ticketsTotal }} tickets sold</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>

      <!-- Price -->
      <div class="raffle-price">
        <Icon icon="game-icons:coins" class="price-icon" />
        {{ ticketPrice }} {{ paymentCurrencyName }} per ticket
      </div>

      <!-- Purchase Section -->
      <div v-if="status === 'running'" class="raffle-purchase">
        <div class="purchase-controls">
          <BaseButton
            variant="outline"
            size="sm"
            @click="decrementTickets"
            :disabled="ticketQuantity <= 1"
            class="quantity-btn"
          >
            &lt;
          </BaseButton>
          <input 
            v-model.number="ticketQuantity"
            type="number"
            min="1"
            :max="maxTicketsAvailable"
            class="quantity-input"
          />
          <BaseButton
            variant="outline"
            size="sm"
            @click="incrementTickets"
            :disabled="ticketQuantity >= maxTicketsAvailable"
            class="quantity-btn"
          >
            &gt;
          </BaseButton>
        </div>
        <BaseButton
          variant="accent"
          size="lg"
          icon="game-icons:card-random"
          @click="buyTickets"
          :disabled="!canPurchase"
          class="buy-button"
        >
          Buy Tickets ({{ totalCost }} {{ paymentCurrencyName }})
        </BaseButton>
      </div>

      <!-- Finished State -->
      <div v-else-if="status === 'finished'" class="raffle-finished">
        <div class="winner-info">
          <Icon icon="game-icons:trophy" class="winner-icon" />
          <span>Winner: {{ winner || 'To be announced' }}</span>
        </div>
      </div>

      <!-- Concept State -->
      <div v-else-if="status === 'concept'" class="raffle-concept">
        <Icon icon="game-icons:hourglass" class="concept-icon" />
        <span>Raffle in development</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import BaseCard from './BaseCard.vue'
import BaseButton from './BaseButton.vue'
import { getSlpPath } from '@/utils/api'

interface RaffleProps {
  raffleId: string
  title: string
  description: string
  status: 'concept' | 'running' | 'finished'
  ticketsTotal: number
  ticketPrice: number
  paymentCurrency: string
  rewardTokenId: string
  rewardAmount: number
  ticketsSoldWallets: string[]
  winner?: string | null
  imageUrl?: string
}

const props = withDefaults(defineProps<RaffleProps>(), {
  imageUrl: getSlpPath('nfts/nft-legendary-ship.png')
})

const emit = defineEmits<{
  buyTickets: [{ raffleId: string; quantity: number; totalCost: number }]
}>()

const ticketQuantity = ref(1)

const ticketsSold = computed(() => props.ticketsSoldWallets.length)
const progressPercentage = computed(() => 
  Math.round((ticketsSold.value / props.ticketsTotal) * 100)
)

const maxTicketsAvailable = computed(() => 
  Math.max(1, props.ticketsTotal - ticketsSold.value)
)

const totalCost = computed(() => 
  ticketQuantity.value * props.ticketPrice
)

const canPurchase = computed(() => 
  props.status === 'running' && 
  ticketQuantity.value > 0 && 
  ticketQuantity.value <= maxTicketsAvailable.value
)

const statusClass = computed(() => {
  switch (props.status) {
    case 'running': return 'status-running'
    case 'finished': return 'status-finished'
    case 'concept': return 'status-concept'
    default: return 'status-concept'
  }
})

const statusIcon = computed(() => {
  switch (props.status) {
    case 'running': return 'game-icons:play'
    case 'finished': return 'game-icons:check'
    case 'concept': return 'game-icons:hourglass'
    default: return 'game-icons:hourglass'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'running': return 'ACTIVE'
    case 'finished': return 'FINISHED'
    case 'concept': return 'CONCEPT'
    default: return 'CONCEPT'
  }
})

const rewardTokenName = computed(() => {
  // Simple token name extraction - in real app this would come from a store/API
  return props.rewardTokenId.replace(/^(g\d+-)?/, '').replace(/-/g, ' ').toUpperCase()
})

const paymentCurrencyName = computed(() => {
  // Clean up currency name - remove prefixes and resource indicators
  return props.paymentCurrency
    .replace(/^(g\d+-)?/, '') // Remove guild prefix like "g1-" or "g2-"
    .replace(/^resource-?/, '') // Remove "resource-" or "resource" prefix
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .toUpperCase()
})

const incrementTickets = () => {
  if (ticketQuantity.value < maxTicketsAvailable.value) {
    ticketQuantity.value++
  }
}

const decrementTickets = () => {
  if (ticketQuantity.value > 1) {
    ticketQuantity.value--
  }
}

const buyTickets = () => {
  if (canPurchase.value) {
    emit('buyTickets', {
      raffleId: props.raffleId,
      quantity: ticketQuantity.value,
      totalCost: totalCost.value
    })
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = getSlpPath('nfts/nft-legendary-ship.png') // Fallback image
}
</script>

<style scoped>
.base-raffle {
  width: 100%;
  max-width: 25rem;
  position: relative;
  overflow: hidden;
}

.raffle-status-container {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  z-index: 2;
}

.raffle-status-badge {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--theme-radius-xl);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-tight);
}

.status-running {
  background: var(--success-color-bg, var(--color-success-light));
  color: var(--success-color, var(--color-success));
  border: var(--border-width-thin) solid var(--success-color, var(--color-success));
}

.status-finished {
  background: var(--neutral-color-bg, var(--color-gray-100));
  color: var(--neutral-color, var(--color-gray-500));
  border: var(--border-width-thin) solid var(--neutral-color, var(--color-gray-500));
}

.status-concept {
  background: var(--warning-color-bg, var(--color-warning-light));
  color: var(--warning-color, var(--color-warning));
  border: var(--border-width-thin) solid var(--warning-color, var(--color-warning));
}

.status-icon {
  font-size: 0.875rem;
}

.raffle-image-container {
  width: 100%;
  height: 18.75rem;
  overflow: hidden;
  border-radius: var(--theme-radius-md);
  margin-bottom: var(--space-lg);
}

.raffle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.base-raffle:hover .raffle-image {
  transform: scale(1.05);
}

.raffle-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.raffle-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color-0);
  margin: 0;
  line-height: 1.3;
}

.raffle-description {
  font-size: 0.875rem;
  color: var(--text-color-1);
  line-height: 1.5;
  margin: 0;
}

.raffle-reward {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--secondary-color-2);
  border-radius: var(--theme-radius-md);
  border-left: var(--border-width-thin) solid var(--secondary-color-0);
}

.reward-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color-1);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-tight);
}

.reward-value {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-0);
}

.reward-icon {
  color: var(--secondary-color-0);
  font-size: 1.125rem;
}

.raffle-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.875rem;
  color: var(--text-color-1);
  font-weight: 500;
}

.progress-percentage {
  font-size: 0.875rem;
  color: var(--text-color-0);
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: var(--space-xs);
  background: var(--secondary-color-2);
  border-radius: var(--theme-radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--secondary-color-0), var(--accent-color-0));
  border-radius: var(--theme-radius-sm);
  transition: width 0.3s ease;
}

.raffle-price {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  color: var(--text-color-1);
  font-weight: 500;
}

.price-icon {
  color: var(--secondary-color-0);
  font-size: 1rem;
}

.raffle-purchase {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-sm);
}

.purchase-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  justify-content: center;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.quantity-input {
  width: 80px;
  height: 40px;
  text-align: center;
  border: var(--border-width-thin) solid var(--secondary-color-1);
  border-radius: var(--theme-radius-md);
  background: var(--primary-color-1);
  color: var(--text-color-0);
  font-size: 1rem;
  font-weight: 600;
}

.quantity-input:focus {
  outline: none;
  border-color: var(--secondary-color-0);
}

.buy-button {
  width: 100%;
  font-weight: 700;
}

.raffle-finished,
.raffle-concept {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--secondary-color-2);
  border-radius: var(--theme-radius-md);
  font-size: 0.875rem;
  color: var(--text-color-1);
  font-weight: 500;
}

.winner-icon,
.concept-icon {
  font-size: 1.125rem;
  color: var(--secondary-color-0);
}

.winner-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .base-raffle {
    max-width: 100%;
  }
  
  .raffle-image-container {
    height: 250px;
  }
  
  .raffle-title {
    font-size: 1.125rem;
  }
  
  .purchase-controls {
    gap: var(--space-xs);
  }
  
  .quantity-input {
    width: 60px;
  }
}
</style>
