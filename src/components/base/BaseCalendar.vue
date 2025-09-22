<template>
  <div class="base-calendar" :style="calendarStyles">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <!-- Year Navigation -->
      <div class="year-navigation">
        <BaseButton
          variant="ghost"
          size="sm"
          icon="game-icons:double-chevron-left"
          @click="previousYear"
          class="nav-button year-nav"
          title="Previous Year"
        />
        <BaseButton
          variant="ghost"
          size="sm"
          @click="toggleYearSelector"
          class="nav-button year-button"
          :title="`Click to change year (${currentYear})`"
        >
          {{ currentYear }}
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          icon="game-icons:double-chevron-right"
          @click="nextYear"
          class="nav-button year-nav"
          title="Next Year"
        />
      </div>
      
      <!-- Month Navigation -->
      <div class="month-navigation">
        <BaseButton
          variant="ghost"
          size="sm"
          icon="game-icons:chevron-left"
          @click="previousMonth"
          class="nav-button"
          title="Previous Month"
        />
        
        <BaseButton
          variant="ghost"
          size="md"
          @click="toggleMonthSelector"
          class="nav-button month-button"
          :title="`Click to change month (${currentMonthName})`"
        >
          {{ currentMonthName }}
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          icon="game-icons:chevron-right"
          @click="nextMonth"
          class="nav-button"
          title="Next Month"
        />
      </div>
      
      <!-- Quick Today Button -->
      <div class="today-navigation">
        <BaseButton
          variant="outline"
          size="sm"
          @click="goToToday"
          class="nav-button today-button"
          title="Go to current month"
        >
          Today
        </BaseButton>
      </div>
    </div>

    <!-- Month Selector Dropdown -->
    <div v-if="showMonthSelector" class="month-selector">
      <div class="selector-header">Select Month</div>
      <div class="month-grid">
        <button
          v-for="(month, index) in monthNames"
          :key="month"
          :class="['month-option', { 'month-current': index === currentMonth }]"
          @click="selectMonth(index)"
        >
          {{ month.substring(0, 3) }}
        </button>
      </div>
    </div>

    <!-- Year Selector Dropdown -->
    <div v-if="showYearSelector" class="year-selector">
      <div class="selector-header">Select Year</div>
      <div class="year-grid">
        <button
          v-for="year in availableYears"
          :key="year"
          :class="['year-option', { 'year-current': year === currentYear }]"
          @click="selectYear(year)"
        >
          {{ year }}
        </button>
      </div>
    </div>

    <!-- Days of Week Header -->
    <div class="calendar-weekdays">
      <div 
        v-for="day in weekDays" 
        :key="day"
        class="weekday-header"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="getDayClasses(day)"
        @click="selectDay(day)"
      >
        <div class="day-number">{{ day.day }}</div>
        
        <!-- Event Indicators -->
        <div v-if="day.events && day.events.length > 0" class="day-events">
          <div
            v-for="event in day.events.slice(0, 3)"
            :key="event.eventID"
            :class="getEventClasses(event)"
            :title="getEventTooltip(event)"
            @click.stop="handleEventClick(event)"
          >
            <Icon :icon="getEventTypeIcon(event.eventType)" class="event-icon" />
            <span class="event-type-name">{{ getEventTypeSidebarName(event.eventType) }}</span>
          </div>
          <div v-if="day.events.length > 3" class="more-events">
            +{{ day.events.length - 3 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../../composables/useSkinTheme'
import BaseButton from './BaseButton.vue'
import { EVENT_TYPE_ICONS, EVENT_TYPE_COLORS, EVENT_TYPE_SIDEBAR } from '../../constants/eventTypes'

interface CalendarEvent {
  eventID: string
  guildID: string
  title: string
  description: string
  date: string
  status: string
  eventType: string
  minRole: string
  maxParticipants: number
  entryFee?: number
  agenda?: string[]
  prizes?: any[]
  requirements?: string[]
  rewards?: string[]
  marked?: string[]
  attended?: string[]
  createdBy: string
  createdAt: string
  isActive: boolean
  [key: string]: any
}

interface CalendarDay {
  day: number
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events?: CalendarEvent[]
}

interface Props {
  events?: CalendarEvent[]
  selectedDate?: Date
  showOtherMonths?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  showOtherMonths: true
})

const emit = defineEmits<{
  dayClick: [date: Date, events: CalendarEvent[]]
  monthChange: [date: Date]
  jumpToList: [eventID: string]
}>()

const { getPrimaryColor, getSecondaryColor, getTextColor } = useSkinTheme()

// Current calendar state - Initialize to current date if no selectedDate provided
const currentDate = ref(props.selectedDate ? new Date(props.selectedDate) : new Date())
const selectedDay = ref<Date | null>(props.selectedDate ? new Date(props.selectedDate) : null)
const showMonthSelector = ref(false)
const showYearSelector = ref(false)

// Week days
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Month names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Computed properties
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => monthNames[currentMonth.value])

// Available years (current year ± 5 years)
const availableYears = computed(() => {
  const thisYear = new Date().getFullYear()
  const years = []
  for (let i = thisYear - 5; i <= thisYear + 5; i++) {
    years.push(i)
  }
  return years
})

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dayEvents = getEventsForDate(date)
    
    days.push({
      day: date.getDate(),
      date: new Date(date),
      isCurrentMonth: date.getMonth() === currentMonth.value,
      isToday: isToday(date),
      isSelected: selectedDay.value ? isSameDay(date, selectedDay.value) : false,
      events: dayEvents
    })
  }

  return days
})

const calendarStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2)
}))

// Methods
const getEventsForDate = (date: Date): CalendarEvent[] => {
  return props.events.filter(event => {
    const eventDate = new Date(event.date)
    return isSameDay(eventDate, date)
  })
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return isSameDay(date, today)
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const getDayClasses = (day: CalendarDay) => [
  'calendar-day',
  {
    'day-current-month': day.isCurrentMonth,
    'day-other-month': !day.isCurrentMonth,
    'day-today': day.isToday,
    'day-selected': day.isSelected,
    'day-has-events': day.events && day.events.length > 0
  }
]

const getEventClasses = (event: CalendarEvent) => [
  'event-indicator',
  `event-${event.eventType}`
]

const getEventTypeIcon = (eventType: string) => {
  return EVENT_TYPE_ICONS[eventType as keyof typeof EVENT_TYPE_ICONS] || 'game-icons:party-popper'
}

const getEventTypeSidebarName = (eventType: string) => {
  return EVENT_TYPE_SIDEBAR[eventType as keyof typeof EVENT_TYPE_SIDEBAR] || eventType
}

const handleEventClick = (event: CalendarEvent) => {
  emit('jumpToList', event.eventID)
}

const formatEventTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const getEventTooltip = (event: CalendarEvent) => {
  let tooltip = `${event.title}\n${formatEventTime(event.date)}\n\n${event.description}`
  
  // Add agenda points for meetings
  if (event.agenda && event.agenda.length > 0) {
    tooltip += '\n\nAgenda:\n' + event.agenda.map(item => `• ${item}`).join('\n')
  }
  
  // Add requirements for raids
  if (event.requirements && event.requirements.length > 0) {
    tooltip += '\n\nRequirements:\n' + event.requirements.map(item => `• ${item}`).join('\n')
  }
  
  // Add rewards for raids
  if (event.rewards && event.rewards.length > 0) {
    tooltip += '\n\nRewards:\n' + event.rewards.map(item => `• ${item}`).join('\n')
  }
  
  // Add prize information for tournaments
  if (event.prizes && event.prizes.length > 0) {
    tooltip += '\n\nPrizes:\n' + event.prizes.map(prize => `• ${prize.description || `${prize.position} Place: ${prize.amount}x ${prize.resourceID}`}`).join('\n')
  }
  
  // Add entry fee if applicable
  if (event.entryFee && event.entryFee > 0) {
    tooltip += `\n\nEntry Fee: ${event.entryFee} ${event.tokenID || 'tokens'}`
  }
  
  // Add participant info
  tooltip += `\n\nMax Participants: ${event.maxParticipants}`
  tooltip += `\nMin Role: ${event.minRole}`
  
  return tooltip
}

const selectDay = (day: CalendarDay) => {
  selectedDay.value = day.date
  emit('dayClick', day.date, day.events || [])
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  emit('monthChange', currentDate.value)
  hideSelectors()
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
  emit('monthChange', currentDate.value)
  hideSelectors()
}

const previousYear = () => {
  currentDate.value = new Date(currentYear.value - 1, currentMonth.value, 1)
  emit('monthChange', currentDate.value)
  hideSelectors()
}

const nextYear = () => {
  currentDate.value = new Date(currentYear.value + 1, currentMonth.value, 1)
  emit('monthChange', currentDate.value)
  hideSelectors()
}

const goToToday = () => {
  const today = new Date()
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedDay.value = today
  emit('monthChange', currentDate.value)
  hideSelectors()
}

const toggleMonthSelector = () => {
  showMonthSelector.value = !showMonthSelector.value
  showYearSelector.value = false
}

const toggleYearSelector = () => {
  showYearSelector.value = !showYearSelector.value
  showMonthSelector.value = false
}

const selectMonth = (monthIndex: number) => {
  currentDate.value = new Date(currentYear.value, monthIndex, 1)
  emit('monthChange', currentDate.value)
  hideSelectors()
}

const selectYear = (year: number) => {
  currentDate.value = new Date(year, currentMonth.value, 1)
  emit('monthChange', currentDate.value)
  hideSelectors()
}

const hideSelectors = () => {
  showMonthSelector.value = false
  showYearSelector.value = false
}

// Watch for external date changes
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    selectedDay.value = newDate
    currentDate.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
  }
})
</script>

<style scoped>
.base-calendar {
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 12px;
  padding: var(--space-lg);
  width: 100%;
  max-width: 100%;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
  gap: var(--space-sm);
}

.year-navigation,
.month-navigation,
.today-navigation {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.year-navigation .base-button,
.month-navigation .base-button,
.today-navigation .base-button {
  background: transparent !important;
  color: var(--secondary-color-0) !important;
  border: none !important;
}

.year-navigation .base-button:hover,
.month-navigation .base-button:hover,
.today-navigation .base-button:hover {
  background: var(--secondary-color-2) !important;
  color: var(--secondary-color-0) !important;
  transform: none !important;
}

.year-navigation .base-button:focus,
.month-navigation .base-button:focus,
.today-navigation .base-button:focus {
  outline: none !important;
  background: transparent !important;
  color: var(--secondary-color-0) !important;
}

.year-navigation .base-button:active,
.month-navigation .base-button:active,
.today-navigation .base-button:active {
  background: transparent !important;
  color: var(--secondary-color-0) !important;
  transform: none !important;
}

/* Force icon visibility with secondary color - multiple selectors */
.year-navigation .base-button .iconify,
.month-navigation .base-button .iconify,
.today-navigation .base-button .iconify,
.year-navigation .base-button svg,
.month-navigation .base-button svg,
.today-navigation .base-button svg,
.year-navigation .base-button i,
.month-navigation .base-button i,
.today-navigation .base-button i {
  color: var(--secondary-color-0) !important;
  fill: var(--secondary-color-0) !important;
  opacity: 1 !important;
  font-size: 1.2rem !important;
  display: inline-block !important;
  visibility: visible !important;
}

.year-navigation .base-button:hover .iconify,
.month-navigation .base-button:hover .iconify,
.today-navigation .base-button:hover .iconify,
.year-navigation .base-button:hover svg,
.month-navigation .base-button:hover svg,
.today-navigation .base-button:hover svg,
.year-navigation .base-button:hover i,
.month-navigation .base-button:hover i,
.today-navigation .base-button:hover i {
  color: var(--secondary-color-0) !important;
  fill: var(--secondary-color-0) !important;
}

/* Fallback: Add simple arrows if icons don't work */
.year-navigation .base-button[title*="Previous"]::before {
  content: "<<";
  color: var(--secondary-color-0) !important;
  font-size: 1.2rem;
  font-weight: bold;
}

.year-navigation .base-button[title*="Next"]::before {
  content: ">>";
  color: var(--secondary-color-0) !important;
  font-size: 1.2rem;
  font-weight: bold;
}

.month-navigation .base-button[title*="Previous"]::before {
  content: "<";
  color: var(--secondary-color-0) !important;
  font-size: 1.2rem;
  font-weight: bold;
}

.month-navigation .base-button[title*="Next"]::before {
  content: ">";
  color: var(--secondary-color-0) !important;
  font-size: 1.2rem;
  font-weight: bold;
}

.month-navigation {
  flex: 1;
  justify-content: center;
}

.nav-button {
  min-width: 40px;
}

.year-button,
.month-button {
  min-width: 60px;
  font-weight: 600;
}

.month-button {
  min-width: 120px;
}

.year-nav {
  opacity: 0.7;
}

.year-nav:hover {
  opacity: 1;
}

.today-button {
  font-size: 0.875rem;
}

/* Selector Dropdowns */
.month-selector,
.year-selector {
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid var(--secondary-color-1);
  border-radius: 12px;
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  box-shadow: var(--shadow-lg);
}

.selector-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-1);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-xs);
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
}

.month-option,
.year-option {
  padding: var(--space-xs) var(--space-sm);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 6px;
  background: var(--primary-color-1);
  color: var(--text-color-1);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.month-option:hover,
.year-option:hover {
  background: var(--secondary-color-2);
  border-color: var(--secondary-color-1);
  color: var(--text-color-0);
}

.month-current,
.year-current {
  background: var(--secondary-color-1) !important;
  border-color: var(--secondary-color-0) !important;
  color: var(--primary-color-0) !important;
  font-weight: 700;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: var(--space-md);
}

.weekday-header {
  padding: var(--space-sm);
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color-1);
  background: var(--primary-color-1);
  border-radius: 6px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--secondary-color-2);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day {
  background: var(--primary-color-0);
  min-height: 80px;
  padding: var(--space-xs);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background: var(--primary-color-1);
  transform: scale(1.02);
}

.day-current-month {
  color: var(--text-color-0);
}

.day-other-month {
  color: var(--text-color-2);
  opacity: 0.5;
}

.day-today {
  background: var(--secondary-color-2) !important;
  color: var(--secondary-color-0) !important;
  font-weight: 700;
}

.day-selected {
  background: var(--secondary-color-1) !important;
  color: var(--primary-color-0) !important;
  box-shadow: inset 0 0 0 2px var(--secondary-color-0);
}

.day-has-events {
  border-left: var(--border-width-thin) solid var(--secondary-color-0);
}

.day-number {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: var(--space-xs);
}

.day-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-indicator {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
  min-height: 16px;
  opacity: 0.8;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.event-indicator:hover {
  opacity: 1;
}

.event-icon {
  width: 12px;
  height: 12px;
  color: currentColor;
  flex-shrink: 0;
}

.event-type-name {
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Event type colors - using theme variables with fallbacks */
.event-poker_tournament {
  background: var(--event-poker-bg, rgba(139, 69, 19, 0.3));
  color: var(--event-poker-color, rgb(139, 69, 19));
}

.event-raid {
  background: var(--event-raid-bg, rgba(139, 0, 0, 0.3));
  color: var(--event-raid-color, rgb(139, 0, 0));
}

.event-meeting {
  background: var(--event-meeting-bg, rgba(46, 139, 87, 0.3));
  color: var(--event-meeting-color, rgb(46, 139, 87));
}

.event-chill_session {
  background: var(--event-chill-bg, rgba(147, 112, 219, 0.3));
  color: var(--event-chill-color, rgb(147, 112, 219));
}

.event-gaming {
  background: var(--event-gaming-bg, rgba(65, 105, 225, 0.3));
  color: var(--event-gaming-color, rgb(65, 105, 225));
}

.more-events {
  font-size: 0.6875rem;
  color: var(--text-color-1);
  text-align: center;
  padding: 2px;
  background: var(--primary-color-1);
  border-radius: 4px;
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .base-calendar {
    padding: var(--space-md);
  }
  
  .calendar-header {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .month-navigation {
    order: 1;
  }
  
  .year-navigation {
    order: 2;
  }
  
  .today-navigation {
    order: 3;
  }
  
  .month-button {
    min-width: 100px;
  }
  
  .month-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .calendar-day {
    min-height: 60px;
    padding: 4px;
  }
  
  .weekday-header {
    padding: var(--space-xs);
    font-size: 0.75rem;
  }
  
  .day-number {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 50px;
    padding: 2px;
  }
  
  .day-number {
    font-size: 0.6875rem;
  }
  
  .event-indicator {
    padding: 1px 2px;
    min-height: 12px;
  }
  
  .event-icon {
    width: 8px;
    height: 8px;
  }
}
</style>
