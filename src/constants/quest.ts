// Quest Constants
export const QUEST_TABS = {
  INGAME: 'ingame',
  GUILD: 'guild'
} as const

export const QUEST_ICONS = {
  INGAME: 'game-icons:target-dummy',
  GUILD: 'game-icons:heart-tower'
} as const

export const QUEST_TITLES = {
  INGAME: 'In-Game Quests',
  GUILD: 'Guild Quests'
} as const

export const QUEST_DESCRIPTIONS = {
  INGAME: 'Complete in-game challenges and earn rewards',
  GUILD: 'Participate in guild activities and community tasks'
} as const

// Workflow Phases (Internal Management)
export const QUEST_PHASES = {
  CREATE: 'create',
  APPLY: 'apply',
  ASSIGN: 'assign',
  EXECUTE: 'execute',
  VERIFY: 'verify',
  REWARD: 'reward',
  COMPLETE: 'complete'
} as const

// User-Facing Status (What users see)
export const QUEST_STATUS = {
  NEW: 'new',
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  DELIVERED: 'delivered',
  REWARDED: 'rewarded',
  COMPLETED: 'completed'
} as const

export const QUEST_STATUS_ICONS = {
  NEW: 'game-icons:plus',
  PENDING: 'game-icons:clock',
  ASSIGNED: 'game-icons:user-check',
  DELIVERED: 'game-icons:package',
  REWARDED: 'game-icons:trophy',
  COMPLETED: 'game-icons:check-mark'
} as const

export const QUEST_STATUS_LABELS = {
  NEW: 'New',
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  DELIVERED: 'Delivered',
  REWARDED: 'Rewarded',
  COMPLETED: 'Completed'
} as const

export const QUEST_STATUS_COLORS = {
  NEW: 'var(--primary-color-0)',
  PENDING: 'var(--secondary-color-1)',
  ASSIGNED: 'var(--accent-color-0)',
  DELIVERED: 'var(--warning-color-0)',
  REWARDED: 'var(--success-color-0)',
  COMPLETED: 'var(--text-color-2)'
} as const

export const QUEST_FEATURES = {
  INGAME: [
    'Combat challenges',
    'Exploration missions',
    'PvP competitions',
    'Skill-based tasks'
  ],
  GUILD: [
    'Treasury management',
    'Recruitment tasks',
    'Event organization',
    'Community building'
  ]
} as const

// Quest type definitions
export interface Quest {
  questID: string
  guildID: string
  title: string
  description: string
  role: string
  roleRequirement: string
  type: 'guild' | 'ingame'
  status: 'new' | 'pending' | 'assigned' | 'delivered' | 'rewarded' | 'completed'
  phase: 'create' | 'apply' | 'assign' | 'execute' | 'verify' | 'reward' | 'complete'
  goal: string
  requirements: string[]
  gear: string[]
  guildSupplies: string[]
  contributors: string[]
  assignedTo?: string
  creator: string
  created: string
  deadline: string
  completedAt?: string
  isActive: boolean
  applications?: QuestApplication[]
  verification?: QuestVerification
  rewards?: QuestReward[]
  amountToken1?: number
  extraTokenGift?: number
  tokenID?: string
  extraTokenID?: string
}

export interface QuestApplication {
  memberID: string
  memberName: string
  appliedAt: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface QuestVerification {
  verifiedBy: string
  verifiedAt: string
  notes: string
  quality: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement'
  approved: boolean
}

export interface QuestReward {
  type: 'token' | 'badge' | 'recognition' | 'nft'
  amount?: number
  tokenID?: string
  badgeID?: string
  nftID?: string
  distributedAt: string
  distributedBy: string
}

export interface QuestRewards {
  tokens?: {
    token1?: number
    token2?: number
  }
  badges?: string[]
  nfts?: string[]
  experience?: number
}

export interface QuestItem {
  id: string
  icon: string
  title: string
  subtitle: string
  value: string
  description: string
  questData: Quest
}
