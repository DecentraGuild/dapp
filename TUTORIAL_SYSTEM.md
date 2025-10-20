# Tutorial System Documentation

## Overview
A comprehensive tutorial overlay system has been implemented for the dGuild dApp. This system guides new users through the platform with an interactive, step-by-step tutorial that can be minimized, maximized, and exited at any time.

## Components Created

### 1. Tutorial Store (`src/stores/tutorialStore.ts`)
A Pinia store that manages the tutorial state and progression.

**State:**
- `isActive`: Whether the tutorial is currently running
- `isMinimized`: Whether the tutorial is in minimized mode
- `currentStepIndex`: Index of the current tutorial step
- `hasCompletedTutorial`: Whether user has completed the tutorial
- `hasSeenWelcome`: Whether user has seen the welcome screen
- `steps`: Array of tutorial steps

**Tutorial Steps:**
1. **Welcome Step**: Introduces users to their dGuild castle (center position)
2. **Navigate to Guild Quests**: Combined step - guides users to click Quest Board and select Guild Quests (auto-advances on route change)
3. **Sign Up Tutorial Quest**: Instructs users to sign up for their first quest

**Actions:**
- `startTutorial()`: Starts the tutorial from the beginning
- `nextStep()`: Advances to the next step
- `previousStep()`: Goes back to the previous step
- `goToStep(index)`: Jumps to a specific step
- `skipTutorial()`: Exits the tutorial
- `completeTutorial()`: Marks tutorial as complete
- `toggleMinimize()`: Toggles between minimized and maximized states
- `reset()`: Resets all tutorial state

### 2. Tutorial Overlay Component (`src/components/TutorialOverlay.vue`)
A Vue component that displays the tutorial UI with route-based auto-advancement.

**Features:**
- **Full Overlay Mode**: 
  - Large centered window with welcome message
  - Backdrop blur for focus
  - Progress bar showing completion
  - Navigation buttons (Previous/Next)
  - Step counter
  - Action hints

- **Minimized Mode**:
  - Small sidebar on the right side of screen
  - Shows current step number
  - Click to expand
  - Stays visible while users complete actions

- **Auto-Advancement**:
  - Watches for route changes
  - Automatically advances when user reaches target route
  - Shows success animation (green checkmark)
  - 1.5 second celebration before advancing

- **Manual Minimize Control**:
  - Users control when to minimize the tutorial
  - Maximizes automatically when showing success feedback
  - Stays maximized after advancing to allow reading new instructions

- **Controls**:
  - Minimize button (chevron icon)
  - Close/Exit button (X icon)
  - Previous/Next navigation
  - Progress indicator

**Positioning:**
- Center: For welcome and major announcements
- Right: For step-by-step instructions
- Other positions available: left, top, bottom

### 3. Integration Points

#### App.vue
- Tutorial overlay added to main template
- Auto-starts tutorial on first visit
- 1-second delay after app initialization

#### TopNavbar.vue
- Added "Tutorial" button to restart tutorial anytime
- Icon: `mdi:school`
- Accessible from any page

#### FooterNavbar.vue
- Added `data-tutorial="quest-board"` attribute to Quest Board shape
- Enables tutorial to highlight the correct navigation element

#### Submenu.vue
- Added `data-tutorial="guild-quests"` attribute to Guild Quests menu item
- Enables tutorial to guide users to the correct submenu option

## User Flow

1. **First Visit**:
   - User lands on the app
   - After 1 second, tutorial automatically starts
   - Welcome screen appears in center with backdrop

2. **Tutorial Progression**:
   - User reads welcome instructions
   - Clicks "Next" to proceed
   - Tutorial stays maximized showing step 2 instructions
   - User can read the full instructions
   - User can manually minimize using the chevron button if desired
   - User performs the action (e.g., navigates to Quest Board > Guild Quests)
   - **Tutorial detects route change automatically**
   - Tutorial maximizes (if minimized) and shows success animation (green checkmark + "Great job!")
   - After 1.5 seconds, auto-advances to next step
   - Tutorial stays maximized for user to read next instruction

3. **Manual Navigation**:
   - User can click minimized tutorial to expand and view full instructions
   - User can use Previous/Next buttons for manual navigation
   - User can minimize/maximize at any time

4. **Exiting**:
   - User can click X button to exit anytime
   - Confirmation dialog asks if they're sure
   - Tutorial state is saved

5. **Restarting**:
   - User can click "Tutorial" button in top navbar
   - Tutorial restarts from beginning
   - Can be accessed from any page

## Styling

The tutorial overlay uses:
- Theme-aware colors via CSS custom properties
- Gradient backgrounds for visual appeal
- Smooth transitions and animations
- Responsive design for mobile devices
- Glassmorphism effects (backdrop blur)
- Shadow effects for depth

**Color Scheme:**
- Primary: Uses `--global-bg-secondary` from theme
- Accent: Purple gradient (#667eea to #764ba2)
- Borders: `--global-border` from theme
- Text: `--global-text-primary` and `--global-text-secondary`

## Future Extensions

To add more tutorial steps:

1. **Add step to store**:
```typescript
{
  id: 'new-step',
  title: 'Step Title',
  description: 'Step description',
  target: '[data-tutorial="target-element"]',
  action: 'Action to perform',
  position: 'right',
  targetRoute: '/target/route',  // Route to watch for
  autoAdvance: true              // Enable auto-advancement
}
```

2. **Add data attribute to target element** (optional, for future highlighting):
```html
<button data-tutorial="target-element">
  Button Text
</button>
```

3. **Auto-advancement is built-in**:
   - Set `targetRoute` to the route path to watch
   - Set `autoAdvance: true` to enable
   - Tutorial will automatically detect route changes
   - Success animation will play automatically
   - Next step will load after 1.5 seconds

## Technical Notes

- Built with Vue 3 Composition API
- Uses Pinia for state management
- Vue Router integration for route watching
- Iconify for icons (`@iconify/vue`)
- CSS custom properties for theming
- CSS animations for success feedback
- Transitions for smooth animations
- Teleport for overlay positioning
- Responsive design with media queries
- Watchers for automatic state management

## Testing

To test the tutorial:
1. Clear localStorage (to reset `hasSeenWelcome`)
2. Refresh the page
3. Tutorial should auto-start after 1 second
4. Navigate through steps
5. Test minimize/maximize
6. Test exit functionality
7. Test restart from Tutorial button

## Customization

### Changing Tutorial Steps
Edit `src/stores/tutorialStore.ts` and modify the `steps` array.

### Changing Styling
Edit `src/components/TutorialOverlay.vue` and modify the `<style scoped>` section.

### Changing Auto-Start Behavior
Edit `src/App.vue` and modify the `onMounted` hook.

### Adding Tutorial Triggers
Add data attributes to any element you want the tutorial to reference:
```html
<div data-tutorial="unique-id">Content</div>
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS custom properties support
- Requires ES6+ JavaScript support
- Mobile responsive

