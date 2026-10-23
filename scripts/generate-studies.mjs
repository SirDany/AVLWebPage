import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = path.join(root, 'public', 'studies')
await mkdir(output, { recursive: true })

const add = (a, b) => a.map((n, i) => n + b[i])
const sub = (a, b) => a.map((n, i) => n - b[i])
const mul = (a, n) => a.map((v) => v * n)
const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0)
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const normalize = (a) => mul(a, 1 / Math.max(Math.hypot(...a), 0.0001))
const key = normalize([-0.8, 0.8, 1.5])
const rim = normalize([1, 0.2, -0.3])
const eye = [0, 0, 1]
const gold = [149, 116, 60]
const graphite = [46, 44, 51]
const linen = [120, 137, 128]

function renderer({ scale = 340, yaw = -0.27, pitch = 0.08 } = {}) {
  const faces = []
  const rotate = ([x, y, z]) => {
    const a = x * Math.cos(yaw) + z * Math.sin(yaw)
    const b = -x * Math.sin(yaw) + z * Math.cos(yaw)
    return [a, y * Math.cos(pitch) - b * Math.sin(pitch), y * Math.sin(pitch) + b * Math.cos(pitch)]
  }
  const project = ([x, y, z]) => {
    const perspective = 5.5 / (5.5 - z)
    return [700 + x * scale * perspective, 770 - y * scale * perspective]
  }
  function triangle(points, color, roughness = 0.35) {
    const vertices = points.map(rotate)
    const normal = normalize(cross(sub(vertices[1], vertices[0]), sub(vertices[2], vertices[0])))
    const facing = dot(normal, eye) < 0 ? mul(normal, -1) : normal
    const center = mul(vertices.reduce(add, [0, 0, 0]), 1 / 3)
    const grain = Math.sin(center[0] * 233.1 + center[1] * 419.7) * 0.035
    const diffuse = Math.max(0, dot(facing, key))
    const edge = Math.max(0, dot(facing, rim)) ** 4
    const specular = Math.max(0, dot(facing, normalize(add(key, eye)))) ** (18 + roughness * 40)
    const rgb = color.map((value, i) =>
      Math.round(
        Math.min(
          255,
          Math.max(
            0,
            value * (0.2 + diffuse * 1.15 + grain) +
              specular * (1 - roughness) * [145, 130, 105][i] +
              edge * [14, 25, 27][i],
          ),
        ),
      ),
    )
    const fill = `rgb(${rgb.join(',')})`
    faces.push({
      depth: center[2],
      svg: `<path d="M${vertices
        .map((v) =>
          project(v)
            .map((n) => n.toFixed(2))
            .join(','),
        )
        .join('L')}Z" fill="${fill}" stroke="${fill}" stroke-width=".55"/>`,
    })
  }
  function surface(fn, nu, nv, color, skip = () => false) {
    for (let v = 0; v < nv; v++) {
      for (let u = 0; u < nu; u++) {
        const a = u / nu
        const b = v / nv
        if (skip(a + 0.5 / nu, b + 0.5 / nv)) continue
        const material = typeof color === 'function' ? color(a, b) : color
        const p = [fn(a, b), fn(a + 1 / nu, b), fn(a + 1 / nu, b + 1 / nv), fn(a, b + 1 / nv)]
        triangle([p[0], p[1], p[2]], material)
        triangle([p[0], p[2], p[3]], material)
      }
    }
  }
  async function save(name) {
    faces.sort((a, b) => a.depth - b.depth)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1540" viewBox="0 0 1400 1540">${faces.map((f) => f.svg).join('')}</svg>`
    await sharp(Buffer.from(svg))
      .webp({ quality: 92, effort: 6 })
      .toFile(path.join(output, `${name}.webp`))
    console.log(`Created original study: ${name}`)
  }
  return { surface, save }
}

async function renderMask(name, yaw) {
  const mask = renderer({ scale: 350, yaw, pitch: -0.06 })
  const maskPoint = (a, b) => {
    const u = a * 2 - 1
    const v = b * 2 - 1
    const width = (0.72 + 0.26 * Math.cos(v * 1.9) + 0.14 * v) * (1 - 0.4 * Math.max(0, -v) ** 3)
    const brow = 0.16 * Math.exp(-((v - 0.23) ** 2) * 65)
    const nose = 0.5 * Math.exp(-(u ** 2) * 42) * Math.exp(-((v + 0.12) ** 2) * 2.5)
    return [
      u * width,
      v * 1.16 + Math.max(0, v) ** 6 * (0.15 * Math.cos(u * Math.PI) - 0.13),
      Math.sqrt(1 - u * u) * (0.44 + brow) + nose + Math.cos(u * 8) * 0.035,
    ]
  }
  mask.surface(
    maskPoint,
    210,
    220,
    (a, b) => {
      const u = a * 2 - 1
      const v = b * 2 - 1
      const seam = Math.abs(u) < 0.025 || Math.abs(Math.abs(u) - (0.58 - v * 0.22)) < 0.018
      const engraving = Math.sin(a * 270) > 0.92 && b > 0.7
      return seam || engraving ? gold : graphite
    },
    (a, b) => {
      const u = a * 2 - 1
      const v = b * 2 - 1
      return ((Math.abs(u) - 0.43) / 0.27) ** 2 + ((v - 0.15 + Math.abs(u) * 0.12) / 0.11) ** 2 < 1
    },
  )
  for (const side of [-1, 1]) {
    mask.surface(
      (a, b) => {
        const angle = a * Math.PI * 2
        const r = (1 - b) * (0.13 + Math.sin(b * 8) * 0.018) + 0.005
        return [
          side * (0.67 + b * 0.36 - b * b * 0.24) + Math.cos(angle) * r,
          0.92 + b * 1.18,
          0.16 - b * 0.4 + Math.sin(angle) * r,
        ]
      },
      22,
      75,
      (a, b) => (Math.sin(b * 190) > 0.5 ? gold : graphite),
    )
  }
  await mask.save(name)
}
await renderMask('vesper', -0.25)
await renderMask('vesper-profile', 0.8)

const relic = renderer({ scale: 330, yaw: 0.35, pitch: 0.3 })
for (let layer = 0; layer < 3; layer++) {
  relic.surface(
    (a, b) => {
      const theta = a * Math.PI * 2
      const phi = b * Math.PI * 2
      const ring = 0.94 + layer * 0.2
      const radius = 0.065 + (layer === 1 ? 0.035 : 0)
      const ribs = 1 + Math.cos(theta * 92) * 0.09
      const x = (ring + Math.cos(phi) * radius * ribs) * Math.cos(theta)
      const y = (ring + Math.cos(phi) * radius * ribs) * Math.sin(theta)
      const z = Math.sin(phi) * radius * ribs
      const tilt = (layer - 1) * 0.62
      return [x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)]
    },
    320,
    16,
    layer === 1 ? graphite : gold,
  )
}
relic.surface(
  (a, b) => {
    const phi = a * Math.PI * 2
    const theta = b * Math.PI
    const r = 0.48 * (1 + 0.065 * Math.cos(phi * 7) * Math.sin(theta * 8))
    return [
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.cos(theta),
      r * Math.sin(theta) * Math.sin(phi),
    ]
  },
  90,
  70,
  graphite,
)
await relic.save('orrery')

const textile = renderer({ scale: 335, yaw: -0.3, pitch: 0.14 })
textile.surface(
  (a, b) => {
    const u = a * 2 - 1
    const v = b * 2 - 1
    const taper = 0.66 + Math.cos(v * 1.5) * 0.32
    return [
      u * taper + Math.sin(v * 2.1) * 0.22,
      v * 1.72 + Math.cos(u * 2.5) * 0.16,
      Math.sin(u * 17 + v * 2.3) * (0.13 + (1 - v) * 0.03) +
        Math.cos(u * 3) * 0.35 +
        Math.sin(v * 3.5) * 0.2,
    ]
  },
  185,
  160,
  (a, b) => {
    if (Math.abs(Math.sin(a * Math.PI * 36)) > 0.985 || b < 0.007 || b > 0.993) return gold
    const thread = 0.86 + Math.sin(b * 1700) * 0.12
    return linen.map((value) => value * thread)
  },
)
await textile.save('selvedge')

await sharp(path.join(output, 'vesper.webp'))
  .extract({ left: 480, top: 440, width: 460, height: 600 })
  .resize(920, 1200)
  .webp({ quality: 92 })
  .toFile(path.join(output, 'vesper-detail.webp'))
await sharp(path.join(output, 'orrery.webp'))
  .rotate(42, { background: '#00000000' })
  .resize(1400, 1540, { fit: 'contain', background: '#00000000' })
  .webp({ quality: 90 })
  .toFile(path.join(output, 'lamina.webp'))
await sharp(path.join(output, 'selvedge.webp'))
  .flop()
  .modulate({ brightness: 1.15 })
  .webp({ quality: 90 })
  .toFile(path.join(output, 'veil.webp'))
const curves = Array.from({ length: 19 }, (_, i) => {
  const y = 410 + i * 42
  return `<path d="M350 ${y} Q700 ${y - 120} 1050 ${y}" />`
}).join('')
const processSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1540">
<rect width="1400" height="1540" fill="#eeeaf3"/>
<g fill="none" stroke="#726080" stroke-width="2">${curves}
<path d="M350 410Q310 850 700 1280Q1090 850 1050 410Q700 240 350 410Z M700 300V1280 M480 510L430 200L580 420 M920 510L970 200L820 420"/>
<path d="M440 650Q520 600 600 650 M800 650Q880 600 960 650" stroke="#008080" stroke-width="6"/></g>
<text x="120" y="1420" font-size="26" fill="#4e3c5f" font-family="sans-serif">VESPER / construction sketch / digital study</text></svg>`
await sharp(Buffer.from(processSVG))
  .webp({ quality: 90 })
  .toFile(path.join(output, 'vesper-process.webp'))

const corners = [
  [0, 0, 0],
  [24, 0, 0],
  [24, 24, 0],
  [0, 24, 0],
  [0, 0, 3],
  [24, 0, 3],
  [24, 24, 3],
  [0, 24, 3],
]
const triangles = [
  [0, 2, 1],
  [0, 3, 2],
  [4, 5, 6],
  [4, 6, 7],
  [0, 1, 5],
  [0, 5, 4],
  [1, 2, 6],
  [1, 6, 5],
  [2, 3, 7],
  [2, 7, 6],
  [3, 0, 4],
  [3, 4, 7],
]
const stl =
  'solid avl_illustrative_token\n' +
  triangles
    .map((indices) => {
      const points = indices.map((i) => corners[i])
      const normal = normalize(cross(sub(points[1], points[0]), sub(points[2], points[0])))
      return `facet normal ${normal.join(' ')}\nouter loop\n${points.map((p) => `vertex ${p.join(' ')}`).join('\n')}\nendloop\nendfacet`
    })
    .join('\n') +
  '\nendsolid avl_illustrative_token\n'
await writeFile(path.join(output, 'vesper-token.stl'), stl)

const pages = [
  [
    'VESPER / DIGITAL STUDY',
    'Original AVL portfolio demonstration',
    '',
    'A dark mask surface with a narrow gold ridge.',
    'Palette: graphite, muted gold, cool rim light.',
    'The digital presentation is complete; no physical mask exists.',
    '',
    'PROPORTION',
    'A tapered jaw balances two rising horns.',
    'Eye openings stay dark. The ridge carries the key light.',
    '',
    'FILES',
    'The sample STL is an illustrative 24 x 24 x 3 token.',
    'It is not the mask or a fabrication-ready costume pattern.',
  ],
  [
    'OPEN FABRICATION QUESTIONS',
    '',
    'Any future wearable version needs independent testing:',
    '- Visibility, ventilation and eye clearance.',
    '- Weight, balance and secure attachment.',
    '- Skin-safe materials and appropriate workshop practice.',
    '',
    'No physical materials have been verified by this study.',
    'The diagrams and renders are original digital illustrations.',
    '',
    'Resources: blender.org / general thermoplastic references.',
    'These demonstration links are not affiliate relationships.',
    '',
    'Original sample document for AVL Studio.',
  ],
]
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [4 0 R 6 0 R] /Count 2 >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
]
for (const lines of pages) {
  const stream = `BT /F1 12 Tf 60 770 Td 22 TL\n${lines.map((line, i) => `${i ? 'T* ' : ''}(${line.replace(/[\\()]/g, '\\$&')}) Tj`).join('\n')}\nET`
  const number = objects.length + 1
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${number + 1} 0 R >>`,
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  )
}
let pdf = '%PDF-1.4\n'
const offsets = [0]
objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(pdf))
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
})
const xref = Buffer.byteLength(pdf)
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
  .slice(1)
  .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
  .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
await writeFile(path.join(output, 'vesper-notes.pdf'), pdf)
console.log('Created original detail illustrations, sample PDF and illustrative STL.')

for (const name of ['mark', 'seal']) {
  const { data, info } = await sharp(path.join(root, 'public', 'brand', `avl-${name}.jpeg`))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 22
    // Remove only the pale neutral backdrop; keep the original foreground RGB.
    if (neutral) {
      const lightestBackground = Math.min(r, g, b)
      data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, (238 - lightestBackground) / 28)))
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(path.join(root, 'public', 'brand', `avl-${name}.png`))
}
console.log('Created original-colour transparent derivatives; source logos unchanged.')
