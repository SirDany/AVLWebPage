import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Media, Posts, Projects, SiteSettings, Users } from './collections'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const secret = process.env.PAYLOAD_SECRET
const databaseURL = process.env.DATABASE_URL
if (!secret || secret.length < 32)
  throw new Error('PAYLOAD_SECRET must contain at least 32 characters.')
if (!databaseURL) throw new Error('DATABASE_URL is required.')
const siteURL = new URL(process.env.SITE_URL || 'http://localhost:3000')
if (
  process.env.NODE_ENV === 'production' &&
  siteURL.protocol !== 'https:' &&
  !['localhost', '127.0.0.1'].includes(siteURL.hostname)
) {
  throw new Error('Production SITE_URL must use HTTPS.')
}

export default buildConfig({
  secret,
  serverURL: siteURL.origin,
  csrf: [siteURL.origin],
  cors: [siteURL.origin],
  admin: {
    user: 'users',
    avatar: 'default',
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' | AVL Studio' },
    components: {
      beforeDashboard: ['/components/admin/StudioOverview#StudioOverview'],
      graphics: { Logo: '/components/admin/Brand#Brand', Icon: '/components/admin/Brand#Brand' },
    },
  },
  collections: [Users, Projects, Posts, Media],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  db: databaseURL.startsWith('file:')
    ? sqliteAdapter({ client: { url: databaseURL }, push: process.env.DATABASE_PUSH === 'true' })
    : postgresAdapter({
        pool: { connectionString: databaseURL },
        push: process.env.DATABASE_PUSH === 'true',
        migrationDir: path.resolve(dirname, 'migrations'),
      }),
  sharp,
  email: () => ({
    name: 'disabled-until-configured',
    defaultFromAddress: 'unconfigured@example.invalid',
    defaultFromName: 'AVL Studio',
    sendEmail: async () => {
      throw new Error(
        'Transactional email is not configured. Use the owner CLI for password recovery.',
      )
    },
  }),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  upload: { limits: { fileSize: 25 * 1024 * 1024 }, abortOnLimit: true },
  telemetry: false,
  graphQL: { disable: true },
})
