import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@opencloud-eu/extension-sdk'

const assets = {
  'translations.json': new URL('./l10n/translations.json', import.meta.url),
  LICENSE: new URL('./LICENSE', import.meta.url),
  NOTICE: new URL('./NOTICE', import.meta.url)
}
const runtimeLicenses = [
  '@module-federation/runtime',
  '@module-federation/runtime-core',
  '@module-federation/sdk',
  '@module-federation/error-codes',
  '@module-federation/vite',
  'vite'
]

export default defineConfig({
  // The official SDK reads the name/version and generates manifest.json from package.json.
  plugins: [
    {
      name: 'translation-assets',
      buildStart() {
        for (const source of Object.values(assets)) this.addWatchFile(fileURLToPath(source))
      },
      generateBundle() {
        // JSON imports feed the runtime. This additional asset exposes the same catalog
        // at a stable URL for OpenCloud customTranslations, without a second source copy.
        for (const [fileName, source] of Object.entries(assets)) {
          this.emitFile({ type: 'asset', fileName, source: readFileSync(source) })
        }
        const notices = runtimeLicenses.map((name) => {
          const base = new URL(`./node_modules/${name}/`, import.meta.url)
          const pkg = JSON.parse(readFileSync(new URL('package.json', base), 'utf8'))
          const license = readFileSync(new URL(name === 'vite' ? 'LICENSE.md' : 'LICENSE', base), 'utf8')
          return `${name}@${pkg.version}\n${license}`
        })
        this.emitFile({ type: 'asset', fileName: 'THIRD_PARTY_NOTICES.txt', source: notices.join('\n\n---\n\n') })
      }
    }
  ]
})
