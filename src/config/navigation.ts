import type { NavigationItem, RoomType } from '../types'
import { FOUNDRY_ICONS } from '../constants/foundry'

// Main navigation items mapping to the castle shapes
export const mainNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'dashboard',
    path: 'dashboard',
    icon: 'game-icons:chart',
    label: 'Dashboard',
    hasSubmenu: false,
    isStandalone: true,
    roomType: 'Castle'
  },
  {
    id: 'commandcenter',
    name: 'commandcenter',
    path: 'commandcenter',
    icon: 'game-icons:chart',
    label: 'Command Center',
    hasSubmenu: false,
    isStandalone: true,
    roomType: 'CommandCenter'
  },
  {
    id: 'questboard',
    name: 'questboard',
    path: 'questboard',
    icon: 'game-icons:target-dummy',
    label: 'Quest Board',
    hasSubmenu: true,
    roomType: 'QuestBoard',
    submenuItems: [
      {
        id: 'ingamequests',
        name: 'gamequests',
        path: 'quest/game',
        icon: 'game-icons:target-dummy',
        label: 'In-Game Quests',
        description: 'Ingame quests for members',
        hasSubmenu: false
      },
      {
        id: 'guildquests',
        name: 'guildquest',
        path: 'quest/guild',
        icon: 'game-icons:heart-tower',
        label: 'Guild Quests',
        description: 'Community gatherings and celebrations',
        hasSubmenu: false
      }
    ]
  },
  {
    id: 'tavern',
    name: 'tavern',
    path: 'tavern',
    icon: 'game-icons:castle',
    label: 'Tavern',
    hasSubmenu: true,
    roomType: 'Tavern',
    submenuItems: [
      {
        id: 'events',
        name: 'events',
        path: 'tavern/events',
        icon: 'game-icons:party-popper',
        label: 'Events',
        description: 'Community gatherings and celebrations',
        hasSubmenu: false
      },
      {
        id: 'raffles',
        name: 'raffles',
        path: 'tavern/raffles',
        icon: 'game-icons:card-random',
        label: 'Raffles',
        description: 'Enter raffles and win prizes',
        hasSubmenu: false
      },
      {
        id: 'poker',
        name: 'poker',
        path: 'tavern/poker',
        icon: 'game-icons:poker-hand',
        label: 'Poker',
        description: 'Play poker with guild members',
        hasSubmenu: false
      },
      {
        id: 'dice',
        name: 'dice',
        path: 'tavern/dice',
        icon: 'game-icons:perspective-dice-one',
        label: 'Dice',
        description: 'Roll dice and test your luck',
        hasSubmenu: false
      }
    ]
  },
  {
    id: 'armory',
    name: 'armory',
    path: 'armory',
    icon: 'game-icons:armory',
    label: 'Armory',
    hasSubmenu: true,
    roomType: 'Armory',
    submenuItems: [
      {
        id: 'g2p',
        name: 'g2p',
        path: 'armory/g2p',
        icon: 'game-icons:buy-card',
        label: 'Guild2Player',
        description: 'G2P trades',
        hasSubmenu: false
      }
    ]
  },
  {
    id: 'foundry',
    name: 'foundry',
    path: 'foundry',
    icon: 'game-icons:foundry',
    label: 'Foundry',
    hasSubmenu: true,
    roomType: 'Foundry',
    submenuItems: [
      {
        id: 'nft',
        name: 'nft',
        path: 'foundry/nft',
        icon: FOUNDRY_ICONS.NFT,
        label: 'NFT',
        description: 'Create and mint unique NFTs',
        hasSubmenu: false
      },
      {
        id: 'token1',
        name: 'token1',
        path: 'foundry/token1',
        icon: FOUNDRY_ICONS.TOKEN1,
        label: 'Token 1',
        description: 'Manage Token 1 operations',
        hasSubmenu: false
      },
      {
        id: 'token2',
        name: 'token2',
        path: 'foundry/token2',
        icon: FOUNDRY_ICONS.TOKEN2,
        label: 'Token 2',
        description: 'Manage Token 2 operations',
        hasSubmenu: false
      },
      {
        id: 'custom',
        name: 'custom',
        path: 'foundry/custom',
        icon: FOUNDRY_ICONS.CUSTOM,
        label: 'Custom',
        description: 'Custom foundry operations',
        hasSubmenu: false
      }
    ]
  },
  {
    id: 'trophy-room',
    name: 'trophy-room',
    path: 'trophy-room',
    icon: 'game-icons:trophy',
    label: 'Trophy Room',
    hasSubmenu: false,
    isStandalone: true,
    roomType: 'TrophyRoom'
  },
  {
    id: 'dao-voting',
    name: 'dao-voting',
    path: 'dao-voting',
    icon: 'game-icons:two-coins',
    label: 'DAO Voting',
    hasSubmenu: false,
    isStandalone: true,
    roomType: 'DAO'
  },
  {
    id: 'vaults',
    name: 'vaults',
    path: 'vaults',
    icon: 'game-icons:bank',
    label: 'Vaults',
    hasSubmenu: true,
    isStandalone: false,
    roomType: 'Vault',
    submenuItems: [
      {
        id: 'vaults-v1',
        name: 'vaults-v1',
        path: 'vaults',
        icon: 'game-icons:bank',
        label: 'Version 1',
        description: 'Original vault layout and design',
        hasSubmenu: false
      },
      {
        id: 'vaults-v2',
        name: 'vaults-v2',
        path: 'vaults/v2',
        icon: 'game-icons:bank',
        label: 'Version 2',
        description: 'Alternative vault layout for comparison',
        hasSubmenu: false
      }
    ]
  },
  {
    id: 'observatory',
    name: 'observatory',
    path: 'observatory',
    icon: 'game-icons:chart',
    label: 'Observatory',
    hasSubmenu: true,
    roomType: 'Observatory',
    submenuItems: [
      {
        id: 'personal',
        name: 'personal',
        path: 'reports/personal',
        icon: 'game-icons:person',
        label: 'Personal',
        description: 'Personal analytics and insights',
        hasSubmenu: false
      },
      {
        id: 'dguild',
        name: 'dguild',
        path: 'reports/dguild',
        icon: 'game-icons:castle',
        label: 'dGuild',
        description: 'dGuild analytics and community metrics',
        hasSubmenu: false
      },
      {
        id: 'financial',
        name: 'financial',
        path: 'reports/financial',
        icon: 'game-icons:take-my-money',
        label: 'Financial',
        description: 'View financial reports and transactions',
        hasSubmenu: false
      }
    ]
  },
  {
    id: 'gatekeeping',
    name: 'gatekeeping',
    path: 'gatekeeping',
    icon: 'game-icons:shield',
    label: 'Gatekeeping',
    hasSubmenu: false,
    isStandalone: true,
    roomType: 'Gatekeeping'
  },
  {
    id: 'community-hub',
    name: 'community-hub',
    path: 'communityhub',
    icon: 'game-icons:castle',
    label: 'Community Hub',
    hasSubmenu: true,
    isStandalone: false,
    roomType: 'CommunityHub', 
    submenuItems: [
      { 
      id: 'guildprofile',
      name: 'guildprofile',
      path: 'communityhub/guildprofile',
      icon: 'game-icons:castle',
      label: 'Guild Profile',
      description: 'Guild profile, member list and messageboard',
      hasSubmenu: false
    },
    {
      id: 'memberprofile',
      name: 'memberprofile',
      path: 'communityhub/memberprofile',
      icon: 'game-icons:person',
      label: 'Member Profile',
      description: 'Member profile, settings, avatar, notifications',
      hasSubmenu: false
    }
  ]
},
  {
    id: 'integrations',
    name: 'integrations',
    path: 'integrations',
    icon: 'game-icons:abstract-050',
    label: 'Integrations',
    hasSubmenu: false,
    isStandalone: true,
    roomType: 'Integrations'
  }
]

// Integration navigation items
export const integrationNavigationItems: NavigationItem[] = [
  {
    id: 'star-atlas',
    name: 'star-atlas',
    path: 'star-atlas',
    icon: 'game-icons:star',
    label: 'Star Atlas',
    hasSubmenu: true,
    submenuItems: [
      {
        id: 'profile',
        name: 'profile',
        path: 'star-atlas/profile',
        icon: 'game-icons:person',
        label: 'Profile',
        description: 'View and manage your Star Atlas profile',
        hasSubmenu: false
      },
      {
        id: 'locker',
        name: 'locker',
        path: 'star-atlas/locker',
        icon: 'game-icons:padlock',
        label: 'Locker',
        description: 'Access your Star Atlas locker',
        hasSubmenu: false
      },
      {
        id: 'sage',
        name: 'sage',
        path: 'star-atlas/sage',
        icon: 'game-icons:magic-swirl',
        label: 'Sage',
        description: 'Use Sage for advanced operations',
        hasSubmenu: false
      },
      {
        id: 'lending',
        name: 'lending',
        path: 'star-atlas/lending',
        icon: 'game-icons:coins',
        label: 'Lending',
        description: 'Manage lending operations',
        hasSubmenu: false
      },
      {
        id: 'marketplace',
        name: 'marketplace',
        path: 'star-atlas/marketplace',
        icon: 'game-icons:shop',
        label: 'Marketplace',
        description: 'Access the Star Atlas marketplace',
        hasSubmenu: false
      }
    ]
  }
]

// Helper function to get integration navigation items
export function getIntegrationNavigationItems(): NavigationItem[] {
  return integrationNavigationItems
}
