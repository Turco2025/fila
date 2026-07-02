import { existsSync, readFileSync } from 'node:fs'
import cors from 'cors'
import express from 'express'
import webpush from 'web-push'

loadEnvFile()

const app = express()
const port = Number(process.env.PUSH_SERVER_PORT ?? 8787)
const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@mesacerta.local'

const generatedKeys =
  process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
    ? undefined
    : webpush.generateVAPIDKeys()

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY ?? generatedKeys.publicKey
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? generatedKeys.privateKey

webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey)

const subscriptionsByClient = new Map()

app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173'] }))
app.use(express.json({ limit: '256kb' }))

app.get('/api/push/vapid-public-key', (_request, response) => {
  response.json({ publicKey: vapidPublicKey })
})

app.post('/api/push/subscribe', (request, response) => {
  const { clienteId, subscription } = request.body ?? {}

  if (!clienteId || !subscription?.endpoint) {
    response.status(400).json({ error: 'clienteId e subscription sao obrigatorios.' })
    return
  }

  subscriptionsByClient.set(clienteId, subscription)
  response.status(201).json({ ok: true, totalSubscriptions: subscriptionsByClient.size })
})

app.post('/api/push/unsubscribe', (request, response) => {
  const { clienteId } = request.body ?? {}

  if (clienteId) subscriptionsByClient.delete(clienteId)
  response.json({ ok: true, totalSubscriptions: subscriptionsByClient.size })
})

app.post('/api/push/notify', async (request, response) => {
  const { clienteId, title, body, mesa, url } = request.body ?? {}
  const subscription = subscriptionsByClient.get(clienteId)

  if (!subscription) {
    response.status(202).json({ delivered: 0, reason: 'Cliente ainda nao ativou push notification.' })
    return
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: title ?? 'Sua mesa esta pronta',
        body: body ?? 'Dirija-se a recepcao.',
        mesa,
        url: url ?? '/',
      }),
    )

    response.json({ delivered: 1 })
  } catch (error) {
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      subscriptionsByClient.delete(clienteId)
    }

    response.status(500).json({
      delivered: 0,
      error: error instanceof Error ? error.message : 'Falha ao enviar push.',
    })
  }
})

app.get('/api/push/health', (_request, response) => {
  response.json({
    ok: true,
    subscriptions: subscriptionsByClient.size,
    vapidSubject: subject,
    generatedDevKeys: Boolean(generatedKeys),
  })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`Push server listening on http://127.0.0.1:${port}`)
  if (generatedKeys) {
    console.log('Using generated development VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in production.')
  }
})

function loadEnvFile() {
  if (!existsSync('.env')) return

  const envFile = readFileSync('.env', 'utf8')

  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    const separatorIndex = trimmedLine.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    const value = rawValue.replace(/^['"]|['"]$/g, '')

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}
