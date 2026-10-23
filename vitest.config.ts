import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@payload-config': fileURLToPath(new URL('./src/payload.config.ts', import.meta.url)),
    },
  },
  test: {
    env: {
      PAYLOAD_SECRET: 'test-only-secret-not-for-deployment-000000',
      DATABASE_URL: 'file:./test-results/studio-test.db',
      DATABASE_PUSH: 'true',
      SITE_URL: 'http://localhost:3000',
      MEDIA_DIR: 'test-results/media',
    },
    include: ['tests/**/*.test.{ts,tsx}'],
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 60000,
  },
})
