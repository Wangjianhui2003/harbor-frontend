import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/router'
import PrimeVue from 'primevue/config'
import HarborPreset from './primevue-preset'
import ToastService from 'primevue/toastservice'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ToastService)
// PrimeVue theme configuration
app.use(PrimeVue, {
  theme: {
    preset: HarborPreset,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  },
})

app.mount('#app')
