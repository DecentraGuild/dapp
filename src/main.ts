import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import design tokens
import './styles/design-tokens.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
