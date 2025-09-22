export interface SidebarItem {
  id?: string
  icon: string
  title: string
  active?: boolean
  disabled?: boolean
  action?: () => void
}

export interface BaseSidebarProps {
  items: SidebarItem[]
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  position?: 'left' | 'right'
  width?: string
}

export interface BaseSidebarEmits {
  itemClick: [item: SidebarItem, index: number]
}
