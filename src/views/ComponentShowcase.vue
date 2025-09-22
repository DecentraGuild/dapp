<template>
  <div class="component-showcase">
    <div class="showcase-header">
      <h1>dGuild Component Library</h1>
      <p>Explore the available components and their variants</p>
      <div class="documentation-links">
        <a href="/src/docs/COMPONENT_LIBRARY.md" target="_blank" class="doc-link">
          📚 Complete Component Documentation
        </a>
        <a href="/src/docs/UI_STYLING_GUIDE.md" target="_blank" class="doc-link">
          🎨 UI Styling Guide
        </a>
      </div>
    </div>

    <!-- Theme Controls -->
    <div class="theme-controls">
      <BaseCard title="Theme & Design Token Controls" size="sm">
        <div class="control-group">
          <label>Skin Theme:</label>
          <select v-model="selectedTheme" @change="setTheme(selectedTheme)">
            <option value="medieval">Castle Medieval</option>
            <option value="whitesun">Castle White Sun</option>
            <option value="shadowsun">Castle Shadow Sun</option>
          </select>
        </div>
        <div class="control-group">
          <label>Component Size:</label>
          <select v-model="selectedSize">
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
        </div>
        <div class="control-group">
          <label>Current Theme:</label>
          <span class="theme-info">{{ currentTheme?.name || 'Loading...' }}</span>
        </div>
      </BaseCard>
    </div>

    <!-- BaseCard Examples -->
    <section class="showcase-section">
      <h2>BaseCard Components</h2>
      <div class="component-grid">
        <BaseCard 
          title="Primary Card" 
          subtitle="This is a primary variant card"
          variant="primary"
          :size="listSize"
          hover
        >
          <p>This card demonstrates the primary variant with hover effects enabled.</p>
        </BaseCard>

        <BaseCard 
          title="Secondary Card" 
          subtitle="This is a secondary variant card"
          variant="secondary"
          :size="listSize"
          clickable
        >
          <p>This card is clickable and uses the secondary variant.</p>
        </BaseCard>

        <BaseCard 
          title="Accent Card" 
          subtitle="This is an accent variant card"
          variant="accent"
          :size="listSize"
        >
          <p>This card uses the accent variant for highlighting important content.</p>
          <template #footer>
            <BaseButton variant="primary" :size="selectedSize">
              Action Button
            </BaseButton>
          </template>
        </BaseCard>

        <BaseCard 
          title="Neutral Card" 
          subtitle="This is a neutral variant card"
          variant="neutral"
          :size="listSize"
        >
          <p>This card uses the neutral variant for subtle content grouping.</p>
        </BaseCard>
      </div>
    </section>

    <!-- BaseButton Examples -->
    <section class="showcase-section">
      <h2>BaseButton Components</h2>
      <div class="button-grid">
        <div class="button-group">
          <h3>Variants</h3>
          <BaseButton variant="primary" :size="selectedSize">Primary</BaseButton>
          <BaseButton variant="secondary" :size="selectedSize">Secondary</BaseButton>
          <BaseButton variant="accent" :size="selectedSize">Accent</BaseButton>
          <BaseButton variant="outline" :size="selectedSize">Outline</BaseButton>
          <BaseButton variant="ghost" :size="selectedSize">Ghost</BaseButton>
          <BaseButton variant="danger" :size="selectedSize">Danger</BaseButton>
        </div>

        <div class="button-group">
          <h3>With Icons</h3>
          <BaseButton variant="primary" :size="selectedSize" icon="game-icons:castle">
            Guild
          </BaseButton>
          <BaseButton variant="secondary" :size="selectedSize" icon="game-icons:person">
            Member
          </BaseButton>
          <BaseButton variant="accent" :size="selectedSize" icon="game-icons:wallet">
            Wallet
          </BaseButton>
        </div>

        <div class="button-group">
          <h3>States</h3>
          <BaseButton variant="primary" :size="selectedSize" loading>
            Loading
          </BaseButton>
          <BaseButton variant="primary" :size="selectedSize" disabled>
            Disabled
          </BaseButton>
          <BaseButton variant="primary" :size="selectedSize" full-width>
            Full Width
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- BaseList Examples -->
    <section class="showcase-section">
      <h2>BaseList Components</h2>
      <div class="list-grid">
        <BaseList
          :items="sampleMembers"
          title="Guild Members"
          subtitle="Active members in your guild"
          variant="bordered"
          :size="listSize"
          clickable
          @item-click="handleMemberClick"
        >
          <template #actions="{ item }">
            <BaseButton size="sm" variant="outline">
              View
            </BaseButton>
          </template>
        </BaseList>

        <BaseList
          :items="sampleQuests"
          title="Available Quests"
          subtitle="Quests you can participate in"
          variant="striped"
          :size="listSize"
          selectable
        >
          <template #icon="{ item }">
            <Icon v-if="item.icon" :icon="item.icon" />
          </template>
          <template #actions="{ item }">
            <BaseButton size="sm" variant="primary">
              Join
            </BaseButton>
          </template>
        </BaseList>

        <BaseList
          :items="sampleTransactions"
          title="Recent Transactions"
          subtitle="Latest guild transactions"
          variant="hover"
          :size="listSize"
        >
          <template #subtitle="{ item }">
            <span class="transaction-amount">{{ item.amount }}</span>
            <span class="transaction-date">{{ item.date }}</span>
          </template>
        </BaseList>
      </div>
    </section>


    <!-- BaseInput Examples -->
    <section class="showcase-section">
      <h2>BaseInput Components</h2>
      <div class="input-grid">
        <BaseInput
          v-model="inputValue"
          placeholder="Enter text"
          variant="outlined"
          :size="inputSize"
        />
        <BaseInput
          v-model="inputValue"
          placeholder="Filled input"
          variant="filled"
          :size="inputSize"
        />
        <BaseInput
          v-model="inputValue"
          placeholder="With prefix icon"
          variant="outlined"
          :size="inputSize"
          prefix-icon="game-icons:castle"
        />
        <BaseInput
          v-model="inputValue"
          placeholder="With suffix icon"
          variant="outlined"
          :size="inputSize"
          suffix-icon="game-icons:person"
          clearable
        />
        <BaseInput
          v-model="inputValue"
          placeholder="Disabled input"
          variant="outlined"
          :size="inputSize"
          disabled
        />
        <BaseInput
          v-model="inputValue"
          placeholder="Error state"
          variant="outlined"
          :size="inputSize"
          error="This field is required"
        />
      </div>
    </section>

    <!-- BaseDropdown Examples -->
    <section class="showcase-section">
      <h2>BaseDropdown Components</h2>
      <div class="dropdown-grid">
        <BaseDropdown
          :items="dropdownItems"
          v-model="selectedDropdown"
          placeholder="Select option"
          variant="outlined"
          :size="inputSize"
        />
        <BaseDropdown
          :items="dropdownItems"
          v-model="selectedDropdown"
          placeholder="Filled dropdown"
          variant="filled"
          :size="inputSize"
        />
        <BaseDropdown
          :items="dropdownItems"
          v-model="selectedDropdown"
          placeholder="Searchable dropdown"
          variant="outlined"
          :size="inputSize"
          searchable
        />
        <BaseDropdown
          :items="dropdownItems"
          v-model="selectedDropdown"
          placeholder="Disabled dropdown"
          variant="outlined"
          :size="inputSize"
          disabled
        />
      </div>
    </section>

    <!-- BaseButtonDropdown Examples -->
    <section class="showcase-section">
      <h2>BaseButtonDropdown Components</h2>
      <div class="button-dropdown-grid">
        <BaseButtonDropdown
          :items="buttonDropdownItems"
          v-model="selectedButtonDropdown"
          icon="game-icons:castle"
          variant="default"
          :size="inputSize"
        >
          Guild Actions
        </BaseButtonDropdown>
        <BaseButtonDropdown
          :items="buttonDropdownItems"
          v-model="selectedButtonDropdown"
          icon="game-icons:person"
          variant="filled"
          :size="inputSize"
        >
          Member Actions
        </BaseButtonDropdown>
        <BaseButtonDropdown
          :items="buttonDropdownItems"
          v-model="selectedButtonDropdown"
          icon="game-icons:wallet"
          variant="outlined"
          :size="inputSize"
        >
          Wallet Actions
        </BaseButtonDropdown>
      </div>
    </section>

    <!-- BaseListGrid Examples -->
    <section class="showcase-section">
      <h2>BaseListGrid Components</h2>
      <div class="list-grid-showcase">
        <BaseListGrid
          :items="gridItems"
          title="Guild Members Grid"
          subtitle="Display members in a grid layout"
          variant="primary"
          :size="listSize"
          :columns="3"
          clickable
          @item-click="handleGridItemClick"
        >
          <template #icon="{ item }">
            <Icon v-if="item.icon" :icon="item.icon" />
          </template>
          <template #actions="{ item }">
            <BaseButton size="sm" variant="outline">
              View
            </BaseButton>
          </template>
        </BaseListGrid>
      </div>
    </section>

    <!-- Design Tokens Showcase -->
    <section class="showcase-section">
      <h2>Design Tokens System</h2>
      
      <!-- Spacing Tokens -->
      <BaseCard title="Spacing Scale" size="sm">
        <div class="spacing-demo">
          <div v-for="(value, key) in spacing" :key="key" class="spacing-item">
            <span class="token-name">{{ key }}</span>
            <div class="spacing-visual" :style="{ width: value, height: value }"></div>
            <span class="token-value">{{ value }}</span>
          </div>
        </div>
        <p class="token-description">
          Use spacing tokens for consistent padding, margins, and gaps across all components.
        </p>
      </BaseCard>

      <!-- Typography Tokens -->
      <BaseCard title="Typography Scale" size="sm">
        <div class="typography-demo">
          <div v-for="(value, key) in typography" :key="key" class="typography-item">
            <span class="token-name">{{ key }}</span>
            <span class="typography-visual" :style="{ fontSize: value }">
              Sample Text
            </span>
            <span class="token-value">{{ value }}</span>
          </div>
        </div>
        <p class="token-description">
          Typography tokens ensure consistent text sizing and hierarchy throughout the platform.
        </p>
      </BaseCard>

      <!-- Color Tokens -->
      <BaseCard title="Theme-Aware Colors" size="sm">
        <div class="colors-demo">
          <div class="color-section">
            <h4>Primary Colors (Theme-Dynamic)</h4>
            <div class="color-palette">
              <div 
                v-for="(color, key) in themeColors.primary" 
                :key="`primary-${key}`"
                class="color-swatch"
                :style="{ backgroundColor: color }"
              >
                <span class="color-label">Primary {{ key }}</span>
              </div>
            </div>
          </div>
          
          <div class="color-section">
            <h4>Secondary Colors (Theme-Dynamic)</h4>
            <div class="color-palette">
              <div 
                v-for="(color, key) in themeColors.secondary" 
                :key="`secondary-${key}`"
                class="color-swatch"
                :style="{ backgroundColor: color }"
              >
                <span class="color-label">Secondary {{ key }}</span>
              </div>
            </div>
          </div>

          <div class="color-section">
            <h4>Text Colors (Theme-Dynamic)</h4>
            <div class="color-palette">
              <div 
                v-for="(color, key) in themeColors.text" 
                :key="`text-${key}`"
                class="color-swatch"
                :style="{ backgroundColor: color }"
              >
                <span class="color-label">Text {{ key }}</span>
              </div>
            </div>
          </div>

          <div class="color-section">
            <h4>Background & Emergency Colors</h4>
            <div class="color-palette">
              <div 
                class="color-swatch"
                :style="{ backgroundColor: themeColors.background }"
              >
                <span class="color-label">Background</span>
              </div>
              <div 
                class="color-swatch"
                :style="{ backgroundColor: themeColors.emergency }"
              >
                <span class="color-label">Emergency</span>
              </div>
            </div>
          </div>
        </div>
        <p class="token-description">
          Colors automatically adapt to the selected skin theme. Change the theme above to see the colors update dynamically.
        </p>
      </BaseCard>

      <!-- Border Radius Tokens -->
      <BaseCard title="Border Radius Scale" size="sm">
        <div class="border-radius-demo">
          <div v-for="(value, key) in borderRadius" :key="key" class="border-radius-item">
            <span class="token-name">{{ key }}</span>
            <div 
              class="border-radius-visual" 
              :style="{ 
                borderRadius: value,
                width: '60px',
                height: '60px'
              }"
            ></div>
            <span class="token-value">{{ value }}</span>
          </div>
        </div>
        <p class="token-description">
          Border radius tokens provide consistent rounded corners. Theme-aware values adapt to skin settings.
        </p>
      </BaseCard>

      <!-- Shadow Tokens -->
      <BaseCard title="Shadow Scale" size="sm">
        <div class="shadow-demo">
          <div v-for="(value, key) in shadows" :key="key" class="shadow-item">
            <span class="token-name">{{ key }}</span>
            <div 
              class="shadow-visual" 
              :style="{ 
                boxShadow: value,
                width: '80px',
                height: '80px'
              }"
            ></div>
            <span class="token-value">{{ value }}</span>
          </div>
        </div>
        <p class="token-description">
          Shadow tokens create consistent depth and elevation across components.
        </p>
      </BaseCard>

      <!-- Component Styles Example -->
      <BaseCard title="Component Styles Generator" size="sm">
        <div class="component-styles-demo">
          <h4>Generated Styles for Size: {{ selectedSize }}</h4>
          <div class="style-preview" :style="generatedStyles">
            <span>Preview Component</span>
          </div>
          <div class="style-code">
            <pre>{{ styleCode }}</pre>
          </div>
        </div>
        <p class="token-description">
          Use <code>getComponentStyles()</code> to get consistent styling for any component size and variant.
        </p>
      </BaseCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { BaseCard, BaseButton, BaseList, BaseInput, BaseDropdown, BaseButtonDropdown, BaseListGrid, useDesignTokens } from '@/components/base'
import { useSkinTheme } from '@/composables/useSkinTheme'

// Composables
const { currentTheme, setTheme, availableThemes } = useSkinTheme()
const { 
  spacing, 
  typography, 
  colors, 
  borderRadius, 
  shadows, 
  fontWeights,
  getComponentStyles 
} = useDesignTokens()

// State
const selectedTheme = ref('medieval')
const selectedSize = ref<'sm' | 'md' | 'lg' | 'xl'>('md')
const inputValue = ref('')
const selectedDropdown = ref<string | number | undefined>(undefined)
const selectedButtonDropdown = ref<string | number | undefined>(undefined)

// Computed for BaseList size (only supports sm, md, lg)
const listSize = computed(() => {
  const size = selectedSize.value
  return size === 'xl' ? 'lg' : size
})

// Computed for BaseInput size (only supports sm, md, lg)
const inputSize = computed(() => {
  const size = selectedSize.value
  return size === 'xl' ? 'lg' : size
})

// Computed
const themeColors = computed(() => colors.value)

// Sample data
const sampleMembers = [
  {
    id: 1,
    title: 'Alice',
    subtitle: 'Guild Master',
    icon: 'game-icons:person',
    selected: false
  },
  {
    id: 2,
    title: 'Bob',
    subtitle: 'Officer',
    icon: 'game-icons:person',
    selected: false
  },
  {
    id: 3,
    title: 'Charlie',
    subtitle: 'Member',
    icon: 'game-icons:person',
    selected: false
  }
]

const sampleQuests = [
  {
    id: 1,
    title: 'Defeat the Dragon',
    subtitle: 'Complete the epic dragon quest',
    icon: 'game-icons:dragon',
    selected: false
  },
  {
    id: 2,
    title: 'Collect Artifacts',
    subtitle: 'Gather 10 ancient artifacts',
    icon: 'game-icons:treasure-map',
    selected: false
  },
  {
    id: 3,
    title: 'Guild Meeting',
    subtitle: 'Attend the weekly guild meeting',
    icon: 'game-icons:meeting',
    selected: false
  }
]

const sampleTransactions = [
  {
    id: 1,
    title: 'Treasury Deposit',
    amount: '+500 GOLD',
    date: '2 hours ago'
  },
  {
    id: 2,
    title: 'Quest Reward',
    amount: '+150 GOLD',
    date: '1 day ago'
  },
  {
    id: 3,
    title: 'Member Contribution',
    amount: '+75 GOLD',
    date: '3 days ago'
  }
]

const dropdownItems = [
  { id: 1, label: 'Option 1', value: 'option1' },
  { id: 2, label: 'Option 2', value: 'option2' },
  { id: 3, label: 'Option 3', value: 'option3' },
  { id: 4, label: 'Option 4', value: 'option4' }
]

const buttonDropdownItems = [
  { id: 1, label: 'View Details', value: 'view' },
  { id: 2, label: 'Edit', value: 'edit' },
  { id: 3, label: 'Delete', value: 'delete' },
  { id: 4, label: 'Share', value: 'share' }
]

const gridItems = [
  {
    id: '1',
    title: 'Alice',
    subtitle: 'Guild Master',
    icon: 'game-icons:person',
    selected: false
  },
  {
    id: '2',
    title: 'Bob',
    subtitle: 'Officer',
    icon: 'game-icons:person',
    selected: false
  },
  {
    id: '3',
    title: 'Charlie',
    subtitle: 'Member',
    icon: 'game-icons:person',
    selected: false
  },
  {
    id: '4',
    title: 'Diana',
    subtitle: 'Member',
    icon: 'game-icons:person',
    selected: false
  },
  {
    id: '5',
    title: 'Eve',
    subtitle: 'Member',
    icon: 'game-icons:person',
    selected: false
  },
  {
    id: '6',
    title: 'Frank',
    subtitle: 'Member',
    icon: 'game-icons:person',
    selected: false
  }
]


// Computed properties for design token demonstration
const generatedStyles = computed(() => {
  const styles = getComponentStyles(selectedSize.value as any, 'primary')
  return {
    padding: styles.padding,
    fontSize: styles.fontSize,
    borderRadius: styles.borderRadius,
    backgroundColor: themeColors.value.primary[0],
    color: themeColors.value.secondary[0],
    border: `1px solid ${themeColors.value.secondary[0]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60px',
    transition: 'all 0.2s ease'
  }
})

const styleCode = computed(() => {
  const styles = getComponentStyles(selectedSize.value as any, 'primary')
  return `const styles = getComponentStyles('${selectedSize.value}', 'primary')

// Generated styles:
{
  padding: '${styles.padding}',
  fontSize: '${styles.fontSize}',
  borderRadius: '${styles.borderRadius}',
  gap: '${styles.gap}',
  // Theme colors automatically applied
  '--primary-color-0': '${themeColors.value.primary[0]}',
  '--primary-color-1': '${themeColors.value.primary[1]}',
  '--secondary-color-0': '${themeColors.value.secondary[0]}',
  '--secondary-color-1': '${themeColors.value.secondary[1]}',
  '--secondary-color-2': '${themeColors.value.secondary[2]}'
}`
})

// Methods
const handleMemberClick = (item: any, index: number) => {
  console.log('Member clicked:', item, index)
}

const handleGridItemClick = (item: any, index: number) => {
  console.log('Grid item clicked:', item, index)
}

</script>

<style scoped>
.component-showcase {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--primary-color-0);
  min-height: 100vh;
}

.showcase-header {
  text-align: center;
  margin-bottom: 3rem;
}

.showcase-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--secondary-color-0);
  margin-bottom: 1rem;
}

.showcase-header p {
  font-size: 1.125rem;
  color: var(--secondary-color-1);
  opacity: 0.8;
}

.documentation-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.doc-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--secondary-color-0);
  color: var(--primary-color-0);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: var(--border-width-thin) solid var(--secondary-color-1);
}

.doc-link:hover {
  background: var(--secondary-color-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
}

.theme-controls {
  margin-bottom: 3rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.control-group label {
  font-weight: 500;
  color: var(--secondary-color-0);
  min-width: 120px;
}

.control-group select {
  padding: 0.5rem;
  border: var(--border-width-thin) solid var(--secondary-color-0);
  border-radius: 6px;
  background: var(--primary-color-1);
  color: var(--secondary-color-0);
}

.showcase-section {
  margin-bottom: 4rem;
}

.showcase-section h2 {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--secondary-color-0);
  margin-bottom: 2rem;
  border-bottom: var(--border-width-thin) solid var(--secondary-color-2);
  padding-bottom: 0.5rem;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.button-group h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--secondary-color-0);
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dropdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.button-dropdown-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.list-grid-showcase {
  margin-bottom: 2rem;
}

.tokens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.token-group h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--secondary-color-0);
  margin-bottom: 1rem;
}

.spacing-demo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
}

.spacing-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.token-name {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--secondary-color-1);
  min-width: 60px;
}

.spacing-visual {
  background: var(--secondary-color-0);
  border-radius: 2px;
}

.token-value {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--secondary-color-1);
  opacity: 0.7;
}

.typography-demo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 200px;
  overflow-y: auto;
}

.typography-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.typography-visual {
  color: var(--secondary-color-0);
  font-weight: 500;
}

.colors-demo {
  margin-top: 1rem;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.color-swatch {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: var(--border-width-thin) solid var(--secondary-color-2);
}

.color-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.transaction-amount {
  font-weight: 600;
  color: var(--secondary-color-0);
}

.transaction-date {
  font-size: 0.75rem;
  color: var(--secondary-color-1);
  opacity: 0.7;
  margin-left: 0.5rem;
}

.token-description {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--secondary-color-1);
  opacity: 0.8;
  line-height: 1.5;
}

.color-section {
  margin-bottom: 1.5rem;
}

.color-section h4 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--secondary-color-0);
  margin-bottom: 0.75rem;
}

.border-radius-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  max-height: 150px;
  overflow-y: auto;
}

.border-radius-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.border-radius-visual {
  background: var(--secondary-color-0);
  opacity: 0.8;
}

.shadow-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  max-height: 150px;
  overflow-y: auto;
}

.shadow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.shadow-visual {
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 8px;
}

.component-styles-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.component-styles-demo h4 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--secondary-color-0);
  margin: 0;
}

.style-preview {
  border: var(--border-width-thin) dashed var(--secondary-color-2);
  border-radius: 8px;
  margin: 0.5rem 0;
}

.style-code {
  background: var(--primary-color-1);
  border: var(--border-width-thin) solid var(--secondary-color-2);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.style-code pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: var(--secondary-color-0);
  line-height: 1.4;
  white-space: pre-wrap;
}

/* Responsive */
@media (max-width: 768px) {
  .component-showcase {
    padding: 1rem;
  }
  
  .component-grid,
  .button-grid,
  .list-grid {
    grid-template-columns: 1fr;
  }
  
  .tokens-grid {
    grid-template-columns: 1fr;
  }
  
  .color-palette {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
}

</style>
