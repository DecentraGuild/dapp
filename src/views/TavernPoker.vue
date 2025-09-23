<template>
  <div class="tavern-poker">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Poker Tournaments" 
      subtitle="High-stakes tournaments and legendary prizes"
      variant="primary" 
      size="lg"
      class="poker-header-card"
    >
      <div class="poker-header-content">
        <div class="poker-description">
          <p>Join thrilling poker tournaments with legendary resource prizes! Test your skills against fellow guild members in high-stakes Texas Hold'em tournaments. From early bird bonuses to bounty rewards, every hand could change your fortune.</p>
        </div>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="poker-main-card"
    >
      <!-- Poker Tournaments List -->
      <div v-if="filteredPokerEvents.length > 0" class="poker-events-container">
        <BasePoker
          v-for="pokerEvent in filteredPokerEvents"
          :key="pokerEvent.eventID"
          :poker-event="pokerEvent"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:poker-hand" class="empty-icon" />
        <p>No poker tournaments available at the moment</p>
        <p class="empty-subtitle">Check back later for exciting tournament opportunities</p>
      </div>
    </BaseCard>

    <!-- Practice Table Section -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="poker-main-card"
    >
      <div v-if="practiceTable" class="practice-table-container">
        <div class="practice-table-header">
          <h3 class="practice-table-title">Practice Table</h3>
          <p class="practice-table-subtitle">Sharpen your skills at the guild's practice poker table</p>
          <div class="table-description">
            <p>{{ practiceTable.description }}</p>
          </div>
        </div>

        <div class="practice-table-content">
          <!-- Table SVG Shape -->
          <div class="practice-table-shape">
            <svg class="table-svg" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
              <!-- Rounded Rectangle Table Shape -->
              <rect 
                x="25" 
                y="60" 
                width="450" 
                height="180" 
                rx="90" 
                ry="90" 
                :fill="cardStyles['--primary-color-1']"
                :stroke="cardStyles['--secondary-color-0']"
                stroke-width="1.5"
              />
              
              <!-- Inner Table Area -->
              <rect 
                x="40" 
                y="75" 
                width="420" 
                height="150" 
                rx="75" 
                ry="75" 
                :fill="cardStyles['--primary-color-0']"
                :stroke="cardStyles['--secondary-color-1']"
                stroke-width="1"
              />

              <!-- Table Information Text -->
              <text x="250" y="105" text-anchor="middle" :fill="cardStyles['--text-color-0']" font-size="11" font-weight="bold">
                {{ practiceTable.name }}
              </text>
              
              <text x="250" y="120" text-anchor="middle" :fill="cardStyles['--secondary-color-0']" font-size="9" font-weight="600">
                {{ practiceTable.gameType }}
              </text>
              
              <!-- Left Column Information -->
              <text x="120" y="140" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Blinds: {{ practiceTable.smallBlind }}/{{ practiceTable.bigBlind }}
              </text>
              
              <text x="120" y="155" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Buy-in: {{ practiceTable.minEntry }}-{{ practiceTable.maxEntry }}
              </text>
              
              <text x="120" y="170" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Currency: {{ practiceTable.tokenID?.toUpperCase() }}
              </text>

              <!-- Right Column Information -->
              <text x="380" y="140" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Max Players: {{ practiceTable.maxPlayers }}
              </text>
              
              <text x="380" y="155" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Time Limit: {{ practiceTable.settings?.timeLimit }}s
              </text>
              
              <text x="380" y="170" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Showdown: {{ practiceTable.settings?.showdownDelay }}s
              </text>

              <!-- Bottom Row Information -->
              <text x="160" y="190" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Spectators: {{ practiceTable.settings?.allowSpectators ? 'Yes' : 'No' }}
              </text>
              
              <text x="250" y="190" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Auto Start: {{ practiceTable.settings?.autoStart ? 'Yes' : 'No' }}
              </text>
              
              <text x="340" y="190" text-anchor="middle" :fill="cardStyles['--text-color-1']" font-size="8">
                Status: {{ practiceTable.isActive ? 'Active' : 'Inactive' }}
              </text>

              <!-- Subtle Decorative Elements (Card Suits) -->
              <g :fill="cardStyles['--secondary-color-0']" opacity="0.15">
                <!-- Spades -->
                <path d="M70 85 L67 92 L73 92 Z M68.5 92 L71.5 92 L71.5 94 L68.5 94 Z" />
                <!-- Hearts -->
                <path d="M430 85 C428.5 83.5, 426.5 83.5, 426.5 85.5 C426.5 83.5, 424.5 83.5, 423 85 C423 87, 426.5 90.5, 426.5 90.5 C426.5 90.5, 430 87, 430 85 Z" />
                <!-- Clubs -->
                <path d="M70 205 C68.5 203.5, 66.5 205, 68 206.5 C66.5 205, 66.5 207, 68 208.5 C66.5 207, 68.5 208.5, 70 207 C71.5 208.5, 73.5 207, 72 208.5 C73.5 207, 73.5 205, 72 206.5 C73.5 205, 71.5 203.5, 70 205 Z M68.5 208.5 L71.5 208.5 L71.5 210.5 L68.5 210.5 Z" />
                <!-- Diamonds -->
                <path d="M426.5 205 L430 201 L433.5 205 L430 209 Z" />
              </g>
            </svg>
          </div>

          <!-- Table Action -->
          <div class="practice-table-actions">
            <BaseButton 
              variant="primary"
              size="lg"
              @click="joinPracticeTable"
              :disabled="!practiceTable.isActive"
            >
              <Icon icon="game-icons:card-play" />
              {{ practiceTable.isActive ? 'Join Table' : 'Table Unavailable' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Empty State for Practice Table -->
      <div v-else class="empty-state">
        <Icon icon="game-icons:card-play" class="empty-icon" />
        <p>No practice table available</p>
        <p class="empty-subtitle">Practice table is currently unavailable</p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BasePoker, BaseButton } from '@/components/base'
import { useGuildStore } from '@/stores/guildStore'
import { useSkinTheme } from '@/composables/useSkinTheme'
import { getSlpPath } from '@/utils/api'

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
  marked?: string[]
  attended?: string[]
  createdBy: string
  createdAt: string
  isActive: boolean
}

interface PracticeTable {
  tableID: string
  guildID: string
  name: string
  description: string
  smallBlind: number
  bigBlind: number
  minEntry: number
  maxEntry: number
  tokenID: string
  themeImage: string
  maxPlayers: number
  gameType: string
  isActive: boolean
  createdAt: string
  settings: {
    allowSpectators: boolean
    autoStart: boolean
    timeLimit: number
    showdownDelay: number
  }
}

const guildStore = useGuildStore()
const pokerEvents = ref<PokerEvent[]>([])
const practiceTable = ref<PracticeTable | null>(null)

// Import theme system for SVG styling
const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

// Computed styles for SVG theming
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

// Filter poker events to only show events from the current guild
const filteredPokerEvents = computed(() => {
  const currentGuildId = guildStore.guildId
  if (!currentGuildId) return []
  
  const guildEvents = pokerEvents.value.filter(event => event.guildID === currentGuildId)
  
  // Sort by status (upcoming first, then active, then past) and then by date
  return guildEvents.sort((a, b) => {
    // Status priority: upcoming > active > finished/past
    const statusPriority = { 
      upcoming: 3, 
      active: 2, 
      finished: 1, 
      past: 1,
      cancelled: 0 
    }
    
    const statusA = statusPriority[a.status as keyof typeof statusPriority] || 0
    const statusB = statusPriority[b.status as keyof typeof statusPriority] || 0
    
    if (statusA !== statusB) {
      return statusB - statusA
    }
    
    // Then sort by starting time
    return new Date(a.startingTime).getTime() - new Date(b.startingTime).getTime()
  })
})

const loadPokerEvents = async () => {
  try {
    // Get all event files dynamically and filter for poker tournaments
    const eventModules = import.meta.glob('/SLP/events/*.json')
    const events: PokerEvent[] = []
    
    for (const path in eventModules) {
      try {
        const eventData = await fetch(path)
        if (eventData.ok) {
          const event = await eventData.json() as PokerEvent
          
          // Only show poker tournament events that are active
          if (event.eventType === 'poker_tournament' && event.isActive) {
            events.push(event)
          }
        } else {
          console.warn(`Failed to load event from ${path}: ${eventData.status}`)
        }
      } catch (error) {
        console.warn(`Failed to load event from ${path}:`, error)
      }
    }
    
    // Store all poker events (filtering and sorting happens in computed property)
    pokerEvents.value = events
  } catch (error) {
    console.error('Failed to load poker events:', error)
  }
}

const loadPracticeTable = async () => {
  try {
    const currentGuildId = guildStore.guildId
    if (!currentGuildId) return

    // Determine the correct table file based on guild ID
    const guildPrefix = currentGuildId === 'guild-1' ? 'g1' : 'g2'
    const tableFile = `${guildPrefix}_poker_table.json`
    
    const response = await fetch(getSlpPath(`poker/${tableFile}`))
    if (!response.ok) {
      console.warn(`Practice table ${tableFile} not found: ${response.status}`)
      return
    }
    
    const tableData = await response.json() as PracticeTable
    
    // Only show table if it belongs to the current guild and is active
    if (tableData.guildID === currentGuildId) {
      practiceTable.value = tableData
    }
  } catch (error) {
    console.error('Failed to load practice table:', error)
  }
}

const joinPracticeTable = () => {
  if (!practiceTable.value) return
  
  // TODO: Implement practice table join logic
  console.log('Joining practice table:', practiceTable.value.tableID)
  alert(`Joining ${practiceTable.value.name}!\nBuy-in: ${practiceTable.value.minEntry}-${practiceTable.value.maxEntry} ${practiceTable.value.tokenID?.toUpperCase()}`)
}

onMounted(() => {
  loadPokerEvents()
  loadPracticeTable()
})
</script>

<style scoped>
.tavern-poker {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
}

.poker-header-card {
  width: 100%;
  max-width: 100%;
}

.poker-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.poker-description {
  flex: 1;
}

.poker-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.poker-main-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.poker-events-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--text-color-1);
  opacity: 0.6;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-md);
  color: var(--secondary-color-0);
}

.empty-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: var(--space-xs);
}

/* Practice Table Styles */
.practice-table-container {
  padding: var(--space-md);
}

.practice-table-header {
  text-align: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-1);
}

.practice-table-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.practice-table-subtitle {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin: 0;
  opacity: 0.8;
}

.practice-table-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.practice-table-shape {
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-svg {
  width: 100%;
  height: auto;
  filter: var(--shadow-md);
}

.practice-table-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-description {
  text-align: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--secondary-color-2);
  border-radius: var(--radius-md);
  border: var(--border-width-thin) solid var(--secondary-color-1);
  margin-top: var(--space-sm);
}

.table-description p {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  line-height: 1.5;
  margin: 0;
}

/* Wide screen margin - matching other tavern pages */
@media (min-width: 1400px) {
  .poker-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .poker-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .tavern-poker {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .tavern-poker {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .poker-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .poker-events-container {
    padding: var(--space-sm);
    gap: var(--space-md);
  }

  .practice-table-container {
    padding: var(--space-sm);
  }

  .practice-table-title {
    font-size: var(--text-xl);
  }

  .table-svg {
    width: 95%;
  }
}

@media (max-width: 480px) {
  .tavern-poker {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
}
</style>
