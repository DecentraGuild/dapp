<template>
  <div v-if="quest" class="quest-details" ref="questDetailsRef">
      <!-- Quest Header -->
      <div class="quest-details__header">
        <div class="quest-details__icon">
          <Icon :icon="questIcon" />
        </div>
        <div class="quest-details__title-section">
          <h2 class="quest-details__title">{{ quest.title }}</h2>
          <div class="quest-details__meta">
            <div class="quest-details__status">
              <Icon :icon="statusIcon" />
              <span>{{ statusLabel }}</span>
            </div>
            <div class="quest-details__type">
              <Icon :icon="quest.type === 'ingame' ? 'game-icons:target-dummy' : 'game-icons:heart-tower'" />
              <span>{{ quest.type === 'ingame' ? 'In-Game Quest' : 'Guild Quest' }}</span>
            </div>
          </div>
        </div>
        <div class="quest-details__actions">
          <BaseButton
            v-if="actionButton"
            :variant="actionButton.variant"
            :icon="actionButton.icon"
            size="lg"
            @click="handleAction"
          >
            {{ actionButton.text }}
          </BaseButton>
        </div>
      </div>

      <!-- Quest Description -->
      <div class="quest-details__description">
        <h3>Description</h3>
        <p>{{ quest.description }}</p>
      </div>

      <!-- Quest Goal -->
      <div class="quest-details__goal">
        <h3>Goal</h3>
        <p>{{ quest.goal }}</p>
      </div>

      <!-- Quest Requirements -->
      <div v-if="quest.requirements && quest.requirements.length > 0" class="quest-details__requirements">
        <h3>Requirements</h3>
        <ul class="quest-details__list">
          <li v-for="(requirement, index) in quest.requirements" :key="index">
            <Icon icon="game-icons:check-mark" />
            <span>{{ requirement }}</span>
          </li>
        </ul>
      </div>

      <!-- Gear Requirements -->
      <div v-if="quest.gear && quest.gear.length > 0" class="quest-details__gear">
        <h3>Gear Required</h3>
        <div class="quest-details__gear-grid">
          <div 
            v-for="(item, index) in quest.gear" 
            :key="index"
            class="quest-details__gear-item"
          >
            <Icon icon="game-icons:backpack" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- Guild Supplies -->
      <div v-if="quest.guildSupplies && quest.guildSupplies.length > 0" class="quest-details__supplies">
        <h3>Guild Supplies</h3>
        <div class="quest-details__supplies-grid">
          <div 
            v-for="(item, index) in quest.guildSupplies" 
            :key="index"
            class="quest-details__supplies-item"
          >
            <Icon icon="game-icons:guild" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- Rewards -->
      <div v-if="quest.rewards && quest.rewards.length > 0" class="quest-details__rewards">
        <h3>Rewards</h3>
        <div class="quest-details__rewards-grid">
          <div v-for="reward in quest.rewards" :key="reward.type" class="quest-details__reward-section">
            <h4>{{ reward.type.charAt(0).toUpperCase() + reward.type.slice(1) }}</h4>
            <div class="quest-details__reward-items">
              <div class="quest-details__reward-item">
                <Icon :icon="getRewardIcon(reward.type)" />
                <span>{{ getRewardText(reward) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quest Info -->
      <div class="quest-details__info">
        <div class="quest-details__info-grid">
          <div class="quest-details__info-item">
            <Icon icon="game-icons:sword-man" />
            <div>
              <span class="quest-details__info-label">Role Requirement</span>
              <span class="quest-details__info-value">{{ roleRequirement }}</span>
            </div>
          </div>
          <div class="quest-details__info-item">
            <Icon icon="game-icons:calendar" />
            <div>
              <span class="quest-details__info-label">Created</span>
              <span class="quest-details__info-value">{{ createdDate }}</span>
            </div>
          </div>
          <div class="quest-details__info-item">
            <Icon icon="game-icons:clock" />
            <div>
              <span class="quest-details__info-label">Deadline</span>
              <span class="quest-details__info-value">{{ deadlineDate }}</span>
            </div>
          </div>
          <div v-if="quest.assignedTo" class="quest-details__info-item">
            <Icon icon="game-icons:user-check" />
            <div>
              <span class="quest-details__info-label">Assigned To</span>
              <span class="quest-details__info-value">{{ quest.assignedTo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Applications (if any) -->
      <div v-if="quest.applications && quest.applications.length > 0" class="quest-details__applications">
        <h3>Applications</h3>
        <div class="quest-details__applications-list">
          <div 
            v-for="(application, index) in quest.applications" 
            :key="index"
            class="quest-details__application"
          >
            <div class="quest-details__application-header">
              <span class="quest-details__application-member">{{ application.memberName }}</span>
              <span class="quest-details__application-status">{{ application.status }}</span>
            </div>
            <p class="quest-details__application-message">{{ application.message }}</p>
            <span class="quest-details__application-date">{{ applicationDate(application.appliedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Verification (if any) -->
      <div v-if="quest.verification" class="quest-details__verification">
        <h3>Verification</h3>
        <div class="quest-details__verification-content">
          <div class="quest-details__verification-header">
            <span class="quest-details__verification-status" :class="`quest-details__verification-status--${quest.verification.approved ? 'approved' : 'rejected'}`">
              {{ quest.verification.approved ? 'Approved' : 'Rejected' }}
            </span>
            <span class="quest-details__verification-date">{{ verificationDate(quest.verification.verifiedAt) }}</span>
          </div>
          <p class="quest-details__verification-notes">{{ quest.verification.notes }}</p>
          <div class="quest-details__verification-quality">
            <span>Quality: {{ quest.verification.quality }}</span>
          </div>
        </div>
      </div>
  </div>
  
  <div v-else class="quest-details__empty">
    <div class="quest-details__empty-content">
      <Icon icon="game-icons:question-mark" class="quest-details__empty-icon" />
      <h3>No Quest Selected</h3>
      <p>Select a quest from the grid above to view its details.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseButton } from '@/components/base'
import { useQuestStore } from '@/stores/questStore'
import { QUEST_STATUS_ICONS, QUEST_STATUS_LABELS } from '@/constants/quest'
import type { Quest } from '@/constants/quest'

interface Props {
  quest: Quest | null
}

interface Emits {
  (e: 'action', quest: Quest, action: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const questStore = useQuestStore()

// Computed properties
const questIcon = computed(() => {
  return props.quest?.type === 'guild' ? 'game-icons:heart-tower' : 'game-icons:target-dummy'
})

const statusIcon = computed(() => {
  return props.quest ? questStore.getStatusIcon(props.quest.status) : ''
})

const statusLabel = computed(() => {
  return props.quest ? questStore.getStatusLabel(props.quest.status) : ''
})

const roleRequirement = computed(() => {
  return props.quest?.roleRequirement || 'Any Role'
})

const createdDate = computed(() => {
  return props.quest ? new Date(props.quest.created).toLocaleDateString() : ''
})

const deadlineDate = computed(() => {
  return props.quest ? new Date(props.quest.deadline).toLocaleDateString() : ''
})

const actionButton = computed(() => {
  if (!props.quest) return null

  const actions = {
    new: {
      text: 'Sign Up',
      icon: 'game-icons:hand',
      variant: 'primary' as const
    },
    pending: {
      text: 'Sign Off',
      icon: 'game-icons:hand-off',
      variant: 'secondary' as const
    },
    assigned: {
      text: 'Deliver',
      icon: 'game-icons:package',
      variant: 'accent' as const
    },
    delivered: {
      text: 'Notify Validator',
      icon: 'game-icons:bell',
      variant: 'warning' as const
    },
    rewarded: {
      text: 'Claim Rewards',
      icon: 'game-icons:trophy',
      variant: 'success' as const
    },
    completed: null
  }

  return actions[props.quest.status as keyof typeof actions]
})

// Methods
const handleAction = () => {
  if (props.quest && actionButton.value) {
    emit('action', props.quest, actionButton.value.text.toLowerCase().replace(' ', '_'))
  }
}

const applicationDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const verificationDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Helper methods for reward display
const getRewardIcon = (type: string): string => {
  switch (type) {
    case 'token':
      return 'game-icons:coins'
    case 'badge':
      return 'game-icons:medal'
    case 'nft':
      return 'game-icons:gem'
    case 'recognition':
      return 'game-icons:star'
    default:
      return 'game-icons:gift'
  }
}

const getRewardText = (reward: any): string => {
  switch (reward.type) {
    case 'token':
      return `${reward.amount || 0} ${reward.tokenID || 'Token'}`
    case 'badge':
      return reward.badgeID || 'Badge'
    case 'nft':
      return reward.nftID || 'NFT'
    case 'recognition':
      return 'Recognition'
    default:
      return reward.type
  }
}
</script>

<style scoped>
.quest-details {
  margin-top: var(--space-lg);
  width: 100%;
}

.quest-details__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: var(--border-width-thin) solid var(--border-color-1);
}

.quest-details__icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-0-20);
  border-radius: var(--border-radius-lg);
  color: var(--primary-color-0);
  flex-shrink: 0;
}

.quest-details__title-section {
  flex: 1;
}

.quest-details__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.2;
}

.quest-details__meta {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.quest-details__status,
.quest-details__type {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-1);
}

.quest-details__actions {
  flex-shrink: 0;
}

.quest-details__description,
.quest-details__goal,
.quest-details__requirements,
.quest-details__gear,
.quest-details__supplies,
.quest-details__rewards,
.quest-details__info,
.quest-details__applications,
.quest-details__verification {
  margin-bottom: var(--space-lg);
}

.quest-details__description h3,
.quest-details__goal h3,
.quest-details__requirements h3,
.quest-details__gear h3,
.quest-details__supplies h3,
.quest-details__rewards h3,
.quest-details__applications h3,
.quest-details__verification h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.quest-details__description p,
.quest-details__goal p {
  font-size: var(--font-size-md);
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.quest-details__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quest-details__list li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-bottom: var(--border-width-thin) solid var(--border-color-1);
  color: var(--text-color-1);
}

.quest-details__list li:last-child {
  border-bottom: none;
}

.quest-details__gear-grid,
.quest-details__supplies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-sm);
}

.quest-details__gear-item,
.quest-details__supplies-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--neutral-color-0-10);
  border-radius: var(--border-radius-md);
  color: var(--text-color-1);
}

.quest-details__supplies-item {
  background: var(--success-color-0-10);
  color: var(--success-color-0);
}

.quest-details__rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.quest-details__reward-section h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.quest-details__reward-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.quest-details__reward-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--accent-color-0-10);
  border-radius: var(--border-radius-md);
  color: var(--text-color-1);
}

.quest-details__info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.quest-details__info-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--neutral-color-0-10);
  border-radius: var(--border-radius-md);
}

.quest-details__info-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-color-2);
  margin-bottom: var(--space-xs);
}

.quest-details__info-value {
  display: block;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-0);
}

.quest-details__applications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.quest-details__application {
  padding: var(--space-md);
  background: var(--neutral-color-0-10);
  border-radius: var(--border-radius-md);
  border-left: var(--border-width-thin) solid var(--accent-color-0);
}

.quest-details__application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.quest-details__application-member {
  font-weight: var(--font-weight-bold);
  color: var(--text-color-0);
}

.quest-details__application-status {
  padding: var(--space-xs) var(--space-sm);
  background: var(--accent-color-0-20);
  color: var(--accent-color-0);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
}

.quest-details__application-message {
  color: var(--text-color-1);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.5;
}

.quest-details__application-date {
  font-size: var(--font-size-sm);
  color: var(--text-color-2);
}

.quest-details__verification-content {
  padding: var(--space-md);
  background: var(--neutral-color-0-10);
  border-radius: var(--border-radius-md);
}

.quest-details__verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.quest-details__verification-status {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.quest-details__verification-status--approved {
  background: var(--success-color-0-20);
  color: var(--success-color-0);
}

.quest-details__verification-status--rejected {
  background: var(--error-color-0-20);
  color: var(--error-color-0);
}

.quest-details__verification-date {
  font-size: var(--font-size-sm);
  color: var(--text-color-2);
}

.quest-details__verification-notes {
  color: var(--text-color-1);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.5;
}

.quest-details__verification-quality {
  font-size: var(--font-size-sm);
  color: var(--text-color-2);
  font-style: italic;
}

.quest-details__empty {
  margin-top: var(--space-lg);
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quest-details__empty-content {
  text-align: center;
  color: var(--text-color-2);
}

.quest-details__empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.quest-details__empty-content h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-color-1);
}

.quest-details__empty-content p {
  font-size: var(--font-size-md);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .quest-details__header {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .quest-details__meta {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .quest-details__title {
    font-size: var(--font-size-xl);
  }
  
  .quest-details__gear-grid,
  .quest-details__supplies-grid {
    grid-template-columns: 1fr;
  }
  
  .quest-details__rewards-grid {
    grid-template-columns: 1fr;
  }
  
  .quest-details__info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
