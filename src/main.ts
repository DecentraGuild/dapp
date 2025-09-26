import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import design tokens
import './styles/design-tokens.css'

// GitHub Pages SPA redirect handler
// This handles the redirect from 404.html for GitHub Pages
if (window.location.search.includes('?/')) {
  const path = window.location.search.split('?/')[1].replace(/~and~/g, '&');
  const newPath = '/' + path.replace(/\?/g, '&').replace(/&/g, '?');
  window.history.replaceState(null, '', newPath);
}

// Additional safety check for malformed URLs
if (window.location.href.includes('##') || window.location.href.includes('//#/')) {
  console.warn('Detected malformed URL in main.ts, redirecting to base domain');
  window.location.replace('https://dapp.decentraguild.com');
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
