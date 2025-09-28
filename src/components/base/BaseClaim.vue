<template>
  <div 
    class="base-claim"
    :class="{
      'claim-clickable': clickable,
      'claim-selected': selected,
      'claim-disabled': !canClaim
    }"
    @click="handleClick"
  >
    <!-- Claim Header -->
    <div class="claim-header">
      <div class="claim-type-badge">
        <Icon :icon="getTypeIcon(type)" class="type-icon" />
        <span class="type-text">{{ type.toUpperCase() }}</span>
      </div>
      <div class="claim-period-badge">
        <Icon :icon="getPeriodIcon(period)" class="period-icon" />
        <span class="period-text">{{ period.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Claim Image -->
    <div class="claim-image-container">
      <img 
        :src="getImagePath(image)" 
        :alt="name"
        class="claim-image"
      />
    </div>

    <!-- Claim Content -->
    <div class="claim-content">
      <div class="claim-info">
        <h3 class="claim-name">{{ name }}</h3>
        <p class="claim-description">{{ description }}</p>
        
        <!-- Resource Info -->
        <div class="resource-info">
          <div class="resource-item">
            <Icon icon="game-icons:resource" class="resource-icon" />
            <span class="resource-label">Resource:</span>
            <span class="resource-value">{{ resourceID }}</span>
          </div>
        </div>

        <!-- Epoch Period -->
        <div class="epoch-period">
          <div class="epoch-item">
            <Icon icon="game-icons:clockwork" class="epoch-icon" />
            <span class="epoch-label">Snapshot Period:</span>
            <span class="epoch-value">{{ formatDateRange(snapshotBegin, snapshotEnd) }}</span>
          </div>
        </div>

        <!-- Claim Amount -->
        <div class="claim-amount-section">
          <div class="amount-item">
            <Icon icon="game-icons:coins" class="amount-icon" />
            <span class="amount-label">Your Claim Amount:</span>
            <span class="amount-value">{{ userClaimAmount }}</span>
          </div>
        </div>

        <!-- Claim Period -->
        <div class="claim-period-section">
          <div class="period-item">
            <Icon icon="game-icons:calendar" class="period-icon" />
            <span class="period-label">Claim Period:</span>
            <span class="period-value">{{ formatDateRange(claimPeriod.start, claimPeriod.end) }}</span>
          </div>
        </div>
      </div>

      <!-- Claim Action -->
      <div class="claim-action">
        <BaseButton
          v-if="canClaim"
          variant="accent"
          size="lg"
          :icon="'game-icons:gift'"
          :disabled="!isActive"
          @click.stop="handleClaim"
        >
          Claim Now
        </BaseButton>
        <div v-else class="claim-status">
          <Icon icon="game-icons:lock" class="status-icon" />
          <span class="status-text">Not Eligible</span>
        </div>
      </div>
    </div>

    <!-- Claim Status Indicator -->
    <div v-if="!isActive" class="claim-status-overlay">
      <Icon icon="game-icons:stop" class="status-overlay-icon" />
      <span class="status-overlay-text">Inactive</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseButton } from '@/components/base'
import { getSlpPath } from '@/utils/api'

// Props
interface Props {
  claimID: string
  guildID: string
  name: string
  description: string
  image: string
  resourceID: string
  type: 'role' | 'token'
  period: 'daily' | 'weekly' | 'monthly' | 'onetime'
  claimAmount: number
  claimPeriod: {
    start: string
    end: string
  }
  snapshotBegin: string
  snapshotEnd: string
  isActive: boolean
  userClaimAmount: number
  canClaim: boolean
  clickable?: boolean
  selected?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  selected: false,
  size: 'md'
})

// Emits
const emit = defineEmits<{
  click: [claim: any]
  claim: [claimData: { claimID: string, amount: number }]
}>()

// Computed
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'role':
      return 'game-icons:badge'
    case 'token':
      return 'game-icons:coins'
    default:
      return 'game-icons:gift'
  }
}

const getPeriodIcon = (period: string) => {
  switch (period) {
    case 'daily':
      return 'game-icons:calendar'
    case 'weekly':
      return 'game-icons:calendar-week'
    case 'monthly':
      return 'game-icons:calendar-month'
    case 'onetime':
      return 'game-icons:one-ringed-cyclone'
    default:
      return 'game-icons:clockwork'
  }
}

const getImagePath = (image: string): string => {
  if (image.startsWith('http')) {
    return image
  }
  return getSlpPath(`resources/${image}`)
}

const formatDateRange = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const startStr = startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  const endStr = endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
  
  return `${startStr} - ${endStr}`
}

// Methods
const handleClick = () => {
  if (props.clickable) {
    emit('click', {
      claimID: props.claimID,
      guildID: props.guildID,
      name: props.name,
      description: props.description,
      image: props.image,
      resourceID: props.resourceID,
      type: props.type,
      period: props.period,
      claimAmount: props.claimAmount,
      claimPeriod: props.claimPeriod,
      snapshotBegin: props.snapshotBegin,
      snapshotEnd: props.snapshotEnd,
      isActive: props.isActive,
      userClaimAmount: props.userClaimAmount,
      canClaim: props.canClaim
    })
  }
}

const handleClaim = () => {
  emit('claim', {
    claimID: props.claimID,
    amount: props.userClaimAmount
  })
}
</script>

<style scoped>
.base-claim {
  position: relative;
  background: var(--primary-color-1);
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.base-claim:hover {
  border-color: var(--secondary-color-1);
  box-shadow: var(--shadow-md);
}

.claim-clickable {
  cursor: pointer;
}

.claim-clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.claim-selected {
  border-color: var(--secondary-color-0);
  box-shadow: var(--shadow-lg);
}

.claim-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Header */
.claim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--primary-color-2);
  border-bottom: var(--component-border-width) solid var(--secondary-color-2);
}

.claim-type-badge,
.claim-period-badge {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--secondary-color-1);
  border-radius: var(--border-radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
}

.type-icon,
.period-icon {
  width: 12px;
  height: 12px;
}

/* Image */
.claim-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-bottom: var(--component-border-width) solid var(--secondary-color-2);
}

.claim-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.base-claim:hover .claim-image {
  transform: scale(1.05);
}

/* Content */
.claim-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  gap: var(--space-md);
}

.claim-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.claim-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin: 0;
  line-height: 1.3;
}

.claim-description {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Resource Info */
.resource-info,
.epoch-period,
.claim-amount-section,
.claim-period-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.resource-item,
.epoch-item,
.amount-item,
.period-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--primary-color-2);
  border-radius: var(--border-radius-sm);
  border: var(--component-border-width-thin) solid var(--secondary-color-2);
}

.resource-icon,
.epoch-icon,
.amount-icon,
.period-icon {
  width: 14px;
  height: 14px;
  color: var(--secondary-color-0);
  flex-shrink: 0;
}

.resource-label,
.epoch-label,
.amount-label,
.period-label {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
  min-width: fit-content;
}

.resource-value,
.epoch-value,
.amount-value,
.period-value {
  font-size: var(--text-xs);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
  text-align: right;
  flex: 1;
}

.amount-value {
  color: var(--secondary-color-0);
  font-weight: var(--font-bold);
}

/* Action */
.claim-action {
  margin-top: auto;
  padding-top: var(--space-sm);
  border-top: var(--component-border-width-thin) solid var(--secondary-color-2);
}

.claim-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--primary-color-2);
  border-radius: var(--border-radius-md);
  color: var(--text-color-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.status-icon {
  width: 16px;
  height: 16px;
}

/* Status Overlay */
.claim-status-overlay {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  z-index: 10;
}

.status-overlay-icon {
  width: 12px;
  height: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .claim-header {
    padding: var(--space-xs) var(--space-sm);
  }
  
  .claim-type-badge,
  .claim-period-badge {
    padding: var(--space-xs);
    font-size: var(--text-xs);
  }
  
  .claim-image-container {
    height: 150px;
  }
  
  .claim-content {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .claim-name {
    font-size: var(--text-base);
  }
  
  .claim-description {
    font-size: var(--text-xs);
  }
  
  .resource-item,
  .epoch-item,
  .amount-item,
  .period-item {
    padding: var(--space-xs);
  }
  
  .resource-label,
  .epoch-label,
  .amount-label,
  .period-label {
    font-size: var(--text-xs);
  }
  
  .resource-value,
  .epoch-value,
  .amount-value,
  .period-value {
    font-size: var(--text-xs);
  }
}

@media (max-width: 480px) {
  .claim-image-container {
    height: 120px;
  }
  
  .claim-header {
    flex-direction: column;
    gap: var(--space-xs);
    align-items: stretch;
  }
  
  .claim-type-badge,
  .claim-period-badge {
    justify-content: center;
  }
}
</style>
