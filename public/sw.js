self.addEventListener('push', (event) => {
  let data = {}

  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {
      title: 'Sua mesa esta pronta',
      body: event.data?.text() ?? 'Dirija-se a recepcao.',
    }
  }

  const title = data.title ?? 'Sua mesa esta pronta'
  const options = {
    body: data.body ?? 'Dirija-se a recepcao.',
    badge: '/vite.svg',
    icon: '/vite.svg',
    data: {
      url: data.url ?? '/',
      mesa: data.mesa,
    },
    requireInteraction: true,
    tag: data.mesa ? `mesa-${data.mesa}` : 'mesa-pronta',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = new URL(event.notification.data?.url ?? '/', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => client.url === targetUrl)

      if (matchingClient) return matchingClient.focus()
      return self.clients.openWindow(targetUrl)
    }),
  )
})
