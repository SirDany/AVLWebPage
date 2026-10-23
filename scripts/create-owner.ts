import nextEnv from '@next/env'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { Writable } from 'node:stream'

nextEnv.loadEnvConfig(process.cwd())
const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
let hidden = false
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!hidden) stdout.write(chunk, encoding)
    callback()
  },
})
const terminal = createInterface({
  input: stdin,
  output,
  terminal: Boolean(stdin.isTTY && stdout.isTTY),
})
try {
  const payload = await getPayload({ config })
  const email = (process.env.AVL_OWNER_EMAIL || (await terminal.question('Owner email: '))).trim()
  const name = (process.env.AVL_OWNER_NAME || (await terminal.question('Display name: '))).trim()
  let password = process.env.AVL_OWNER_PASSWORD
  if (!password) {
    stdout.write('Password (at least 16 characters, input hidden): ')
    hidden = true
    password = await terminal.question('')
    hidden = false
    stdout.write('\n')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || password.length < 16) {
    throw new Error(
      'A valid email, display name, and password of at least 16 characters are required.',
    )
  }
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (existing.docs.length) {
    await payload.update({ collection: 'users', id: existing.docs[0].id, data: { password, name } })
    console.log('Owner password updated.')
  } else {
    await payload.create({ collection: 'users', data: { email, password, name } })
    console.log('Owner created. Sign in at /admin.')
  }
  await payload.destroy()
} finally {
  hidden = false
  terminal.close()
}
process.exit(0)
