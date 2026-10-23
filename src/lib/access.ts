import type { Access } from 'payload'

export const ownerOnly: Access = ({ req }) => Boolean(req.user)
export const publishedOrOwner: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
