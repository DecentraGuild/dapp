<template>
  <BaseCard 
    :variant="variant" 
    :size="size" 
    :hover="hover" 
    :clickable="clickable"
    class="achievement-progression-card"
    :class="achievementClasses"
  >
    <!-- Achievement Header -->
    <div class="achievement-header">
      <div class="achievement-icon-container" :style="{ '--level-color': getLevelColor(achievement.currentLevel) }">
        <Icon 
          :icon="getIconName(achievement.icon)" 
          class="achievement-icon"
          :style="iconStyles"
          width="80"
          height="80"
        />
        <div v-if="isFullyCompleted" class="completion-badge">
          <Icon icon="mdi:check" />
        </div>
      </div>
      
      <div class="achievement-info">
        <h3 class="achievement-title">{{ achievement.title }}</h3>
        <p class="achievement-description">{{ achievement.description }}</p>
        <div class="achievement-meta">
          <span class="achievement-type">{{ achievement.type }}</span>
          <span class="achievement-current-level" :class="currentLevelClass">
            {{ achievement.currentLevel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Simple Level Progression -->
    <div class="simple-levels">
      <h4>Levels</h4>
      
      <!-- Common -->
      <div class="simple-level">
        <Icon 
          :icon="getIconName(achievement.icon)" 
          width="32" 
          height="32"
          style="color: #10B981 !important; fill: #10B981 !important;"
        />
        <div class="level-content">
          <strong>Common</strong>
          <div class="requirement">{{ achievement.levels.Common.requirement }}</div>
          <div class="rewards">
            <span class="reward-item">{{ achievement.levels.Common.contributionPoints }} CP</span>
            <span class="reward-item">{{ achievement.levels.Common.tokenReward }} Tokens</span>
            <span v-if="achievement.levels.Common.mintable" class="reward-item nft">NFT</span>
          </div>
        </div>
      </div>

      <!-- Epic -->
      <div class="simple-level">
        <Icon 
          :icon="getIconName(achievement.icon)" 
          width="32" 
          height="32"
          style="color: #F59E0B !important; fill: #F59E0B !important;"
        />
        <div class="level-content">
          <strong>Epic</strong>
          <div class="requirement">{{ achievement.levels.Epic.requirement }}</div>
          <div class="rewards">
            <span class="reward-item">{{ achievement.levels.Epic.contributionPoints }} CP</span>
            <span class="reward-item">{{ achievement.levels.Epic.tokenReward }} Tokens</span>
            <span v-if="achievement.levels.Epic.mintable" class="reward-item nft">NFT</span>
          </div>
        </div>
      </div>

      <!-- Legendary -->
      <div class="simple-level">
        <Icon 
          :icon="getIconName(achievement.icon)" 
          width="32" 
          height="32"
          style="color: #EF4444 !important; fill: #EF4444 !important;"
        />
        <div class="level-content">
          <strong>Legendary</strong>
          <div class="requirement">{{ achievement.levels.Legendary.requirement }}</div>
          <div class="rewards">
            <span class="reward-item">{{ achievement.levels.Legendary.contributionPoints }} CP</span>
            <span class="reward-item">{{ achievement.levels.Legendary.tokenReward }} Tokens</span>
            <span v-if="achievement.levels.Legendary.mintable" class="reward-item nft">NFT</span>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import BaseCard from './BaseCard.vue'
import { useSkinTheme } from '../../composables/useSkinTheme'

interface Achievement {
  id: string
  title: string
  description: string
  type: string
  icon: string
  levels: {
    Common: {
      requirement: string
      contributionPoints: number
      tokenReward: number
      mintable: boolean
      completed: boolean
      completedAt?: string
    }
    Epic: {
      requirement: string
      contributionPoints: number
      tokenReward: number
      mintable: boolean
      completed: boolean
      completedAt?: string
    }
    Legendary: {
      requirement: string
      contributionPoints: number
      tokenReward: number
      mintable: boolean
      completed: boolean
      completedAt?: string
    }
  }
  currentLevel: 'Common' | 'Epic' | 'Legendary'
  totalProgress: number
  maxProgress: number
}

interface Props {
  achievement: Achievement
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  hover: true,
  clickable: false
})

const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

// Level-based styling
const levelColors = {
  Common: '#6B7280',
  Epic: '#10B981', 
  Legendary: '#EF4444'
}

const achievementClasses = computed(() => [
  `achievement-${props.achievement.currentLevel.toLowerCase()}`,
  {
    'achievement-fully-completed': isFullyCompleted.value
  }
])

const iconStyles = computed(() => ({
  color: levelColors[props.achievement.currentLevel]
}))

const currentLevelClass = computed(() => [
  'level-badge',
  `level-${props.achievement.currentLevel.toLowerCase()}`
])

const isFullyCompleted = computed(() => 
  props.achievement.levels.Legendary.completed
)

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Level color mapping - using exact colors from achievements_index.json
const getLevelColor = (level: string) => {
  const colors = {
    'Common': '#6B7280',  // Gray
    'Epic': '#10B981',    // Green
    'Legendary': '#EF4444' // Red
  }
  return colors[level as keyof typeof colors] || '#6B7280'
}

// Smart icon utility - handles both game-icons and regular icons
const getIconName = (icon: string) => {
  // If it already has a prefix, use it as is
  if (icon.includes(':')) {
    return icon
  }
  // Otherwise, assume it's a game-icon
  return `game-icons:${icon}`
}


</script>

<style scoped>
.achievement-progression-card {
  position: relative;
  overflow: visible;
}

.achievement-header {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.achievement-icon-container {
  position: relative;
  flex-shrink: 0;
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-1);
  border-radius: var(--radius-lg);
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.achievement-icon {
  transition: all 0.3s ease;
  color: var(--level-color, var(--text-color-0)) !important;
  fill: currentColor;
}

/* Simple level progression */
.simple-levels {
  margin-top: var(--space-md);
}

.simple-levels h4 {
  margin: 0 0 var(--space-md) 0;
  color: var(--text-color-0);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.simple-level {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--primary-color-1);
  border-radius: var(--radius-lg);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  transition: all 0.3s ease;
}

.simple-level:hover {
  background: var(--primary-color-2);
  border-color: var(--secondary-color-1);
}

.simple-level .level-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* Force icon colors with very specific selectors */
.common-icon {
  color: #10B981 !important;
}

.epic-icon {
  color: #F59E0B !important;
}

.legendary-icon {
  color: #EF4444 !important;
}

/* Force icon colors on SVG elements */
.common-icon svg {
  color: #10B981 !important;
  fill: #10B981 !important;
}

.epic-icon svg {
  color: #F59E0B !important;
  fill: #F59E0B !important;
}

.legendary-icon svg {
  color: #EF4444 !important;
  fill: #EF4444 !important;
}

.simple-level .level-content {
  flex: 1;
}

.simple-level strong {
  color: var(--text-color-0);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  display: block;
  margin-bottom: var(--space-xs);
}

.simple-level .requirement {
  color: var(--text-color-1);
  font-size: var(--text-sm);
  line-height: 1.4;
  margin-bottom: var(--space-xs);
}

.simple-level .rewards {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.simple-level .reward-item {
  background: var(--secondary-color-2);
  color: var(--text-color-0);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.simple-level .reward-item.nft {
  background: #8B5CF6;
  color: white;
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
  font-weight: var(--font-medium);
  color: var(--text-color-1);
  background: var(--secondary-color-2);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.achievement-current-level {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.level-common {
  background: #6B7280 !important;
  color: white !important;
}

.level-epic {
  background: #10B981 !important;
  color: white !important;
}

.level-legendary {
  background: #EF4444 !important;
  color: white !important;
}

.level-progression {
  margin-top: var(--space-md);
}

.progression-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.progression-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0;
}

.progress-text {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  font-weight: var(--font-medium);
}

.levels-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.level-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  background: var(--primary-color-1);
  transition: all 0.3s ease;
}

.level-item.level-completed {
  background: var(--primary-color-2);
  border-color: var(--secondary-color-2);
  opacity: 0.6;
}

.level-item.level-current {
  background: color-mix(in srgb, #3B82F6 10%, var(--primary-color-1));
  border-color: #3B82F6;
}

.level-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--level-color, var(--primary-color-0));
  border-radius: var(--radius-md);
  border: var(--border-width-thin) solid var(--level-color, var(--secondary-color-1));
  flex-shrink: 0;
  color: var(--level-color, var(--text-color-0));
  position: relative;
}

.level-icon svg {
  color: var(--level-color, var(--text-color-0)) !important;
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
  stroke: currentColor;
  display: block;
}

.level-icon .iconify {
  color: var(--level-color, var(--text-color-0)) !important;
  width: 1.25rem;
  height: 1.25rem;
  display: block;
}

.level-icon > * {
  color: var(--level-color, var(--text-color-0)) !important;
  width: 1.25rem;
  height: 1.25rem;
  display: block;
  fill: currentColor;
  stroke: currentColor;
}

/* Ensure Icon component renders properly */
.level-icon .iconify-icon {
  color: var(--level-color, var(--text-color-0)) !important;
  width: 1.25rem;
  height: 1.25rem;
  display: block;
}

.level-icon .iconify-icon svg {
  color: var(--level-color, var(--text-color-0)) !important;
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
  stroke: currentColor;
}

.level-icon .icon-completed {
  color: var(--level-color, #10B981);
}

.level-info {
  flex: 1;
  min-width: 0;
}

.level-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin-bottom: 2px;
}

.level-requirement {
  font-size: var(--text-xs);
  color: var(--text-color-1);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
}

.level-rewards {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.reward-item {
  font-size: var(--text-xs);
  padding: 2px 6px;
  background: var(--secondary-color-2);
  color: var(--text-color-0);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.reward-item.nft {
  background: #8B5CF6;
  color: white;
}

.level-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.status-icon {
  font-size: 1.25rem;
}

.status-icon.completed {
  color: #10B981;
}

.status-text {
  font-size: var(--text-xs);
  color: var(--text-color-1);
  text-align: center;
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
  
  .level-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .level-icon {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .level-status {
    align-self: flex-end;
  }
}
</style>
