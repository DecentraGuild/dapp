export interface PermissionColumn {
  key: string
  label: string
  icon?: string
  required?: boolean
  description?: string
}

export interface Room {
  id: string
  name: string
  description?: string
  icon?: string
  disabled?: boolean
  permissions: Record<string, boolean>
}

export interface Role {
  id: string
  name: string
  emblem: string
  color: string
  description: string
  level: number
  permissions: string[]
}

export interface RoomPermission {
  roomId: string
  roleId: string
  permissions: {
    view: boolean
    use: boolean
    manage: boolean
    edit: boolean
    all: boolean
  }
}

export interface PermissionTableData {
  roles: Role[]
  rooms: Room[]
  roomPermissions: RoomPermission[]
}

export type PermissionKey = 'view' | 'use' | 'manage' | 'edit' | 'all'

export interface PermissionChangeEvent {
  room: Room
  permission: PermissionKey
  value: boolean
  roleId?: string
}

export interface PermissionTableConfig {
  columns: PermissionColumn[]
  defaultPermissions: Record<PermissionKey, boolean>
  editable: boolean
  showSummary: boolean
  allowRoleManagement: boolean
}
