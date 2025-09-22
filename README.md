# DecentraGuild dApp

A Vue.js application for DecentraGuild's decentralized guild management platform.

## Features

- Guild management and membership
- Quest boards and achievements
- Tavern events (poker, dice, raffles)
- Vault management
- DAO voting system
- Permission-based access control

## Development

### Prerequisites

- Node.js 20.19.0 or higher
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/DecentraGuild/DecentraWebApp.git
cd DecentraWebApp
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

### Build

To build for production:
```bash
npm run build
```

### Deployment

This project is automatically deployed to GitHub Pages at [dapp.decentraguild.com](https://dapp.decentraguild.com) when changes are pushed to the main branch.

## Project Structure

- `src/components/` - Vue components
- `src/views/` - Page views
- `src/stores/` - Pinia stores for state management
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/composables/` - Vue composables

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Pinia for state management
- Vue Router
- @iconify/vue for icons

## License

Private - DecentraGuild