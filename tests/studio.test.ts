import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { mkdir, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import type { Payload } from 'payload'
import type { User } from '../src/payload-types'

let payload: Payload
let user: User

beforeAll(async () => {
  await mkdir('test-results', { recursive: true })
  await rm('test-results/studio-test.db', { force: true })
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')
  payload = await getPayload({ config })
  user = await payload.create({
    collection: 'users',
    data: {
      email: 'owner@example.test',
      name: 'Test owner',
      password: 'test-owner-password-0000',
    },
  })
})
afterAll(async () => {
  await payload?.destroy()
})

describe('Studio publishing and access', () => {
  it('the server CLI provisions an owner and resets the password without exposing credentials', async () => {
    const invoke = (password: string) =>
      execFileSync(
        process.execPath,
        [path.resolve('node_modules/tsx/dist/cli.mjs'), 'scripts/create-owner.ts'],
        {
          encoding: 'utf8',
          timeout: 30000,
          env: {
            ...process.env,
            DATABASE_PUSH: 'false',
            AVL_OWNER_EMAIL: 'cli-owner@example.test',
            AVL_OWNER_NAME: 'CLI owner',
            AVL_OWNER_PASSWORD: password,
          },
        },
      )
    const initial = 'cli-password-first-0000'
    const replacement = 'cli-password-replaced-0000'
    expect(invoke(initial)).toContain('Owner created.')
    const output = invoke(replacement)
    expect(output).toContain('Owner password updated.')
    expect(output).not.toContain(replacement)
    const login = await payload.login({
      collection: 'users',
      data: { email: 'cli-owner@example.test', password: replacement },
    })
    expect(login.user?.email).toBe('cli-owner@example.test')
    expect(login.token).toBeTruthy()
  })

  it('published content remains public and drafts stay private', async () => {
    const base = {
      summary: 'A real publishing test.',
      category: 'props' as const,
      stage: 'completed' as const,
      layout: 'sanctuary' as const,
    }
    const draft = await payload.create({
      collection: 'projects',
      draft: true,
      data: { ...base, title: 'Unannounced work', slug: 'unannounced-work', _status: 'draft' },
    })
    const published = await payload.create({
      collection: 'projects',
      data: { ...base, title: 'Finished work', slug: 'finished-work', _status: 'published' },
    })
    const publicProjects = await payload.find({ collection: 'projects', overrideAccess: false })
    expect(publicProjects.docs.map((item) => item.id)).toContain(published.id)
    expect(publicProjects.docs.map((item) => item.id)).not.toContain(draft.id)
    const privateResult = await payload.find({
      collection: 'projects',
      overrideAccess: false,
      where: { slug: { equals: draft.slug } },
    })
    expect(privateResult.docs).toHaveLength(0)
    await payload.update({
      collection: 'projects',
      id: published.id,
      draft: true,
      data: { title: 'Unreleased revision', _status: 'draft' },
    })
    const publicRevision = await payload.find({
      collection: 'projects',
      draft: false,
      overrideAccess: false,
      where: { id: { equals: published.id } },
    })
    expect(publicRevision.docs[0]?.title).toBe('Finished work')
    const ownerRevision = await payload.find({
      collection: 'projects',
      draft: true,
      overrideAccess: false,
      user,
      where: { id: { equals: published.id } },
    })
    expect(ownerRevision.docs[0]?.title).toBe('Unreleased revision')
    const post = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: 'Private note',
        slug: 'private-note',
        summary: 'Not announced.',
        _status: 'draft',
        body: {
          root: {
            type: 'root',
            version: 1,
            children: [
              {
                type: 'paragraph',
                version: 1,
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: 'A studio note.',
                    format: 0,
                    detail: 0,
                    mode: 'normal',
                    style: '',
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
          },
        },
      },
    })
    expect((await payload.find({ collection: 'posts', overrideAccess: false })).docs).toHaveLength(
      0,
    )
    await payload.update({ collection: 'posts', id: post.id, data: { _status: 'published' } })
    expect((await payload.find({ collection: 'posts', overrideAccess: false })).docs[0].title).toBe(
      'Private note',
    )
  })

  it('an authenticated owner can publish a project and change commission availability', async () => {
    const result = await payload.create({
      collection: 'projects',
      overrideAccess: false,
      user,
      data: {
        title: 'Owner creation',
        slug: 'owner-creation',
        summary: 'Controlled by the artist.',
        category: 'art',
        stage: 'upcoming',
        layout: 'gallery',
        _status: 'published',
      },
    })
    expect(result.title).toBe('Owner creation')
    expect(result.stage).toBe('upcoming')
    await payload.updateGlobal({
      slug: 'site-settings',
      overrideAccess: false,
      user,
      data: { commissionsOpen: true, commissionNote: 'Selected projects welcome.' },
    })
    const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false })
    expect(settings.commissionsOpen).toBe(true)
    expect(settings.commissionNote).toBe('Selected projects welcome.')
  })

  it('showcase starts on its configured published project without exposing drafts', async () => {
    const { getHomepageContent } = await import('../src/lib/content')
    for (let index = 0; index < 13; index++) {
      await payload.create({
        collection: 'projects',
        data: {
          title: `Orbit ${index}`,
          slug: `orbit-${index}`,
          summary: 'Published work.',
          category: 'art',
          stage: 'completed',
          layout: 'gallery',
          order: index,
          _status: 'published',
        },
      })
    }
    const project = await payload.create({
      collection: 'projects',
      data: {
        title: 'Initial distant project',
        slug: 'initial-distant-project',
        summary: 'Chosen by the artist.',
        category: 'props',
        stage: 'completed',
        completedAt: '2025-04-12T12:00:00.000Z',
        layout: 'gallery',
        order: 100,
        _status: 'published',
      },
    })
    await payload.updateGlobal({
      slug: 'site-settings',
      overrideAccess: false,
      user,
      data: { initialProject: project.id },
    })
    const selected = await getHomepageContent()
    expect(selected.projects).toHaveLength(12)
    expect(selected.projects.find((item) => item.id === selected.projectID)?.completedAt).toBe(
      '2025-04-12T12:00:00.000Z',
    )
    await payload.update({
      collection: 'projects',
      id: project.id,
      draft: false,
      data: { _status: 'draft' },
    })
    const hidden = await getHomepageContent()
    expect(hidden.projects.some((item) => item.id === project.id)).toBe(false)
    expect(hidden.projects.length).toBeGreaterThan(0)
    await payload.delete({ collection: 'projects', id: project.id })
    const deleted = await getHomepageContent()
    expect(deleted.projects.some((item) => item.id === project.id)).toBe(false)
  })

  it('unauthenticated callers cannot write or access audience data', async () => {
    await expect(
      payload.create({
        collection: 'users',
        overrideAccess: false,
        data: {
          email: 'intruder@example.test',
          password: 'not-authorized-0000',
          name: 'Intruder',
        },
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'projects',
        overrideAccess: false,
        data: {
          title: 'Unauthorized',
          slug: 'unauthorized',
          summary: 'Blocked.',
          category: 'props',
          stage: 'completed',
          layout: 'sanctuary',
        },
      }),
    ).rejects.toThrow()
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        overrideAccess: false,
        data: { commissionsOpen: false },
      }),
    ).rejects.toThrow()
    const { GET, POST } = await import('../src/app/(site)/api/audience/route')
    const response = await GET(new Request('http://localhost:3000/api/audience'))
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Administrator login required.' })
    const change = await POST(
      new Request('http://localhost:3000/api/audience', {
        method: 'POST',
        headers: { Origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '123' }),
      }),
    )
    expect(change.status).toBe(401)
    const { createLocalReq } = await import('payload')
    const endpoints = payload.config.collections.find((item) => item.slug === 'users')?.endpoints
    const bootstrap = endpoints
      ? await endpoints
          .find((endpoint) => endpoint.path === '/first-register')
          ?.handler(await createLocalReq({}, payload))
      : undefined
    expect(bootstrap?.status).toBe(403)
  })

  it('public downloads and accessible image metadata survive upload and retrieval', async () => {
    const asset = await payload.create({
      collection: 'media',
      user,
      overrideAccess: false,
      data: { alt: 'Original AVL seal', credit: 'AVL' },
      filePath: 'public/brand/avl-seal.jpeg',
    })
    expect(asset.mimeType).toBe('image/jpeg')
    expect(asset.alt).toBe('Original AVL seal')
    const publicAsset = await payload.findByID({
      collection: 'media',
      id: asset.id,
      overrideAccess: false,
    })
    expect(new URL(publicAsset.url!).pathname).toMatch(/^\/api\/media\/file\//)
    expect(publicAsset.sizes?.card?.width).toBe(900)
  })

  it('project browsing keeps later pages discoverable and applies filters before pagination', async () => {
    for (let index = 0; index < 13; index++) {
      await payload.create({
        collection: 'projects',
        data: {
          title: `Software ${index}`,
          slug: `software-${index}`,
          summary: 'A pagination example.',
          category: 'software',
          stage: 'completed',
          layout: 'gallery',
          _status: 'published',
        },
      })
    }
    const { getProjects } = await import('../src/lib/content')
    const first = await getProjects(1, 'software')
    const second = await getProjects(2, 'software')
    expect(first.docs).toHaveLength(12)
    expect(first.hasNextPage).toBe(true)
    expect(second.docs).toHaveLength(1)
    expect(second.totalDocs).toBe(13)
    expect(second.docs[0].category).toBe('software')
    expect(first.docs.map((item) => item.id)).not.toContain(second.docs[0].id)
  })
})
