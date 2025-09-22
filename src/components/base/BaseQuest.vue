<template>
  <div 
    class="base-quest"
    :class="[
      `base-quest--${quest.status}`,
      { 'base-quest--selected': isSelected }
    ]"
    @click="handleClick"
  >
    <!-- Quest Header -->
    <div class="base-quest__header">
      <div class="base-quest__icon">
        <Icon :icon="questIcon" />
      </div>
      <div class="base-quest__status">
        <Icon :icon="statusIcon" />
        <span class="base-quest__status-text">{{ statusLabel }}</span>
      </div>
    </div>

    <!-- Quest Content -->
    <div class="base-quest__content">
      <h3 class="base-quest__title">{{ quest.title }}</h3>
      <p class="base-quest__description">{{ quest.description }}</p>
      
      <!-- Quest Info -->
      <div class="base-quest__info">
        <div class="base-quest__info-item">
          <Icon icon="game-icons:sword-man" />
          <span>{{ roleRequirement }}</span>
        </div>
        <div class="base-quest__info-item">
          <Icon icon="game-icons:treasure-map" />
          <span>{{ rewardText }}</span>
        </div>
      </div>

      <!-- Gear Requirements -->
      <div v-if="quest.gear && quest.gear.length > 0" class="base-quest__gear">
        <div class="base-quest__gear-label">
          <Icon icon="game-icons:backpack" />
          <span>Gear Required</span>
        </div>
        <div class="base-quest__gear-items">
          <span 
            v-for="(item, index) in quest.gear.slice(0, 2)" 
            :key="index"
            class="base-quest__gear-item"
          >
            {{ item }}
          </span>
          <span v-if="quest.gear.length > 2" class="base-quest__gear-more">
            +{{ quest.gear.length - 2 }} more
          </span>
        </div>
      </div>

      <!-- Guild Supplies -->
      <div v-if="quest.guildSupplies && quest.guildSupplies.length > 0" class="base-quest__supplies">
        <div class="base-quest__supplies-label">
          <Icon icon="game-icons:guild" />
          <span>Guild Provides</span>
        </div>
        <div class="base-quest__supplies-items">
          <span 
            v-for="(item, index) in quest.guildSupplies.slice(0, 2)" 
            :key="index"
            class="base-quest__supplies-item"
          >
            {{ item }}
          </span>
          <span v-if="quest.guildSupplies.length > 2" class="base-quest__supplies-more">
            +{{ quest.guildSupplies.length - 2 }} more
          </span>
        </div>
      </div>
    </div>

    <!-- Quest Footer -->
    <div class="base-quest__footer">
      <div class="base-quest__deadline">
        <Icon icon="game-icons:clock" />
        <span>{{ deadlineText }}</span>
      </div>
      <div class="base-quest__type">
        <Icon :icon="quest.type === 'ingame' ? 'game-icons:target-dummy' : 'game-icons:heart-tower'" />
        <span>{{ quest.type === 'ingame' ? 'In-Game' : 'Guild' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useQuestStore } from '@/stores/questStore'
import { QUEST_STATUS_ICONS, QUEST_STATUS_LABELS, QUEST_STATUS_COLORS } from '@/constants/quest'
import type { Quest } from '@/constants/quest'

interface Props {
  quest: Quest
  isSelected?: boolean
}

interface Emits {
  (e: 'click', quest: Quest): void
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

const emit = defineEmits<Emits>()

const questStore = useQuestStore()

// Computed properties
const questIcon = computed(() => {
  return props.quest.type === 'guild' ? 'game-icons:heart-tower' : 'game-icons:target-dummy'
})

const statusIcon = computed(() => {
  return questStore.getStatusIcon(props.quest.status)
})

const statusLabel = computed(() => {
  return questStore.getStatusLabel(props.quest.status)
})

const roleRequirement = computed(() => {
  return props.quest.roleRequirement || 'Any Role'
})

const rewardText = computed(() => {
  if (props.quest.rewards && typeof props.quest.rewards === 'object' && 'tokens' in props.quest.rewards) {
    const rewards = props.quest.rewards as any
    if (rewards.tokens) {
      const tokens = rewards.tokens
      if (tokens.token1 && tokens.token2) {
        return `${tokens.token1} + ${tokens.token2} tokens`
      } else if (tokens.token1) {
        return `${tokens.token1} tokens`
      } else if (tokens.token2) {
        return `${tokens.token2} tokens`
      }
    }
  }
  return 'Rewards available'
})

const deadlineText = computed(() => {
  const deadline = new Date(props.quest.deadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'Expired'
  } else if (diffDays === 0) {
    return 'Due today'
  } else if (diffDays === 1) {
    return 'Due tomorrow'
  } else if (diffDays <= 7) {
    return `${diffDays} days left`
  } else {
    return deadline.toLocaleDateString()
  }
})

// Methods
const handleClick = () => {
  emit('click', props.quest)
}
</script>

<style scoped>
.base-quest {
  padding: var(--space-md);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.base-quest--completed {
  opacity: 0.8;
}

.base-quest__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.base-quest__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-0-20);
  border-radius: var(--border-radius-md);
  color: var(--primary-color-0);
}

.base-quest__status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-2);
}

.base-quest__status-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.base-quest__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.base-quest__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-0);
  margin: 0;
  line-height: 1.3;
}

.base-quest__description {
  font-size: var(--font-size-sm);
  color: var(--text-color-1);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.base-quest__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.base-quest__info-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--text-color-1);
}

.base-quest__gear,
.base-quest__supplies {
  margin-top: var(--space-xs);
}

.base-quest__gear-label,
.base-quest__supplies-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-2);
  margin-bottom: var(--space-xs);
}

.base-quest__gear-items,
.base-quest__supplies-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.base-quest__gear-item,
.base-quest__supplies-item {
  background: var(--neutral-color-0-20);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-color-1);
}

.base-quest__supplies-item {
  background: var(--success-color-0-20);
  color: var(--success-color-0);
}

.base-quest__gear-more,
.base-quest__supplies-more {
  font-size: var(--font-size-xs);
  color: var(--text-color-2);
  font-style: italic;
}

.base-quest__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: var(--border-width-thin) solid var(--border-color-1);
  font-size: var(--font-size-xs);
  color: var(--text-color-2);
}

.base-quest__deadline,
.base-quest__type {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

/* Responsive Design */
@media (max-width: 768px) {
  .base-quest {
    height: 440px;
    padding: var(--space-sm);
  }
  
  .base-quest__title {
    font-size: var(--font-size-md);
  }
  
  .base-quest__description {
    font-size: var(--font-size-xs);
  }
}
</style>
