# 🧩 dGuild Component Library

A comprehensive collection of reusable Vue.js components designed for building decentralized guild applications. All components follow consistent design patterns, support theming, and provide full TypeScript support.

## 📋 Table of Contents

- [Installation](#installation)
- [Base Components](#base-components)
- [Component Props](#component-props)
- [Usage Examples](#usage-examples)
- [Theming](#theming)
- [Size Variants](#size-variants)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)

## 🚀 Installation

```typescript
// Import individual components
import { BaseCard, BaseButton, BaseList } from '@/components/base'

// Import composables
import { useDesignTokens, useSkinTheme } from '@/composables'
```

## 🧩 Base Components

### BaseCard

A flexible container component with header, body, and footer sections.

```vue
<BaseCard 
  title="Card Title"
  subtitle="Optional subtitle"
  variant="primary"
  size="md"
  hover
  clickable
>
  <p>Card content goes here</p>
  <template #footer>
    <BaseButton variant="primary">Action</BaseButton>
  </template>
</BaseCard>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'accent' | 'neutral'` - Visual style variant
- `size`: `'sm' | 'md' | 'lg' | 'xl'` - Component size
- `title`: `string` - Card title text
- `subtitle`: `string` - Optional subtitle text
- `hover`: `boolean` - Enable hover effects
- `clickable`: `boolean` - Make card clickable

**Slots:**
- `default` - Main card content
- `header` - Custom header content
- `footer` - Footer content

### BaseButton

Interactive button component with multiple variants and states.

```vue
<BaseButton 
  variant="primary"
  size="md"
  icon="game-icons:castle"
  loading
  disabled
  full-width
  @click="handleClick"
>
  Button Text
</BaseButton>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'` - Button style
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Button size
- `icon`: `string` - Icon name (Iconify format)
- `loading`: `boolean` - Show loading state
- `disabled`: `boolean` - Disable button
- `fullWidth`: `boolean` - Make button full width

**Events:**
- `click` - Emitted when button is clicked

### BaseList

List component for displaying collections of items with various display modes.

```vue
<BaseList
  :items="listItems"
  title="List Title"
  subtitle="Optional description"
  variant="bordered"
  size="md"
  clickable
  selectable
  @item-click="handleItemClick"
>
  <template #icon="{ item }">
    <Icon :icon="item.icon" />
  </template>
  <template #actions="{ item }">
    <BaseButton size="sm" variant="outline">Action</BaseButton>
  </template>
</BaseList>
```

**Props:**
- `items`: `ListItem[]` - Array of items to display
- `title`: `string` - List title
- `subtitle`: `string` - Optional subtitle
- `variant`: `'default' | 'bordered' | 'striped' | 'hover'` - Display style
- `size`: `'sm' | 'md' | 'lg'` - List size
- `clickable`: `boolean` - Make items clickable
- `selectable`: `boolean` - Enable item selection
- `emptyMessage`: `string` - Message when no items

**Events:**
- `itemClick` - Emitted when item is clicked
- `actionClick` - Emitted when action button is clicked

**Slots:**
- `icon` - Custom icon for each item
- `title` - Custom title for each item
- `subtitle` - Custom subtitle for each item
- `actions` - Action buttons for each item

### BaseInput

Form input component with validation and styling variants.

```vue
<BaseInput
  v-model="inputValue"
  type="text"
  placeholder="Enter text"
  variant="outlined"
  size="md"
  disabled
  error="Error message"
  @input="handleInput"
/>
```

**Props:**
- `modelValue`: `string` - Input value (v-model)
- `type`: `string` - Input type (text, email, password, etc.)
- `placeholder`: `string` - Placeholder text
- `variant`: `'default' | 'filled' | 'outlined'` - Input style
- `size`: `'sm' | 'md' | 'lg'` - Input size
- `disabled`: `boolean` - Disable input
- `error`: `string` - Error message to display
- `prefixIcon`: `string` - Icon before input
- `suffixIcon`: `string` - Icon after input
- `clearable`: `boolean` - Show clear button

**Events:**
- `update:modelValue` - Emitted when value changes
- `input` - Emitted on input
- `focus` - Emitted on focus
- `blur` - Emitted on blur

### BaseDropdown

Dropdown menu component for displaying lists of options.

```vue
<BaseDropdown
  :items="dropdownItems"
  v-model="selectedItem"
  placeholder="Select option"
  variant="outlined"
  size="md"
  searchable
  disabled
  @change="handleChange"
/>
```

**Props:**
- `items`: `DropdownItem[]` - Array of dropdown options
- `modelValue`: `DropdownItem | string | number` - Selected value
- `placeholder`: `string` - Placeholder text
- `variant`: `'default' | 'filled' | 'outlined'` - Dropdown style
- `size`: `'sm' | 'md' | 'lg'` - Dropdown size
- `searchable`: `boolean` - Enable search functionality
- `disabled`: `boolean` - Disable dropdown
- `clearable`: `boolean` - Allow clearing selection

**Events:**
- `update:modelValue` - Emitted when selection changes
- `change` - Emitted when selection changes
- `search` - Emitted when searching (if searchable)

### BaseButtonDropdown

Button component with integrated dropdown functionality.

```vue
<BaseButtonDropdown
  :items="buttonItems"
  v-model="selectedItem"
  icon="game-icons:castle"
  variant="primary"
  size="md"
  @change="handleChange"
>
  Guild Actions
</BaseButtonDropdown>
```

**Props:**
- `items`: `DropdownItem[]` - Array of dropdown options
- `modelValue`: `DropdownItem | string | number` - Selected value
- `icon`: `string` - Button icon
- `variant`: `'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'` - Button style
- `size`: `'sm' | 'md' | 'lg' | 'xl'` - Button size
- `disabled`: `boolean` - Disable button
- `searchable`: `boolean` - Enable search in dropdown
- `clearable`: `boolean` - Allow clearing selection

**Events:**
- `update:modelValue` - Emitted when selection changes
- `change` - Emitted when selection changes
- `open` - Emitted when dropdown opens
- `close` - Emitted when dropdown closes

## 🎨 Theming

All components support dynamic theming through the design token system.

### Using Design Tokens

```typescript
import { useDesignTokens } from '@/composables/useDesignTokens'

const { spacing, typography, colors, borderRadius, shadows } = useDesignTokens()

// Use in component styles
const componentStyles = computed(() => ({
  padding: spacing.md,
  fontSize: typography.lg,
  color: colors.primary[0],
  backgroundColor: colors.secondary[0],
  borderRadius: borderRadius.md,
  boxShadow: shadows.sm
}))
```

### Theme-Aware Colors

```typescript
// Primary colors (adapt to theme)
colors.primary[0]    // Main primary color
colors.primary[1]    // Secondary primary color
colors.primary[2]    // Tertiary primary color

// Secondary colors (adapt to theme)
colors.secondary[0]  // Main accent color
colors.secondary[1]  // Secondary accent color
colors.secondary[2]  // Tertiary accent color

// Text colors (adapt to theme)
colors.text[0]       // Main text color
colors.text[1]       // Secondary text color
colors.text[2]       // Tertiary text color

// Theme colors (from skin JSON)
colors.background     // Theme background color
colors.emergency      // Theme emergency color
```

### Theme Switching

```typescript
import { useSkinTheme } from '@/composables/useSkinTheme'

const { setTheme, currentTheme } = useSkinTheme()

// Change theme
await setTheme('shadowsun')
```

## 📏 Size Variants

All components support consistent size variants:

### Size Mapping

| Size | Padding | Font Size | Border Radius | Use Case |
|------|---------|-----------|---------------|----------|
| `xs` | 0.25rem | 0.75rem | 0.25rem | Compact UI elements |
| `sm` | 0.5rem | 0.875rem | 0.5rem | Small components |
| `md` | 1rem | 1rem | 0.75rem | Default size |
| `lg` | 1.5rem | 1.125rem | 1rem | Large components |
| `xl` | 2rem | 1.25rem | 1.5rem | Extra large components |

### Using Component Styles

```typescript
import { useDesignTokens } from '@/composables/useDesignTokens'

const { getComponentStyles } = useDesignTokens()

// Get complete styling for a size and variant
const buttonStyles = getComponentStyles('md', 'primary')
// Returns: { padding: '1rem', fontSize: '1rem', borderRadius: '0.75rem', ... }
```

## ♿ Accessibility

All components are built with accessibility in mind:

### Keyboard Navigation
- Tab order follows logical flow
- Enter/Space activates interactive elements
- Escape closes modals and dropdowns
- Arrow keys navigate lists and menus

### ARIA Support
- Proper ARIA labels and descriptions
- Role attributes for screen readers
- State announcements for dynamic content
- Focus management for modals and dropdowns

### Color Contrast
- All color combinations meet WCAG AA standards
- High contrast mode support
- Theme-aware color adjustments

## 🎯 Best Practices

### Component Composition

```vue
<template>
  <!-- Use semantic HTML structure -->
  <BaseCard title="User Profile" variant="primary">
    <BaseList :items="userItems" variant="bordered" />
    <template #footer>
      <div class="card-actions">
        <BaseButton variant="outline" @click="cancel">Cancel</BaseButton>
        <BaseButton variant="primary" @click="save">Save</BaseButton>
      </div>
    </template>
  </BaseCard>
</template>
```

### State Management

```typescript
// Use reactive state for dynamic content
const items = ref<ListItem[]>([
  { id: 1, title: 'Item 1', subtitle: 'Description' },
  { id: 2, title: 'Item 2', subtitle: 'Description' }
])

// Handle events properly
const handleItemClick = (item: ListItem, index: number) => {
  console.log('Item clicked:', item, index)
}
```

### Error Handling

```vue
<template>
  <BaseInput
    v-model="email"
    type="email"
    :error="emailError"
    @blur="validateEmail"
  />
</template>

<script setup lang="ts">
const email = ref('')
const emailError = ref('')

const validateEmail = () => {
  if (!email.value.includes('@')) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}
</script>
```

### Performance Optimization

```typescript
// Use computed properties for derived state
const filteredItems = computed(() => 
  items.value.filter(item => item.title.includes(searchQuery.value))
)

// Use v-memo for expensive list rendering
<BaseList
  v-memo="[items, selectedItem]"
  :items="filteredItems"
  :selected-item="selectedItem"
/>
```

## 🔧 Customization

### Custom Component Styles

```vue
<style scoped>
.custom-card {
  /* Override base styles */
  --primary-color-0: #custom-color;
  --border-radius: 20px;
}

.custom-card .base-card {
  background: linear-gradient(45deg, var(--primary-color-0), var(--secondary-color-0));
}
</style>
```

### Extending Components

```typescript
// Create a specialized component
import { BaseCard } from '@/components/base'

export default defineComponent({
  name: 'GuildCard',
  extends: BaseCard,
  props: {
    guildId: String,
    memberCount: Number
  },
  computed: {
    cardTitle() {
      return `Guild ${this.guildId} (${this.memberCount} members)`
    }
  }
})
```

## 📚 Examples

### Complete Form Example

```vue
<template>
  <BaseCard title="Create Guild" variant="primary">
    <form @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.name"
        placeholder="Guild name"
        :error="errors.name"
        @blur="validateName"
      />
      
      <BaseDropdown
        v-model="form.theme"
        :items="themeOptions"
        placeholder="Select theme"
      />
      
      <BaseList
        :items="memberOptions"
        title="Initial Members"
        selectable
        @item-click="toggleMember"
      />
      
      <template #footer>
        <div class="form-actions">
          <BaseButton variant="outline" @click="cancel">Cancel</BaseButton>
          <BaseButton 
            type="submit" 
            variant="primary" 
            :loading="submitting"
          >
            Create Guild
          </BaseButton>
        </div>
      </template>
    </form>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseCard, BaseInput, BaseDropdown, BaseList, BaseButton } from '@/components/base'

const form = ref({
  name: '',
  theme: '',
  members: []
})

const errors = ref({
  name: ''
})

const submitting = ref(false)

const themeOptions = [
  { id: 'medieval', label: 'Castle Medieval' },
  { id: 'whitesun', label: 'Castle White Sun' },
  { id: 'shadowsun', label: 'Castle Shadow Sun' }
]

const memberOptions = computed(() => 
  availableMembers.value.map(member => ({
    ...member,
    selected: form.value.members.includes(member.id)
  }))
)

const handleSubmit = async () => {
  if (validateForm()) {
    submitting.value = true
    try {
      await createGuild(form.value)
    } finally {
      submitting.value = false
    }
  }
}
</script>
```

This component library provides everything you need to build beautiful, accessible, and themeable guild applications. For more examples, visit the component showcase at `/components` in your application.
