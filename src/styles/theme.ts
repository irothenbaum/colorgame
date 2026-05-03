import {definePreset} from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const styles = {
  formField: {
    background: 'var(--color-dark-grey)',
    borderColor: 'var(--color-dark-grey)',
    color: 'var(--color-white)',

    filledBackground: 'var(--color-dark-grey)',
    filledBorderColor: 'var(--color-dark-grey)',

    filledHoverBackground: 'var(--color-dark-grey)',
    filledHoverBorderColor: 'var(--color-grey)',

    filledFocusBackground: 'var(--color-dark-grey)',
    filledFocusBorderColor: 'var(--color-grey)',
  },
}

// @see https://primevue.org/theming/styled/
const MyTheme = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: styles,
      dark: styles,
    },
  },
})

export default MyTheme
