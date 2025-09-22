<template>
  <div class="base-observatory">
    <!-- Primary Card with Title and Navigation -->
    <BaseCard 
      title="Observatory" 
      variant="primary" 
      size="lg"
      class="observatory-header-card"
    >
      <!-- Quick Jump Navigation Buttons -->
      <div class="observatory-navigation">
        <BaseButton
          v-for="tab in availableTabs"
          :key="tab.id"
          :variant="currentTab?.id === tab.id ? 'accent' : 'outline'"
          :icon="tab.icon"
          size="md"
          class="observatory-nav-button"
          @click="handleTabClick(tab.id)"
        >
          {{ tab.title }}
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="observatory-main-card"
    >
      <!-- Content slot for specific observatory implementations -->
      <slot />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseCard, BaseButton } from '@/components/base'
import { OBSERVATORY_TABS, OBSERVATORY_ICONS, OBSERVATORY_DESCRIPTIONS } from '@/constants/observatory'

// Constants
const DEFAULT_TAB = OBSERVATORY_TABS.PERSONAL

// Available tabs
const availableTabs = [
  {
    id: OBSERVATORY_TABS.PERSONAL,
    title: 'Personal',
    icon: OBSERVATORY_ICONS.PERSONAL,
    route: '/reports/personal',
    description: OBSERVATORY_DESCRIPTIONS.PERSONAL
  },
  {
    id: OBSERVATORY_TABS.DGUILD,
    title: 'dGuild',
    icon: OBSERVATORY_ICONS.DGUILD,
    route: '/reports/dguild',
    description: OBSERVATORY_DESCRIPTIONS.DGUILD
  },
  {
    id: OBSERVATORY_TABS.FINANCIAL,
    title: 'Financial',
    icon: OBSERVATORY_ICONS.FINANCIAL,
    route: '/reports/financial',
    description: OBSERVATORY_DESCRIPTIONS.FINANCIAL
  }
]

// Composables
const router = useRouter()
const route = useRoute()

// State
const currentTabId = ref<string>(DEFAULT_TAB)

// Computed properties
const currentTab = computed(() => 
  availableTabs.find(tab => tab.id === currentTabId.value)
)

// Methods
const handleTabClick = (tabId: string) => {
  currentTabId.value = tabId
  const tab = availableTabs.find(t => t.id === tabId)
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
  const observatoryTab = pathSegments[pathSegments.length - 1]
  
  if (observatoryTab && observatoryTab !== 'reports') {
    const tab = availableTabs.find(t => t.id === observatoryTab)
    if (tab) {
      currentTabId.value = observatoryTab
    }
  } else if (observatoryTab === 'reports') {
    currentTabId.value = DEFAULT_TAB
  }
}

// Watch for route changes to update current tab
watch(() => route.path, updateTabFromRoute, { immediate: true })
</script>

<style scoped>
.base-observatory {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  min-height: 100vh;
  background: var(--theme-background);
}

.observatory-header-card {
  width: 100%;
  max-width: 100%;
}

.observatory-navigation {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-md);
}

.observatory-nav-button {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

.observatory-main-card {
  width: 100%;
  max-width: 100%;
  min-height: 90vh;
}

/* Wide screen margin */
@media (min-width: 1400px) {
  .observatory-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .observatory-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .base-observatory {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .base-observatory {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .observatory-navigation {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .observatory-nav-button {
    max-width: none;
    width: 100%;
  }
  
  .observatory-main-card {
    min-height: 80vh;
  }
}

@media (max-width: 480px) {
  .base-observatory {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
}
</style>
