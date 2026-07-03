import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '..', 'public')

const jobs = [
  { src: 'icon-source.svg', out: 'pwa-192x192.png', size: 192 },
  { src: 'icon-source.svg', out: 'pwa-512x512.png', size: 512 },
  { src: 'icon-source.svg', out: 'apple-touch-icon.png', size: 180 },
  { src: 'icon-source.svg', out: 'favicon-32x32.png', size: 32 },
  { src: 'icon-maskable-source.svg', out: 'pwa-maskable-512x512.png', size: 512 },
]

for (const job of jobs) {
  const inputPath = path.join(publicDir, job.src)
  const outputPath = path.join(publicDir, job.out)
  await sharp(inputPath).resize(job.size, job.size).png().toFile(outputPath)
  console.log(`generated ${job.out}`)
}
