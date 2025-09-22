<template>
  <div 
    class="footer-navbar"
    :class="{ 'expanded': isExpanded }"
    :style="footerStyles"
  >
    <!-- Folded state -->
    <div 
      v-if="!isExpanded" 
      class="footer-folded"
    >
      <!-- Triangle Background -->
      <div class="triangle-background" :style="triangleStyles"></div>
      
      <!-- Miniature Image - Clickable -->
      <div class="miniature-container" @click.stop="toggleExpanded">
        <img 
          :src="currentTheme?.images?.[0] || ''"
          :alt="currentTheme?.name || 'Theme'"
          class="miniature-image"
        />
         <div class="image-overlay">
           <p class="expand-text" :style="{ color: getSecondaryColor(0) }">
             Click to navigate
           </p>
         </div>
      </div>
    </div>

    <!-- Expanded state -->
    <div v-else class="footer-expanded">
      <div class="footer-header">
        <button 
          class="close-button"
          @click="toggleExpanded"
          :style="{ color: getSecondaryColor(0) }"
        >
          <Icon icon="mdi:close" />
        </button>
      </div>
      
       <div class="svg-container">
         <!-- SVG with embedded image background -->
         <svg 
           width="3413.3301"
           height="1946.67"
           viewBox="0 0 3413.3299 1946.67"
           class="nav-svg"
           xmlns="http://www.w3.org/2000/svg"
           preserveAspectRatio="none"
         >
           <!-- Background Image embedded in SVG -->
           <image 
             :href="currentTheme?.images?.[0] || ''" 
             x="0" 
             y="0" 
             width="3413.3299" 
             height="1946.67"
             preserveAspectRatio="none"
           />
           <!-- Render all navigation shapes -->
           <g v-for="item in navigationItems" :key="item.id">
             <path
               :id="getShapeId(item.name)"
               :d="getShapePathData(item.name)"
               :fill="isHovered(item.id) ? getSecondaryColor(2) : 'transparent'"
               :stroke="isHovered(item.id) ? getSecondaryColor(1) : 'transparent'"
               :stroke-width="isHovered(item.id) ? '2' : '0'"
               class="nav-shape"
               @click="handleShapeClick(item, $event)"
               @mouseenter="handleShapeHover(item, $event)"
               @mouseleave="handleShapeLeave"
             />
           </g>
         </svg>
       </div>

    </div>
  </div>

  <!-- Submenu for hovered item - positioned outside footer container -->
  <Teleport to="body">
    <Submenu 
      v-if="hoveredItem && hoveredItem.hasSubmenu"
      :item="hoveredItem"
      :position="submenuPosition"
      @close="setHoveredItem(null)"
      @navigate="handleNavigation"
    />
  </Teleport>

  <!-- Shape Label Tooltip -->
  <Teleport to="body">
    <div 
      v-if="hoveredShape && isExpanded"
      class="shape-tooltip"
      :style="tooltipStyles"
    >
      {{ navigationItems.find(item => item.id === hoveredShape)?.label }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useSkinTheme } from '../composables/useSkinTheme'
import { useFooterState } from '../composables/useFooterState'
import { mainNavigationItems } from '../config/navigation'
import { getShapeId } from '../utils/shapeMapping'
import { getShapePath } from '../utils/svgPathExtractor'
import type { NavigationItem } from '../types'
import Submenu from './Submenu.vue'

// Props
interface Props {
  navigationItems?: NavigationItem[]
}

const props = withDefaults(defineProps<Props>(), {
  navigationItems: () => mainNavigationItems
})

// Composables
const router = useRouter()
const { currentTheme, getPrimaryColor, getSecondaryColor } = useSkinTheme()
const { isFooterExpanded, setFooterExpanded } = useFooterState()

// State
const isExpanded = computed({
  get: () => isFooterExpanded.value,
  set: (value: boolean) => setFooterExpanded(value)
})
const hoveredItem = ref<NavigationItem | null>(null)
const submenuPosition = ref({ x: 0, y: 0 })
const shapePaths = ref<Map<string, string>>(new Map())
const hoveredShape = ref<string | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// Computed styles
const footerStyles = computed(() => ({
  '--primary-color': getPrimaryColor(0),
  '--secondary-color': getSecondaryColor(0),
  '--secondary-color-2': getSecondaryColor(1),
  '--secondary-color-3': getSecondaryColor(2),
  '--theme-secondary-1': getSecondaryColor(0),
  '--theme-secondary-2': getSecondaryColor(1),
  '--theme-secondary-3': getSecondaryColor(2)
}))

const triangleStyles = computed(() => ({
  backgroundColor: `${getSecondaryColor(0)}80` // Using secondaryColor[0] with higher opacity
}))

const tooltipStyles = computed(() => {
  // Ensure tooltip stays within viewport bounds
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const tooltipWidth = 200 // estimated width
  const tooltipHeight = 40 // estimated height
  
  let x = tooltipPosition.value.x
  let y = tooltipPosition.value.y
  
  // Adjust horizontal position if tooltip would go off-screen
  if (x + tooltipWidth / 2 > viewportWidth) {
    x = viewportWidth - tooltipWidth / 2 - 20 // 20px margin
  }
  if (x - tooltipWidth / 2 < 20) {
    x = tooltipWidth / 2 + 20 // 20px margin from left edge
  }
  
  // Adjust vertical position if tooltip would go off-screen
  if (y + tooltipHeight / 2 > viewportHeight) {
    y = viewportHeight - tooltipHeight / 2 - 20 // 20px margin
  }
  if (y - tooltipHeight / 2 < 20) {
    y = tooltipHeight / 2 + 20 // 20px margin from top edge
  }
  
  return {
    '--primary-color': getPrimaryColor(0),
    '--secondary-color': getSecondaryColor(0),
    '--secondary-color-2': getSecondaryColor(1),
    '--secondary-color-3': getSecondaryColor(2),
    left: `${x}px`,
    top: `${y}px`
  }
})

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const isHovered = (itemId: string) => {
  return hoveredItem.value?.id === itemId
}

const setHoveredItem = (itemId: string | null) => {
  if (itemId) {
    const item = props.navigationItems.find(navItem => navItem.id === itemId)
    hoveredItem.value = item || null
  } else {
    hoveredItem.value = null
  }
}

const handleShapeHover = (item: NavigationItem, event: MouseEvent) => {
  hoveredShape.value = item.id
  // Calculate center point of the shape for tooltip positioning
  const rect = (event.target as SVGElement).getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

const handleShapeLeave = () => {
  hoveredShape.value = null
}


const handleShapeClick = (item: NavigationItem, event: MouseEvent) => {
  console.log('FooterNavbar: Shape clicked:', item.id, 'hasSubmenu:', item.hasSubmenu)
  
  if (item.hasSubmenu) {
    console.log('FooterNavbar: Showing submenu for:', item.id)
    // Calculate dynamic position based on submenu content and available space
    const submenuItemCount = item.submenuItems?.length || 0
    const estimatedHeight = Math.max(100, submenuItemCount * 60 + 80) // Base height + items
    const viewportHeight = window.innerHeight
    const clickY = event.clientY
    
    // Determine if menu should appear above or below
    const spaceBelow = viewportHeight - clickY
    const spaceAbove = clickY
    
    let yPosition: number
    
    if (spaceAbove >= estimatedHeight + 20) {
      // Enough space above - position above the click
      yPosition = clickY - estimatedHeight - 10
    } else if (spaceBelow >= estimatedHeight + 20) {
      // Not enough space above, but enough below - position below the click
      yPosition = clickY + 10
    } else {
      // Not enough space in either direction - position above with minimal offset
      yPosition = Math.max(10, clickY - estimatedHeight - 10)
    }
    
    const newPosition = {
      x: event.clientX,
      y: yPosition
    }
    
    console.log('FooterNavbar: Submenu position:', newPosition)
    submenuPosition.value = newPosition
    // Show submenu or toggle it
    setHoveredItem(hoveredItem.value?.id === item.id ? null : item.id)
    console.log('FooterNavbar: Hovered item set to:', hoveredItem.value?.id)
  } else {
    console.log('FooterNavbar: Navigating directly to:', item.path)
    // Navigate directly
    handleNavigation(item)
  }
}

const handleNavigation = (item: NavigationItem) => {
  router.push(`/${item.path}`)
  setHoveredItem(null)
  isExpanded.value = false
}

// Load shape paths when component mounts or theme changes
const loadShapePaths = async () => {
  if (!currentTheme.value) {
    console.log('FooterNavbar: No theme loaded yet')
    return
  }
  
  console.log('FooterNavbar: Loading shape paths for theme:', currentTheme.value.id)
  const svgFile = currentTheme.value.svgFile
  const shapeIds = props.navigationItems.map(item => getShapeId(item.name))
  const imageSize = currentTheme.value.shapeCoordinates?.imageSize
  
  console.log('FooterNavbar: SVG file:', svgFile)
  console.log('FooterNavbar: Image size:', imageSize)
  console.log('FooterNavbar: Shape IDs:', shapeIds)
  
  try {
    const paths = await Promise.all(
      shapeIds.map(async (shapeId) => {
        const path = await getShapePath(shapeId, svgFile)
        console.log(`FooterNavbar: Loaded path for ${shapeId}:`, path.substring(0, 100) + '...')
        return { shapeId, path }
      })
    )
    
    // Create new Map directly from the paths array
    shapePaths.value = new Map(paths.map(({ shapeId, path }) => [shapeId, path]))
    console.log('FooterNavbar: Shape paths loaded successfully')
  } catch (error) {
    console.error('FooterNavbar: Error loading shape paths:', error)
  }
}

const getShapePathData = (itemName: string): string => {
  const shapeId = getShapeId(itemName)
  return shapePaths.value.get(shapeId) || "M10,10 L90,10 L90,50 L10,50 Z"
}

// Event listeners
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // Only close if clicking outside the footer AND it's currently expanded
  if (isExpanded.value && !target.closest('.footer-navbar')) {
    isExpanded.value = false
    setHoveredItem(null)
  }
}

// Watch for theme changes
watch(() => currentTheme.value?.id, () => {
  loadShapePaths()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadShapePaths()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.footer-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  z-index: 1000;
  transition: height 0.3s ease-in-out;
  overflow: visible;
}

.footer-navbar.expanded {
  height: 80vh;
  background: var(--theme-secondary-3, rgba(0, 204, 204, 0.1));
  clip-path: polygon(50% 5%, 100% 30%, 100% 100%, 0% 100%, 0% 30%);
  overflow: visible;
}

.footer-folded {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.miniature-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 400px;
  height: auto;
  z-index: 2;
  cursor: pointer;
}

.miniature-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.miniature-container:hover .miniature-image {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.triangle-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  clip-path: polygon(5% 100%, 50% 15%, 95% 100%);
  background: var(--theme-secondary-3, rgba(0, 204, 204, 0.1));
  z-index: 1;
}

.expand-text {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.footer-expanded {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color-1), var(--primary-color-1));
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.footer-header {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.svg-container {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  bottom: 50px;
  padding: 2rem 2rem 0 2rem;
  position: relative;
  overflow: visible;
}

.nav-svg {
  width: 100%;
  max-width: 1000px;
  height: auto;
  display: block;
  overflow: visible;
}

.nav-shape {
  cursor: pointer;
  transition: fill 0.2s ease, stroke 0.2s ease;
  fill: transparent;
  stroke: transparent;
  overflow: visible;
}

.nav-shape:hover,
.nav-shape.selected {
  fill: var(--theme-secondary-2, rgba(0, 230, 230, 0.5));
  stroke: var(--theme-secondary-1, rgba(0, 255, 255, 0.9));
  stroke-width: 5;
}

/* Shape Tooltip Styles - matching submenu design */
.shape-tooltip {
  position: fixed;
  background: var(--primary-color);
  border: var(--border-width-thin) solid var(--secondary-color-3);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1rem;
  z-index: 1002;
  backdrop-filter: blur(10px);
  transform: translate(-50%, -50%);
  animation: tooltipSlideIn 0.2s ease-out;
  pointer-events: none;
  white-space: nowrap;
  min-width: 120px;
  text-align: center;
}

.shape-tooltip::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: var(--border-width-thin) solid transparent;
  border-top-color: var(--secondary-color-3);
}

@keyframes tooltipSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.shape-tooltip {
  color: var(--secondary-color);
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .footer-navbar.expanded {
    height: 70vh;
  }
  
  .expand-text {
    font-size: 1rem;
  }
  
  .svg-container {
    padding: 1rem;
  }
  
  .shape-tooltip {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
    min-width: 100px;
  }
}
</style>
