import type { Mesa } from '../types/domain'

export type PushStatus =
  | 'unsupported'
  | 'default'
  | 'requesting'
  | 'subscribed'
  | 'denied'
  | 'error'

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function ativarPushNotifications(clienteId: string): Promise<PushStatus> {
  if (!isPushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission === 'denied') return 'denied'
  if (permission !== 'granted') return 'default'

  const registration = await navigator.serviceWorker.register('/sw.js')
  const existingSubscription = await registration.pushManager.getSubscription()
  await existingSubscription?.unsubscribe()

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: await getApplicationServerKey(),
  })

  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clienteId, subscription }),
  })

  if (!response.ok) throw new Error('Nao foi possivel salvar a inscricao de push.')

  return 'subscribed'
}

export async function enviarPushMesaPronta(clienteId: string, mesa: Mesa): Promise<void> {
  await fetch('/api/push/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clienteId,
      title: 'Sua mesa esta pronta',
      body: `Mesa ${mesa.numero_mesa} pronta. Dirija-se a recepcao.`,
      mesa: mesa.numero_mesa,
      url: '/',
    }),
  })
}

async function getApplicationServerKey(): Promise<ArrayBuffer> {
  const response = await fetch('/api/push/vapid-public-key')
  if (!response.ok) throw new Error('Chave publica VAPID indisponivel.')

  const { publicKey } = (await response.json()) as { publicKey: string }
  return urlBase64ToArrayBuffer(publicKey)
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length))

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray.buffer
}
