<template>
  <div class="integration">
    <!-- Primary Card with Title and Description -->
    <BaseCard 
      title="Integrations" 
      subtitle="Connect your accounts and platforms"
      variant="primary" 
      size="lg"
      class="integration-header-card"
    >
      <div class="integration-header-content">
        <div class="integration-description">
          <p>Connect your Discord, GitHub, and Star Atlas accounts to unlock exclusive features and seamless integration across platforms. Link your accounts to access special guild benefits and enhanced functionality.</p>
        </div>
      </div>
    </BaseCard>

    <!-- Main Content Area -->
    <BaseCard 
      variant="neutral" 
      size="xl"
      class="integration-main-card"
    >
      <!-- Integration Cards Grid -->
      <div class="integration-grid">
        <!-- Discord Integration -->
        <BaseCard 
          variant="primary" 
          size="lg"
          class="integration-card"
        >
          <div class="integration-card-content">
            <div class="integration-logo">
              <Icon icon="logos:discord-icon" class="logo-icon" />
            </div>
            <div class="integration-info">
              <h3 class="integration-title">Discord</h3>
              <p class="integration-description">Connect your Discord account to access voice channels, roles, and guild notifications.</p>
            </div>
            <div class="integration-input">
              <BaseInput
                v-model="discordUsername"
                placeholder="Enter Discord username"
                type="text"
                size="md"
              />
            </div>
          </div>
        </BaseCard>

        <!-- GitHub Integration -->
        <BaseCard 
          variant="primary" 
          size="lg"
          class="integration-card"
        >
          <div class="integration-card-content">
            <div class="integration-logo">
              <Icon icon="logos:github-icon" class="logo-icon" />
            </div>
            <div class="integration-info">
              <h3 class="integration-title">GitHub</h3>
              <p class="integration-description">Link your GitHub account to contribute to guild projects and track development progress.</p>
            </div>
            <div class="integration-input">
              <BaseInput
                v-model="githubUsername"
                placeholder="Enter GitHub username"
                type="text"
                size="md"
              />
            </div>
          </div>
        </BaseCard>

        <!-- Star Atlas Integration -->
        <BaseCard 
          variant="primary" 
          size="lg"
          class="integration-card"
        >
          <div class="integration-card-content">
            <div class="integration-logo">
              <Icon icon="game-icons:spaceship" class="logo-icon" />
            </div>
            <div class="integration-info">
              <h3 class="integration-title">Star Atlas</h3>
              <p class="integration-description">Connect your Star Atlas wallet to participate in guild activities and earn rewards.</p>
            </div>
            <div class="integration-input">
              <BaseInput
                v-model="starAtlasWallet"
                placeholder="Enter Star Atlas wallet address"
                type="text"
                size="md"
              />
            </div>
          </div>
        </BaseCard>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseInput } from '@/components/base'

// Form data
const discordUsername = ref('')
const githubUsername = ref('')
const starAtlasWallet = ref('')
</script>

<style scoped>
.integration {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--theme-background);
}

.integration-header-card {
  width: 100%;
  max-width: 100%;
}

.integration-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.integration-description {
  flex: 1;
}

.integration-description p {
  color: var(--text-color-1);
  line-height: 1.6;
  margin: 0;
}

.integration-main-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.integration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-xl);
  padding: var(--space-md);
}

.integration-card {
  width: 100%;
  transition: all 0.3s ease;
}

.integration-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.integration-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  height: 100%;
  min-height: 280px;
}

.integration-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: var(--secondary-color-2);
  border-radius: var(--radius-lg);
  margin: 0 auto;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--text-color-0);
}

.integration-info {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.integration-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-sm) 0;
}

.integration-description {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
}

.integration-input {
  margin-top: auto;
  width: 100%;
}

/* Wide screen margin - matching raffle layout */
@media (min-width: 1400px) {
  .integration-header-card {
    margin: 0% 10%;
    width: 80%;
    max-width: 80%;
  }
  
  .integration-main-card {
    margin: 0 10%;
    width: 80%;
    max-width: 80%;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .integration {
    padding: var(--space-md);
  }
}

@media (max-width: 768px) {
  .integration {
    padding: var(--space-md);
    gap: var(--space-md);
  }
  
  .integration-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .integration-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    padding: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .integration {
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
}
</style>
