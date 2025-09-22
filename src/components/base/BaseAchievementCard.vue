<template>
  <BaseCard 
    :variant="variant" 
    :size="size" 
    :hover="hover" 
    :clickable="clickable"
    class="achievement-card"
    :class="achievementClasses"
  >
    <!-- Achievement Header -->
    <div class="achievement-header">
      <div class="achievement-icon-container">
        <Icon 
          :icon="achievementIcon" 
          :class="iconClasses"
          :style="iconStyles"
        />
        <div v-if="completed" class="completion-badge">
          <Icon icon="mdi:check" />
        </div>
      </div>
      
      <div class="achievement-info">
        <h3 class="achievement-title">{{ title }}</h3>
        <p class="achievement-description">{{ description }}</p>
        <div class="achievement-meta">
          <span class="achievement-type">{{ type }}</span>
          <span class="achievement-level" :class="levelClass">{{ level }}</span>
        </div>
      </div>
    </div>

    <!-- Achievement Progress -->
    <div v-if="showProgress" class="achievement-progress">
      <BaseProgressBar
        :value="progressValue"
        :max="progressMax"
        :label="progressLabel"
        :size="progressSize"
        :variant="progressVariant"
        :animated="animated"
      />
    </div>

    <!-- Achievement Rewards -->
    <div v-if="showRewards && (contributionPoints || tokenReward)" class="achievement-rewards">
      <h4 class="rewards-title">Rewards</h4>
      <div class="rewards-grid">
        <div v-if="contributionPoints" class="reward-item">
          <Icon icon="mdi:star" class="reward-icon" />
          <span class="reward-label">Contribution Points</span>
          <span class="reward-value">{{ contributionPoints }}</span>
        </div>
        <div v-if="tokenReward" class="reward-item">
          <Icon icon="mdi:coin" class="reward-icon" />
          <span class="reward-label">Tokens</span>
          <span class="reward-value">{{ tokenReward }}</span>
        </div>
        <div v-if="mintable" class="reward-item nft-reward">
          <Icon icon="mdi:image" class="reward-icon" />
          <span class="reward-label">Mintable NFT</span>
          <span class="reward-value">Available</span>
        </div>
      </div>
    </div>

    <!-- Achievement Requirements -->
    <div v-if="showRequirements && requirement" class="achievement-requirements">
      <h4 class="requirements-title">Requirements</h4>
      <p class="requirement-text">{{ requirement }}</p>
    </div>

    <!-- Achievement Footer -->
    <div v-if="completedAt" class="achievement-footer">
      <div class="completion-info">
        <Icon icon="mdi:calendar-check" class="completion-icon" />
        <span class="completion-date">Completed {{ formatDate(completedAt) }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import BaseCard from './BaseCard.vue'
import BaseProgressBar from './BaseProgressBar.vue'
import { useSkinTheme } from '../../composables/useSkinTheme'

interface Props {
  // Achievement data
  title: string
  description: string
  type: string
  level: 'Common' | 'Epic' | 'Legendary'
  icon?: string
  
  // Progress data
  progressValue?: number
  progressMax?: number
  progressLabel?: string
  showProgress?: boolean
  
  // Rewards
  contributionPoints?: number
  tokenReward?: number
  mintable?: boolean
  showRewards?: boolean
  
  // Requirements
  requirement?: string
  showRequirements?: boolean
  
  // Status
  completed?: boolean
  completedAt?: string
  
  // Card styling
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  clickable?: boolean
  
  // Progress bar styling
  progressSize?: 'sm' | 'md' | 'lg'
  progressVariant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi:trophy',
  progressValue: 0,
  progressMax: 100,
  progressLabel: 'Progress',
  showProgress: true,
  showRewards: true,
  showRequirements: true,
  completed: false,
  variant: 'primary',
  size: 'md',
  hover: true,
  clickable: false,
  progressSize: 'md',
  progressVariant: 'default',
  animated: false
})

const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

// Level-based styling
const levelColors = {
  Common: '#6B7280',
  Epic: '#10B981', 
  Legendary: '#EF4444'
}

const levelIcons = {
  Common: 'mdi:trophy',
  Epic: 'mdi:crown',
  Legendary: 'mdi:star'
}

const achievementIcon = computed(() => props.icon || levelIcons[props.level])

const achievementClasses = computed(() => [
  `achievement-${props.level.toLowerCase()}`,
  {
    'achievement-completed': props.completed,
    'achievement-mintable': props.mintable
  }
])

const iconClasses = computed(() => [
  'achievement-icon',
  `icon-${props.level.toLowerCase()}`
])

const iconStyles = computed(() => ({
  color: levelColors[props.level]
}))

const levelClass = computed(() => [
  'level-badge',
  `level-${props.level.toLowerCase()}`
])

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.achievement-card {
  position: relative;
  overflow: visible;
}

.achievement-header {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.achievement-icon-container {
  position: relative;
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-1);
  border-radius: var(--radius-lg);
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.achievement-icon {
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.completion-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--secondary-color-0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color-0);
  font-size: 0.75rem;
  border: var(--border-width-thin) solid var(--primary-color-0);
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-xs) 0;
  line-height: 1.3;
}

.achievement-description {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.4;
  opacity: 0.9;
}

.achievement-meta {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  flex-wrap: wrap;
}

.achievement-type {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  background: var(--primary-color-2);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.level-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.level-common {
  background: #6B7280;
  color: white;
}

.level-epic {
  background: #10B981;
  color: white;
}

.level-legendary {
  background: #EF4444;
  color: white;
}

.achievement-progress {
  margin-bottom: var(--space-md);
}

.achievement-rewards {
  margin-bottom: var(--space-md);
}

.rewards-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-sm);
}

.reward-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--primary-color-1);
  border-radius: var(--radius-md);
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.reward-item.nft-reward {
  background: linear-gradient(135deg, var(--secondary-color-2), var(--primary-color-1));
  border-color: var(--secondary-color-1);
}

.reward-icon {
  font-size: 1rem;
  color: var(--secondary-color-0);
  flex-shrink: 0;
}

.reward-label {
  font-size: var(--text-xs);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
  flex: 1;
  min-width: 0;
}

.reward-value {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  flex-shrink: 0;
}

.achievement-requirements {
  margin-bottom: var(--space-md);
}

.requirements-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.requirement-text {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin: 0;
  line-height: 1.4;
  background: var(--primary-color-1);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border-left: var(--border-width-thin) solid var(--secondary-color-0);
}

.achievement-footer {
  border-top: var(--border-width-thin) solid var(--secondary-color-2);
  padding-top: var(--space-sm);
}

.completion-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-xs);
  color: var(--text-color-1);
}

.completion-icon {
  font-size: 0.875rem;
  color: var(--secondary-color-0);
}

.completion-date {
  font-weight: var(--font-medium);
}

/* Level-specific styling */
.achievement-common .achievement-icon-container {
  border-color: #6B7280;
}

.achievement-epic .achievement-icon-container {
  border-color: #10B981;
}

.achievement-legendary .achievement-icon-container {
  border-color: #EF4444;
}

.achievement-completed .achievement-icon-container {
  background: var(--secondary-color-0);
  border-color: var(--secondary-color-0);
}

.achievement-completed .achievement-icon {
  color: var(--primary-color-0);
}

.achievement-mintable .achievement-icon-container {
  box-shadow: 0 0 0 2px var(--secondary-color-0);
}

/* Responsive */
@media (max-width: 768px) {
  .achievement-header {
    gap: var(--space-sm);
  }
  
  .achievement-icon-container {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .achievement-icon {
    font-size: 1.25rem;
  }
  
  .achievement-title {
    font-size: var(--text-base);
  }
  
  .rewards-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
