import './assets/styles/main.css'

// PrimeVue Icon
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/router'
import PrimeVue from 'primevue/config'
import HarborPreset from './primevue-preset'
import ToastService from 'primevue/toastservice'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

const app = createApp(App)
app.component('v-icon', Icon)
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
