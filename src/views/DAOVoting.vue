<template>
  <div class="dao-voting-page">
    <!-- Sidebar for Status Filtering -->
    <BaseSidebar
      :items="sidebarItems"
      variant="primary"
      position="left"
      width="4rem"
      @item-click="handleStatusFilter"
    />

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- DAO Voting Title Card -->
      <BaseCard 
        variant="primary" 
        size="lg"
        class="dao-voting-header-card"
      >
        <div class="dao-header">
          <div class="dao-icon">
            <Icon icon="mdi:vote" class="header-icon" />
          </div>
          <div class="dao-details">
            <h1 class="dao-title">DAO Voting</h1>
            <p class="dao-description">
              Participate in guild governance through our tiered voting system. 
              Combined votes split according to token weights, while individual token votes affect their respective DAOs.
            </p>
            <div class="dao-stats">
              <div class="stat">
                <span class="stat-label">Active Proposals:</span>
                <span class="stat-value">{{ votingStats.activeProposals }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Total Proposals:</span>
                <span class="stat-value">{{ votingStats.totalProposals }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Participation Rate:</span>
                <span class="stat-value">{{ Math.round(votingStats.participationRate * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Token Filter Buttons -->
      <div class="token-filter-container" :style="tokenFilterStyles">
        <button 
          class="token-filter-button"
          :class="{ 'active': showToken1 }"
          :style="tokenFilterStyles"
          @click="toggleToken1Filter"
        >
          <Icon icon="mdi:coin" class="token-button-icon" />
          <div class="token-button-content">
            <span class="token-button-title">{{ daoSettings?.daoStructure?.token1DAO?.tokenSymbol || 'CCC' }} Token</span>
            <span class="token-button-subtitle">{{ daoSettings?.daoStructure?.token1DAO?.name || 'Cyber Castle Coin DAO' }}</span>
          </div>
        </button>
        
        <button 
          class="token-filter-button"
          :class="{ 'active': showToken2 }"
          :style="tokenFilterStyles"
          @click="toggleToken2Filter"
        >
          <Icon icon="mdi:diamond-stone" class="token-button-icon" />
          <div class="token-button-content">
            <span class="token-button-title">{{ daoSettings?.daoStructure?.token2DAO?.tokenSymbol || 'CGM' }} Token</span>
            <span class="token-button-subtitle">{{ daoSettings?.daoStructure?.token2DAO?.name || 'Castle Gem DAO' }}</span>
          </div>
        </button>
      </div>

      <!-- Voting List Card -->
      <BaseCard 
        variant="neutral" 
        size="xl"
        class="voting-list-card"
      >
        <div class="voting-list-header">
          <h2 class="list-title">
            {{ getFilterTitle() }} 
            <span class="vote-count">({{ filteredVotes.length }})</span>
          </h2>
        </div>

        <!-- Vote Items List -->
        <div class="votes-container">
          <div 
            v-for="vote in filteredVotes" 
            :key="vote.voteID"
            class="vote-item"
            :class="{ 'vote-expanded': expandedVote === vote.voteID }"
          >
            <!-- Main Vote Row -->
            <div 
              class="vote-main-row"
              @click="toggleVoteExpansion(vote.voteID)"
            >
              <div class="vote-info">
                <div class="vote-header">
                    <h3 class="vote-title" :class="`title-${vote.votetype}`">{{ vote.title }}</h3>
                  <div class="vote-badges">
                    <span 
                      class="vote-type-badge"
                      :class="`badge-${vote.votetype}`"
                    >
                      {{ getVoteTypeLabel(vote.votetype) }}
                    </span>
                    <span 
                      class="vote-status-badge"
                      :class="`status-${vote.status}`"
                    >
                      {{ vote.status }}
                    </span>
                  </div>
                </div>
                <p class="vote-description">{{ vote.description }}</p>
                <div class="vote-meta">
                  <span class="vote-proposer">By: {{ vote.proposer }}</span>
                  <span class="vote-dates">
                    {{ formatDateRange(vote.votingStarts, vote.votingEnds) }}
                  </span>
                </div>
              </div>
              
              <!-- Vote Results Summary -->
              <div class="vote-results-summary">
                <div class="result-item">
                  <span class="result-label">Result:</span>
                  <span 
                    class="result-value"
                    :class="`result-${vote.result || 'pending'}`"
                  >
                    {{ getResultLabel(vote) }}
                  </span>
                </div>
                <div class="result-item">
                  <span class="result-label">Votes:</span>
                  <span class="result-value">{{ vote.currentVotes }} / {{ vote.quorum }}</span>
                </div>
                  <div class="result-progress">
                    <!-- Yes Votes Bar -->
                    <div class="vote-bar">
                      <div class="vote-bar-label">
                        <span>Yes: {{ vote.yesVotes }}</span>
                        <span>{{ getVotePercentage(vote.yesVotes, vote.currentVotes) }}%</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar">
                          <div 
                            class="progress-fill yes-votes" 
                            :style="{ width: getVotePercentage(vote.yesVotes, vote.currentVotes) + '%' }"
                          ></div>
                        </div>
                        <!-- Threshold line -->
                        <div class="threshold-line" :style="{ left: getThresholdPercentage(vote) + '%' }">
                          <div class="threshold-marker"></div>
                          <span class="threshold-label">{{ getThresholdPercentage(vote) }}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- No Votes Bar -->
                    <div class="vote-bar">
                      <div class="vote-bar-label">
                        <span>No: {{ vote.noVotes }}</span>
                        <span>{{ getVotePercentage(vote.noVotes, vote.currentVotes) }}%</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar">
                          <div 
                            class="progress-fill no-votes" 
                            :style="{ width: getVotePercentage(vote.noVotes, vote.currentVotes) + '%' }"
                          ></div>
                        </div>
                        <!-- Threshold line -->
                        <div class="threshold-line" :style="{ left: getThresholdPercentage(vote) + '%' }">
                          <div class="threshold-marker"></div>
                          <span class="threshold-label">{{ getThresholdPercentage(vote) }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

              <div class="vote-expand-icon">
                <Icon 
                  :icon="expandedVote === vote.voteID ? 'mdi:chevron-up' : 'mdi:chevron-down'" 
                  class="expand-icon"
                />
              </div>
            </div>

            <!-- Expanded Tiered Voting Details -->
            <div 
              v-if="expandedVote === vote.voteID" 
              class="vote-expansion"
            >
              <div class="tiered-voting-container">
                <!-- Token 1 DAO Card -->
                <BaseCard 
                  variant="secondary" 
                  size="md"
                  class="token-dao-card"
                  :class="{ 'dao-inactive': vote.votetype === 'token-2' }"
                >
                  <div class="dao-card-header">
                    <Icon icon="mdi:coin" class="token-icon" />
                    <div class="dao-info">
                      <h4 class="dao-name">{{ daoSettings?.daoStructure?.token1DAO?.name || 'Token 1 DAO' }}</h4>
                      <p class="dao-symbol">{{ daoSettings?.daoStructure?.token1DAO?.tokenSymbol || 'CCC' }}</p>
                    </div>
                    <div class="dao-weight" v-if="vote.votetype === 'combined'">
                      {{ Math.round((vote.token1Weight || 0.6) * 100) }}%
                    </div>
                  </div>
                  
                  <div 
                    v-if="vote.votetype !== 'token-2'" 
                    class="dao-voting-details"
                  >
                    <!-- Quorum Progress Bar -->
                    <div class="quorum-section">
                      <div class="quorum-bar-label">
                        <span>Quorum Progress</span>
                        <span>{{ getToken1TotalVotes(vote) }} / {{ getToken1Quorum(vote) }} ({{ getToken1QuorumPercentage(vote) }}%)</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar quorum-bar">
                          <div 
                            class="progress-fill quorum-votes" 
                            :class="`quorum-${vote.votetype}`"
                            :style="{ width: getToken1QuorumPercentage(vote) + '%' }"
                          ></div>
                        </div>
                        <!-- Quorum threshold line at 100% -->
                        <div class="threshold-line" style="left: 100%">
                          <div class="threshold-marker"></div>
                          <span class="threshold-label">Required</span>
                        </div>
                      </div>
                    </div>

                    <!-- Vote Summary Row -->
                    <div class="vote-summary-row">
                      <div class="summary-item">
                        <span class="summary-label">Yes:</span>
                        <span class="summary-value">{{ getToken1Results(vote).yesVotes }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">No:</span>
                        <span class="summary-value">{{ getToken1Results(vote).noVotes }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Undecided:</span>
                        <span class="summary-value">{{ getToken1Undecided(vote) }}</span>
                      </div>
                    </div>

                    <!-- User Token Status -->
                    <div class="user-token-status">
                      <div class="token-status-item">
                        <span class="status-label">Voted:</span>
                        <span class="status-value">{{ getUserToken1Voted() }} CCC</span>
                      </div>
                      <div class="token-status-item">
                        <span class="status-label">Unvoted:</span>
                        <span class="status-value">{{ getUserToken1Unvoted() }} CCC</span>
                      </div>
                    </div>

                    <!-- Yes/No Progress Bars -->
                    <div class="dao-progress">
                      <!-- Yes Votes Bar -->
                      <div class="dao-vote-bar">
                        <div class="dao-vote-bar-label">
                          <span>Yes: {{ getToken1Results(vote).yesVotes }}</span>
                          <span>{{ getToken1YesPercentage(vote) }}%</span>
                        </div>
                        <div class="progress-bar-container">
                          <div class="progress-bar">
                            <div 
                              class="progress-fill yes-votes" 
                              :style="{ width: getToken1YesPercentage(vote) + '%' }"
                            ></div>
                          </div>
                          <!-- Threshold line at 50% -->
                          <div class="threshold-line" style="left: 50%">
                            <div class="threshold-marker"></div>
                            <span class="threshold-label">50%</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- No Votes Bar -->
                      <div class="dao-vote-bar">
                        <div class="dao-vote-bar-label">
                          <span>No: {{ getToken1Results(vote).noVotes }}</span>
                          <span>{{ getToken1NoPercentage(vote) }}%</span>
                        </div>
                        <div class="progress-bar-container">
                          <div class="progress-bar">
                            <div 
                              class="progress-fill no-votes" 
                              :style="{ width: getToken1NoPercentage(vote) + '%' }"
                            ></div>
                          </div>
                          <!-- Threshold line at 50% -->
                          <div class="threshold-line" style="left: 50%">
                            <div class="threshold-marker"></div>
                            <span class="threshold-label">50%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Voting Buttons -->
                    <div class="voting-buttons" v-if="vote.status === 'active' && getUserToken1Unvoted() > 0">
                      <button 
                        class="vote-button vote-yes"
                        @click="handleVote(vote, 'token-1', 'yes')"
                        :disabled="isVoting"
                      >
                        <Icon icon="mdi:thumb-up" class="vote-icon" />
                        Vote Yes
                      </button>
                      <button 
                        class="vote-button vote-no"
                        @click="handleVote(vote, 'token-1', 'no')"
                        :disabled="isVoting"
                      >
                        <Icon icon="mdi:thumb-down" class="vote-icon" />
                        Vote No
                      </button>
                    </div>
                  </div>

                  <div v-else class="dao-inactive-message">
                    <Icon icon="mdi:lock" class="inactive-icon" />
                    <span>Not participating in this vote</span>
                  </div>
                </BaseCard>

                <!-- Token 2 DAO Card -->
                <BaseCard 
                  variant="secondary" 
                  size="md"
                  class="token-dao-card"
                  :class="{ 'dao-inactive': vote.votetype === 'token-1' }"
                >
                  <div class="dao-card-header">
                    <Icon icon="mdi:diamond-stone" class="token-icon" />
                    <div class="dao-info">
                      <h4 class="dao-name">{{ daoSettings?.daoStructure?.token2DAO?.name || 'Token 2 DAO' }}</h4>
                      <p class="dao-symbol">{{ daoSettings?.daoStructure?.token2DAO?.tokenSymbol || 'CGM' }}</p>
                    </div>
                    <div class="dao-weight" v-if="vote.votetype === 'combined'">
                      {{ Math.round((vote.token2Weight || 0.4) * 100) }}%
                    </div>
                  </div>
                  
                  <div 
                    v-if="vote.votetype !== 'token-1'" 
                    class="dao-voting-details"
                  >
                    <!-- Quorum Progress Bar -->
                    <div class="quorum-section">
                      <div class="quorum-bar-label">
                        <span>Quorum Progress</span>
                        <span>{{ getToken2TotalVotes(vote) }} / {{ getToken2Quorum(vote) }} ({{ getToken2QuorumPercentage(vote) }}%)</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar quorum-bar">
                          <div 
                            class="progress-fill quorum-votes" 
                            :class="`quorum-${vote.votetype}`"
                            :style="{ width: getToken2QuorumPercentage(vote) + '%' }"
                          ></div>
                        </div>
                        <!-- Quorum threshold line at 100% -->
                        <div class="threshold-line" style="left: 100%">
                          <div class="threshold-marker"></div>
                          <span class="threshold-label">Required</span>
                        </div>
                      </div>
                    </div>

                    <!-- Vote Summary Row -->
                    <div class="vote-summary-row">
                      <div class="summary-item">
                        <span class="summary-label">Yes:</span>
                        <span class="summary-value">{{ getToken2Results(vote).yesVotes }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">No:</span>
                        <span class="summary-value">{{ getToken2Results(vote).noVotes }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Undecided:</span>
                        <span class="summary-value">{{ getToken2Undecided(vote) }}</span>
                      </div>
                    </div>

                    <!-- User Token Status -->
                    <div class="user-token-status">
                      <div class="token-status-item">
                        <span class="status-label">Voted:</span>
                        <span class="status-value">{{ getUserToken2Voted() }} CGM</span>
                      </div>
                      <div class="token-status-item">
                        <span class="status-label">Unvoted:</span>
                        <span class="status-value">{{ getUserToken2Unvoted() }} CGM</span>
                      </div>
                    </div>

                    <!-- Yes/No Progress Bars -->
                    <div class="dao-progress">
                      <!-- Yes Votes Bar -->
                      <div class="dao-vote-bar">
                        <div class="dao-vote-bar-label">
                          <span>Yes: {{ getToken2Results(vote).yesVotes }}</span>
                          <span>{{ getToken2YesPercentage(vote) }}%</span>
                        </div>
                        <div class="progress-bar-container">
                          <div class="progress-bar">
                            <div 
                              class="progress-fill yes-votes" 
                              :style="{ width: getToken2YesPercentage(vote) + '%' }"
                            ></div>
                          </div>
                          <!-- Threshold line at 50% -->
                          <div class="threshold-line" style="left: 50%">
                            <div class="threshold-marker"></div>
                            <span class="threshold-label">50%</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- No Votes Bar -->
                      <div class="dao-vote-bar">
                        <div class="dao-vote-bar-label">
                          <span>No: {{ getToken2Results(vote).noVotes }}</span>
                          <span>{{ getToken2NoPercentage(vote) }}%</span>
                        </div>
                        <div class="progress-bar-container">
                          <div class="progress-bar">
                            <div 
                              class="progress-fill no-votes" 
                              :style="{ width: getToken2NoPercentage(vote) + '%' }"
                            ></div>
                          </div>
                          <!-- Threshold line at 50% -->
                          <div class="threshold-line" style="left: 50%">
                            <div class="threshold-marker"></div>
                            <span class="threshold-label">50%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Voting Buttons -->
                    <div class="voting-buttons" v-if="vote.status === 'active' && getUserToken2Unvoted() > 0">
                      <button 
                        class="vote-button vote-yes"
                        @click="handleVote(vote, 'token-2', 'yes')"
                        :disabled="isVoting"
                      >
                        <Icon icon="mdi:thumb-up" class="vote-icon" />
                        Vote Yes
                      </button>
                      <button 
                        class="vote-button vote-no"
                        @click="handleVote(vote, 'token-2', 'no')"
                        :disabled="isVoting"
                      >
                        <Icon icon="mdi:thumb-down" class="vote-icon" />
                        Vote No
                      </button>
                    </div>
                  </div>

                  <div v-else class="dao-inactive-message">
                    <Icon icon="mdi:lock" class="inactive-icon" />
                    <span>Not participating in this vote</span>
                  </div>
                </BaseCard>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredVotes.length === 0" class="empty-state">
          <Icon icon="mdi:vote-outline" class="empty-icon" />
          <h3 class="empty-title">No {{ currentFilter.toLowerCase() }} votes found</h3>
          <p class="empty-description">
            There are currently no votes with the "{{ currentFilter.toLowerCase() }}" status.
          </p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard } from '@/components/base'
import BaseSidebar from '@/components/base/BaseSidebar.vue'
import { useSkinTheme } from '@/composables/useSkinTheme'

// Types
interface Vote {
  voteID: string
  daoID: string
  votetype: 'combined' | 'token-1' | 'token-2'
  guildID: string
  title: string
  description: string
  proposer: string
  status: 'active' | 'completed' | 'cancelled'
  votingStarts: string
  votingEnds: string
  completedAt?: string
  result?: 'passed' | 'rejected' | 'cancelled'
  quorum: number
  currentVotes: number
  yesVotes: number
  noVotes: number
  abstainVotes: number
  voters: string[]
  isActive: boolean
  cancellationReason?: string
  token1Weight?: number
  token2Weight?: number
  token1Results?: {
    yesVotes: number
    noVotes: number
    abstainVotes: number
  }
  token2Results?: {
    yesVotes: number
    noVotes: number
    abstainVotes: number
  }
}

interface DAOSettings {
  guildID: string
  guildName: string
  daoStructure: {
    token1DAO: {
      daoID: string
      name: string
      tokenSymbol: string
      quorum?: number
      proposalThreshold?: number
      weightInCombinedVotes: number
      circulatingSupply?: number
    }
    token2DAO: {
      daoID: string
      name: string
      tokenSymbol: string
      quorum?: number
      proposalThreshold?: number
      weightInCombinedVotes: number
      circulatingSupply?: number
    }
    combinedDAO: {
      daoID: string
      name: string
      quorum?: number
      proposalThreshold?: number
    }
  }
  votingStatistics: {
    totalProposals: number
    activeProposals: number
    completedProposals: number
    cancelledProposals: number
    participationRate: number
  }
}

// Composables
const { getPrimaryColor, getSecondaryColor, getTextColor, getBorderRadius } = useSkinTheme()

// State
const votes = ref<Vote[]>([])
const daoSettings = ref<DAOSettings | null>(null)
const currentFilter = ref<string>('All')
const expandedVote = ref<string | null>(null)
const showToken1 = ref<boolean>(true)
const showToken2 = ref<boolean>(true)
const isVoting = ref<boolean>(false)

// Mock user token balances (in real app, would come from wallet/API)
const userToken1Balance = ref<number>(1500) // CCC tokens
const userToken2Balance = ref<number>(250)  // CGM tokens
const userToken1Voted = ref<number>(500)    // Already voted CCC tokens
const userToken2Voted = ref<number>(100)    // Already voted CGM tokens

// Sidebar items for status filtering
const sidebarItems = computed(() => [
  {
    id: 'all',
    icon: 'mdi:format-list-bulleted',
    title: 'All',
    active: currentFilter.value === 'All'
  },
  {
    id: 'active',
    icon: 'mdi:clock-outline',
    title: 'Active',
    active: currentFilter.value === 'Active'
  },
  {
    id: 'completed',
    icon: 'mdi:check-circle',
    title: 'Completed',
    active: currentFilter.value === 'Completed'
  },
  {
    id: 'cancelled',
    icon: 'mdi:cancel',
    title: 'Cancelled',
    active: currentFilter.value === 'Cancelled'
  }
])

// Computed
const votingStats = computed(() => {
  return daoSettings.value?.votingStatistics || {
    totalProposals: votes.value.length,
    activeProposals: votes.value.filter(v => v.status === 'active').length,
    completedProposals: votes.value.filter(v => v.status === 'completed').length,
    cancelledProposals: votes.value.filter(v => v.status === 'cancelled').length,
    participationRate: 0.75
  }
})

const filteredVotes = computed(() => {
  let filtered = votes.value

  // Apply status filter
  if (currentFilter.value !== 'All') {
    filtered = filtered.filter(vote => 
      vote.status.toLowerCase() === currentFilter.value.toLowerCase()
    )
  }

  // Apply token filter
  if (!showToken1.value || !showToken2.value) {
    filtered = filtered.filter(vote => {
      if (!showToken1.value && !showToken2.value) {
        // If both are off, show nothing
        return false
      } else if (!showToken1.value) {
        // Token 1 off: show token-2 and combined votes
        return vote.votetype === 'token-2' || vote.votetype === 'combined'
      } else if (!showToken2.value) {
        // Token 2 off: show token-1 and combined votes
        return vote.votetype === 'token-1' || vote.votetype === 'combined'
      }
      return true
    })
  }

  return filtered
})

// Get secondary color 3 (index 2) for active state - same as sidebar
const getSecondaryColor3 = () => getSecondaryColor(2)

// Computed styles for token filter buttons
const tokenFilterStyles = computed(() => ({
  '--primary-color-0': getPrimaryColor(0),
  '--primary-color-1': getPrimaryColor(1),
  '--primary-color-2': getPrimaryColor(2),
  '--secondary-color-0': getSecondaryColor(0),
  '--secondary-color-1': getSecondaryColor(1),
  '--secondary-color-2': getSecondaryColor(2),
  '--secondary-color-3': getSecondaryColor3(),
  '--text-color-0': getTextColor(0),
  '--text-color-1': getTextColor(1),
  '--text-color-2': getTextColor(2),
  '--border-radius-sm': getBorderRadius('sm'),
  '--border-radius-md': getBorderRadius('md'),
  '--border-radius-lg': getBorderRadius('lg'),
  '--border-radius-xl': getBorderRadius('xl')
}))

// Methods
const loadVotes = async () => {
  try {
    const voteFiles = [
      'g1_vote_001_token1.json',
      'g1_vote_002_token2.json', 
      'g1_vote_003_totalvote.json',
      'g1_vote_004_token1.json',
      'g1_vote_005_totalvote.json',
      'g1_vote_006_token1.json',
      'g1_vote_007_token2.json',
      'g1_vote_008_combined.json',
      'g1_vote_009_token1.json',
      'g1_vote_010_token2.json',
      'g1_vote_011_combined.json',
      'g1_vote_012_token1.json',
      'g1_vote_013_combined.json'
    ]

    const votePromises = voteFiles.map(async (filename) => {
      try {
        const response = await fetch(`/SLP/vote/${filename}`)
        if (response.ok) {
          return await response.json()
        }
      } catch (error) {
        console.error(`Error loading ${filename}:`, error)
      }
      return null
    })

    const loadedVotes = await Promise.all(votePromises)
    votes.value = loadedVotes.filter(vote => vote !== null)
    
    // Sort by voting start date (newest first)
    votes.value.sort((a, b) => new Date(b.votingStarts).getTime() - new Date(a.votingStarts).getTime())
  } catch (error) {
    console.error('Error loading votes:', error)
  }
}

const loadDAOSettings = async () => {
  try {
    const response = await fetch('/SLP/dao/guild-1_dao_summary.json')
    if (response.ok) {
      daoSettings.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading DAO settings:', error)
  }
}

const handleStatusFilter = (item: any) => {
  currentFilter.value = item.title
  expandedVote.value = null // Close any expanded vote when filtering
}

const toggleVoteExpansion = (voteID: string) => {
  expandedVote.value = expandedVote.value === voteID ? null : voteID
}

const toggleToken1Filter = () => {
  showToken1.value = !showToken1.value
  expandedVote.value = null // Close any expanded vote when filtering
}

const toggleToken2Filter = () => {
  showToken2.value = !showToken2.value
  expandedVote.value = null // Close any expanded vote when filtering
}

const getFilterTitle = () => {
  return currentFilter.value === 'All' ? 'All Votes' : `${currentFilter.value} Votes`
}

const getVoteTypeLabel = (votetype: string) => {
  switch (votetype) {
    case 'combined': return 'Combined'
    case 'token-1': return 'CCC Only'
    case 'token-2': return 'CGM Only'
    default: return votetype
  }
}

const getResultLabel = (vote: Vote) => {
  if (vote.status === 'active') return 'Pending'
  if (vote.status === 'cancelled') return 'Cancelled'
  return vote.result || 'Unknown'
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start).toLocaleDateString()
  const endDate = new Date(end).toLocaleDateString()
  return `${startDate} - ${endDate}`
}

const getVotePercentage = (votes: number, total: number) => {
  if (total === 0) return 0
  return Math.round((votes / total) * 100)
}

const getThresholdPercentage = (vote: Vote) => {
  // Based on DAO settings: combined = 60%, individual = 50%
  return vote.votetype === 'combined' ? 60 : 50
}

const getToken1Results = (vote: Vote) => {
  if (vote.votetype === 'combined' && vote.token1Results) {
    return vote.token1Results
  }
  if (vote.votetype === 'token-1') {
    return {
      yesVotes: vote.yesVotes,
      noVotes: vote.noVotes,
      abstainVotes: vote.abstainVotes
    }
  }
  return { yesVotes: 0, noVotes: 0, abstainVotes: 0 }
}

const getToken2Results = (vote: Vote) => {
  if (vote.votetype === 'combined' && vote.token2Results) {
    return vote.token2Results
  }
  if (vote.votetype === 'token-2') {
    return {
      yesVotes: vote.yesVotes,
      noVotes: vote.noVotes,
      abstainVotes: vote.abstainVotes
    }
  }
  return { yesVotes: 0, noVotes: 0, abstainVotes: 0 }
}

const getToken1YesPercentage = (vote: Vote) => {
  const results = getToken1Results(vote)
  const total = results.yesVotes + results.noVotes + results.abstainVotes
  return getVotePercentage(results.yesVotes, total)
}

const getToken1NoPercentage = (vote: Vote) => {
  const results = getToken1Results(vote)
  const total = results.yesVotes + results.noVotes + results.abstainVotes
  return getVotePercentage(results.noVotes, total)
}

const getToken2YesPercentage = (vote: Vote) => {
  const results = getToken2Results(vote)
  const total = results.yesVotes + results.noVotes + results.abstainVotes
  return getVotePercentage(results.yesVotes, total)
}

const getToken2NoPercentage = (vote: Vote) => {
  const results = getToken2Results(vote)
  const total = results.yesVotes + results.noVotes + results.abstainVotes
  return getVotePercentage(results.noVotes, total)
}

// Quorum calculation methods
const getToken1Quorum = (vote: Vote) => {
  // Each DAO has its own quorum requirement from DAO settings
  const token1DAO = daoSettings.value?.daoStructure?.token1DAO
  const quorumPercentage = token1DAO?.quorum || 0.4 // 40% default
  const circulatingSupply = token1DAO?.circulatingSupply || 750000 // fallback
  return Math.round(quorumPercentage * circulatingSupply)
}

const getToken2Quorum = (vote: Vote) => {
  // Token2 DAO: 40% of circulating supply
  const token2DAO = daoSettings.value?.daoStructure?.token2DAO
  const quorumPercentage = token2DAO?.quorum || 0.4 // 40% default
  const circulatingSupply = token2DAO?.circulatingSupply || 75000 // fallback
  return Math.round(quorumPercentage * circulatingSupply)
}

const getToken1TotalVotes = (vote: Vote) => {
  const results = getToken1Results(vote)
  return results.yesVotes + results.noVotes + results.abstainVotes
}

const getToken2TotalVotes = (vote: Vote) => {
  const results = getToken2Results(vote)
  return results.yesVotes + results.noVotes + results.abstainVotes
}

const getToken1QuorumPercentage = (vote: Vote) => {
  const total = getToken1TotalVotes(vote)
  const quorum = getToken1Quorum(vote)
  return Math.min(100, Math.round((total / quorum) * 100))
}

const getToken2QuorumPercentage = (vote: Vote) => {
  const total = getToken2TotalVotes(vote)
  const quorum = getToken2Quorum(vote)
  return Math.min(100, Math.round((total / quorum) * 100))
}

const getToken1Undecided = (vote: Vote) => {
  const quorum = getToken1Quorum(vote)
  const totalVotes = getToken1TotalVotes(vote)
  return Math.max(0, quorum - totalVotes)
}

const getToken2Undecided = (vote: Vote) => {
  const quorum = getToken2Quorum(vote)
  const totalVotes = getToken2TotalVotes(vote)
  return Math.max(0, quorum - totalVotes)
}

// User token status methods
const getUserToken1Voted = () => {
  return userToken1Voted.value
}

const getUserToken1Unvoted = () => {
  return userToken1Balance.value - userToken1Voted.value
}

const getUserToken2Voted = () => {
  return userToken2Voted.value
}

const getUserToken2Unvoted = () => {
  return userToken2Balance.value - userToken2Voted.value
}

// Voting handler
const handleVote = async (vote: Vote, tokenType: 'token-1' | 'token-2', voteChoice: 'yes' | 'no') => {
  if (isVoting.value) return
  
  isVoting.value = true
  
  try {
    // In a real app, this would call an API to submit the vote
    console.log(`Voting ${voteChoice} on ${vote.voteID} with ${tokenType}`)
    
    // Mock voting delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo purposes, just show an alert
    const tokenSymbol = tokenType === 'token-1' ? 'CCC' : 'CGM'
    const unvoted = tokenType === 'token-1' ? getUserToken1Unvoted() : getUserToken2Unvoted()
    
    alert(`Successfully voted ${voteChoice.toUpperCase()} with ${unvoted} ${tokenSymbol} tokens on "${vote.title}"`)
    
    // Update voted amounts (in real app, this would come from the API response)
    if (tokenType === 'token-1') {
      userToken1Voted.value = userToken1Balance.value
    } else {
      userToken2Voted.value = userToken2Balance.value
    }
    
  } catch (error) {
    console.error('Error voting:', error)
    alert('Failed to submit vote. Please try again.')
  } finally {
    isVoting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadVotes()
  loadDAOSettings()
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.dao-voting-page {
  display: flex;
  min-height: 100vh;
  background: var(--theme-background);
  position: relative;
}

.main-content {
  flex: 1;
  margin-left: 6.25rem;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-height: 100%;
  overflow-y: visible;
}

/* DAO Header Card */
.dao-voting-header-card {
  width: 90%;
  margin: 0 auto;
}

.dao-header {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

.dao-icon {
  flex-shrink: 0;
  width: var(--space-3xl);
  height: var(--space-3xl);
  border-radius: var(--border-radius-lg);
  background: var(--secondary-color-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--component-border-width-thick) solid var(--secondary-color-0);
}

.header-icon {
  font-size: var(--text-4xl);
  color: var(--secondary-color-0);
}

.dao-details {
  flex: 1;
}

.dao-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-color-0);
  margin-bottom: var(--space-sm);
}

.dao-description {
  font-size: var(--text-base);
  color: var(--text-color-1);
  margin-bottom: var(--space-lg);
  line-height: var(--leading-relaxed);
}

.dao-stats {
  display: flex;
  gap: var(--space-xl);
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.stat-value {
  font-size: var(--text-lg);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* Token Filter Container */
.token-filter-container {
  width: 90%;
  margin: 0 auto;
  display: flex;
  gap: 10%;
  margin-bottom: var(--space-lg);
}

.token-filter-button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--primary-color-0, #f8f9fa);
  border: var(--border-width-thin) solid var(--secondary-color-2, #e9ecef);
  border-radius: var(--border-radius-lg, 12px);
  cursor: pointer;
  transition: all var(--transition-normal, 0.2s ease);
  text-align: left;
  position: relative;
  min-height: 4rem;
}

.token-filter-button:hover {
  background: var(--primary-color-1, #e9ecef);
  border-color: var(--secondary-color-1, #6c757d);
  transform: translateY(-0.0625rem);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.token-filter-button.active {
  background: var(--secondary-color-3, #0d6efd);
  border-color: var(--secondary-color-0, #495057);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.token-filter-button.active .token-button-icon {
  color: var(--secondary-color-0);
}

.token-filter-button.active .token-button-title {
  color: var(--secondary-color-0);
  font-weight: var(--font-semibold);
}

.token-filter-button.active .token-button-subtitle {
  color: var(--secondary-color-1);
}

.token-button-icon {
  font-size: 2rem;
  color: var(--text-color-1, #6c757d);
  transition: color var(--transition-normal, 0.2s ease);
  flex-shrink: 0;
}

.token-button-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.token-button-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color-0, #212529);
  transition: all var(--transition-normal, 0.2s ease);
}

.token-button-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-2, #6c757d);
  line-height: 1.25;
  transition: color var(--transition-normal, 0.2s ease);
}

/* Voting List Card */
.voting-list-card {
  width: 90%;
  margin: 0 auto;
}

.voting-list-header {
  margin-bottom: var(--space-lg);
}

.list-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
}

.vote-count {
  color: var(--text-color-2);
  font-weight: var(--font-normal);
}

/* Vote Items */
.votes-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.vote-item {
  border: var(--component-border-width) solid var(--secondary-color-2);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background: var(--primary-color-0);
  transition: all var(--transition-normal);
}

.vote-item:hover {
  border-color: var(--secondary-color-1);
  box-shadow: var(--shadow-sm);
}

.vote-expanded {
  border-color: var(--secondary-color-0);
  box-shadow: var(--shadow-md);
}

.vote-main-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.vote-main-row:hover {
  background: var(--primary-color-1);
}

.vote-info {
  flex: 2;
  min-width: 0;
}

.vote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-sm);
  gap: var(--space-md);
}

.vote-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin-bottom: var(--space-xs);
  line-height: var(--leading-tight);
  transition: color var(--transition-normal);
}

/* Vote title colors matching badge colors */
.vote-title.title-combined {
  color: var(--secondary-color-0);
}

.vote-title.title-token-1 {
  color: rgb(59, 130, 246);
}

.vote-title.title-token-2 {
  color: rgb(168, 85, 247);
}

.vote-badges {
  display: flex;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.vote-type-badge, .vote-status-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-combined {
  background: var(--secondary-color-2);
  color: var(--secondary-color-0);
}

.badge-token-1 {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.badge-token-2 {
  background: rgba(168, 85, 247, 0.1);
  color: rgb(168, 85, 247);
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-completed {
  background: rgba(156, 163, 175, 0.1);
  color: rgb(156, 163, 175);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.vote-description {
  font-size: var(--text-sm);
  color: var(--text-color-1);
  margin-bottom: var(--space-md);
  line-height: var(--leading-relaxed);
}

.vote-meta {
  display: flex;
  gap: var(--space-lg);
  font-size: var(--text-xs);
  color: var(--text-color-2);
}

.vote-proposer, .vote-dates {
  font-weight: var(--font-medium);
}

/* Vote Results Summary */
.vote-results-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--theme-background);
  border-radius: var(--border-radius-md);
  border: var(--component-border-width) solid var(--secondary-color-2);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.result-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
}

.result-passed {
  color: rgb(34, 197, 94);
}

.result-rejected {
  color: rgb(239, 68, 68);
}

.result-cancelled {
  color: rgb(156, 163, 175);
}

.result-pending {
  color: rgb(59, 130, 246);
}

.result-progress {
  margin-top: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* Individual Vote Bars */
.vote-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.vote-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.vote-bar-label span:first-child {
  color: var(--text-color-1);
}

.vote-bar-label span:last-child {
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

.progress-bar-container {
  position: relative;
}

.progress-bar {
  height: 0.5rem;
  background: var(--primary-color-1);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  display: flex;
  position: relative;
}

.threshold-line {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  pointer-events: none;
  z-index: 2;
}

.threshold-marker {
  width: 2px;
  height: 100%;
  background: var(--text-color-0);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.threshold-label {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-color-0);
  background: var(--primary-color-0);
  padding: 0.125rem 0.25rem;
  border-radius: var(--border-radius-sm);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  white-space: nowrap;
}

.progress-fill {
  height: 100%;
  transition: width var(--transition-normal);
}

.yes-votes {
  background: rgb(34, 197, 94);
}

.no-votes {
  background: rgb(239, 68, 68);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-color-2);
}

.yes-label {
  color: rgb(34, 197, 94);
}

.no-label {
  color: rgb(239, 68, 68);
}

/* Vote Expansion Icon */
.vote-expand-icon {
  flex-shrink: 0;
  padding: var(--space-sm);
}

.expand-icon {
  font-size: var(--text-xl);
  color: var(--text-color-2);
  transition: color var(--transition-fast);
}

.vote-main-row:hover .expand-icon {
  color: var(--text-color-0);
}

/* Vote Expansion Area */
.vote-expansion {
  border-top: var(--component-border-width) solid var(--secondary-color-2);
  padding: var(--space-lg);
  background: var(--theme-background);
}

.tiered-voting-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
}

/* Token DAO Cards */
.token-dao-card {
  background: var(--primary-color-0);
  border: var(--component-border-width) solid var(--secondary-color-2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dao-inactive {
  opacity: 0.3;
  background: var(--primary-color-1);
  border-color: var(--secondary-color-1);
  filter: grayscale(0.5);
}

.dao-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.token-icon {
  font-size: var(--text-xl);
  color: var(--secondary-color-0);
  flex-shrink: 0;
}

.dao-info {
  flex: 1;
}

.dao-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-color-0);
  margin-bottom: var(--space-xs);
}

.dao-symbol {
  font-size: var(--text-sm);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.dao-weight {
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

.dao-voting-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dao-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.dao-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dao-progress {
  margin-top: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* DAO Vote Bars */
.dao-vote-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.dao-vote-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.dao-vote-bar-label span:first-child {
  color: var(--text-color-1);
}

.dao-vote-bar-label span:last-child {
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* Quorum Section */
.quorum-section {
  margin-bottom: var(--space-md);
}

.quorum-bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-color-1);
}

.quorum-bar-label span:first-child {
  color: var(--text-color-0);
}

.progress-fill.quorum-votes {
  background: var(--secondary-color-0);
}

.progress-fill.quorum-combined {
  background: var(--secondary-color-0);
}

.progress-fill.quorum-token-1 {
  background: rgb(59, 130, 246);
}

.progress-fill.quorum-token-2 {
  background: rgb(168, 85, 247);
}

/* Vote Summary Row */
.vote-summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding: var(--space-sm) 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.summary-label {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.summary-value {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* User Token Status */
.user-token-status {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding: var(--space-sm) 0;
}

.token-status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.status-label {
  font-size: var(--text-xs);
  color: var(--text-color-2);
  font-weight: var(--font-medium);
}

.status-value {
  font-size: var(--text-sm);
  color: var(--text-color-0);
  font-weight: var(--font-semibold);
}

/* Voting Buttons */
.voting-buttons {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: var(--border-width-thin) solid var(--secondary-color-2);
}

.vote-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  background: var(--primary-color-0);
  color: var(--text-color-0);
}

.vote-button:hover:not(:disabled) {
  background: var(--primary-color-1);
  border-color: var(--secondary-color-1);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.vote-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.vote-icon {
  font-size: var(--text-base);
}

.vote-yes {
  color: rgb(34, 197, 94);
}

.vote-no {
  color: rgb(239, 68, 68);
}

.dao-inactive-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-color-2);
  font-size: var(--text-sm);
  font-style: italic;
}

.inactive-icon {
  font-size: var(--text-base);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  text-align: center;
}

.empty-icon {
  font-size: var(--text-6xl);
  color: var(--text-color-2);
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-color-1);
  margin-bottom: var(--space-sm);
}

.empty-description {
  font-size: var(--text-base);
  color: var(--text-color-2);
  max-width: 28rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 6.25rem;
  }
  
  .dao-stats {
    gap: var(--space-lg);
  }
  
  .tiered-voting-container {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 5rem;
    padding: var(--space-md);
  }
  
  .dao-voting-header-card,
  .voting-list-card {
    width: 100%;
  }
  
  .dao-header {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .dao-stats {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .token-filter-container {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .vote-main-row {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .vote-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .vote-badges {
    align-self: flex-start;
  }
  
  .vote-meta {
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .vote-summary-row,
  .user-token-status {
    justify-content: space-around;
  }
  
  .voting-buttons {
    flex-direction: column;
    gap: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .main-content {
    margin-left: 4.375rem;
    padding: var(--space-sm);
  }
  
  .vote-expansion {
    padding: var(--space-md);
  }
  
  .dao-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
}</style>
