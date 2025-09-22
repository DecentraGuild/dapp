<template>
  <div class="poker-event-container" :data-event-id="pokerEvent.eventID" :style="cardStyles">
    <!-- Main Poker Card -->
    <BaseCard 
      variant="primary" 
      size="md"
      class="poker-card"
      @click="toggleExpansion"
    >
      <div class="poker-content">
        <!-- Poker Icon -->
        <div class="poker-icon">
          <Icon 
            icon="game-icons:poker-hand" 
            class="icon"
          />
        </div>
        
        <!-- Poker Details -->
        <div class="poker-details">
          <div class="poker-type">Poker Tournament</div>
          <div class="poker-name">{{ pokerEvent.title }}</div>
          <div class="poker-description">{{ pokerEvent.description }}</div>
        </div>
        
        <!-- Expand/Collapse Icon -->
        <div class="expand-icon">
          <Icon 
            :icon="isExpanded ? 'game-icons:chevron-up' : 'game-icons:chevron-down'" 
            class="chevron"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Expanded Details -->
    <Transition name="accordion">
      <BaseCard 
        v-if="isExpanded"
        variant="primary" 
        size="md"
        class="poker-details-card"
      >
        <div class="expanded-content">
          <!-- Tournament Header -->
          <div class="tournament-header">
            <div class="tournament-info">
              <h3 class="tournament-title">{{ pokerEvent.title }}</h3>
              <div class="tournament-status">
                <span class="status-badge" :class="pokerEvent.status">{{ pokerEvent.status }}</span>
              </div>
            </div>
            <div class="tournament-times">
              <div class="time-item">
                <Icon icon="game-icons:clock" class="time-icon" />
                <span>Start: {{ formatDateTime(pokerEvent.startingTime) }}</span>
              </div>
              <div class="time-item">
                <Icon icon="game-icons:hourglass" class="time-icon" />
                <span>Late reg: {{ formatDateTime(pokerEvent.lateRegTime) }}</span>
              </div>
            </div>
          </div>

          <!-- Tournament Details Grid -->
          <div class="tournament-grid">
            <!-- Left Column: Buy-in & Structure -->
            <div class="grid-section">
              <h4 class="section-title">
                <Icon icon="game-icons:coins" class="section-icon" />
                Buy-in
              </h4>
              <div class="buy-in-info">
                <div class="buy-in-amount">{{ pokerEvent.entryFee }} {{ pokerEvent.entryCurrency?.toUpperCase() }}</div>
                <div class="chip-details">
                  <div class="chip-item">
                    <Icon icon="game-icons:poker-chip" class="chip-icon" />
                    <span>{{ pokerEvent.startChips?.toLocaleString() }} starting chips</span>
                  </div>
                  <div v-if="pokerEvent.earlyBirdChips" class="chip-item bonus">
                    <Icon icon="game-icons:gift" class="chip-icon" />
                    <span>+{{ pokerEvent.earlyBirdChips?.toLocaleString() }} early bird</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Players -->
            <div class="grid-section">
              <h4 class="section-title">
                <Icon icon="game-icons:player" class="section-icon" />
                Players ({{ pokerEvent.leaderboard?.length || 0 }}/{{ pokerEvent.maxParticipants }})
              </h4>
              <div class="players-info">
                <div class="player-count">
                  <div class="count-circle">{{ pokerEvent.leaderboard?.length || 0 }}</div>
                  <span>registered</span>
                </div>
                <div class="min-role">
                  <Icon icon="game-icons:rank-3" class="role-icon" />
                  <span>Min role: {{ pokerEvent.minRole }}</span>
                </div>
              </div>
            </div>

            <!-- Bottom Left: Structure -->
            <div class="grid-section">
              <h4 class="section-title">
                <Icon icon="game-icons:stopwatch" class="section-icon" />
                Structure
              </h4>
              <div class="structure-info">
                <div class="structure-item">
                  <span class="label">Blinds:</span>
                  <span class="value">{{ pokerEvent.blindsTime }} mins</span>
                </div>
                <div class="structure-item">
                  <span class="label">Prize pool:</span>
                  <span class="value">{{ pokerEvent.pricePercent }}%</span>
                </div>
                <div class="structure-item">
                  <span class="label">Bounty:</span>
                  <span class="value">{{ pokerEvent.bountyPercent }}%</span>
                </div>
                <div class="structure-item">
                  <span class="label">Rake:</span>
                  <span class="value">{{ pokerEvent.rakePercent }}%</span>
                </div>
              </div>
            </div>

            <!-- Bottom Right: Prizes -->
            <div class="grid-section">
              <h4 class="section-title">
                <Icon icon="game-icons:trophy" class="section-icon" />
                Prizes
              </h4>
              <div class="prizes-info">
                <div v-for="prize in pokerEvent.prizes?.slice(0, 3)" :key="prize.position" class="prize-item">
                  <div class="prize-position">#{{ prize.position }}</div>
                  <div class="prize-details">
                    <div class="prize-amount">{{ prize.amount }}x {{ prize.resourceID }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leaderboard Section -->
          <div v-if="pokerEvent.leaderboard && pokerEvent.leaderboard.length > 0" class="leaderboard-section">
            <h4 class="section-title">
              <Icon icon="game-icons:podium" class="section-icon" />
              Leaderboard
            </h4>
            <div class="leaderboard-grid">
              <div v-for="(player, index) in pokerEvent.leaderboard" :key="player.memberID" class="player-row">
                <div class="player-rank">{{ index + 1 }}</div>
                <div class="player-id">{{ player.memberID }}</div>
                <div class="player-chips">
                  <Icon icon="game-icons:poker-chip" class="chip-icon-small" />
                  {{ player.chips?.toLocaleString() }}
                </div>
                <div class="player-status" :class="{ eliminated: player.eliminated }">
                  {{ player.eliminated ? 'Eliminated' : 'Active' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <BaseButton 
              v-if="pokerEvent.status === 'upcoming'"
              variant="primary"
              size="md"
              @click="registerForTournament"
            >
              <Icon icon="game-icons:poker-hand" />
              Register
            </BaseButton>
            <BaseButton 
              v-else-if="pokerEvent.status === 'active'"
              variant="success"
              size="md"
              @click="joinTournament"
            >
              <Icon icon="game-icons:play-button" />
              Join Now
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import BaseCard from './BaseCard.vue'
import BaseButton from './BaseButton.vue'
import { useSkinTheme } from '../../composables/useSkinTheme'

interface PokerEvent {
  eventID: string
  guildID: string
  title: string
  description: string
  eventType: string
  status: string
  startingTime: string
  lateRegTime: string
  entryFee: number
  entryCurrency: string
  startChips: number
  earlyBirdChips?: number
  pricePercent: number
  bountyPercent: number
  rakePercent: number
  blindsTime: number
  leaderboard?: Array<{
    memberID: string
    entryTime: string
    chips: number
    position?: number
    eliminated: boolean
    eliminationTime?: string
  }>
  minRole: string
  maxParticipants: number
  prizes?: Array<{
    position: number
    resourceID: string
    amount: number
    description: string
  }>
  bonusRewards?: Array<{
    type: string
    description: string
    chips: number
  }>
}

interface Props {
  pokerEvent: PokerEvent
}

const props = defineProps<Props>()

const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

const isExpanded = ref(false)

// Computed styles for theming
const cardStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2),
  '--border-color': getSecondaryColor(1)
}))

const toggleExpansion = () => {
  isExpanded.value = !isExpanded.value
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const registerForTournament = () => {
  // TODO: Implement registration logic
  console.log('Registering for tournament:', props.pokerEvent.eventID)
}

const joinTournament = () => {
  // TODO: Implement join logic
  console.log('Joining tournament:', props.pokerEvent.eventID)
}
</script>

<style scoped>
.poker-event-container {
  margin-bottom: 1rem;
}

.poker-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: var(--border-width-thin) solid transparent;
}

.poker-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--secondary-color-0-rgb, 139, 92, 246), 0.15);
}

.poker-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.poker-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--secondary-color-0), var(--secondary-color-1));
  border-radius: 50%;
}

.poker-icon .icon {
  font-size: 1.5rem;
  color: white;
}

.poker-details {
  flex: 1;
  min-width: 0;
}

.poker-type {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--secondary-color-0);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.poker-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.poker-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.expand-icon {
  flex-shrink: 0;
  padding: 0.5rem;
}

.chevron {
  font-size: 1.25rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.poker-details-card {
  margin-top: 0.5rem;
  border: var(--border-width-thin) solid transparent;
}

.expanded-content {
  padding: 1.5rem;
}

.tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: var(--border-width-thin) solid var(--border-color);
}

.tournament-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.upcoming {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.tournament-times {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.time-icon {
  font-size: 1rem;
  color: var(--secondary-color-0);
}

.tournament-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.grid-section {
  background: var(--surface-2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: var(--border-width-thin) solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.section-icon {
  font-size: 1.1rem;
  color: var(--secondary-color-0);
}

.buy-in-info {
  text-align: center;
}

.buy-in-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color-0);
  margin-bottom: 1rem;
}

.chip-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.chip-item.bonus {
  color: #22C55E;
}

.chip-icon {
  font-size: 1rem;
}

.players-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.player-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.count-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--secondary-color-0), var(--secondary-color-1));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.min-role {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.role-icon {
  font-size: 1rem;
  color: var(--secondary-color-0);
}

.structure-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.structure-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: var(--border-width-thin) solid var(--border-color);
}

.structure-item:last-child {
  border-bottom: none;
}

.structure-item .label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.structure-item .value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.prizes-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prize-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--surface-3);
  border-radius: 0.5rem;
  border: var(--border-width-thin) solid var(--border-color);
}

.prize-position {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--secondary-color-0), var(--secondary-color-1));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.prize-details {
  flex: 1;
}

.prize-amount {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.leaderboard-section {
  margin-bottom: 2rem;
}

.leaderboard-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.player-row {
  display: grid;
  grid-template-columns: 2rem 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface-2);
  border-radius: 0.5rem;
  border: var(--border-width-thin) solid var(--border-color);
}

.player-rank {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--secondary-color-0);
}

.player-id {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.player-chips {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.chip-icon-small {
  font-size: 0.875rem;
  color: var(--secondary-color-0);
}

.player-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.player-status.eliminated {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: var(--border-width-thin) solid var(--border-color);
}

/* Accordion Animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 1000px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tournament-header {
    flex-direction: column;
    gap: 1rem;
  }

  .tournament-times {
    text-align: left;
  }

  .tournament-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .player-row {
    grid-template-columns: 2rem 1fr;
    gap: 0.5rem;
  }

  .player-chips,
  .player-status {
    grid-column: 2;
    justify-self: end;
  }
}
</style>
