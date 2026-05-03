import './styles/main.css'
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import PrimeVue from 'primevue/config'
import MyTheme from './styles/theme.ts'
import App from './App.vue'
import Tooltip from 'primevue/tooltip'

const app = createApp(App)

app.use(PrimeVue, {
  // Default theme configuration
  theme: {
    preset: MyTheme,
    options: {
      prefix: 'app',
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  },
})

app.use(createPinia())

app.directive('tooltip', Tooltip)

// -------------------------------------------------------------------

app.mount('#app')
