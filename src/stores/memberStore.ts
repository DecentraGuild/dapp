import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './userStore'
import { useGuildStore } from './guildStore'
import { getSlpPath } from '@/utils/api'

export interface MemberProfile {
  memberID: string
  walletAddress: string
  guild: string
  role: string
  username: string
  avatar: string
  email: string
  notification: boolean[]
  lastActive: string
  joinedAt: string
  isActive: boolean
  contributionScore: number
  bio: string
}

export interface MemberTokenBalance {
  token1: number
  token2: number
  token1Name: string
  token2Name: string
  token1Symbol: string
  token2Symbol: string
  token1Icon: string
  token2Icon: string
  lastUpdated: string
}

export interface GuildPermission {
  role: string
  permissions: {
    canViewGuild: boolean
    canEditGuild: boolean
    canManageMembers: boolean
    canManageRoles: boolean
    canAccessVault: boolean
    canAccessDAO: boolean
    canCreateEvents: boolean
    canManageQuests: boolean
    canAccessArmory: boolean
    canAccessG2P: boolean
  }
}

export const useMemberStore = defineStore('member', () => {
  // State
  const currentMember = ref<MemberProfile | null>(null)
  const memberPermissions = ref<GuildPermission | null>(null)
  const memberTokenBalance = ref<MemberTokenBalance | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isMember = computed(() => !!currentMember.value)
  const memberUsername = computed(() => currentMember.value?.username || '')
  const memberRole = computed(() => currentMember.value?.role || '')
  const memberAvatar = computed(() => currentMember.value?.avatar || '')
  const memberEmail = computed(() => currentMember.value?.email || '')
  const memberBio = computed(() => currentMember.value?.bio || '')
  const memberContributionScore = computed(() => currentMember.value?.contributionScore || 0)
  const memberJoinedAt = computed(() => currentMember.value?.joinedAt || '')
  const memberLastActive = computed(() => currentMember.value?.lastActive || '')
  const isActive = computed(() => currentMember.value?.isActive || false)
  const notifications = computed(() => currentMember.value?.notification || [false, false, false])

  const hasPermission = computed(() => (permission: keyof GuildPermission['permissions']) => {
    return memberPermissions.value?.permissions[permission] || false
  })

  const roleName = computed(() => {
    if (!currentMember.value) return ''
    const guildStore = useGuildStore()
    return guildStore.getRoleName(currentMember.value.role)
  })

  // Token balance getters
  const token1Balance = computed(() => memberTokenBalance.value?.token1 || 0)
  const token2Balance = computed(() => memberTokenBalance.value?.token2 || 0)
  const token1Name = computed(() => memberTokenBalance.value?.token1Name || 'Token-1')
  const token2Name = computed(() => memberTokenBalance.value?.token2Name || 'Token-2')
  const token1Symbol = computed(() => memberTokenBalance.value?.token1Symbol || 'T1')
  const token2Symbol = computed(() => memberTokenBalance.value?.token2Symbol || 'T2')
  const token1Icon = computed(() => memberTokenBalance.value?.token1Icon || '')
  const token2Icon = computed(() => memberTokenBalance.value?.token2Icon || '')
  const hasTokenBalance = computed(() => !!memberTokenBalance.value)

  // Actions
  const loadMemberProfile = async (walletAddress: string, guildId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const userStore = useUserStore()
      const guildStore = useGuildStore()
      
      // Check if user is in the guild
      if (!userStore.isInGuild(guildId)) {
        throw new Error('User is not a member of this guild')
      }
      
      // Find member in guild members
      const member = guildStore.getMemberByWallet(walletAddress)
      if (!member) {
        throw new Error('Member profile not found')
      }
      
      currentMember.value = member
      
      // Load member permissions
      await loadMemberPermissions(member.role, guildId)
      
      // Load member token balances
      await loadMemberTokenBalance(walletAddress, guildId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load member profile'
      // Handle error silently in production
      // Could implement proper error handling/notification system here
    } finally {
      isLoading.value = false
    }
  }

  const loadMemberPermissions = async (roleId: string, guildId: string) => {
    try {
      // Load guild permission table
      const permissionFile = guildId === 'guild-1' ? 'guild1_permissiontable.json' : 'guild2_permissiontable.json'
      const response = await fetch(getSlpPath(`guildpermission/${permissionFile}`))
      if (!response.ok) throw new Error('Failed to load permissions')
      
      const permissionData = await response.json()
      
      // Find permissions for the role
      const rolePermissions = permissionData.find((p: GuildPermission) => p.role === roleId)
      if (rolePermissions) {
        memberPermissions.value = rolePermissions
      } else {
        // Default permissions for unknown roles
        memberPermissions.value = {
          role: roleId,
          permissions: {
            canViewGuild: true,
            canEditGuild: false,
            canManageMembers: false,
            canManageRoles: false,
            canAccessVault: false,
            canAccessDAO: false,
            canCreateEvents: false,
            canManageQuests: false,
            canAccessArmory: false,
            canAccessG2P: false
          }
        }
      }
    } catch (err) {
      // Handle failed member permissions load silently
      // Set default permissions
      memberPermissions.value = {
        role: roleId,
        permissions: {
          canViewGuild: true,
          canEditGuild: false,
          canManageMembers: false,
          canManageRoles: false,
          canAccessVault: false,
          canAccessDAO: false,
          canCreateEvents: false,
          canManageQuests: false,
          canAccessArmory: false,
          canAccessG2P: false
        }
      }
    }
  }

  const loadMemberTokenBalance = async (walletAddress: string, guildId: string) => {
    try {
      // Load wallet balance data
      const balanceResponse = await fetch(getSlpPath(`balance/wallet_${walletAddress}_balance.json`))
      if (!balanceResponse.ok) {
        return
      }
      
      const balanceData = await balanceResponse.json()
      
      // Load token names from guild token files
      const token1Response = await fetch(getSlpPath(`guildtoken/${guildId}_token1.json`))
      const token2Response = await fetch(getSlpPath(`guildtoken/${guildId}_token2.json`))
      
      let token1Name = 'Token-1'
      let token2Name = 'Token-2'
      let token1Symbol = 'T1'
      let token2Symbol = 'T2'
      let token1Icon = ''
      let token2Icon = ''
      
      if (token1Response.ok) {
        const token1Data = await token1Response.json()
        token1Name = token1Data.name || 'Token-1'
        token1Symbol = token1Data.symbol || 'T1'
        token1Icon = token1Data.image || ''
      }
      
      if (token2Response.ok) {
        const token2Data = await token2Response.json()
        token2Name = token2Data.name || 'Token-2'
        token2Symbol = token2Data.symbol || 'T2'
        token2Icon = token2Data.image || ''
      }
      
      // Extract guild-specific token balances
      const guildPrefix = guildId === 'guild-1' ? 'g1' : 'g2'
      const token1Key = `${guildPrefix}-token1`
      const token2Key = `${guildPrefix}-token2`
      
      const token1Balance = balanceData.balances[token1Key] || 0
      const token2Balance = balanceData.balances[token2Key] || 0
      
      memberTokenBalance.value = {
        token1: token1Balance,
        token2: token2Balance,
        token1Name,
        token2Name,
        token1Symbol,
        token2Symbol,
        token1Icon,
        token2Icon,
        lastUpdated: balanceData.lastUpdated || new Date().toISOString()
      }
      
    } catch (err) {
      // Handle failed member token balance load silently
      // Set default balance if loading fails
      memberTokenBalance.value = {
        token1: 0,
        token2: 0,
        token1Name: 'Token-1',
        token2Name: 'Token-2',
        token1Symbol: 'T1',
        token2Symbol: 'T2',
        token1Icon: '',
        token2Icon: '',
        lastUpdated: new Date().toISOString()
      }
    }
  }

  const clearMember = () => {
    currentMember.value = null
    memberPermissions.value = null
    memberTokenBalance.value = null
    error.value = null
  }

  const updateMemberProfile = (updates: Partial<MemberProfile>) => {
    if (currentMember.value) {
      currentMember.value = { ...currentMember.value, ...updates }
    }
  }

  const updateNotificationSettings = (settings: boolean[]) => {
    if (currentMember.value) {
      currentMember.value.notification = settings
    }
  }

  const updateContributionScore = (score: number) => {
    if (currentMember.value) {
      currentMember.value.contributionScore = score
    }
  }

  const updateLastActive = () => {
    if (currentMember.value) {
      currentMember.value.lastActive = new Date().toISOString()
    }
  }

  return {
    // State
    currentMember,
    memberPermissions,
    memberTokenBalance,
    isLoading,
    error,
    
    // Getters
    isMember,
    memberUsername,
    memberRole,
    memberAvatar,
    memberEmail,
    memberBio,
    memberContributionScore,
    memberJoinedAt,
    memberLastActive,
    isActive,
    notifications,
    hasPermission,
    roleName,
    token1Balance,
    token2Balance,
    token1Name,
    token2Name,
    token1Symbol,
    token2Symbol,
    token1Icon,
    token2Icon,
    hasTokenBalance,
    
    // Actions
    loadMemberProfile,
    loadMemberPermissions,
    loadMemberTokenBalance,
    clearMember,
    updateMemberProfile,
    updateNotificationSettings,
    updateContributionScore,
    updateLastActive
  }
})
