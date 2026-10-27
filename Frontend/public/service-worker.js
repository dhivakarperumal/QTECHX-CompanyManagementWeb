self.addEventListener('notificationclick', event => {
  event.notification.close()

  const link = typeof event.notification.data?.link === 'string'
    ? event.notification.data.link
    : ''
  const target = new URL(self.location.origin)
  target.hash = link.startsWith('#') ? link.slice(1) : link

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const appWindow = windows.find(client => new URL(client.url).origin === self.location.origin)
    if (appWindow) {
      await appWindow.navigate(target.href)
      return appWindow.focus()
    }
    return self.clients.openWindow(target.href)
  })())
})
