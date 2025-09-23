<template>
  <div class="tavern-events">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Events" 
      subtitle="Community gatherings and celebrations"
      variant="primary" 
      size="lg"
      class="events-header-card"
    >
      <div class="events-header-content">
        <div class="events-description">
          <p>Join exciting guild events, participate in community celebrations, and connect with fellow members. From tournaments to social gatherings, there's always something happening in the tavern!</p>
        </div>
        
        <!-- View Toggle Buttons -->
        <div class="view-toggle-container">
          <BaseButton
            :variant="currentView === 'list' ? 'accent' : 'outline'"
            size="sm"
            icon="game-icons:list"
            @click="setView('list')"
            class="view-toggle-btn"
          >
            List
          </BaseButton>
          <BaseButton
            :variant="currentView === 'calendar' ? 'accent' : 'outline'"
            size="sm"
            icon="game-icons:calendar"
            @click="setView('calendar')"
            class="view-toggle-btn"
          >
            Calendar
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Events Filter Sidebar -->
    <BaseSidebar
      :items="filterItems"
      variant="primary"
      position="left"
      width="4rem"
      @item-click="handleFilterClick"
    />

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="events-main-card"
    >
      <!-- List View -->
      <div v-if="currentView === 'list'" class="events-list-container">
        <BaseTimeline
          v-for="(event, index) in filteredEvents" 
          :key="event.eventID"
          :date="event.date"
          :event-type="event.eventType"
          :is-first="index === 0"
          :is-last="index === filteredEvents.length - 1"
        >
          <div class="event-card-container" :data-event-id="event.eventID">
            <!-- Main Event Card -->
            <BaseCard 
              variant="primary" 
              size="md"
              class="event-card"
              :style="{ borderColor: getEventTypeColor(event.eventType) }"
              @click="toggleEventExpansion(event.eventID)"
            >
              <div class="event-content">
                <!-- Event Icon -->
                <div class="event-icon">
                  <Icon 
                    :icon="getEventTypeIcon(event.eventType)" 
                    class="icon"
                  />
                </div>
                
                <!-- Event Details -->
                <div class="event-details">
                  <div class="event-type">{{ getEventTypeTitle(event.eventType) }}</div>
                  <div class="event-name">{{ event.title }}</div>
                  <div class="event-description">{{ event.description }}</div>
                </div>
                
                <!-- Expand/Collapse Icon -->
                <div class="expand-icon">
                  <Icon 
                    :icon="expandedEvent === event.eventID ? 'game-icons:chevron-up' : 'game-icons:chevron-down'" 
                    class="chevron"
                  />
                </div>
              </div>
            </BaseCard>

            <!-- Expanded Details -->
            <Transition name="accordion">
              <div v-if="expandedEvent === event.eventID" class="event-details-expanded">
                <BaseCard 
                  variant="primary" 
                  size="md"
                  class="event-details-card"
                  :style="{ borderColor: getEventTypeColor(event.eventType) }"
                >
                  <div class="expanded-content">
                    <!-- Left Column: Event Details -->
                    <div class="details-left-column">
                      <!-- Event Information -->
                      <div class="detail-section">
                        <h4 class="detail-title">Event Information</h4>
                        <div class="detail-grid">
                          <div class="detail-item">
                            <span class="detail-label">Date & Time:</span>
                            <span class="detail-value">{{ new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">{{ event.status }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">Min Role:</span>
                            <span class="detail-value">{{ event.minRole }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-label">Max Participants:</span>
                            <span class="detail-value">{{ event.maxParticipants }}</span>
                          </div>
                          <div v-if="event.entryFee" class="detail-item">
                            <span class="detail-label">Entry Fee:</span>
                            <span class="detail-value">{{ event.entryFee }} tokens</span>
                          </div>
                        </div>
                      </div>

                      <!-- Agenda (for meetings) -->
                      <div v-if="event.agenda && event.agenda.length > 0" class="detail-section">
                        <h4 class="detail-title">Agenda</h4>
                        <ul class="detail-list">
                          <li v-for="item in event.agenda" :key="item" class="detail-list-item">{{ item }}</li>
                        </ul>
                      </div>

                      <!-- Requirements (for raids/gaming) -->
                      <div v-if="event.requirements && event.requirements.length > 0" class="detail-section">
                        <h4 class="detail-title">Requirements</h4>
                        <ul class="detail-list">
                          <li v-for="req in event.requirements" :key="req" class="detail-list-item">{{ req }}</li>
                        </ul>
                      </div>

                      <!-- Rewards (for raids/gaming) -->
                      <div v-if="event.rewards && event.rewards.length > 0" class="detail-section">
                        <h4 class="detail-title">Rewards</h4>
                        <ul class="detail-list">
                          <li v-for="reward in event.rewards" :key="reward" class="detail-list-item">{{ reward }}</li>
                        </ul>
                      </div>

                      <!-- Prizes (for tournaments) -->
                      <div v-if="event.prizes && event.prizes.length > 0" class="detail-section">
                        <h4 class="detail-title">Prizes</h4>
                        <div class="prizes-grid">
                          <div v-for="(prize, index) in event.prizes" :key="index" class="prize-item">
                            <span class="prize-description">{{ prize.description || prize.reward }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Activities (for chill sessions) -->
                      <div v-if="event.activities && event.activities.length > 0" class="detail-section">
                        <h4 class="detail-title">Activities</h4>
                        <ul class="detail-list">
                          <li v-for="activity in event.activities" :key="activity" class="detail-list-item">{{ activity }}</li>
                        </ul>
                      </div>
                    </div>

                    <!-- Right Column: Signup Section -->
                    <div class="details-right-column">
                      <!-- Signup Status -->
                      <div class="signup-section">
                        <h4 class="detail-title">Event Signup</h4>
                        
                        <!-- Participant Counter -->
                        <div class="participant-counter">
                          <div class="counter-display">
                            <span class="counter-current">{{ event.marked?.length || 0 }}</span>
                            <span class="counter-separator">/</span>
                            <span class="counter-max">{{ event.maxParticipants }}</span>
                          </div>
                          <div class="counter-label">Participants</div>
                        </div>

                        <!-- Signup Button -->
                        <div class="signup-button-container">
                          <BaseButton
                            :variant="isUserSignedUp(event) ? 'danger' : 'accent'"
                            size="lg"
                            :icon="isUserSignedUp(event) ? 'game-icons:cancel' : 'game-icons:check'"
                            @click="toggleSignup(event)"
                            :disabled="!canSignUp(event)"
                            class="signup-button"
                          >
                            {{ getSignupButtonText(event) }}
                          </BaseButton>
                          
                          <!-- Entry Fee Display -->
                          <div v-if="event.entryFee && event.entryFee > 0" class="entry-fee-display">
                            <Icon icon="game-icons:coins" class="fee-icon" />
                            <span>{{ event.entryFee }} tokens required</span>
                          </div>
                        </div>

                        <!-- Participants List -->
                        <div v-if="event.marked && event.marked.length > 0" class="participants-section">
                          <h5 class="participants-title">Signed Up ({{ event.marked.length }})</h5>
                          <div class="participants-list">
                            <div v-for="participant in event.marked" :key="participant" class="participant-item">
                              <Icon icon="game-icons:person" class="participant-icon" />
                              <span class="participant-name">{{ participant }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Event Status Info -->
                        <div class="event-status-info">
                          <div v-if="event.status === 'upcoming'" class="status-item status-upcoming">
                            <Icon icon="game-icons:time" class="status-icon" />
                            <span>Event is open for signup</span>
                          </div>
                          <div v-else-if="event.status === 'full'" class="status-item status-full">
                            <Icon icon="game-icons:cancel" class="status-icon" />
                            <span>Event is full</span>
                          </div>
                          <div v-else-if="event.status === 'closed'" class="status-item status-closed">
                            <Icon icon="game-icons:lock" class="status-icon" />
                            <span>Signup closed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>
            </Transition>
          </div>
        </BaseTimeline>
        
        <!-- Empty State -->
        <div v-if="filteredEvents.length === 0" class="empty-state">
          <Icon icon="game-icons:party-popper" class="empty-icon" />
          <p v-if="upcomingEvents.length === 0">No upcoming events at the moment</p>
          <p v-else>No events match the selected filter</p>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else-if="currentView === 'calendar'" class="events-calendar-container">
        <BaseCalendar
          :events="filteredEvents as any[]"
          @day-click="handleDayClick"
          @month-change="handleMonthChange"
          @jump-to-list="handleJumpToList"
        />
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseTimeline, BaseButton, BaseCalendar } from '@/components/base'
import BaseSidebar from '@/components/base/BaseSidebar.vue'
import { EVENT_TYPE_ICONS, EVENT_TYPE_TITLES, EVENT_TYPE_SIDEBAR, EVENT_TYPE_COLORS } from '@/constants/eventTypes'

interface Event {
  eventID: string
  guildID: string
  title: string
  description: string
  date: string
  status: string
  eventType: keyof typeof EVENT_TYPE_ICONS
  minRole: string
  maxParticipants: number
  entryFee?: number
  createdBy: string
  createdAt: string
  isActive: boolean
  agenda?: string[]
  requirements?: string[]
  rewards?: string[]
  prizes?: Array<{ position?: string; reward: string; description?: string }>
  activities?: string[]
  marked?: string[]
}

const upcomingEvents = ref<Event[]>([])
const selectedFilter = ref<string>('all')
const currentView = ref<'list' | 'calendar'>('list')
const expandedEvent = ref<string | null>(null)

// Filter items for sidebar
const filterItems = computed(() => [
  {
    id: 'all',
    icon: 'game-icons:party-popper',
    title: 'All',
    active: selectedFilter.value === 'all'
  },
  ...Object.keys(EVENT_TYPE_ICONS).map(eventType => ({
    id: eventType,
    icon: EVENT_TYPE_ICONS[eventType as keyof typeof EVENT_TYPE_ICONS],
    title: EVENT_TYPE_SIDEBAR[eventType as keyof typeof EVENT_TYPE_SIDEBAR],
    active: selectedFilter.value === eventType
  }))
])

// Filtered events based on selected filter
const filteredEvents = computed(() => {
  if (selectedFilter.value === 'all') {
    return upcomingEvents.value
  }
  return upcomingEvents.value.filter(event => event.eventType === selectedFilter.value)
})

const getEventTypeIcon = (eventType: keyof typeof EVENT_TYPE_ICONS) => {
  return EVENT_TYPE_ICONS[eventType] || 'game-icons:party-popper'
}

const getEventTypeTitle = (eventType: keyof typeof EVENT_TYPE_TITLES) => {
  return EVENT_TYPE_TITLES[eventType] || 'Event'
}

const getEventTypeColor = (eventType: keyof typeof EVENT_TYPE_COLORS) => {
  return EVENT_TYPE_COLORS[eventType] || 'var(--secondary-color-2)'
}

const handleFilterClick = (item: any) => {
  selectedFilter.value = item.id
}

const setView = (view: 'list' | 'calendar') => {
  currentView.value = view
}

const handleDayClick = (date: Date, dayEvents: any[]) => {
  console.log('Day clicked:', date.toDateString())
  
  if (dayEvents.length > 0) {
    console.log(`Found ${dayEvents.length} event(s) on this day:`)
    dayEvents.forEach((event, index) => {
      console.log(`\n--- Event ${index + 1} ---`)
      console.log(`Title: ${event.title}`)
      console.log(`Type: ${event.eventType}`)
      console.log(`Time: ${new Date(event.date).toLocaleTimeString()}`)
      console.log(`Description: ${event.description}`)
      
      if (event.agenda && event.agenda.length > 0) {
        console.log('Agenda:')
        event.agenda.forEach((item: string, i: number) => {
          console.log(`  ${i + 1}. ${item}`)
        })
      }
      
      if (event.requirements && event.requirements.length > 0) {
        console.log('Requirements:')
        event.requirements.forEach((req: string) => console.log(`  • ${req}`))
      }
      
      if (event.rewards && event.rewards.length > 0) {
        console.log('Rewards:')
        event.rewards.forEach((reward: string) => console.log(`  • ${reward}`))
      }
      
      if (event.prizes && event.prizes.length > 0) {
        console.log('Prizes:')
        event.prizes.forEach((prize: any) => {
          console.log(`  • ${prize.description || `${prize.position} Place: ${prize.amount}x ${prize.resourceID}`}`)
        })
      }
      
      if (event.entryFee && event.entryFee > 0) {
        console.log(`Entry Fee: ${event.entryFee} ${event.tokenID || 'tokens'}`)
      }
      
      console.log(`Max Participants: ${event.maxParticipants}`)
      console.log(`Min Role: ${event.minRole}`)
    })
  } else {
    console.log('No events on this day')
  }
}

const handleMonthChange = (date: Date) => {
  console.log('Month changed:', date)
  // You can add logic here to load events for the new month
}

const handleJumpToList = (eventID: string) => {
  currentView.value = 'list'
  expandedEvent.value = eventID
  
  // Scroll to the expanded event after a short delay to allow DOM update
  nextTick(() => {
    const eventElement = document.querySelector(`[data-event-id="${eventID}"]`)
    if (eventElement) {
      eventElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  })
}

const toggleEventExpansion = (eventID: string) => {
  expandedEvent.value = expandedEvent.value === eventID ? null : eventID
}

// Mock current user - in real app this would come from auth store
const currentUser = ref('g1_current_user')

const isUserSignedUp = (event: Event) => {
  return event.marked?.includes(currentUser.value) || false
}

const canSignUp = (event: Event) => {
  if (event.status !== 'upcoming') return false
  if (event.marked && event.marked.length >= event.maxParticipants) return false
  return true
}

const getSignupButtonText = (event: Event) => {
  if (isUserSignedUp(event)) return 'Cancel Signup'
  if (event.status !== 'upcoming') return 'Event Closed'
  if (event.marked && event.marked.length >= event.maxParticipants) return 'Event Full'
  return 'Sign Up'
}

const toggleSignup = (event: Event) => {
  if (!canSignUp(event) && !isUserSignedUp(event)) return
  
  // Find the event in the array to modify it
  const eventIndex = upcomingEvents.value.findIndex(e => e.eventID === event.eventID)
  if (eventIndex === -1) return
  
  const targetEvent = upcomingEvents.value[eventIndex]
  
  if (!targetEvent.marked) {
    targetEvent.marked = []
  }
  
  if (isUserSignedUp(targetEvent)) {
    // Remove user from signup
    targetEvent.marked = targetEvent.marked.filter((user: string) => user !== currentUser.value)
  } else {
    // Add user to signup
    if (targetEvent.marked.length < targetEvent.maxParticipants) {
      targetEvent.marked.push(currentUser.value)
    }
  }
  
  // In a real app, you would also make an API call here to persist the change
  console.log(`User ${isUserSignedUp(targetEvent) ? 'signed up for' : 'cancelled signup for'} event: ${targetEvent.title}`)
}

const loadEvents = async () => {
  try {
    // Get all event files dynamically using the correct glob pattern
    const eventModules = import.meta.glob('/SLP/events/*.json')
    const events: Event[] = []
    
    for (const path in eventModules) {
      try {
        const eventData = await fetch(path)
        if (eventData.ok) {
          const event = await eventData.json() as Event
          
          // Only show upcoming events
          if (event.status === 'upcoming' && event.isActive) {
            events.push(event)
          }
        } else {
          console.warn(`Failed to load event from ${path}: ${eventData.status}`)
        }
      } catch (error) {
        console.warn(`Failed to load event from ${path}:`, error)
      }
    }
    
    // Sort by date
    upcomingEvents.value = events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  } catch (error) {
    console.error('Failed to load events:', error)
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.tavern-events {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);

  background: var(--theme-background);
}

.events-header-card {
  width: 100%;
  max-width: 100%;
}

.events-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.events-description {
  flex: 1;
}

.events-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.view-toggle-container {
  display: flex;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.view-toggle-btn {
  min-width: 80px;
}

.events-main-card {
  width: 100%;
  max-width: 100%;
  
  overflow: hidden;
}

.events-list-container {

  overflow-y: auto;
  padding-right: var(--space-xs);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.events-calendar-container {
  height: calc(90vh - 2rem); /* Account for card padding */
  overflow-y: auto;
  padding-right: var(--space-xs);
}

.event-card-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.event-card {
  width: 100%;
  border-width: var(--border-width-thin);
  border-style: solid;
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.event-content {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.event-icon {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-1);
  border-radius: var(--radius-lg);
  border: var(--border-width-thin) solid var(--secondary-color-1);
}

.event-icon .icon {
  width: 80px;
  height: 80px;
  color: var(--text-color-0);
}

.event-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-xl);
  height: var(--space-xl);
  margin-left: var(--space-sm);
}

.expand-icon .chevron {
  font-size: var(--text-2xl);
  color: var(--text-color-1);
  transition: var(--transition-normal);
}

.event-type {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-color-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-name {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  line-height: 1.3;
}

.event-description {
  font-size: var(--text-base);
  color: var(--text-color-1);
  line-height: 1.5;
  opacity: 0.9;
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
}

/* Expanded Details Styles */
.event-details-expanded {
  width: 100%;
}

.event-details-card {
  width: 100%;
  border-width: var(--border-width-thin);
  border-style: solid;
  margin-top: var(--space-sm);
}

.expanded-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: var(--space-xl);
  align-items: start;
}

.details-left-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.details-right-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.detail-title {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin: 0;
  padding-bottom: var(--space-xs);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-sm);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.detail-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-color-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-medium);
}

.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.detail-list-item {
  padding: var(--space-xs) var(--space-sm);
  background: var(--secondary-color-2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-color-0);
  position: relative;
  padding-left: var(--space-lg);
}

.detail-list-item::before {
  content: "•";
  color: var(--secondary-color-0);
  font-weight: bold;
  position: absolute;
  left: var(--space-sm);
}

.prizes-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.prize-item {
  padding: var(--space-sm);
  background: var(--secondary-color-2);
  border-radius: var(--radius-lg);
  border-left: var(--border-width-thin) solid var(--secondary-color-0);
}

.prize-description {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-medium);
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.participant-tag {
  padding: var(--space-xs) var(--space-sm);
  background: var(--secondary-color-1);
  color: var(--text-color-0);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

/* Signup Section Styles */
.signup-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.participant-counter {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.counter-display {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-xs);
}

.counter-current {
  color: var(--secondary-color-0);
}

.counter-separator {
  color: var(--text-color-2);
  margin: 0 var(--space-xs);
}

.counter-max {
  color: var(--text-color-1);
}

.counter-label {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: var(--font-semibold);
}

.signup-button-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.signup-button {
  width: 100%;
  font-weight: var(--font-bold);
}

.entry-fee-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--secondary-color-2);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--text-color-0);
}

.fee-icon {
  color: var(--secondary-color-0);
}

.participants-section {
  margin-bottom: var(--space-lg);
}

.participants-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
  padding-bottom: var(--space-xs);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  max-height: 200px;
  overflow-y: auto;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--secondary-color-2);
  border-radius: var(--radius-lg);
  border-left: var(--border-width-thin) solid var(--secondary-color-0);
}

.participant-icon {
  color: var(--secondary-color-0);
  font-size: var(--text-base);
}

.participant-name {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-medium);
}

.event-status-info {
  margin-top: var(--space-md);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.status-upcoming {
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  color: var(--color-success);
}

.status-full {
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
  color: var(--color-error);
}

.status-closed {
  background: color-mix(in srgb, var(--color-gray-500) 10%, transparent);
  color: var(--color-gray-500);
}

.status-icon {
  font-size: var(--text-base);
}

/* Accordion Animation */
.accordion-enter-active,
.accordion-leave-active {
  transition: var(--transition-normal);
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

/* Scrollbar styling */
.events-list-container::-webkit-scrollbar {
  width: 6px;
}

.events-list-container::-webkit-scrollbar-track {
  background: var(--primary-color-1);
  border-radius: 3px;
}

.events-list-container::-webkit-scrollbar-thumb {
  background: var(--secondary-color-1);
  border-radius: 3px;
}

.events-list-container::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color-0);
}

/* Wide screen margin - matching foundry layout */
@media (min-width: 1400px) {
  .events-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .events-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .tavern-events {
    padding: var(--space-md);
  }
  
}

@media (max-width: 768px) {
  .tavern-events {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .events-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .view-toggle-container {
    justify-content: center;
  }
  
  .event-content {
    gap: var(--space-md);
  }
  
  .event-icon {
    width: 100px;
    height: 100px;
  }
  
  .event-icon .icon {
    width: 60px;
    height: 60px;
  }
  
  .event-name {
    font-size: var(--text-lg);
  }
  
  .event-description {
    font-size: var(--text-sm);
  }
  
  /* Mobile: Stack columns vertically */
  .expanded-content {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .details-right-column {
    order: -1; /* Show signup section first on mobile */
  }
  
  
  .counter-display {
    font-size: var(--text-2xl);
  }
}

@media (max-width: 480px) {
  .tavern-events {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .event-content {
    flex-direction: column;
    text-align: center;
    gap: var(--space-sm);
  }
  
  .event-icon {
    width: 80px;
    height: 80px;
  }
  
  .event-icon .icon {
    width: 50px;
    height: 50px;
  }
}
</style>
