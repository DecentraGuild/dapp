# 🎨 UI Styling & Design System Guide

## Overview

This guide covers the complete UI styling system for the dGuild platform, including design tokens, theming, and component styling patterns. All styling should follow these standards for consistency and maintainability.

## 🏗️ Architecture

### Design Token System
```
CSS Custom Properties (design-tokens.css)
    ↓
useDesignTokens Composable
    ↓
useSkinTheme Integration
    ↓
Base Components
    ↓
Application Components
```

## 🎯 Core Principles

### 1. **Design Token First**
- Always use design tokens instead of hard-coded values
- Maintain consistency across all components
- Enable easy theme switching and customization

### 2. **Theme Integration**
- All colors must come from the selected skin theme
- Border radius and spacing adapt to theme settings
- Support for dynamic theme switching

### 3. **Component Consistency**
- All base components follow the same styling patterns
- Consistent spacing, typography, and color usage
- Predictable behavior across the platform

## 🎨 Design Tokens

### Spacing Scale
```typescript
const { spacing } = useDesignTokens()

// Usage
padding: spacing.sm    // 0.5rem (8px)
margin: spacing.lg     // 1.5rem (24px)
gap: spacing.md        // 1rem (16px)
```

**Available Sizes:**
- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)
- `3xl`: 4rem (64px)

### Typography Scale
```typescript
const { typography, fontWeights } = useDesignTokens()

// Usage
fontSize: typography.lg        // 1.125rem (18px)
fontWeight: fontWeights.bold   // 700
```

**Available Sizes:**
- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)
- `5xl`: 3rem (48px)

### Color System
```typescript
const { colors } = useDesignTokens()

// Theme-aware colors (dynamically change with skin)
primary: colors.primary[0]      // Main primary color
secondary: colors.secondary[0]  // Main secondary color
text: colors.text[0]           // Main text color

// Theme colors (from skin JSON)
background: colors.background   // Theme background color
emergency: colors.emergency     // Theme emergency color
```

**Color Hierarchy:**
- `primary[0]`: Main primary color (backgrounds, main elements)
- `primary[1]`: Secondary primary color (cards, containers)
- `primary[2]`: Tertiary primary color (subtle backgrounds)
- `secondary[0]`: Main accent color (borders, highlights, icons)
- `secondary[1]`: Secondary accent color (hover states)
- `secondary[2]`: Tertiary accent color (subtle accents)
- `text[0]`: Main text color (headings, primary text)
- `text[1]`: Secondary text color (body text, descriptions)
- `text[2]`: Tertiary text color (muted text, placeholders)

### Border Radius
```typescript
const { borderRadius } = useDesignTokens()

// Usage
borderRadius: borderRadius.md   // 0.5rem (8px)
```

**Available Sizes:**
- `none`: 0
- `sm`: 0.25rem (4px)
- `md`: 0.5rem (8px)
- `lg`: 0.75rem (12px)
- `xl`: 1rem (16px)
- `2xl`: 1.5rem (24px)
- `full`: 9999px (circular)

### Shadows
```typescript
const { shadows } = useDesignTokens()

// Usage
boxShadow: shadows.lg   // 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

**Available Shadows:**
- `sm`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- `md`: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- `lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- `xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
- `2xl`: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

## 🧩 Available Base Components

The dGuild platform includes a comprehensive set of base components that follow the design token system:

### **Core Components**
- **BaseCard** - Container component with variants (primary, secondary, accent, neutral)
- **BaseButton** - Interactive button with multiple variants and states
- **BaseInput** - Form input component with validation support
- **BaseList** - List component with various display modes (bordered, striped, hover)

### **Layout Components**
- **BaseListGrid** - Grid layout component for displaying items in rows/columns
- **BaseDropdown** - Dropdown menu component
- **BaseButtonDropdown** - Button with integrated dropdown functionality

### **Component Features**
- **Size Variants:** All components support `sm`, `md`, `lg`, `xl` sizes
- **Theme Integration:** Automatic color adaptation based on selected skin theme
- **Responsive Design:** Mobile-first approach with breakpoint support
- **Accessibility:** ARIA labels, keyboard navigation, focus management
- **TypeScript Support:** Full type safety and IntelliSense support

### **Usage Example**
```vue
<template>
  <BaseCard title="Example" variant="primary" size="md">
    <BaseButton variant="secondary" size="sm" icon="game-icons:castle">
      Action
    </BaseButton>
    <BaseList :items="items" variant="bordered" />
  </BaseCard>
</template>
```

### **Complete Base Components List**

| Component | Description | Variants | Props |
|-----------|-------------|----------|-------|
| **BaseCard** | Container with header, body, footer | primary, secondary, accent, neutral | title, subtitle, size, hover, clickable |
| **BaseButton** | Interactive button element | primary, secondary, accent, outline, ghost, danger | size, variant, disabled, loading, icon, fullWidth |
| **BaseInput** | Form input with validation | default, filled, outlined | size, variant, type, placeholder, disabled, error |
| **BaseList** | List display component | bordered, striped, hover | items, title, subtitle, size, clickable, selectable |
| **BaseListGrid** | Grid layout for items | primary, secondary, accent, neutral | items, columns, gap, size, variant, hover, clickable |
| **BaseDropdown** | Dropdown menu | default, filled, outlined | items, size, variant, disabled, searchable |
| **BaseButtonDropdown** | Button with dropdown | default, filled, outlined | items, size, variant, disabled, searchable, clearable |

### **Import All Components**
```typescript
import { 
  BaseCard, 
  BaseButton, 
  BaseInput, 
  BaseList, 
  BaseListGrid, 
  BaseDropdown, 
  BaseButtonDropdown,
  useDesignTokens 
} from '@/components/base'
```

## 🧩 Component Styling Patterns

### 1. Base Component Structure
```vue
<template>
  <div 
    :class="componentClasses"
    :style="componentStyles"
  >
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { spacing, typography, colors, borderRadius, shadows } = useDesignTokens()

// Props
interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  disabled: false
})

// Computed styles using design tokens
const componentStyles = computed(() => ({
  padding: spacing[props.size],
  fontSize: typography[props.size],
  borderRadius: borderRadius.md,
  color: colors.secondary[0],
  backgroundColor: colors.primary[0],
  boxShadow: shadows.sm,
  opacity: props.disabled ? 0.5 : 1
}))

const componentClasses = computed(() => [
  'base-component',
  `component-${props.size}`,
  `component-${props.variant}`,
  {
    'component-disabled': props.disabled
  }
])
</script>

<style scoped>
.base-component {
  transition: all 0.2s ease;
  cursor: pointer;
}

.base-component:hover:not(.component-disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.component-disabled {
  cursor: not-allowed;
}
</style>
```

### 2. Theme-Aware Styling
```typescript
// Always use theme-aware colors
const themeStyles = computed(() => ({
  // Primary colors (adapt to theme)
  '--primary-color-0': colors.primary[0],
  '--primary-color-1': colors.primary[1],
  '--primary-color-2': colors.primary[2],
  
  // Secondary colors (adapt to theme)
  '--secondary-color-0': colors.secondary[0],
  '--secondary-color-1': colors.secondary[1],
  '--secondary-color-2': colors.secondary[2],
  
  // Static colors (consistent across themes)
  '--success-color': colors.status.success,
  '--error-color': colors.status.error,
  '--warning-color': colors.status.warning
}))
```

### 3. Responsive Design
```typescript
const { breakpoints, mediaQuery } = useDesignTokens()

// Use in computed styles
const responsiveStyles = computed(() => ({
  padding: spacing.md,
  fontSize: typography.base,
  
  // Responsive adjustments
  [`@media (min-width: ${breakpoints.md})`]: {
    padding: spacing.lg,
    fontSize: typography.lg
  }
}))
```

## 🎭 Theme Integration

### Skin Theme Selection
```typescript
import { useSkinTheme } from '@/composables/useSkinTheme'

const { currentTheme, setTheme, getPrimaryColor, getSecondaryColor } = useSkinTheme()

// Theme automatically updates design tokens
const themeColors = computed(() => ({
  primary: getPrimaryColor(0),
  secondary: getSecondaryColor(0)
}))
```

### Dynamic Theme Switching
```typescript
// Change theme programmatically
const changeTheme = async (themeId: string) => {
  await setTheme(themeId)
  // All components automatically update
}
```

## 📏 Component Size Variants

### Predefined Sizes
```typescript
const { getComponentStyles } = useDesignTokens()

// Get complete styling for a size variant
const buttonStyles = getComponentStyles('md', 'primary')
// Returns: { padding: '1rem', fontSize: '1rem', borderRadius: '0.75rem', ... }
```

### Size Mapping
- **xs**: Compact components (0.25rem padding, 0.75rem font)
- **sm**: Small components (0.5rem padding, 0.875rem font)
- **md**: Medium components (1rem padding, 1rem font) - **Default**
- **lg**: Large components (1.5rem padding, 1.125rem font)
- **xl**: Extra large components (2rem padding, 1.25rem font)

## 🎨 Color Usage Guidelines

### Primary Colors
- **primary[0]**: Main backgrounds, primary elements
- **primary[1]**: Card backgrounds, secondary containers
- **primary[2]**: Subtle backgrounds, disabled states

### Secondary Colors
- **secondary[0]**: Borders, highlights, icons, accent elements
- **secondary[1]**: Hover states, secondary accents
- **secondary[2]**: Tertiary accents, subtle highlights

### Text Colors
- **text[0]**: Main headings, primary text, important content
- **text[1]**: Body text, descriptions, secondary content
- **text[2]**: Muted text, placeholders, tertiary content

### Theme Colors
- **background**: Main background color from skin theme
- **emergency**: Emergency/error color from skin theme

## 🔧 Implementation Checklist

### For New Components
- [ ] Import `useDesignTokens` composable
- [ ] Use design tokens for all spacing, typography, colors
- [ ] Implement size variants (sm, md, lg, xl)
- [ ] Add theme-aware color integration
- [ ] Include responsive design considerations
- [ ] Add proper TypeScript types
- [ ] Test with different themes

### For Existing Components
- [ ] Replace hard-coded values with design tokens
- [ ] Update color usage to theme-aware system
- [ ] Ensure consistent spacing and typography
- [ ] Test theme switching functionality
- [ ] Update documentation

## 🚀 Best Practices

### 1. **Consistency First**
- Always use the same spacing scale
- Follow the typography hierarchy
- Use consistent color patterns

### 2. **Theme Awareness**
- Never hard-code colors
- Always use theme-aware color tokens
- Test with multiple themes

### 3. **Responsive Design**
- Use responsive breakpoints
- Test on different screen sizes
- Consider mobile-first approach

### 4. **Performance**
- Use computed properties for dynamic styles
- Minimize style recalculations
- Leverage CSS custom properties

### 5. **Accessibility**
- Ensure proper color contrast
- Use semantic color meanings
- Test with screen readers

## 📚 Examples

### Button Component
```vue
<template>
  <button 
    :class="buttonClasses"
    :style="buttonStyles"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <Icon v-if="icon" :icon="icon" class="button-icon" />
    <span v-if="$slots.default" class="button-text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { spacing, typography, colors, borderRadius, shadows } = useDesignTokens()

interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  disabled: false
})

const buttonStyles = computed(() => {
  const sizeMap = { sm: 'sm', md: 'md', lg: 'lg' }
  const currentSize = sizeMap[props.size]
  
  return {
    padding: `${spacing[currentSize]} ${spacing[props.size]}`,
    fontSize: typography[currentSize],
    borderRadius: borderRadius.md,
    fontWeight: '500',
    transition: 'all 0.2s ease',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
    
    // Theme-aware colors
    backgroundColor: colors.primary[0],
    color: colors.secondary[0],
    border: `1px solid ${colors.secondary[0]}`,
    boxShadow: shadows.sm
  }
})

const buttonClasses = computed(() => [
  'base-button',
  `button-${props.size}`,
  `button-${props.variant}`,
  {
    'button-disabled': props.disabled
  }
])
</script>

<style scoped>
.base-button:hover:not(.button-disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  background-color: var(--primary-color-1);
}

.button-icon {
  margin-right: var(--space-sm);
}
</style>
```

This guide provides the foundation for consistent, maintainable, and theme-aware UI development across the dGuild platform. Follow these patterns for all new components and gradually migrate existing components to this system.
