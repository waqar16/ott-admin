const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const outputPath = path.join(__dirname, '..', 'web-scaffold.zip')
const output = fs.createWriteStream(outputPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`✅ ZIP created: ${archive.pointer()} total bytes`)
  console.log(`📦 File: web-scaffold.zip`)
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)

// Add files and folders
const filesToInclude = [
  'app',
  'components',
  'players',
  'lib',
  'styles',
  'public',
  'scripts',
  'package.json',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'next.config.js',
  '.eslintrc.json',
  '.prettierrc',
  '.prettierignore',
  '.gitignore',
  '.env.example',
  '.npmrc',
  'pnpm-workspace.yaml',
  'README.md',
]

const rootDir = path.join(__dirname, '..')

filesToInclude.forEach((item) => {
  const fullPath = path.join(rootDir, item)

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${item} (not found)`)
    return
  }

  const stat = fs.statSync(fullPath)

  if (stat.isDirectory()) {
    archive.directory(fullPath, item)
    console.log(`📁 Adding directory: ${item}`)
  } else {
    archive.file(fullPath, { name: item })
    console.log(`📄 Adding file: ${item}`)
  }
})

archive.finalize()
