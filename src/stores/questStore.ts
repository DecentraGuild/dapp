import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { QUEST_TABS, QUEST_ICONS, QUEST_TITLES, QUEST_DESCRIPTIONS, QUEST_FEATURES, QUEST_STATUS, QUEST_STATUS_ICONS, QUEST_STATUS_LABELS, QUEST_STATUS_COLORS } from '@/constants/quest'
import { loadMultipleSlpData } from '@/utils/api'
import type { Quest, QuestItem, QuestApplication, QuestVerification, QuestReward } from '@/constants/quest'

export const useQuestStore = defineStore('quest', () => {
  // State
  const currentTab = ref<string>(QUEST_TABS.SOLO)
  const quests = ref<Quest[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const isLoaded = ref<boolean>(false)

  // Available tabs configuration
  const availableTabs = computed(() => [
    {
      id: QUEST_TABS.SOLO,
      title: QUEST_TITLES.SOLO,
      icon: QUEST_ICONS.SOLO,
      description: QUEST_DESCRIPTIONS.SOLO,
      features: QUEST_FEATURES.SOLO,
      route: '/quest/solo'
    },
    {
      id: QUEST_TABS.GROUP,
      title: QUEST_TITLES.GROUP,
      icon: QUEST_ICONS.GROUP,
      description: QUEST_DESCRIPTIONS.GROUP,
      features: QUEST_FEATURES.GROUP,
      route: '/quest/group'
    },
    {
      id: QUEST_TABS.GUILD,
      title: QUEST_TITLES.GUILD,
      icon: QUEST_ICONS.GUILD,
      description: QUEST_DESCRIPTIONS.GUILD,
      features: QUEST_FEATURES.GUILD,
      route: '/quest/guild'
    }
  ])

  // Current tab info
  const currentTabInfo = computed(() => 
    availableTabs.value.find(tab => tab.id === currentTab.value)
  )

  // Filtered quests by current tab (lazy loads data)
  const filteredQuests = computed(() => {
    // Auto-load quests on first access
    if (!isLoaded.value && !loading.value) {
      loadQuests()
    }
    
    if (!currentTab.value) return []
    
    return quests.value.filter(quest => quest.type === currentTab.value)
  })

  // Quest items for display
  const questItems = computed((): QuestItem[] => {
    return filteredQuests.value.map(quest => ({
      id: quest.questID,
      icon: getQuestIcon(quest),
      title: quest.title,
      subtitle: quest.status.toUpperCase(),
      value: `${quest.amountToken1 || 0} tokens`,
      description: quest.description,
      questData: quest
    }))
  })

  // Quest statistics
  const questStats = computed(() => {
    const newQuests = filteredQuests.value.filter(q => q.status === QUEST_STATUS.NEW).length
    const pending = filteredQuests.value.filter(q => q.status === QUEST_STATUS.PENDING).length
    const assigned = filteredQuests.value.filter(q => q.status === QUEST_STATUS.ASSIGNED).length
    const delivered = filteredQuests.value.filter(q => q.status === QUEST_STATUS.DELIVERED).length
    const rewarded = filteredQuests.value.filter(q => q.status === QUEST_STATUS.REWARDED).length
    const completed = filteredQuests.value.filter(q => q.status === QUEST_STATUS.COMPLETED).length

    return {
      total: filteredQuests.value.length,
      new: newQuests,
      pending,
      assigned,
      delivered,
      rewarded,
      completed
    }
  })

  // Status filtering
  const statusFilter = ref<string>('all')
  const questsByStatus = computed(() => {
    if (statusFilter.value === 'all') {
      return filteredQuests.value
    }
    return filteredQuests.value.filter(quest => quest.status === statusFilter.value)
  })

  // Actions
  const setCurrentTab = (tabId: string) => {
    currentTab.value = tabId
    // Reset status filter to 'new' when switching tabs
    statusFilter.value = 'new'
  }

  // Local storage keys
  const STORAGE_KEYS = {
    TUTORIAL_QUEST_STATUS: 'dguild_tutorial_quest_status'
  }

  // Save tutorial quest status to localStorage
  const saveTutorialQuestStatus = (questId: string, quest: Quest) => {
    try {
      const savedStatus = localStorage.getItem(STORAGE_KEYS.TUTORIAL_QUEST_STATUS)
      const tutorialStatus = savedStatus ? JSON.parse(savedStatus) : {}
      
      tutorialStatus[questId] = {
        status: quest.status,
        assignedTo: quest.assignedTo,
        phase: quest.phase,
        applications: quest.applications,
        verification: quest.verification,
        rewards: quest.rewards,
        completedAt: quest.completedAt
      }
      
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_QUEST_STATUS, JSON.stringify(tutorialStatus))
    } catch (err) {
      console.error('Failed to save tutorial quest status:', err)
    }
  }

  // Load tutorial quest status from localStorage
  const loadTutorialQuestStatus = () => {
    try {
      const savedStatus = localStorage.getItem(STORAGE_KEYS.TUTORIAL_QUEST_STATUS)
      return savedStatus ? JSON.parse(savedStatus) : {}
    } catch (err) {
      console.warn('Failed to load tutorial quest status:', err)
      return {}
    }
  }

  // Clear tutorial quest status from localStorage
  const clearTutorialQuestStatus = () => {
    localStorage.removeItem(STORAGE_KEYS.TUTORIAL_QUEST_STATUS)
  }

  const loadQuests = async () => {
    loading.value = true
    error.value = null

    try {
      // Load quest files from SLP directory in parallel
      const questFiles = [
        'g1_q_tutorial_solo.json',
        'g1_q_tutorial_guild.json',
        'g1_q_tutorial_group.json',
        'g1_q0001_ingame.json',
        'g1_q0002_ingame.json',
        'g1_q0003_ingame.json',
        'g1_q0004_ingame.json',
        'g1_q0005_ingame.json',
        'g1_q0006_ingame.json',
        'g1_q0007_guild.json',
        'g1_q0008_guild.json',
        'g1_q0009_guild.json',
        'g1_q0010_ingame.json',
        'g1_q0011_ingame.json',
        'g1_q0012_guild.json',
        'g1_q0013_guild.json'
      ]

      // Load all quests in parallel using loadMultipleSlpData
      const loadedQuests = await loadMultipleSlpData<Quest>(
        questFiles.map(file => `quests/${file}`)
      )

      // Transform quest data to ensure questID is properly mapped from qid
      const transformedQuests = loadedQuests.map(quest => ({
        ...quest,
        questID: (quest as any).qid || quest.questID, // Map qid to questID
        guildID: (quest as any).gid || quest.guildID  // Map gid to guildID
      }))

      // Load tutorial quest status from localStorage
      const tutorialQuestStatus = loadTutorialQuestStatus()
      
      // Apply saved tutorial quest status to loaded quests
      transformedQuests.forEach(quest => {
        const tutorialQuestIds = ['g1_q_tutorial', 'g1_q_tutorial_guild', 'g1_q_tutorial_group']
        if (tutorialQuestIds.includes(quest.questID) && tutorialQuestStatus[quest.questID]) {
          const savedStatus = tutorialQuestStatus[quest.questID]
          quest.status = savedStatus.status || quest.status
          quest.assignedTo = savedStatus.assignedTo || quest.assignedTo
          quest.phase = savedStatus.phase || quest.phase
          quest.applications = savedStatus.applications || quest.applications
          quest.verification = savedStatus.verification || quest.verification
          quest.rewards = savedStatus.rewards || quest.rewards
          quest.completedAt = savedStatus.completedAt || quest.completedAt
        }
      })

      quests.value = transformedQuests
      isLoaded.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load quests'
      // Handle error silently in production
      // Could implement proper error handling/notification system here
    } finally {
      loading.value = false
    }
  }

  const getQuestById = (questId: string): Quest | undefined => {
    return quests.value.find(quest => quest.questID === questId)
  }

  const getQuestsByStatus = (status: string): Quest[] => {
    return filteredQuests.value.filter(quest => quest.status === status)
  }

  const getQuestsByGuild = (guildId: string): Quest[] => {
    return quests.value.filter(quest => quest.guildID === guildId)
  }

  const setStatusFilter = (status: string) => {
    statusFilter.value = status
  }

  // Quest workflow methods
  const applyToQuest = (questId: string, memberId: string, memberName: string, message: string) => {
    const quest = quests.value.find(q => q.questID === questId)
    if (quest && quest.status === QUEST_STATUS.NEW) {
      if (!quest.applications) {
        quest.applications = []
      }
      quest.applications.push({
        memberID: memberId,
        memberName,
        appliedAt: new Date().toISOString(),
        message,
        status: 'pending'
      })
      quest.status = QUEST_STATUS.PENDING
      quest.phase = 'apply'
      
      // Save tutorial quest status if it's a tutorial quest
      const tutorialQuestIds = ['g1_q_tutorial', 'g1_q_tutorial_guild', 'g1_q_tutorial_group']
      if (tutorialQuestIds.includes(questId)) {
        saveTutorialQuestStatus(questId, quest)
      }
    }
  }

  const assignQuest = (questId: string, memberId: string, assignedBy: string) => {
    const quest = quests.value.find(q => q.questID === questId)
    if (quest && quest.status === QUEST_STATUS.PENDING) {
      quest.assignedTo = memberId
      quest.status = QUEST_STATUS.ASSIGNED
      quest.phase = 'assign'
      // Update application status
      if (quest.applications) {
        const application = quest.applications.find(app => app.memberID === memberId)
        if (application) {
          application.status = 'approved'
        }
      }
      
      // Save tutorial quest status if it's a tutorial quest
      const tutorialQuestIds = ['g1_q_tutorial', 'g1_q_tutorial_guild', 'g1_q_tutorial_group']
      if (tutorialQuestIds.includes(questId)) {
        saveTutorialQuestStatus(questId, quest)
      }
    }
  }

  const submitQuest = (questId: string, submittedBy: string) => {
    const quest = quests.value.find(q => q.questID === questId)
    if (quest && quest.status === QUEST_STATUS.ASSIGNED && quest.assignedTo === submittedBy) {
      quest.status = QUEST_STATUS.DELIVERED
      quest.phase = 'execute'
      
      // Save tutorial quest status if it's a tutorial quest
      const tutorialQuestIds = ['g1_q_tutorial', 'g1_q_tutorial_guild', 'g1_q_tutorial_group']
      if (tutorialQuestIds.includes(questId)) {
        saveTutorialQuestStatus(questId, quest)
      }
    }
  }

  const verifyQuest = (questId: string, verifiedBy: string, notes: string, quality: string, approved: boolean) => {
    const quest = quests.value.find(q => q.questID === questId)
    if (quest && quest.status === QUEST_STATUS.DELIVERED) {
      quest.verification = {
        verifiedBy,
        verifiedAt: new Date().toISOString(),
        notes,
        quality: quality as any,
        approved
      }
      quest.status = approved ? QUEST_STATUS.REWARDED : QUEST_STATUS.ASSIGNED
      quest.phase = approved ? 'reward' : 'execute'
      
      // Save tutorial quest status if it's a tutorial quest
      const tutorialQuestIds = ['g1_q_tutorial', 'g1_q_tutorial_guild', 'g1_q_tutorial_group']
      if (tutorialQuestIds.includes(questId)) {
        saveTutorialQuestStatus(questId, quest)
      }
    }
  }

  const rewardQuest = (questId: string, rewards: QuestReward[], rewardedBy: string) => {
    const quest = quests.value.find(q => q.questID === questId)
    if (quest && quest.status === QUEST_STATUS.REWARDED) {
      quest.rewards = rewards
      // For tutorial quest, keep it in REWARDED status so user can see it in rewarded category
      if (questId !== 'g1_q_tutorial' && questId !== 'g1_q_tutorial_guild' && questId !== 'g1_q_tutorial_group') {
        quest.status = QUEST_STATUS.COMPLETED
        quest.phase = 'complete'
        quest.completedAt = new Date().toISOString()
      }
      
      // Save tutorial quest status to localStorage
      const tutorialQuestIds = ['g1_q_tutorial', 'g1_q_tutorial_guild', 'g1_q_tutorial_group']
      if (tutorialQuestIds.includes(questId)) {
        saveTutorialQuestStatus(questId, quest)
      }
    }
  }

  // Helper function to get quest icon based on type and status
  const getQuestIcon = (quest: Quest): string => {
    if (quest.type === 'guild') {
      return QUEST_ICONS.GUILD
    } else if (quest.type === 'group') {
      return QUEST_ICONS.GROUP
    } else {
      return QUEST_ICONS.SOLO
    }
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string): string => {
    return QUEST_STATUS_ICONS[status.toUpperCase() as keyof typeof QUEST_STATUS_ICONS] || 'game-icons:question-mark'
  }

  // Helper function to get status label
  const getStatusLabel = (status: string): string => {
    return QUEST_STATUS_LABELS[status.toUpperCase() as keyof typeof QUEST_STATUS_LABELS] || status
  }

  // Helper function to get status color
  const getStatusColor = (status: string): string => {
    return QUEST_STATUS_COLORS[status.toUpperCase() as keyof typeof QUEST_STATUS_COLORS] || 'var(--text-color-1)'
  }

  // Tutorial quest specific methods
  const getTutorialQuest = (questId?: string): Quest | undefined => {
    if (questId) {
      return quests.value.find(quest => quest.questID === questId)
    }
    // Default to solo tutorial quest for backward compatibility
    return quests.value.find(quest => quest.questID === 'g1_q_tutorial')
  }

  const updateTutorialQuestStatus = (status: string) => {
    const tutorialQuest = getTutorialQuest()
    if (tutorialQuest) {
      tutorialQuest.status = status as any
      // Update phase based on status
      switch (status) {
        case QUEST_STATUS.PENDING:
          tutorialQuest.phase = 'apply'
          break
        case QUEST_STATUS.ASSIGNED:
          tutorialQuest.phase = 'assign'
          break
        case QUEST_STATUS.DELIVERED:
          tutorialQuest.phase = 'execute'
          break
        case QUEST_STATUS.REWARDED:
          tutorialQuest.phase = 'reward'
          break
        case QUEST_STATUS.COMPLETED:
          tutorialQuest.phase = 'complete'
          break
      }
      
      // Save tutorial quest status
      saveTutorialQuestStatus(tutorialQuest.questID, tutorialQuest)
    }
  }

  const assignTutorialQuest = (memberId: string, questId?: string) => {
    const tutorialQuest = getTutorialQuest(questId)
    // For tutorial quest, assign regardless of current status (NEW or PENDING)
    if (tutorialQuest && (tutorialQuest.status === QUEST_STATUS.NEW || tutorialQuest.status === QUEST_STATUS.PENDING)) {
      tutorialQuest.assignedTo = memberId
      tutorialQuest.status = QUEST_STATUS.ASSIGNED
      tutorialQuest.phase = 'assign'
      
      // Save tutorial quest status
      saveTutorialQuestStatus(tutorialQuest.questID, tutorialQuest)
      
      // Trigger tutorial state update
      import('./tutorialStore').then(({ useTutorialStore }) => {
        const tutorialStore = useTutorialStore()
        tutorialStore.updateTutorialQuestState('assign')
      })
    }
  }

  const resetTutorialQuest = () => {
    const tutorialQuest = getTutorialQuest()
    if (tutorialQuest) {
      tutorialQuest.status = QUEST_STATUS.NEW
      tutorialQuest.phase = 'create'
      tutorialQuest.assignedTo = undefined
      tutorialQuest.applications = []
      tutorialQuest.verification = undefined
      tutorialQuest.rewards = []
      tutorialQuest.completedAt = undefined
      
      // Save tutorial quest status
      saveTutorialQuestStatus(tutorialQuest.questID, tutorialQuest)
    }
  }

  const handleTutorialQuestAction = (action: string, memberId: string, questId?: string) => {
    // Get the specific tutorial quest (solo or guild)
    const tutorialQuest = getTutorialQuest(questId)
    if (!tutorialQuest) return

    // Import tutorial store to update tutorial state
    import('./tutorialStore').then(({ useTutorialStore }) => {
      const tutorialStore = useTutorialStore()
      
      switch (action) {
        case 'sign_up':
          // For tutorial, always process signup regardless of current status
          if (tutorialQuest.status === QUEST_STATUS.NEW || tutorialQuest.status === QUEST_STATUS.PENDING) {
            // If already pending, skip applyToQuest and go straight to assignment
            if (tutorialQuest.status === QUEST_STATUS.NEW) {
              applyToQuest(tutorialQuest.questID, memberId, 'Tutorial User', 'I want to learn the quest system!')
            }
            tutorialStore.updateTutorialQuestState('signup')
            // Auto-assign tutorial quest immediately
            assignTutorialQuest(memberId, questId)
            tutorialStore.updateTutorialQuestState('assign')
            
            // Start the appropriate tutorial
            if (tutorialQuest.questID === 'g1_q_tutorial_guild') {
              tutorialStore.startGuildQuestTutorial()
            } else if (tutorialQuest.questID === 'g1_q_tutorial_group') {
              tutorialStore.startGroupQuestTutorial()
            } else {
              tutorialStore.startQuestTutorial()
            }
            
            // Auto-advance from signup step to quest assigned step only if current step allows it
            setTimeout(() => {
              if (tutorialStore.currentStep?.autoAdvance !== false) {
                tutorialStore.nextStep()
              }
            }, 300)
          }
          break
        case 'deliver':
          if (tutorialQuest.status === QUEST_STATUS.ASSIGNED) {
            // Submit the quest
            submitQuest(tutorialQuest.questID, memberId)
            tutorialStore.updateTutorialQuestState('deliver')
            
            // Schedule verification and rewards in sequence
            setTimeout(() => {
              tutorialStore.nextStep()
              
              // Auto-verify after moving to next step
              setTimeout(() => {
                verifyQuest(tutorialQuest.questID, 'guild1_founder', 'Tutorial quest completed successfully!', 'excellent', true)
                tutorialStore.updateTutorialQuestState('verify')
                
                // Auto-advance to verified step
                setTimeout(() => {
                  tutorialStore.nextStep()
                  
                  // Auto-reward after moving to verified step
                  setTimeout(() => {
                    const isGuildTutorial = tutorialQuest.questID === 'g1_q_tutorial_guild'
                    const isGroupTutorial = tutorialQuest.questID === 'g1_q_tutorial_group'
                    const rewards: QuestReward[] = isGroupTutorial ? [
                      {
                        type: 'token' as const,
                        amount: 50,
                        tokenID: 'g1-token1',
                        distributedAt: new Date().toISOString(),
                        distributedBy: 'guild1_founder'
                      },
                      {
                        type: 'badge' as const,
                        badgeID: 'group_quest_master',
                        distributedAt: new Date().toISOString(),
                        distributedBy: 'guild1_founder'
                      }
                    ] : isGuildTutorial ? [
                      {
                        type: 'token' as const,
                        amount: 2,
                        tokenID: 'g1-token1',
                        distributedAt: new Date().toISOString(),
                        distributedBy: 'guild1_founder'
                      }
                    ] : [
                      {
                        type: 'token' as const,
                        amount: 1,
                        tokenID: 'g1-token1',
                        distributedAt: new Date().toISOString(),
                        distributedBy: 'guild1_founder'
                      }
                    ]
                    rewardQuest(tutorialQuest.questID, rewards, 'guild1_founder')
                  }, 800)
                }, 1000)
              }, 800)
            }, 300)
          }
          break
        case 'claim_rewards':
          if (tutorialQuest.status === QUEST_STATUS.REWARDED) {
            // Move quest to COMPLETED status when rewards are claimed
            tutorialQuest.status = QUEST_STATUS.COMPLETED
            tutorialQuest.phase = 'complete'
            tutorialQuest.completedAt = new Date().toISOString()
            
            // Save to localStorage
            saveTutorialQuestStatus(tutorialQuest.questID, tutorialQuest)
            
            tutorialStore.updateTutorialQuestState('claim')
            // Auto-advance to tutorial complete step when rewards are claimed
            setTimeout(() => {
              tutorialStore.nextStep()
            }, 800)
          }
          break
      }
    })
  }

  return {
    // State
    currentTab,
    quests,
    loading,
    error,
    statusFilter,

    // Computed
    availableTabs,
    currentTabInfo,
    filteredQuests,
    questItems,
    questStats,
    questsByStatus,

    // Actions
    setCurrentTab,
    loadQuests,
    getQuestById,
    getQuestsByStatus,
    getQuestsByGuild,
    setStatusFilter,

    // Quest workflow methods
    applyToQuest,
    assignQuest,
    submitQuest,
    verifyQuest,
    rewardQuest,

    // Helper methods
    getQuestIcon,
    getStatusIcon,
    getStatusLabel,
    getStatusColor,

    // Tutorial quest methods
    getTutorialQuest,
    updateTutorialQuestStatus,
    assignTutorialQuest,
    resetTutorialQuest,
    handleTutorialQuestAction,

    // Persistence methods
    saveTutorialQuestStatus,
    loadTutorialQuestStatus,
    clearTutorialQuestStatus
  }
})
