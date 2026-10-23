import type { Media, Post, Project } from '@/payload-types'
import type { Metadata } from 'next'

export type ExhibitionProject = Project & {
  demonstration?: true
  demoFilm?: { mp4: string; webm: string }
}
export type ExhibitionPost = Post & { demonstration?: true }

export function demoEnabled() {
  return process.env.AVL_DEMO_CONTENT === 'true'
}

const createdAt = '2026-10-23T10:00:00.000Z'
function studyImage(name: string, alt: string): Media {
  return {
    id: -1,
    alt,
    url: `/studies/${name}.webp`,
    width: 1400,
    height: 1540,
    createdAt,
    updatedAt: createdAt,
  }
}

function paragraphs(...text: string[]): Post['body'] {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: text.map((value) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        children: [
          {
            type: 'text',
            version: 1,
            text: value,
            format: 0,
            mode: 'normal',
            style: '',
            detail: 0,
          },
        ],
      })),
    },
  }
}

function storySections(...sections: [string, string][]): Post['body'] {
  const body = paragraphs()
  for (const [heading, text] of sections) {
    body.root.children.push(
      {
        type: 'heading',
        tag: 'h3',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        children: [
          {
            type: 'text',
            version: 1,
            text: heading,
            format: 0,
            mode: 'normal',
            style: '',
            detail: 0,
          },
        ],
      },
      ...paragraphs(text).root.children,
    )
  }
  return body
}

function studyFile(filename: string, alt: string, mimeType: string): Media {
  return {
    id: -10,
    url: `/studies/${filename}`,
    alt,
    filename,
    mimeType,
    createdAt,
    updatedAt: createdAt,
  }
}

export const demoProjects: ExhibitionProject[] = [
  {
    id: -1,
    slug: 'study-vesper',
    title: 'Vesper',
    summary:
      'A mask study in graphite and gold. A narrow ridge catches the light; the face stays in shadow.',
    category: 'costume',
    stage: 'completed',
    completedAt: '2026-10-20T12:00:00.000Z',
    demoFilm: { mp4: '/studies/vesper-film.mp4', webm: '/studies/vesper-film.webm' },
    layout: 'sanctuary',
    cover: studyImage(
      'vesper',
      'Original digital study of a dark, horned mask with fine gold inlays',
    ),
    gallery: [
      {
        image: studyImage('vesper-profile', 'Alternate view of the original digital mask geometry'),
        caption: 'Profile study / the ridge and horn silhouette.',
      },
      {
        image: studyImage('vesper-detail', 'Close-up of the gold seam and graphite mask surface'),
        caption: 'Surface detail / a small amount of reflected light.',
      },
      {
        image: studyImage(
          'vesper-process',
          'Original wireframe drawing showing the mask construction curves',
        ),
        caption: 'Construction drawing / curves before surface and light.',
      },
    ],
    story: storySections(
      [
        'A face without a character',
        'Vesper starts with a silhouette, not a backstory. Two rising horns and a narrow central ridge do most of the work. The eye openings interrupt the surface without becoming its brightest point. This is an original digital study; no physical costume has been made. The completion date refers to this digital presentation.',
      ],
      [
        'Finding the proportion',
        'The first surface was too wide at the jaw. Tapering the lower edge made the forehead feel heavier without adding ornament. The profile view tests whether the central ridge still reads when the mask turns away from the camera.',
      ],
      [
        'Graphite, interrupted',
        'The surface is generated from a curved mesh. Narrow gold seams use the same geometry rather than floating above it. A broad key light reveals the centre; a cooler rim separates the edge from the background. The close-up shows where a seam disappears into shadow. These are rendered colour studies, not verified physical materials.',
      ],
      [
        'From image to object',
        'A physical version would need an entirely separate fit and safety study: eye clearance, ventilation, visibility, weight and secure attachment. Neither the illustration nor the sample STL is a wearable pattern. The included STL is a simple ornamental test token for demonstrating file delivery.',
      ],
      [
        'Notes from the workbench',
        'The downloadable PDF records the palette, proportions and open fabrication questions. Blender is linked as an example modelling tool; the material reference is general educational reading. No product endorsement, purchase tracking or affiliate relationship is implied by these demonstration links.',
      ],
    ),
    resources: [
      {
        label: 'Vesper / design notes',
        kind: 'download',
        description: 'Original two-page digital-study notes (PDF). No fabrication instructions.',
        file: studyFile('vesper-notes.pdf', 'Vesper digital study design notes', 'application/pdf'),
      },
      {
        label: 'Ornamental test token',
        kind: 'download',
        description:
          'Original illustrative STL, 24 × 24 × 3 model units. Not the mask, not wearable, and not a validated fabrication file.',
        file: studyFile('vesper-token.stl', 'Illustrative ornamental test token STL', 'model/stl'),
      },
      {
        label: 'Blender',
        kind: 'link',
        description:
          'Open-source modelling and rendering software. Independent external resource; not an affiliate link.',
        url: 'https://www.blender.org/',
      },
      {
        label: 'Material reference / thermoplastics',
        kind: 'link',
        description:
          'General material background for future experiments. Not a purchase recommendation or affiliate link.',
        url: 'https://en.wikipedia.org/wiki/Thermoplastic',
      },
    ],
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -2,
    slug: 'study-orrery',
    title: 'Orrery',
    summary:
      'Three offset rings around a suspended core. A prop study in balance, ribs and worn metal.',
    category: 'props',
    stage: 'upcoming',
    layout: 'gallery',
    cover: studyImage(
      'orrery',
      'Original digital study of nested gold and graphite rings around a sculpted core',
    ),
    story: paragraphs(
      'An original digital concept for an upcoming prop exploration. No physical prop is complete; the image illustrates a possible direction.',
      'The rings share a centre but not a plane. Dark metal breaks up the gold, and repeated ribs let the shape read differently from each angle.',
    ),
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -3,
    slug: 'study-selvedge',
    title: 'Selvedge',
    summary:
      'A folded surface with a fine metallic edge. A textile study concerned with weight and rhythm.',
    category: 'art',
    stage: 'in-progress',
    layout: 'sanctuary',
    cover: studyImage(
      'selvedge',
      'Original digital study of a green-grey folded textile with gold threads',
    ),
    story: paragraphs(
      'An original procedural textile illustration for the website preview, not a finished garment or a claim about a particular material.',
      'Closely spaced folds take the place of ornament. A small change in lighting brings one edge forward and lets the next disappear.',
    ),
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -4,
    slug: 'study-lamina',
    title: 'Lamina',
    summary:
      'A thin shell around a dark centre. An early surface experiment for a future accessory.',
    category: 'props',
    stage: 'upcoming',
    layout: 'gallery',
    cover: studyImage('lamina', 'Original digital shell study with nested gold ribs'),
    story: paragraphs(
      'An original digital concept. The thin shell tests a different arrangement of the same procedural ring geometry; no physical object or release date is promised.',
    ),
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -5,
    slug: 'study-veil',
    title: 'Veil',
    summary: 'A small textile fragment, held against the light. Testing a finer metallic edge.',
    category: 'art',
    stage: 'in-progress',
    layout: 'sanctuary',
    cover: studyImage('veil', 'Original alternate digital textile study with a fine gold edge'),
    story: paragraphs(
      'An original procedural textile variation. This preview is a digital experiment, not a finished garment.',
    ),
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
]

export const demoPosts: ExhibitionPost[] = [
  {
    id: -1,
    slug: 'study-light-on-an-edge',
    title: 'Light on an edge',
    summary:
      'A narrow gold line changes the whole silhouette. Testing how little detail a surface needs.',
    publishedAt: createdAt,
    body: paragraphs(
      'Sample journal entry. This note accompanies the digital mask study used in the website preview.',
      'The first version had too many bright lines. Removing most of them left a stronger shape: the eye follows the central ridge, then returns to the unlit areas.',
      'For a real build, a note like this could sit beside a close-up, a material sample or a photograph from the workbench.',
    ),
    cover: demoProjects[0].cover,
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -3,
    slug: 'study-a-centre-without-support',
    title: 'A centre without support',
    summary: 'The rings share a centre, but not a plane. A short note on the Orrery concept.',
    publishedAt: '2026-10-18T10:00:00.000Z',
    body: paragraphs(
      'Sample journal entry for the digital Orrery concept.',
      'Three intersecting rings can look heavy or almost weightless depending on their spacing. This version leaves the centre dark, with the brighter outer edges describing the volume.',
      'A physical suspension mechanism remains an open design question. The illustration does not solve it.',
    ),
    cover: demoProjects[1].cover,
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -4,
    slug: 'study-what-to-leave-out',
    title: 'What to leave out',
    summary: 'Fewer seams, a quieter silhouette. Comparing a detail with the whole object.',
    publishedAt: '2026-10-14T10:00:00.000Z',
    body: paragraphs(
      'Sample journal entry about the original digital mask study.',
      'A close-up makes every surface variation feel important. Stepping back is a useful correction: if the whole silhouette no longer reads, the detail is doing too much.',
      'The next experiment is not another ornament. It is a different lighting angle.',
    ),
    cover: demoProjects[0].cover,
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -5,
    slug: 'study-first-curves',
    title: 'First curves',
    summary: 'Before surface and light: a few construction lines to test a shape.',
    publishedAt: '2026-10-10T10:00:00.000Z',
    body: paragraphs(
      'Sample journal entry for the portfolio preview.',
      'The construction drawing stays deliberately plain. It is easier to change a proportion before the surface has enough detail to become precious.',
    ),
    cover: studyImage('vesper-process', 'Construction curves of the original mask study'),
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: -2,
    slug: 'study-folds-and-weight',
    title: 'Folds & weight',
    summary:
      'Testing a softer surface against the rigid forms. Repetition, without perfect symmetry.',
    publishedAt: '2026-10-21T10:00:00.000Z',
    body: paragraphs(
      'Sample journal entry accompanying the procedural textile study.',
      'The folds repeat, but the surface bends across them. That small interruption makes the result less like a diagram and more like something with weight.',
      'These preview notes demonstrate the journal layout. They can be removed together with the demonstration projects, without changing real published content.',
    ),
    cover: demoProjects[2].cover,
    demonstration: true,
    createdAt,
    updatedAt: createdAt,
  },
]

export function exhibitionContent<T>(published: T[], samples: T[], enabled = demoEnabled()): T[] {
  return published.length ? published : enabled ? samples : []
}

export function demoProject(slug: string, enabled = demoEnabled()) {
  return enabled ? demoProjects.find((project) => project.slug === slug) || null : null
}

export function demoPost(slug: string, enabled = demoEnabled()) {
  return enabled ? demoPosts.find((post) => post.slug === slug) || null : null
}

export function demoMetadata(item: { demonstration?: true }): Metadata {
  return item.demonstration
    ? { robots: { index: false, follow: false }, alternates: { canonical: null } }
    : {}
}
