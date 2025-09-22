<template>
  <div class="member-profile">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <Icon icon="game-icons:loading" class="loading-icon" />
      <p>Loading your profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Icon icon="game-icons:warning" class="error-icon" />
      <h3>Error Loading Profile</h3>
      <p>{{ error }}</p>
      <BaseButton @click="loadMemberProfile" variant="primary">
        Try Again
      </BaseButton>
    </div>

    <!-- Not Logged In State -->
    <div v-else-if="!isLoggedIn" class="not-logged-in">
      <Icon icon="game-icons:padlock" class="lock-icon" />
      <h3>Please Log In</h3>
      <p>You need to connect your wallet to view your profile.</p>
    </div>

    <!-- No Guild Selected State -->
    <div v-else-if="!hasActiveGuild" class="no-guild">
      <Icon icon="game-icons:castle" class="castle-icon" />
      <h3>Select a Guild</h3>
      <p>Please select a guild to view your member profile.</p>
    </div>

    <!-- Profile Content -->
    <template v-else>
      <!-- Primary Card - Profile Overview -->
      <BaseCard 
        variant="primary" 
        size="xl" 
        class="profile-primary-card"
      >
        <div class="profile-header">
          <div class="avatar-container">
            <img 
              :src="memberData.avatar || '/default-avatar.png'" 
              :alt="memberData.name"
              class="member-avatar"
            />
          </div>
          <div class="profile-info">
            <h1 class="member-name">{{ memberData.name }}</h1>
            <p class="member-role">{{ memberData.role }}</p>
            <p class="member-since">Member since {{ memberData.memberSince }}</p>
          </div>
        </div>
        
        <div class="level-progress">
          <BaseProgressBar
            :value="memberData.contributionPoints"
            :max="memberData.nextLevelPoints"
            label="Level Progress"
            :description="`${memberData.contributionPoints} / ${memberData.nextLevelPoints} points to next level`"
            size="lg"
            variant="default"
            :animated="true"
          />
        </div>
      </BaseCard>

      <!-- Profile Editing Card -->
      <BaseCard 
        variant="primary" 
        size="lg" 
        class="profile-edit-card"
      >
        <template #header>
          <h3 class="card-title">Profile Settings</h3>
          <p class="card-subtitle">Manage your profile information and preferences</p>
        </template>
        
        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="profileForm.username"
              type="text"
              class="form-input"
              placeholder="Enter your username"
            />
          </div>
          
          <div class="form-group">
            <label for="bio" class="form-label">Bio</label>
            <textarea
              id="bio"
              v-model="profileForm.bio"
              class="form-textarea"
              placeholder="Tell us about yourself..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="discord" class="form-label">Discord Name</label>
            <input
              id="discord"
              v-model="profileForm.discordName"
              type="text"
              class="form-input"
              placeholder="Your Discord username"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Notifications</label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input
                  v-model="profileForm.notifications.quests"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-label">Quest Updates</span>
              </label>
              <label class="checkbox-item">
                <input
                  v-model="profileForm.notifications.events"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-label">Event Notifications</span>
              </label>
              <label class="checkbox-item">
                <input
                  v-model="profileForm.notifications.governance"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-label">Governance Updates</span>
              </label>
            </div>
          </div>
        </form>
        
        <template #footer>
          <BaseButton 
            @click="saveProfile" 
            :disabled="isSaving"
            variant="primary"
            size="md"
          >
            <Icon v-if="isSaving" icon="game-icons:loading" class="loading-icon" />
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </BaseButton>
        </template>
      </BaseCard>

      <!-- Achievements List Card -->
      <BaseCard 
        variant="primary" 
        size="lg" 
        class="achievements-card"
      >
        <template #header>
          <h3 class="card-title">Recent Achievements</h3>
          <p class="card-subtitle">Your latest accomplishments and milestones</p>
        </template>
        
        <BaseList
          :items="achievements"
          variant="striped"
          size="md"
          class="achievements-list"
        >
          <template #icon="{ item }">
            <Icon :icon="item.icon || 'mdi:trophy'" class="achievement-icon" />
          </template>
          
          <template #title="{ item }">
            <div class="achievement-title">{{ item.title }}</div>
          </template>
          
          <template #subtitle="{ item }">
            <div class="achievement-description">{{ item.description }}</div>
            <div class="achievement-date">{{ item.date }}</div>
          </template>
          
          <template #actions="{ item }">
            <BaseButton
              v-if="item.canMint"
              variant="primary"
              size="sm"
              icon="game-icons:coin"
              @click="mintAchievement(item)"
            >
              Mint
            </BaseButton>
          </template>
        </BaseList>
      </BaseCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useDesignTokens } from '../composables/useDesignTokens'
import { useThemeStore } from '../stores/themeStore'
import { useUserStore } from '../stores/userStore'
import { useGuildStore } from '../stores/guildStore'
import { useMemberStore } from '../stores/memberStore'
import BaseCard from '../components/base/BaseCard.vue'
import BaseProgressBar from '../components/base/BaseProgressBar.vue'
import BaseList from '../components/base/BaseList.vue'
import BaseButton from '../components/base/BaseButton.vue'

// Design tokens and theme
const { spacing, typography, borderRadius, colors } = useDesignTokens()
const themeStore = useThemeStore()
const userStore = useUserStore()
const guildStore = useGuildStore()
const memberStore = useMemberStore()

// Profile form
const profileForm = reactive({
  username: '',
  bio: '',
  discordName: '',
  notifications: {
    quests: true,
    events: true,
    governance: false
  }
})

// Form state
const isSaving = ref(false)

// Computed properties
const isLoggedIn = computed(() => userStore.isLoggedIn)
const hasActiveGuild = computed(() => guildStore.hasActiveGuild)
const canLoadProfile = computed(() => isLoggedIn.value && hasActiveGuild.value)

// Member data from store
const memberData = computed(() => ({
  name: memberStore.memberUsername,
  role: memberStore.roleName,
  memberSince: memberStore.memberJoinedAt ? new Date(memberStore.memberJoinedAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : '',
  avatar: memberStore.memberAvatar ? `/SLP/nfts/${memberStore.memberAvatar}` : '/default-avatar.png',
  contributionPoints: memberStore.memberContributionScore,
  nextLevelPoints: 1000, // This could be calculated based on level
  bio: memberStore.memberBio
}))

// Loading and error states from store
const isLoading = computed(() => memberStore.isLoading)
const error = computed(() => memberStore.error)

// Achievements data
const achievements = ref([
  {
    id: 1,
    title: 'First Quest Completed',
    description: 'Successfully completed your first guild quest',
    icon: 'game-icons:target-dummy',
    date: '2 days ago',
    canMint: true
  },
  {
    id: 2,
    title: 'Event Participant',
    description: 'Attended 5 guild events',
    icon: 'game-icons:party-popper',
    date: '1 week ago',
    canMint: false
  },
  {
    id: 3,
    title: 'Contribution Master',
    description: 'Earned 500+ contribution points',
    icon: 'game-icons:trophy',
    date: '2 weeks ago',
    canMint: true
  },
  {
    id: 4,
    title: 'Community Helper',
    description: 'Helped 10+ new members',
    icon: 'game-icons:heart-tower',
    date: '3 weeks ago',
    canMint: false
  },
  {
    id: 5,
    title: 'Governance Voter',
    description: 'Participated in 3 governance votes',
    icon: 'game-icons:vote',
    date: '1 month ago',
    canMint: true
  }
])

// Methods
const loadMemberProfile = async () => {
  if (!canLoadProfile.value) {
    return
  }

  const walletAddress = userStore.selectedWallet?.address
  const guildId = guildStore.guildId

  if (!walletAddress || !guildId) {
    return
  }

  try {
    await memberStore.loadMemberProfile(walletAddress, guildId)
    
    // Update form data with member store data
    profileForm.username = memberStore.memberUsername
    profileForm.bio = memberStore.memberBio
    profileForm.discordName = memberStore.memberEmail // Using email as placeholder for discord
    profileForm.notifications = {
      quests: memberStore.notifications[0] || false,
      events: memberStore.notifications[1] || false,
      governance: memberStore.notifications[2] || false
    }
  } catch (err) {
    console.error('Error loading member profile:', err)
  }
}

const saveProfile = async () => {
  isSaving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update member store
    memberStore.updateMemberProfile({
      username: profileForm.username,
      bio: profileForm.bio
    })
    
    memberStore.updateNotificationSettings([
      profileForm.notifications.quests,
      profileForm.notifications.events,
      profileForm.notifications.governance
    ])
    
    console.log('Profile saved:', profileForm)
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    isSaving.value = false
  }
}

const mintAchievement = (achievement: any) => {
  console.log('Minting achievement:', achievement)
  // Demo: Show minting calculation
}

// Watch for changes in wallet or guild selection
watch([() => userStore.selectedWallet, () => guildStore.guildId], () => {
  if (canLoadProfile.value) {
    loadMemberProfile()
  }
}, { immediate: true })

onMounted(() => {
  if (canLoadProfile.value) {
    loadMemberProfile()
  }
})
</script>

<style scoped>
.member-profile {
  max-width: 55%;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.profile-primary-card,
.profile-edit-card,
.achievements-card {
  width: 100%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.avatar-container {
  flex-shrink: 0;
}

.member-avatar {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-xl);
  object-fit: cover;
  border: var(--border-width-thin) solid var(--secondary-color-0);
}

.profile-info {
  flex: 1;
}

.member-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-xs) 0;
}

.member-role {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-color-1);
  margin: 0 0 var(--space-xs) 0;
}

.member-since {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  margin: 0;
  opacity: 0.8;
}

.level-progress {
  width: 100%;
  margin-top: var(--space-lg);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-color-0);
}

.form-input,
.form-textarea {
  padding: var(--space-md);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: var(--radius-md);
  background: var(--primary-color-1);
  color: var(--text-color-0);
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
  width: 100%;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--secondary-color-0);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--secondary-color-0);
}

.checkbox-label {
  font-size: var(--text-sm);
  color: var(--text-color-0);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.achievements-list {
  width: 100%;
}

.achievement-icon {
  font-size: 1.5rem;
  color: var(--text-color-0);
}

.achievement-title {
  font-weight: var(--font-medium);
  color: var(--text-color-0);
  margin-bottom: var(--space-xs);
}

.achievement-description {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin-bottom: var(--space-xs);
}

.achievement-date {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  opacity: 0.8;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Loading and Error States */
.loading-container,
.error-container,
.not-logged-in,
.no-guild {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  text-align: center;
  background: var(--primary-color-0);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  width: 100%;
}

.loading-icon,
.error-icon,
.lock-icon,
.castle-icon {
  font-size: 3rem;
  color: var(--text-color-0);
  margin-bottom: var(--space-lg);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.error-container h3,
.not-logged-in h3,
.no-guild h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin: 0 0 var(--space-md) 0;
}

.error-container p,
.not-logged-in p,
.no-guild p {
  font-size: var(--text-base);
  color: var(--text-color-1);
  margin: 0 0 var(--space-lg) 0;
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .member-profile {
    max-width: 85%;
  }
}

@media (max-width: 768px) {
  .member-profile {
    max-width: 95%;
    padding: 1rem 0.5rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .member-avatar {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .member-avatar {
    width: 60px;
    height: 60px;
  }
}
</style>