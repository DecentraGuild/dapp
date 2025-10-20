<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTutorialStore } from '@/stores/tutorialStore'
import { useSkinTheme } from '@/composables/useSkinTheme'
import { useFooterState } from '@/composables/useFooterState'
import { replaceTutorialNavigationText } from '@/utils/tutorialTextProcessor'
import { Icon } from '@iconify/vue'

const route = useRoute()
const tutorialStore = useTutorialStore()
const { currentTheme } = useSkinTheme()
const { isFooterExpanded } = useFooterState()
const showSuccess = ref(false)

// Computed properties for skin-aware tutorial text
const processedTitle = computed(() => {
  const title = tutorialStore.currentStep?.title
  return title ? replaceTutorialNavigationText(title, currentTheme.value) : ''
})

const processedDescription = computed(() => {
  const description = tutorialStore.currentStep?.description
  return description ? replaceTutorialNavigationText(description, currentTheme.value) : ''
})

const processedAction = computed(() => {
  const action = tutorialStore.currentStep?.action
  return action ? replaceTutorialNavigationText(action, currentTheme.value) : ''
})

const isLastStep = computed(() => tutorialStore.isLastStep)

const overlayClasses = computed(() => ({
  'tutorial-overlay': true,
  'minimized': tutorialStore.isMinimized,
  'center': tutorialStore.currentStep?.position === 'center',
  'right': tutorialStore.currentStep?.position === 'right',
  'left': tutorialStore.currentStep?.position === 'left',
  'top': tutorialStore.currentStep?.position === 'top',
  'bottom': tutorialStore.currentStep?.position === 'bottom',
  'footer-expanded': isFooterExpanded.value,
}))

const handleNext = () => {
  // Show success indicator for all step completions
  showSuccess.value = true
  
  setTimeout(() => {
    showSuccess.value = false
    
    if (tutorialStore.isLastStep && tutorialStore.currentStep?.autoAdvance === false) {
      tutorialStore.completeTutorialManually()
    } else {
      tutorialStore.nextStep()
    }
  }, 1500)
}

const handlePrevious = () => {
  tutorialStore.previousStep()
}

const handleSkip = () => {
  if (confirm('Are you sure you want to exit the tutorial? You can restart it anytime from the settings.')) {
    tutorialStore.skipTutorial()
  }
}

const handleMinimize = () => {
  tutorialStore.toggleMinimize()
}

const handleBackdropClick = () => {
  // Move centered tutorial to right side instead of minimizing
  if (tutorialStore.currentStep?.position === 'center') {
    tutorialStore.moveToRight()
  }
}

// Watch for route changes to auto-advance tutorial
watch(() => route.path, (newPath) => {
  if (tutorialStore.isActive && tutorialStore.currentStep) {
    const step = tutorialStore.currentStep
    if (step.autoAdvance && step.targetRoute && newPath === step.targetRoute) {
      // Show success indicator briefly
      showSuccess.value = true
      tutorialStore.maximize()
      
      // Let the store handle the advancement
      tutorialStore.checkRouteAndAdvance(newPath)
    }
  }
}, { immediate: true })

// Watch for step changes - no auto-minimize, let users control it
watch(() => tutorialStore.currentStep?.id, (newStepId, oldStepId) => {
  // Users can manually minimize using the minimize button
  // No automatic minimization - keep tutorial visible for better UX
})

// Listen for tutorial action completion events
const handleTutorialActionCompleted = (event: CustomEvent) => {
  if (tutorialStore.isActive) {
    showSuccess.value = true
    // Auto-hide success banner after 1.5 seconds to prevent stuck states
    setTimeout(() => {
      showSuccess.value = false
    }, 1500)
  }
}

// Watch for step changes to immediately hide success banner
watch(() => tutorialStore.currentStep?.id, (newStepId, oldStepId) => {
  if (oldStepId && newStepId && oldStepId !== newStepId) {
    showSuccess.value = false
  }
})

// Watch for tutorial becoming inactive to hide success banner
watch(() => tutorialStore.isActive, (isActive) => {
  if (!isActive) {
    showSuccess.value = false
  }
})

// Add event listeners on mount
onMounted(() => {
  window.addEventListener('tutorial-action-completed', handleTutorialActionCompleted as EventListener)
})

// Remove event listeners on unmount
onUnmounted(() => {
  window.removeEventListener('tutorial-action-completed', handleTutorialActionCompleted as EventListener)
})
</script>

<template>
  <Transition name="tutorial-fade">
    <div v-if="tutorialStore.isActive" :class="overlayClasses">
      <!-- Minimized state -->
      <div v-if="tutorialStore.isMinimized" class="tutorial-minimized">
        <button @click="handleMinimize" class="minimize-button" title="Expand Tutorial">
          <Icon icon="mdi:chevron-left" width="24" height="24" />
        </button>
        <div class="minimized-content">
          <div class="step-indicator">
            {{ tutorialStore.currentStepIndex + 1 }} / {{ tutorialStore.totalSteps }}
          </div>
          <Icon icon="mdi:school" width="20" height="20" />
        </div>
      </div>

      <!-- Full overlay state -->
      <div v-else class="tutorial-content">
        <!-- Background overlay for center position -->
        <div 
          v-if="tutorialStore.currentStep?.position === 'center'" 
          class="tutorial-backdrop"
          @click="handleBackdropClick"
        />

        <!-- Tutorial card -->
        <div class="tutorial-card" :class="{ 'success': showSuccess, 'large': isLastStep }">
          <!-- Success Overlay -->
          <div v-if="showSuccess" class="success-overlay">
            <Icon icon="mdi:check-circle" width="64" height="64" class="success-icon" />
            <p class="success-text">Great job! Moving to next step...</p>
          </div>

          <!-- Header -->
          <div class="tutorial-header">
            <div class="tutorial-title-section">
              <Icon icon="mdi:school" width="24" height="24" class="title-icon" />
              <h3 class="tutorial-title">{{ processedTitle }}</h3>
            </div>
            <div class="tutorial-controls">
              <button 
                @click="handleMinimize" 
                class="control-button minimize"
                title="Minimize"
              >
                <Icon icon="mdi:chevron-right" width="20" height="20" />
              </button>
              <button 
                @click="handleSkip" 
                class="control-button close"
                title="Exit Tutorial"
              >
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="tutorial-progress-bar">
            <div 
              class="tutorial-progress-fill" 
              :style="{ width: `${tutorialStore.progress}%` }"
            />
          </div>

          <!-- Content -->
          <div class="tutorial-body">
            <p class="tutorial-description">
              {{ processedDescription }}
            </p>


            <!-- Social links shown only on final step of group quest tutorial -->
            <div v-if="isLastStep && tutorialStore.currentTutorialId === 'group-quest-tutorial'" class="social-links social-links--body">
              <a
                href="https://x.com/DecentraGuild"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link social-link--large"
                title="Follow on X"
              >
                <img src="/SLP/guildassets/x-logo.png" alt="X" class="social-icon social-icon--large" />
              </a>
              <a
                href="https://discord.gg/MFVnuaRQ5J"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link social-link--large"
                title="Join Discord"
              >
                <img src="/SLP/guildassets/discord-logo.webp" alt="Discord" class="social-icon social-icon--large" />
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="tutorial-footer">
            <div class="step-info">
              Step {{ tutorialStore.currentStepIndex + 1 }} of {{ tutorialStore.totalSteps }}
            </div>
            <div class="tutorial-actions">
              <button 
                v-if="!tutorialStore.isFirstStep"
                @click="handlePrevious"
                class="tutorial-button secondary"
              >
                <Icon icon="mdi:chevron-left" width="18" height="18" />
                Previous
              </button>
              <button 
                @click="handleNext"
                class="tutorial-button primary"
              >
                {{ tutorialStore.isLastStep ? 'Complete' : 'Next' }}
                <Icon icon="mdi:chevron-right" width="18" height="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tutorial-overlay {
  position: fixed;
  z-index: 9999;
  transition: all 0.3s ease;
}

/* Positioning classes */
.tutorial-overlay.center {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-overlay.right {
  bottom: calc(var(--space-3xl) * 1.5 + 10px);
  right: 10px;
  transform: none;
}

.tutorial-overlay.left {
  bottom: calc(var(--space-3xl) * 1.5 + 10px);
  left: 10px;
  transform: none;
}

/* When footer is expanded, move side positions up */
.tutorial-overlay.footer-expanded.right {
  bottom: calc(85vh + 10px);
}

.tutorial-overlay.footer-expanded.left {
  bottom: calc(85vh + 10px);
}

.tutorial-overlay.top {
  top: calc(var(--space-3xl, 4rem) + 40px) !important;
  left: 10px;
  right: 10px;
  transform: none;
  /* Ensure it never goes above the topbar */
  position: fixed !important;
  z-index: 9999 !important;
}

.tutorial-overlay.bottom {
  bottom: calc(var(--space-3xl) * 1.5 + 10px);
  left: 10px;
  right: 10px;
  transform: none;
}

/* When footer is expanded, move tutorial up */
.tutorial-overlay.footer-expanded.bottom {
  bottom: calc(85vh + 10px);
}

/* Minimized state */
.tutorial-overlay.minimized {
  top: calc(var(--space-3xl) + 10px);
  right: 0;
  transform: none;
}

.tutorial-minimized {
  display: flex;
  align-items: center;
  background: var(--global-bg-secondary, #1a1a2e);
  border: 2px solid var(--global-border, #3d3d5c);
  border-right: none;
  border-radius: 12px 0 0 12px;
  padding: 12px 8px;
  box-shadow: -4px 4px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tutorial-minimized:hover {
  background: var(--global-bg-primary, #0f0f1e);
  transform: translateX(-4px);
}

.minimize-button {
  background: none;
  border: none;
  color: var(--global-text-primary, #fff);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.minimize-button:hover {
  transform: scale(1.1);
}

.minimized-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--global-text-primary, #fff);
  padding: 0 4px;
}

.step-indicator {
  font-size: 11px;
  font-weight: 600;
  color: var(--global-text-secondary, #a0a0b0);
}

/* Full overlay */
.tutorial-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.tutorial-card {
  position: relative;
  background: var(--global-bg-secondary, #1a1a2e);
  border: 2px solid var(--global-border, #3d3d5c);
  border-radius: 16px;
  padding: 0;
  width: 400px;
  max-width: 400px;
  min-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.tutorial-card.large {
  width: 500px;
  max-width: 500px;
  min-width: 500px;
}

/* Responsive width adjustments */
@media (max-width: 768px) {
  .tutorial-card {
    width: calc(100vw - 20px);
    max-width: calc(100vw - 20px);
    min-width: calc(100vw - 20px);
  }
  
  .tutorial-card.large {
    width: calc(100vw - 20px);
    max-width: calc(100vw - 20px);
    min-width: calc(100vw - 20px);
  }
}

.tutorial-card.success {
  border-color: #4caf50;
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.4);
}

/* Success Overlay */
.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
  animation: successFadeIn 0.3s ease;
}

@keyframes successFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-icon {
  color: #4caf50;
  animation: successPop 0.5s ease;
}

@keyframes successPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-text {
  font-size: 18px;
  font-weight: 600;
  color: #4caf50;
  margin: 0;
  animation: successSlideUp 0.5s ease 0.2s both;
}

@keyframes successSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--global-border, #3d3d5c);
  background: linear-gradient(135deg, rgba(61, 61, 92, 0.2), rgba(26, 26, 46, 0.2));
}

.tutorial-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.title-icon {
  color: #ffd700;
  flex-shrink: 0;
}

.tutorial-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--global-text-primary, #fff);
  margin: 0;
}

.tutorial-controls {
  display: flex;
  gap: 8px;
}

.control-button {
  background: none;
  border: none;
  color: var(--global-text-secondary, #a0a0b0);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--global-text-primary, #fff);
}

.control-button.close:hover {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

/* Progress bar */
.tutorial-progress-bar {
  height: 4px;
  background: rgba(61, 61, 92, 0.5);
  position: relative;
  overflow: hidden;
}

.tutorial-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

/* Body */
.tutorial-body {
  padding: 24px;
  min-height: 120px;
}

.tutorial-description {
  font-size: 15px;
  line-height: 1.6;
  color: var(--global-text-primary, #fff);
  margin: 0 0 16px 0;
}


/* Footer */
.tutorial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid var(--global-border, #3d3d5c);
  background: rgba(15, 15, 30, 0.5);
}

.step-info {
  font-size: 13px;
  font-weight: 600;
  color: var(--global-text-secondary, #a0a0b0);
}

.tutorial-actions {
  display: flex;
  gap: 12px;
}

.social-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.social-links--body {
  justify-content: center;
  margin-top: 16px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: transform 0.15s ease, background 0.15s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.social-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.social-link--large {
  width: 64px;
  height: 64px;
  border-radius: 12px;
}

.social-icon--large {
  width: 42px;
  height: 42px;
}

.tutorial-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tutorial-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.tutorial-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.tutorial-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--global-text-primary, #fff);
  border: 1px solid var(--global-border, #3d3d5c);
}

.tutorial-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Animations */
.tutorial-fade-enter-active,
.tutorial-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tutorial-fade-enter-from,
.tutorial-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .tutorial-card {
    min-width: 280px;
    max-width: calc(100vw - 40px);
  }

  .tutorial-overlay.right,
  .tutorial-overlay.left {
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
  }
}
</style>

