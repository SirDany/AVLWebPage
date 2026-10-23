import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { ownerOnly, publishedOrOwner } from './lib/access'
import { isVideoID, validateSlug, validateURL } from './lib/validation'

const writeAccess = { create: ownerOnly, update: ownerOnly, delete: ownerOnly }
const title: Field = { name: 'title', type: 'text', required: true }
const slug: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  validate: validateSlug,
  admin: { description: 'Stable URL identifier. Changing it changes the public URL.' },
}
const summary: Field = { name: 'summary', type: 'textarea', required: true, maxLength: 320 }
const image: Field = {
  name: 'cover',
  type: 'relationship',
  relationTo: 'media',
  filterOptions: { mimeType: { like: 'image/' } },
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', group: 'Studio' },
  auth: {
    tokenExpiration: 7200,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.SITE_URL?.startsWith('https://') },
    forgotPassword: {
      generateEmailHTML: () => {
        throw new Error('Email password reset is not configured. Use the owner CLI on the server.')
      },
    },
  },
  access: { ...writeAccess, read: ownerOnly, admin: ({ req }) => Boolean(req.user) },
  endpoints: [
    {
      path: '/first-register',
      method: 'post',
      handler: () =>
        Response.json({ error: 'Create the initial owner using the server CLI.' }, { status: 403 }),
    },
  ],
  fields: [{ name: 'name', type: 'text', required: true }],
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Publishing',
    description: 'Public assets only. Never upload paid files or private documents.',
  },
  access: { ...writeAccess, read: () => true },
  upload: {
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'application/pdf',
      'application/zip',
      'model/stl',
      'application/sla',
      'application/octet-stream',
    ],
    imageSizes: [{ name: 'card', width: 900, height: 700, position: 'centre' }],
    adminThumbnail: 'card',
    filesRequiredOnCreate: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image or download accessibly.' },
    },
    { name: 'credit', type: 'text' },
  ],
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    group: 'Publishing',
    defaultColumns: ['title', 'stage', '_status'],
    preview: (data) => `/preview/projects/${data.id}`,
  },
  access: { ...writeAccess, read: publishedOrOwner },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    title,
    slug,
    summary,
    image,
    {
      name: 'stage',
      type: 'select',
      required: true,
      defaultValue: 'completed',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Upcoming', value: 'upcoming' },
      ],
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Completion date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Optional actual completion date. Not the publication date.',
        condition: (_, data) => data.stage === 'completed',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'props',
      options: [
        { label: 'Costume & character', value: 'costume' },
        { label: 'Props & objects', value: 'props' },
        { label: 'Art', value: 'art' },
        { label: 'Software', value: 'software' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'sanctuary',
      required: true,
      options: [
        { label: 'Sanctuary / immersive', value: 'sanctuary' },
        { label: 'Gallery / editorial', value: 'gallery' },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number', defaultValue: 0 },
    {
      name: 'gallery',
      type: 'array',
      maxRows: 30,
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
          filterOptions: { mimeType: { like: 'image/' } },
        },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'story',
      type: 'richText',
      admin: {
        description:
          'Optional journey: headings, paragraphs, lists, links, and images. The finished work always appears first.',
      },
    },
    {
      name: 'youtubeID',
      type: 'text',
      label: 'YouTube video ID',
      validate: (value: unknown) =>
        !value || isVideoID(value) ? true : 'Enter the 11-character video ID, not the full URL.',
    },
    {
      name: 'resources',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'link',
          required: true,
          options: [
            { label: 'Tool or material link', value: 'link' },
            { label: 'Public download', value: 'download' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          validate: validateURL,
          admin: { condition: (_, sibling) => sibling.kind === 'link' },
          hooks: {
            beforeValidate: [
              ({ value, siblingData }) => {
                if (siblingData?.kind === 'link' && !value)
                  throw new Error('A tool or material link requires an HTTPS URL.')
                return value
              },
            ],
          },
        },
        {
          name: 'file',
          type: 'relationship',
          relationTo: 'media',
          admin: { condition: (_, sibling) => sibling.kind === 'download' },
          hooks: {
            beforeValidate: [
              ({ value, siblingData }) => {
                if (siblingData?.kind === 'download' && !value)
                  throw new Error('A public download requires a file.')
                return value
              },
            ],
          },
        },
        {
          name: 'affiliate',
          type: 'checkbox',
          label: 'Affiliate link (disclosure shown publicly)',
          defaultValue: false,
        },
      ],
    },
  ],
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Journal entry', plural: 'Journal' },
  admin: {
    useAsTitle: 'title',
    group: 'Publishing',
    preview: (data) => `/preview/posts/${data.id}`,
  },
  access: { ...writeAccess, read: publishedOrOwner },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    title,
    slug,
    summary,
    image,
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    { name: 'body', type: 'richText', required: true },
  ],
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site & commissions',
  admin: { group: 'Studio' },
  access: { read: () => true, update: ownerOnly },
  fields: [
    {
      name: 'initialProject',
      type: 'relationship',
      relationTo: 'projects',
      filterOptions: { _status: { equals: 'published' } },
      admin: { description: 'Initially expanded homepage project. Only published work is shown.' },
    },
    { name: 'tagline', type: 'text', required: true, defaultValue: 'Artifacts from elsewhere.' },
    {
      name: 'introduction',
      type: 'textarea',
      required: true,
      defaultValue:
        'Costumes, props, and art at the edge of the familiar. Imagined by AVL. Brought into the physical world.',
    },
    { name: 'commissionsOpen', type: 'checkbox', defaultValue: false },
    {
      name: 'commissionNote',
      type: 'textarea',
      defaultValue:
        'For commission inquiries, include the idea, intended timeline, and approximate budget.',
    },
    {
      name: 'contactEmail',
      type: 'email',
      admin: { description: 'Published on the contact page. Use a dedicated studio address.' },
    },
    { name: 'about', type: 'richText' },
    {
      name: 'socials',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true, validate: validateURL },
      ],
    },
    {
      name: 'privacyNotice',
      type: 'richText',
      admin: {
        description:
          'Complete the applicable privacy notice before enabling newsletter signup or launching publicly.',
      },
    },
    {
      name: 'legalNotice',
      type: 'richText',
      admin: {
        description:
          'Legal identity and jurisdiction-specific disclosures. Public launch requires review.',
      },
    },
    {
      name: 'newsletterEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Enable only after provider double opt-in, sender verification, and the privacy notice are configured.',
      },
    },
  ],
}
