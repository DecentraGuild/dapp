import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { QUEST_TABS, QUEST_ICONS, QUEST_TITLES, QUEST_DESCRIPTIONS, QUEST_FEATURES, QUEST_STATUS, QUEST_STATUS_ICONS, QUEST_STATUS_LABELS, QUEST_STATUS_COLORS } from '@/constants/quest'
import { getSlpPath } from '@/utils/api'
import type { Quest, QuestItem, QuestApplication, QuestVerification, QuestReward } from '@/constants/quest'

export const useQuestStore = defineStore('quest', () => {
  // State
  const currentTab = ref<string>(QUEST_TABS.INGAME)
  const quests = ref<Quest[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Available tabs configuration
  const availableTabs = computed(() => [
    {
      id: QUEST_TABS.INGAME,
      title: QUEST_TITLES.INGAME,
      icon: QUEST_ICONS.INGAME,
      description: QUEST_DESCRIPTIONS.INGAME,
      features: QUEST_FEATURES.INGAME,
      route: '/quest/game'
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

  // Filtered quests by current tab
  const filteredQuests = computed(() => {
    if (!currentTab.value) return []
    
    const questType = currentTab.value === QUEST_TABS.INGAME ? 'ingame' : 'guild'
    return quests.value.filter(quest => quest.type === questType)
  })

  // Quest items for display
  const questItems = computed((): QuestItem[] => {
    return filteredQuests.value.map(quest => ({
      id: quest.questID,
      icon: getQuestIcon(quest),
      title: quest.title,
      subtitle: quest.status.toUpperCase(),
      value: `${quest.amountToken1} tokens`,
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

  const loadQuests = async () => {
    loading.value = true
    error.value = null

    try {
      // Load quest files from SLP directory
      const questFiles = [
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

      const loadedQuests: Quest[] = []

      for (const file of questFiles) {
        try {
          const response = await fetch(getSlpPath(`quests/${file}`))
          if (response.ok) {
            const quest = await response.json()
            loadedQuests.push(quest)
          }
        } catch (fileError) {
          console.warn(`Failed to load quest file ${file}:`, fileError)
        }
      }

      quests.value = loadedQuests
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load quests'
      console.error('Error loading quests:', err)
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
    }
  }

  const submitQuest = (questId: string, submittedBy: string) => {
    const quest = quests.value.find(q => q.questID === questId)
    if (quest && quest.status === QUEST_STATUS.ASSIGNED && quest.assignedTo === submittedBy) {
      quest.status = QUEST_STATUS.DELIVERED
      quest.phase = 'execute'
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
    }
  }

  const rewardQuest = (questId: string, rewards: QuestReward[], rewardedBy: string) => {
    const quest = quests.value.find(q => q.questID === questId)
    if (quest && quest.status === QUEST_STATUS.REWARDED) {
      quest.rewards = rewards
      quest.status = QUEST_STATUS.COMPLETED
      quest.phase = 'complete'
      quest.completedAt = new Date().toISOString()
    }
  }

  // Helper function to get quest icon based on type and status
  const getQuestIcon = (quest: Quest): string => {
    if (quest.type === 'guild') {
      return QUEST_ICONS.GUILD
    } else {
      return QUEST_ICONS.INGAME
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
    getStatusColor
  }
})
