import { withPayload } from '@payloadcms/next/withPayload'

export default withPayload({
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/studies/vesper-token.stl',
        headers: [
          { key: 'Content-Type', value: 'model/stl' },
          { key: 'Content-Disposition', value: 'attachment; filename="vesper-token.stl"' },
        ],
      },
    ]
  },
})
