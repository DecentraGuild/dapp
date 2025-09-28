<template>
  <div class="base-armory">
    <!-- Primary Card with Title and Navigation -->
    <BaseCard 
      title="Armory" 
      subtitle="Manage your guild's resources and equipment"
      variant="primary" 
      size="lg"
      class="armory-header-card"
    >
      <div class="armory-header-content">
        <div class="armory-description">
          <p>{{ description }}</p>
        </div>
        
        <!-- Armory Navigation Tabs -->
        <div class="armory-navigation">
          <BaseButton
            v-for="tab in armoryTabs"
            :key="tab.id"
            :variant="activeTab === tab.id ? 'accent' : 'outline'"
            :size="'md'"
            :icon="tab.icon"
            @click="switchTab(tab.id)"
            class="armory-tab"
          >
            {{ tab.label }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="armory-main-card"
    >
      <slot :activeTab="activeTab" />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseCard, BaseButton } from '@/components/base'

// Props
interface Props {
  description?: string
  defaultTab?: 'claim' | 'shop' | 'use'
}

const props = withDefaults(defineProps<Props>(), {
  description: 'Welcome to the Guild Armory! Here you can manage your guild\'s resources, equipment, and claim rewards.',
  defaultTab: 'claim'
})

// Emits
const emit = defineEmits<{
  'tab-change': [tab: string]
}>()

// State
const activeTab = ref(props.defaultTab)

// Armory tabs configuration
const armoryTabs = [
  {
    id: 'claim',
    label: 'Claim',
    icon: 'game-icons:gift',
    description: 'Claim rewards and airdrops'
  },
  {
    id: 'shop',
    label: 'Shop',
    icon: 'game-icons:buy-card',
    description: 'G2P trades and marketplace'
  },
  {
    id: 'use',
    label: 'Use',
    icon: 'game-icons:armor',
    description: 'Borrow and return gear with collateral'
  }
]

// Methods
const switchTab = (tabId: string) => {
  activeTab.value = tabId
  emit('tab-change', tabId)
}
</script>

<style scoped>
.base-armory {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
  min-height: 100%;
}

/* Header Card */
.armory-header-card {
  width: 100%;
  max-width: 100%;
}

.armory-header-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.armory-description {
  flex: 1;
}

.armory-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

/* Navigation */
.armory-navigation {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.armory-tab {
  flex: 1;
  min-width: 120px;
  justify-content: center;
  transition: all var(--transition-normal);
}

.armory-tab:hover {
  transform: translateY(-1px);
}

/* Main Card */
.armory-main-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

/* Wide screen margin - matching other pages */
@media (min-width: 1400px) {
  .armory-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .armory-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .base-armory {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .base-armory {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .armory-header-content {
    gap: var(--space-md);
  }
  
  .armory-navigation {
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .armory-tab {
    min-width: unset;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .base-armory {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  
  .armory-navigation {
    gap: var(--space-xs);
  }
}
</style>
