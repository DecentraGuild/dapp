<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import FooterNavbar from './components/FooterNavbar.vue'
import TopNavbar from './components/TopNavbar.vue'
import { useSkinTheme } from './composables/useSkinTheme'
import { useFooterState } from './composables/useFooterState'
import { useThemeStore } from './stores/themeStore'
import { useUserStore } from './stores/userStore'
import { useGuildStore } from './stores/guildStore'

const { currentTheme, getTextColor, getPrimaryColor, getSecondaryColor, getBackgroundColor } = useSkinTheme()
const { isFooterExpanded, isDashboardMode } = useFooterState()
const themeStore = useThemeStore()
const userStore = useUserStore()
const guildStore = useGuildStore()

const appClasses = computed(() => [
  'app',
  `theme-${currentTheme.value?.id || 'default'}`
])

// Update CSS custom properties when theme changes
watch(currentTheme, (newTheme) => {
  if (newTheme) {
    document.documentElement.style.setProperty('--global-text-primary', getTextColor(0))
    document.documentElement.style.setProperty('--global-text-secondary', getTextColor(1))
  }
}, { immediate: true })

// Apply theme variables to document
watch(() => themeStore.cssVariables, (variables) => {
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }
}, { immediate: true, deep: true })

// Initialize default theme and demo login
onMounted(async () => {
  // Load themes
  if (themeStore.availableThemes.length === 0) {
    await themeStore.loadAvailableThemes()
  }
  
  if (!themeStore.currentTheme) {
    // Load the first available theme as default
    if (themeStore.availableThemes.length > 0) {
      await themeStore.loadTheme(themeStore.availableThemes[0].id)
    }
  }

  // Demo login with Alice if not already logged in
  if (!userStore.isLoggedIn) {
    await userStore.demoLogin()
  }

  // Load guilds and select guild-1 if not already selected
  if (!guildStore.hasActiveGuild) {
    await guildStore.loadAvailableGuilds()
    if (guildStore.availableGuilds.length > 0) {
      await guildStore.selectGuild('guild-1')
    }
  }
})
</script>

<template>
  <div :class="appClasses">
    <!-- Top Navbar -->
    <TopNavbar />
    
    <!-- Main Content -->
    <main class="main-content" :class="{ 'faded': isFooterExpanded && !isDashboardMode }">
      <RouterView />
    </main>
    
    <!-- Footer Navbar -->
    <FooterNavbar />
  </div>
</template>

<style>
/* Global theme-aware styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Default dark theme - will be overridden by skin colors */

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--global-bg-primary);
  color: var(--global-text-primary);
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app {
  min-height: 100vh;
  background: var(--theme-background, rgba(0, 0, 0, 1));
  transition: background 0.3s ease;
}

.main-content {
  flex: 1;
  min-height: calc(100vh - 48); /* Account for navbar heights */
  padding-top: 48px; /* Account for fixed topbar */
  padding-bottom: 180px; /* Reserve space for footer */
  transition: opacity 0.3s ease-in-out, filter 0.3s ease-in-out;
}

.main-content.faded {
  opacity: 0.3;
  filter: blur(2px);
  pointer-events: none;
}

/* Theme overrides */
.app {
  /* Set global theme variables for all themes */
  --global-bg-primary: v-bind('getPrimaryColor(0)');
  --global-bg-secondary: v-bind('getPrimaryColor(1)');
  --global-text-primary: v-bind('getTextColor(0)');
  --global-text-secondary: v-bind('getTextColor(1)');
  --global-border: v-bind('getSecondaryColor(2)');
}

.app.theme-white_sun {
  /* Use skin colors instead of hardcoded values */
  --global-bg-primary: v-bind('getPrimaryColor(0)');
  --global-bg-secondary: v-bind('getPrimaryColor(1)');
  --global-text-primary: v-bind('getTextColor(0)');
  --global-text-secondary: v-bind('getTextColor(1)');
  --global-border: v-bind('getSecondaryColor(2)');
}

.app.theme-white_sun body {
  background: var(--global-bg-primary);
  color: var(--global-text-primary);
}
</style>
