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
            v-for="tab in armoryStore.availableTabs"
            :key="tab.id"
            :variant="currentTab?.id === tab.id ? 'accent' : 'outline'"
            :size="'md'"
            :icon="tab.icon"
            :data-tutorial="tab.id === 'claim' ? 'armory-claim' : tab.id === 'use' ? 'armory-use' : undefined"
            @click="handleTabClick(tab.id)"
            class="armory-tab"
          >
            {{ tab.title }}
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
      <slot :activeTab="currentTab?.id" />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseCard, BaseButton } from '@/components/base'
import { useArmoryStore } from '@/stores/armoryStore'
import { ARMORY_TABS } from '@/constants/armory'

// Props
interface Props {
  description?: string
  defaultTab?: 'claim' | 'shop' | 'use'
}

const props = withDefaults(defineProps<Props>(), {
  description: 'Welcome to the Guild Armory! Here you can manage your guild\'s resources, equipment, and claim rewards.',
  defaultTab: 'claim'
})

// Constants
const DEFAULT_TAB = ARMORY_TABS.CLAIM

// Composables
const router = useRouter()
const route = useRoute()
const armoryStore = useArmoryStore()

// Computed properties
const currentTab = computed(() => armoryStore.currentTab)

// Methods
const handleTabClick = (tabId: string) => {
  armoryStore.setCurrentTab(tabId)
  const tab = armoryStore.availableTabs.find(t => t.id === tabId)
  if (tab) {
    router.push(tab.route)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
}

const updateTabFromRoute = (path: string) => {
  const pathSegments = path.split('/')
  const armoryTab = pathSegments[pathSegments.length - 1]
  
  if (armoryTab && armoryTab !== 'armory') {
    armoryStore.setCurrentTab(armoryTab)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  } else if (armoryTab === 'armory') {
    armoryStore.setCurrentTab(DEFAULT_TAB)
    // Scroll to top after content loads
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }
}

// Watch for route changes to update current tab
watch(() => route.path, updateTabFromRoute, { immediate: true })
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
  min-width: var(--component-button-min-width);
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
