export interface NavigationItem {
  id: string
  name: string
  path: string
  icon: string
  label: string
  hasSubmenu: boolean
  isStandalone?: boolean
  roomType?: RoomType
  submenuItems?: NavigationItem[]
  description?: string
}

export type RoomType = 
  | 'Castle'
  | 'CommandCenter'
  | 'QuestBoard'
  | 'Tavern'
  | 'Armory'
  | 'Foundry'
  | 'TrophyRoom'
  | 'DAO'
  | 'Vault'
  | 'Observatory'
  | 'Gatekeeping'
  | 'CommunityHub'
  | 'Integrations'

export interface SkinTheme {
  id: string
  name: string
  description: string
  images: string[]
  svgFile: string
  shapeCoordinates: {
    imageSize: {
      width: number
      height: number
    }
  }
  primaryColor: string[]
  secondaryColor: string[]
  textColor: string[]
  emergencyColor?: string
  borderRadius?: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  metadata: {
    rarity: string
    creator: string
    mintedAt: string
    version: string
    category: string
    tags: string[]
  }
}

export interface ShapeMapping {
  [key: string]: string // navigation item name -> SVG shape ID
}

export interface GuildProfile {
  id: string
  name: string
  description: string
  logo: string
  theme: string
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
  roles: {
    prospect: string
    member: string
    officer: string
    council: string
    founder: string
  }
  daos: {
    token1: string
    token2: string
    totalvote: string
  }
  createdAt: string
  updatedAt: string
}
