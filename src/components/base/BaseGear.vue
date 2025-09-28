<template>
  <div 
    :class="[
      'base-gear',
      `base-gear--${size}`,
      `base-gear--${rarity}`,
      {
        'base-gear--hover': hover,
        'base-gear--clickable': clickable,
        'base-gear--selected': selected,
        'base-gear--active': selected
      }
    ]"
    @click="handleClick"
  >
    <!-- Gear Image -->
    <div class="gear-image-container">
      <img 
        :src="getImageUrl(image)" 
        :alt="name"
        class="gear-image"
        @error="handleImageError"
      />
      <div class="gear-rarity-badge">
        <Icon :icon="getRarityIcon(rarity)" class="rarity-icon" />
        <span class="rarity-text">{{ rarity.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Gear Info -->
    <div class="gear-info">
      <div class="gear-header">
        <h3 class="gear-name">{{ name }}</h3>
        <div class="gear-type">
          <Icon :icon="getTypeIcon(type)" class="type-icon" />
          <span class="type-text">{{ type.toUpperCase() }}</span>
        </div>
      </div>

      <p class="gear-description">{{ description }}</p>

      <!-- Deposit Requirements -->
      <div class="deposit-info">
        <div class="deposit-required">
          <Icon icon="mdi:bank" class="deposit-icon" />
          <span class="deposit-label">Deposit Required:</span>
          <span class="deposit-amount">{{ depositRequired.toLocaleString() }} {{ depositToken }}</span>
        </div>
        <div v-if="rentalFee > 0" class="rental-fee">
          <Icon icon="mdi:clock-outline" class="rental-icon" />
          <span class="rental-label">Daily Rental:</span>
          <span class="rental-amount">{{ rentalFee.toLocaleString() }} {{ rentalFeeToken }}</span>
        </div>
        <div v-else class="rental-fee-free">
          <Icon icon="mdi:gift" class="rental-icon" />
          <span class="rental-label">Free Rental</span>
        </div>
      </div>

      <!-- Availability Info -->
      <div class="availability-info">
        <div class="availability-row">
          <Icon icon="mdi:package-variant" class="availability-icon" />
          <span class="availability-label">Available:</span>
          <span class="availability-amount">{{ amountAvailable }}</span>
        </div>
        <div class="availability-row">
          <Icon icon="mdi:account-multiple" class="availability-icon" />
          <span class="availability-label">Max per Member:</span>
          <span class="availability-amount">{{ maxPerMember }}</span>
        </div>
      </div>

      <!-- Currently Held By -->
      <div v-if="currentlyHeldBy.length > 0" class="held-by-info">
        <div class="held-by-header">
          <Icon icon="mdi:account-check" class="held-icon" />
          <span class="held-label">Currently Held By:</span>
        </div>
        <div class="held-by-list">
          <span 
            v-for="(holder, index) in currentlyHeldBy" 
            :key="holder"
            class="held-member"
          >
            {{ holder }}{{ index < currentlyHeldBy.length - 1 ? ', ' : '' }}
          </span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="gear-actions">
        <button 
          class="gear-action-btn"
          :disabled="amountAvailable === 0"
        >
          <Icon icon="mdi:handshake" class="action-icon" />
          <span>{{ amountAvailable > 0 ? 'Borrow Gear' : 'Unavailable' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
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
  size?: 'sm' | 'md' | 'lg'
  hover?: boolean
  clickable?: boolean
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  hover: false,
  clickable: false,
  selected: false
})

// Emits
const emit = defineEmits<{
  click: [gear: Props]
}>()

// Computed
const getImageUrl = (imagePath: string): string => {
  return imagePath.startsWith('http') 
    ? imagePath 
    : getSlpPath(`resources/${imagePath}`)
}

const getRarityIcon = (rarity: string): string => {
  const rarityIcons: Record<string, string> = {
    common: 'mdi:circle',
    uncommon: 'mdi:circle-outline',
    rare: 'mdi:hexagon',
    epic: 'mdi:hexagon-outline',
    legendary: 'mdi:star',
    mythic: 'mdi:star-four-points'
  }
  return rarityIcons[rarity.toLowerCase()] || 'mdi:circle'
}

const getTypeIcon = (type: string): string => {
  const typeIcons: Record<string, string> = {
    weapon: 'mdi:sword',
    vehicle: 'mdi:car',
    aircraft: 'mdi:airplane',
    armor: 'mdi:shield',
    tool: 'mdi:wrench',
    equipment: 'mdi:cog'
  }
  return typeIcons[type.toLowerCase()] || 'mdi:cog'
}

// Methods
const handleClick = () => {
  if (props.clickable) {
    emit('click', props)
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = getSlpPath('resources/placeholder-gear.png')
}
</script>

<style scoped>
.base-gear {
  background: var(--card-background);
  border: 2px solid var(--secondary-color-2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Size variants */
.base-gear--sm {
  max-width: 250px;
}

.base-gear--md {
  max-width: 300px;
}

.base-gear--lg {
  max-width: 350px;
}

/* Rarity variants */
.base-gear--common {
  border-color: var(--text-color-3);
}

.base-gear--uncommon {
  border-color: var(--success-color-0);
}

.base-gear--rare {
  border-color: var(--info-color-0);
}

.base-gear--epic {
  border-color: var(--warning-color-0);
}

.base-gear--legendary {
  border-color: var(--secondary-color-0);
}

.base-gear--mythic {
  border-color: var(--primary-color-0);
  box-shadow: 0 0 20px rgba(var(--primary-color-0-rgb), 0.3);
}

/* Interactive states */
.base-gear--hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-gear--clickable {
  cursor: pointer;
}

.base-gear--selected {
  transform: scale(1.02);
  box-shadow: var(--shadow-xl);
  border-color: var(--secondary-color-0);
}

.base-gear--active {
  border-color: var(--secondary-color-0);
  box-shadow: 0 0 0 2px rgba(var(--secondary-color-0-rgb), 0.2);
}

/* Gear Image */
.gear-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--background-2);
}

.gear-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.base-gear--hover:hover .gear-image {
  transform: scale(1.05);
}

.gear-rarity-badge {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.75rem;
  font-weight: 600;
}

.rarity-icon {
  width: 12px;
  height: 12px;
}

/* Gear Info */
.gear-info {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
}

.gear-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-sm);
}

.gear-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color-1);
  margin: 0;
  line-height: 1.3;
}

.gear-type {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  background: var(--background-2);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-color-2);
}

.type-icon {
  width: 12px;
  height: 12px;
}

.gear-description {
  color: var(--text-color-2);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Deposit Info */
.deposit-info {
  background: var(--background-2);
  padding: var(--space-sm);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--warning-color-0);
}

.deposit-required {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
}

.deposit-icon {
  width: 16px;
  height: 16px;
  color: var(--warning-color-0);
}

.deposit-label {
  color: var(--text-color-2);
  font-weight: 500;
}

.deposit-amount {
  color: var(--text-color-1);
  font-weight: 600;
  margin-left: auto;
}

.rental-fee {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  margin-top: var(--space-xs);
  padding-top: var(--space-xs);
  border-top: 1px solid var(--border-color);
}

.rental-fee-free {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.875rem;
  margin-top: var(--space-xs);
  padding-top: var(--space-xs);
  border-top: 1px solid var(--border-color);
}

.rental-icon {
  width: 16px;
  height: 16px;
  color: var(--info-color-0);
}

.rental-label {
  color: var(--text-color-2);
  font-weight: 500;
}

.rental-amount {
  color: var(--text-color-1);
  font-weight: 600;
  margin-left: auto;
}

.rental-fee-free .rental-label {
  color: var(--success-color-0);
  font-weight: 600;
}

/* Availability Info */
.availability-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.availability-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.8rem;
}

.availability-icon {
  width: 14px;
  height: 14px;
  color: var(--text-color-3);
}

.availability-label {
  color: var(--text-color-2);
  font-weight: 500;
}

.availability-amount {
  color: var(--text-color-1);
  font-weight: 600;
  margin-left: auto;
}

/* Held By Info */
.held-by-info {
  background: var(--background-2);
  padding: var(--space-sm);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--info-color-0);
}

.held-by-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color-2);
}

.held-icon {
  width: 14px;
  height: 14px;
  color: var(--info-color-0);
}

.held-by-list {
  font-size: 0.75rem;
  color: var(--text-color-1);
  line-height: 1.3;
}

.held-member {
  font-weight: 500;
}

/* Actions */
.gear-actions {
  margin-top: auto;
  padding-top: var(--space-sm);
}

.gear-action-btn {
  width: 100%;
  background: var(--primary-color-0);
  color: white;
  border: none;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  cursor: pointer;
  transition: all 0.2s ease;
}

.gear-action-btn:hover:not(:disabled) {
  background: var(--primary-color-1);
  transform: translateY(-1px);
}

.gear-action-btn:disabled {
  background: var(--text-color-3);
  cursor: not-allowed;
  opacity: 0.6;
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .base-gear--md {
    max-width: 100%;
  }
  
  .gear-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-xs);
  }
  
  .gear-type {
    align-self: flex-start;
  }
}
</style>
