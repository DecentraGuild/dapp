import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// Global state for footer expansion
const isFooterExpanded = ref(false)
const isDashboardMode = ref(false)

export function useFooterState() {
  const route = useRoute()
  
  const setFooterExpanded = (expanded: boolean) => {
    isFooterExpanded.value = expanded
  }

  const toggleFooterExpanded = () => {
    isFooterExpanded.value = !isFooterExpanded.value
  }

  const setDashboardMode = (dashboardMode: boolean) => {
    isDashboardMode.value = dashboardMode
    if (dashboardMode) {
      isFooterExpanded.value = true
    }
  }

  // Computed property that returns true if footer should be expanded
  const shouldFooterBeExpanded = computed(() => {
    return isFooterExpanded.value || (isDashboardMode.value && route.name === 'Dashboard')
  })

  return {
    isFooterExpanded: shouldFooterBeExpanded,
    setFooterExpanded,
    toggleFooterExpanded,
    setDashboardMode,
    isDashboardMode
  }
}
