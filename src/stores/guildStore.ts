import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './userStore'

export interface GuildProfile {
  id: string
  name: string
  description: string
  logo: string
  theme: string
  message: string
  settings: {
    allowPublicViewing: boolean
    requireApprovalForJoin: boolean
    maxMembers: number
    autoAssignRole: string
    notificationSettings: {
      email: boolean
      push: boolean
      inApp: boolean
      frequency: string
    }
  }
  roles: Record<string, string>
  daos: {
    token1: string
    token2: string
    totalvote: string
  }
  createdAt: string
  updatedAt: string
}

export interface GuildMember {
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

export const useGuildStore = defineStore('guild', () => {
  // State
  const activeGuild = ref<GuildProfile | null>(null)
  const availableGuilds = ref<GuildProfile[]>([])
  const guildMembers = ref<GuildMember[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasActiveGuild = computed(() => !!activeGuild.value)
  const guildId = computed(() => activeGuild.value?.id || null)
  const guildName = computed(() => activeGuild.value?.name || '')
  const guildTheme = computed(() => activeGuild.value?.theme || '')
  const guildLogo = computed(() => activeGuild.value?.logo || '')
  const guildDescription = computed(() => activeGuild.value?.description || '')
  const guildMessage = computed(() => activeGuild.value?.message || '')
  const guildRoles = computed(() => activeGuild.value?.roles || {})
  const guildDaos = computed(() => activeGuild.value?.daos || { token1: '', token2: '', totalvote: '' })
  const memberCount = computed(() => guildMembers.value.length)
  const activeMembers = computed(() => guildMembers.value.filter(member => member.isActive))

  // Actions
  const loadAvailableGuilds = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // Load guild profiles from SLP assets
      const guildFiles = ['guild-1_profile.json', 'guild-2_profile.json']
      const guilds: GuildProfile[] = []
      
      for (const file of guildFiles) {
        try {
          const response = await fetch(`/SLP/guildprofiles/${file}`)
          if (response.ok) {
            const guildData = await response.json()
            guilds.push(guildData)
          } else {
            console.warn(`Failed to load guild profile ${file}: ${response.status}`)
          }
        } catch (err) {
          console.warn(`Failed to load guild profile ${file}:`, err)
        }
      }
      
      availableGuilds.value = guilds
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load guilds'
      console.error('Error loading guilds:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadGuildMembers = async (guildId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Load guild member list
      const memberListFile = guildId === 'guild-1' ? 'guild-1_memberlist.json' : 'guild-2_memberlist.json'
      const response = await fetch(`/SLP/guildmemberlist/${memberListFile}`)
      if (!response.ok) {
        console.error(`Failed to load guild members: ${response.status} ${response.statusText}`)
        throw new Error('Failed to load guild members')
      }
      
      const memberAddresses = await response.json()
      console.log(`Loaded ${memberAddresses.length} member addresses for ${guildId}:`, memberAddresses)
      const members: GuildMember[] = []
      
      // Load all member profiles for this guild
      const guildPrefix = guildId === 'guild-1' ? 'g1' : 'g2'
      const memberNames = ['alice', 'bob', 'charlie', 'diana', 'eve']
      
      for (const name of memberNames) {
        try {
          // Try to find the member profile by guild + name pattern
          const possibleFiles = [
            `${guildPrefix}_${name}_prospect.json`,
            `${guildPrefix}_${name}_member.json`,
            `${guildPrefix}_${name}_officer.json`,
            `${guildPrefix}_${name}_council.json`,
            `${guildPrefix}_${name}_founder.json`
          ]
          
          for (const fileName of possibleFiles) {
            try {
              const memberResponse = await fetch(`/SLP/memberprofiles/${fileName}`)
              if (memberResponse.ok) {
                const memberData = await memberResponse.json()
                // Only include members whose addresses are in the guild member list
                if (memberAddresses.includes(memberData.walletAddress)) {
                  console.log(`Found member ${name} in ${guildId}:`, memberData.username, memberData.role)
                  members.push(memberData)
                  break // Found the member, no need to check other roles
                } else {
                  console.log(`Member ${name} (${memberData.walletAddress}) not in guild member list`)
                }
              } else {
                console.warn(`Member profile ${fileName} not found: ${memberResponse.status}`)
              }
            } catch (err) {
              console.warn(`Error loading member profile ${fileName}:`, err)
            }
          }
        } catch (err) {
          console.warn(`Failed to load member profile for ${name}:`, err)
        }
      }
      
      guildMembers.value = members
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load guild members'
      console.error('Error loading guild members:', err)
    } finally {
      isLoading.value = false
    }
  }

  const selectGuild = async (guildId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Find guild in available guilds
      const guild = availableGuilds.value.find(g => g.id === guildId)
      if (!guild) throw new Error('Guild not found')
      
      activeGuild.value = guild
      
      // Load guild members
      await loadGuildMembers(guildId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select guild'
      console.error('Error selecting guild:', err)
    } finally {
      isLoading.value = false
    }
  }

  const clearGuild = () => {
    activeGuild.value = null
    guildMembers.value = []
    error.value = null
  }

  const getMemberByWallet = (walletAddress: string) => {
    return guildMembers.value.find(member => member.walletAddress === walletAddress)
  }

  const getMembersByRole = (role: string) => {
    return guildMembers.value.filter(member => member.role === role)
  }

  const getRoleName = (roleId: string) => {
    return guildRoles.value[roleId] || roleId
  }

  const loadMemberProfile = async (walletAddress: string, guildId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      // Find the member profile file based on wallet address and guild
      const guildPrefix = guildId === 'guild-1' ? 'g1' : 'g2'
      const memberNames = ['alice', 'bob', 'charlie', 'diana', 'eve']
      
      for (const name of memberNames) {
        const possibleFiles = [
          `${guildPrefix}_${name}_prospect.json`,
          `${guildPrefix}_${name}_member.json`,
          `${guildPrefix}_${name}_officer.json`,
          `${guildPrefix}_${name}_council.json`,
          `${guildPrefix}_${name}_founder.json`
        ]
        
        for (const fileName of possibleFiles) {
          try {
            const response = await fetch(`/SLP/memberprofiles/${fileName}`)
            if (response.ok) {
              const memberData = await response.json()
              if (memberData.walletAddress === walletAddress && memberData.guild === guildId) {
                return memberData
              }
            }
          } catch (err) {
            console.warn(`Error loading member profile ${fileName}:`, err)
          }
        }
      }
      
      throw new Error('Member profile not found')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load member profile'
      console.error('Error loading member profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    activeGuild,
    availableGuilds,
    guildMembers,
    isLoading,
    error,
    
    // Getters
    hasActiveGuild,
    guildId,
    guildName,
    guildTheme,
    guildLogo,
    guildDescription,
    guildMessage,
    guildRoles,
    guildDaos,
    memberCount,
    activeMembers,
    
    // Actions
    loadAvailableGuilds,
    loadGuildMembers,
    selectGuild,
    clearGuild,
    getMemberByWallet,
    getMembersByRole,
    getRoleName,
    loadMemberProfile
  }
})
