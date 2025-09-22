<template>
  <div class="base-timeline">
    <!-- Timeline Column -->
    <div class="timeline-column">
      <!-- Top Line Segment -->
      <div class="timeline-line timeline-line-top" />
      
      <!-- Date Display -->
      <div class="timeline-date">
        {{ formattedDate }}
      </div>
      
      <!-- Middle Line Segment -->
      <div class="timeline-line timeline-line-middle" />
      
      <!-- Timeline Orb (centered with card) -->
      <div class="timeline-orb" />
      
      <!-- Bottom Line Segment -->
      <div class="timeline-line timeline-line-bottom" />
    </div>
    
    <!-- Card Column -->
    <div class="card-column">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSkinTheme } from '../../composables/useSkinTheme'
import { EVENT_TYPE_COLORS } from '../../constants/eventTypes'

interface Props {
  date: string | Date
  eventType?: string
  isFirst?: boolean
  isLast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFirst: false,
  isLast: false
})

const { getSecondaryColor } = useSkinTheme()

const formattedDate = computed(() => {
  const date = new Date(props.date)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const getOrbColor = computed(() => {
  if (props.eventType && EVENT_TYPE_COLORS[props.eventType as keyof typeof EVENT_TYPE_COLORS]) {
    return EVENT_TYPE_COLORS[props.eventType as keyof typeof EVENT_TYPE_COLORS]
  }
  return getSecondaryColor(1)
})

const timelineStyles = computed(() => ({
  '--secondary-color-1': getSecondaryColor(1),
  '--orb-color': getOrbColor.value
}))
</script>

<style scoped>
.base-timeline {
  display: flex;
  align-items: stretch;
  gap: var(--space-lg);
  position: relative;
}

.timeline-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
  flex-shrink: 0;
  position: relative;
  color: v-bind('getSecondaryColor(1)');
}

.timeline-line {
  width: 2px;
  background-color: v-bind('getSecondaryColor(1)');
  flex-shrink: 0;
}

.timeline-line-top {
  height: var(--space-md);
}

.timeline-line-middle {
  height: var(--space-lg);
}

.timeline-line-bottom {
  flex: 1;
  min-height: var(--space-xl);
}

.timeline-date {
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--primary-color-0);
  border: var(--border-width-thin) solid v-bind('getSecondaryColor(0)');
  border-radius: 12px;
  white-space: nowrap;
  margin: var(--space-xs) 0;
  color: v-bind('getSecondaryColor(0)');
}

.timeline-orb {
  width: 16px;
  height: 16px;
  background: v-bind('getOrbColor');
  border: var(--border-width-thin) solid var(--primary-color-0);
  border-radius: 50%;
  margin: var(--space-sm) 0;
  box-shadow: 0 0 0 2px v-bind('getOrbColor'), 0 0 12px v-bind('getOrbColor');
}

.card-column {
  width: 65%;
  display: flex;
  justify-content: flex-start;
}

/* Hide top line for first item */
.base-timeline:first-child .timeline-line-top {
  visibility: hidden;
}

/* Hide bottom line for last item */
.base-timeline:last-child .timeline-line-bottom {
  visibility: hidden;
}

/* Responsive Design */
@media (max-width: 768px) {
  .base-timeline {
    gap: var(--space-md);
  }
  
  .timeline-column {
    width: 35%;
  }
  
  .card-column {
    width: 65%;
  }
  
  .timeline-date {
    font-size: 0.8125rem;
    font-weight: 700;
    padding: var(--space-xs) var(--space-sm);
  }
  
  .timeline-orb {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .base-timeline {
    gap: var(--space-sm);
  }
  
  .timeline-column {
    width: 40%;
  }
  
  .card-column {
    width: 60%;
  }
  
  .timeline-date {
    font-size: 0.75rem;
    font-weight: 700;
    padding: var(--space-xs);
  }
  
  .timeline-orb {
    width: 10px;
    height: 10px;
    border-width: var(--border-width-thin);
  }
}
</style>
