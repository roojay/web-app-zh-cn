import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { isAbsolute, resolve, sep } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = (path) => readFileSync(resolve(root, path))
const json = (path) => JSON.parse(read(path))
const catalog = json('l10n/translations.json')
const keys = json('l10n/source-keys.json')
assert.deepEqual(Object.keys(catalog), ['zh'], 'Preserve the OpenCloud locale key zh')
assert.equal(new Set(keys).size, keys.length, 'Duplicate source keys')
assert.deepEqual(Object.keys(catalog.zh).sort(), [...keys].sort(), 'Catalog/source key mismatch')

const placeholders = (text) => (text.match(/%\{[^{}]*\}/g) || []).sort()
for (const [source, translation] of Object.entries(catalog.zh)) {
  assert.equal(typeof translation, 'string', `Expected a Chinese string: ${source}`)
  assert.ok(translation.trim(), `Empty translation: ${source}`)
  assert.deepEqual(placeholders(translation), placeholders(source), `Placeholder mismatch: ${source}`)
}
const hash = createHash('sha256').update(read('l10n/translations.json')).digest('hex')
console.log(`Catalog: ${keys.length} keys; placeholders OK; SHA-256 ${hash}`)

if (process.argv.includes('--dist')) {
  const manifest = json('dist/manifest.json')
  const pkg = json('package.json')
  assert.equal(manifest.name, pkg.name)
  assert.equal(manifest.version, pkg.version)
  assert.equal(typeof manifest.entrypoint, 'string')
  const entry = resolve(root, 'dist', manifest.entrypoint)
  assert.ok(!isAbsolute(manifest.entrypoint) && entry.startsWith(resolve(root, 'dist') + sep))
  assert.ok(existsSync(entry), 'Manifest entrypoint missing')
  assert.deepEqual(read('dist/translations.json'), read('l10n/translations.json'))
  for (const name of ['LICENSE', 'NOTICE']) assert.deepEqual(read(`dist/${name}`), read(name))
  assert.ok(read('dist/THIRD_PARTY_NOTICES.txt').length > 0)
  console.log(`Build: ${manifest.name}@${manifest.version}; entrypoint and static catalog OK`)
}
