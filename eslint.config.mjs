import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'media/**',
    'test-results/**',
    'next-env.d.ts',
    'src/payload-types.ts',
    'src/migrations/**',
    'src/app/(payload)/admin/importMap.js',
  ]),
  {
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
])
