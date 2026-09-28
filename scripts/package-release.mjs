import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json')))
if (!/^web-app-[a-z0-9-]+$/.test(pkg.name) || !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(pkg.version)) {
  throw new Error('Expected a web-app name and a SemVer version')
}
execFileSync(process.execPath, [join(root, 'scripts/check.mjs'), '--dist'], { stdio: 'inherit' })
const output = join(root, 'release')
mkdirSync(output, { recursive: true })
const stage = mkdtempSync(join(tmpdir(), `${pkg.name}-`))
const checksums = []
// Maintainer skills stay in Git; release archives contain no .agents resources.
const sourceFiles = [
  '.editorconfig', '.gitignore', '.nvmrc', '.github', 'LICENSE', 'NOTICE', 'README.md',
  'CHANGELOG.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts',
  'src', 'l10n', 'scripts'
]
try {
  for (const kind of ['app', 'source']) {
    const target = join(stage, kind, pkg.name)
    mkdirSync(target, { recursive: true })
    if (kind === 'app') cpSync(join(root, 'dist'), target, { recursive: true })
    else for (const file of sourceFiles) cpSync(join(root, file), join(target, file), { recursive: true })
    const filename = `${pkg.name}-${pkg.version}${kind === 'source' ? '-source' : ''}.zip`
    // zip updates existing archives by default: remove only this generated output first.
    rmSync(join(output, filename), { force: true })
    // The official App Store requires manifest.json at the root of the install ZIP.
    // The source ZIP instead contains a single repository root directory.
    execFileSync('zip', ['-q', '-r', '-X', join(output, filename), kind === 'app' ? '.' : pkg.name], {
      cwd: kind === 'app' ? target : join(stage, kind),
      env: { ...process.env, COPYFILE_DISABLE: '1' }
    })
    const hash = createHash('sha256').update(readFileSync(join(output, filename))).digest('hex')
    checksums.push(`${hash}  ${filename}`)
    console.log(`Packaged ${filename}`)
  }
  writeFileSync(join(output, 'SHA256SUMS'), checksums.join('\n') + '\n')
} finally {
  rmSync(stage, { recursive: true, force: true })
}
