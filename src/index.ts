import { defineWebApplication } from '@opencloud-eu/web-pkg'
import { name } from '../package.json'
import translations from '../l10n/translations.json'

// Keep the host locale key `zh`; zh-CN is the module's target language, not a new locale.
// Application translations also cover terms merged after customTranslations.
export default defineWebApplication({
  setup() {
    return {
      appInfo: { id: name, name: '简体中文优化' },
      translations
    }
  }
})
