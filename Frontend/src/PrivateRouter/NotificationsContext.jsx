import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { io } from 'socket.io-client'
import api, { API_URL } from '../api'
import { useAuth } from './AuthContext'
import { NotificationsContext, useNotifications } from './NotificationsContext'

const socketUrl = API_URL.replace(/\/api\/?$/, '') || window.location.origin

function getDesktopPermission() {
  if (typeof window === 'undefined' || !('Notification' in window) || !window.isSecureContext) {
    return 'unsupported'
  }
  return window.Notification.permission
}

function showDesktopNotification(notification, { onShow, onError } = {}) {
  const permission = getDesktopPermission()
  if (permission !== 'granted') {
    if (permission === 'denied') {
      throw new Error('Notifications are blocked for this site. Allow them in browser site settings.')
    }
    return false
  }

  const desktopNotification = new window.Notification(notification.title, {
    body: notification.message,
    icon: '/favicon.ico',
    tag: notification.id,
  })
  desktopNotification.onerror = error => {
    console.error('[Notifications] Browser could not display desktop notification:', error)
    onError?.(error)
  }
  desktopNotification.onshow = () => onShow?.()
  desktopNotification.onclick = () => {
    window.focus()
    if (notification.link) window.location.hash = `#${notification.link}`
    desktopNotification.close()
  }
  return desktopNotification
}

export function NotificationsProvider({ children }) {
  const { user, logout } = useAuth()
  const userId = user?.user_id || user?.id
  const token = localStorage.getItem('token')
  const userRole = String(user?.role || '').toLowerCase()

  return (
    <NotificationsSession
      key={userId || 'anonymous'}
      userId={userId}
      token={token}
      userRole={userRole}
      logout={logout}
    >
      {children}
    </NotificationsSession>
  )
}

function NotificationsSession({ children, userId, token, userRole, logout }) {
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [connectionError, setConnectionError] = useState('')
  const [liveConnected, setLiveConnected] = useState(false)

  useEffect(() => {
    if (!userId || !token) return undefined

    let active = true
    let sessionInvalid = false
    let initialLoadComplete = false
    let refreshInProgress = false
    const seenNotificationIds = new Set()
    const handleInvalidSession = error => {
      const isExpiredToken =
        error.response?.status === 403 &&
        error.response?.data?.message === 'Invalid or expired token'

      if (!isExpiredToken || sessionInvalid) return false
      sessionInvalid = true
      logout()
      return true
    }

    const receiveNotification = notification => {
      if (!active || !notification?.id || seenNotificationIds.has(String(notification.id))) return
      seenNotificationIds.add(String(notification.id))
      setNotifications(current => [
        notification,
        ...current.filter(item => item.id !== notification.id),
      ].slice(0, 100))
      setToast(notification)
      try {
        showDesktopNotification(notification)
      } catch (error) {
        console.error('[Notifications] Could not show desktop notification:', error)
      }
    }

    const refreshNotifications = ({ notifyNew = false } = {}) => {
      if (refreshInProgress) return Promise.resolve()
      refreshInProgress = true
      return api.get('/notifications', { params: { limit: 50 } })
        .then(({ data }) => {
          if (!active) return
          const savedNotifications = data?.data || []
          if (initialLoadComplete && notifyNew) {
            savedNotifications
              .filter(item => !seenNotificationIds.has(String(item.id)))
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .forEach(receiveNotification)
          } else {
            savedNotifications.forEach(item => seenNotificationIds.add(String(item.id)))
          }
          initialLoadComplete = true
          setNotifications(current => {
            const byId = new Map(savedNotifications.map(item => [item.id, item]))
            current.forEach(item => {
              if (!byId.has(item.id)) byId.set(item.id, item)
            })
            return [...byId.values()]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 100)
          })
          setLoadError('')
        })
        .catch(error => {
          if (!active) return
          if (handleInvalidSession(error)) return
          console.error('[Notifications] Failed to load saved notifications:', error)
          setLoadError('Notifications could not be loaded.')
        })
        .finally(() => {
          refreshInProgress = false
        })
    }
    refreshNotifications()

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      tryAllTransports: true,
    })

    socket.on('notification', notification => {
      receiveNotification(notification)
    })

    socket.on('connect', () => {
      setLiveConnected(true)
      setConnectionError('')
      refreshNotifications({ notifyNew: true })
    })
    socket.on('disconnect', () => {
      if (!active) return
      setLiveConnected(false)
      setConnectionError('Live connection lost. Checking for new notifications periodically.')
    })
    socket.on('connect_error', error => {
      if (!active) return
      setLiveConnected(false)
      setConnectionError('Live connection unavailable. Checking for new notifications periodically.')
      if (error.message === 'Invalid or expired token') {
        if (!sessionInvalid) {
          sessionInvalid = true
          logout()
        }
      }
      console.error('[Notifications] Live connection failed:', error.message)
    })
    socket.io.on('reconnect_failed', () => {
      if (active) setConnectionError('Live connection unavailable. Checking for new notifications periodically.')
    })

    const pollTimer = window.setInterval(() => {
      refreshNotifications({ notifyNew: true })
    }, 10000)
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      if (socket.disconnected) socket.connect()
      refreshNotifications({ notifyNew: true })
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      active = false
      window.clearInterval(pollTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      socket.disconnect()
    }
  }, [userId, token, logout])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 8000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const markRead = useCallback(async id => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications(current => current.map(item => item.id === id ? { ...item, is_read: 1 } : item))
  }, [])

  const markAllRead = useCallback(async () => {
    await api.patch('/notifications/read-all')
    setNotifications(current => current.map(item => ({ ...item, is_read: 1 })))
  }, [])

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter(item => !Number(item.is_read)).length,
    loadError,
    connectionError,
    markRead,
    markAllRead,
  }), [notifications, loadError, connectionError, markRead, markAllRead])

  const hasHeaderInbox = ['admin', 'super admin', 'manager', 'staff', 'employee', 'hr'].includes(userRole)

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {userId && (
        <DesktopNotificationPrompt
          userId={userId}
          liveConnected={liveConnected}
          connectionError={connectionError}
        />
      )}
      {!hasHeaderInbox && userId && <NotificationBell floating />}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[10000] w-[min(24rem,calc(100vw-2.5rem))]">
          <button
            type="button"
            onClick={() => {
              if (toast.link) window.location.hash = `#${toast.link}`
              setToast(null)
            }}
            className="w-full rounded-2xl border border-white/10 bg-[#171820] p-4 text-left text-white shadow-2xl"
            aria-live="polite"
          >
            <span className="block text-sm font-bold">{toast.title}</span>
            <span className="mt-1 block text-xs text-white/65">{toast.message}</span>
          </button>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="absolute right-2 top-2 rounded p-1 text-xs text-white/50 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </NotificationsContext.Provider>
  )
}

function DesktopNotificationPrompt({ userId, liveConnected, connectionError }) {
  const [desktopPermission, setDesktopPermission] = useState(getDesktopPermission)
  const [dismissed, setDismissed] = useState(false)

  const enableDesktopNotifications = async () => {
    try {
      const permission = await window.Notification.requestPermission()
      setDesktopPermission(permission)
    } catch (error) {
      console.error('[Notifications] Desktop permission request failed:', error)
      setDesktopPermission(getDesktopPermission())
    }
  }

  useEffect(() => {
    const refreshDesktopPermission = () => {
      setDesktopPermission(getDesktopPermission())
    }
    window.addEventListener('focus', refreshDesktopPermission)
    return () => window.removeEventListener('focus', refreshDesktopPermission)
  }, [])

  if (
    dismissed ||
    !userId ||
    desktopPermission === 'unsupported'
  ) {
    return null
  }

  return (
    <aside className="fixed bottom-5 right-5 z-[10001] w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-white/10 bg-[#171820] p-4 text-white shadow-2xl" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Stay up to date</h2>
          {desktopPermission === 'default' ? (
            <p className="mt-1 text-xs text-white/65">
              Allow desktop notifications to see updates while using another tab or app.
            </p>
          ) : desktopPermission === 'denied' ? (
            <p className="mt-1 text-xs text-amber-200">
              Notifications are blocked. Open the site controls beside the address bar, set Notifications to Allow, then reload.
            </p>
          ) : (
            <p className="mt-1 text-xs text-white/65">
              Live desktop alerts are enabled for new notifications.
            </p>
          )}
          {connectionError ? (
            <p className="mt-2 text-xs text-amber-200">{connectionError}</p>
          ) : (
            <p className="mt-2 text-xs text-white/45">
              {liveConnected
                ? 'Live notifications are connected.'
                : 'Connecting to live notifications...'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-white/50 hover:text-white"
          aria-label="Dismiss notification prompt"
        >
          <X size={16} />
        </button>
      </div>
      {desktopPermission === 'default' ? (
        <button
          type="button"
          onClick={enableDesktopNotifications}
          className="mt-3 rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-500/30"
        >
          Enable desktop alerts
        </button>
      ) : null}
    </aside>
  )
}

function NotificationBell({ floating = false }) {
  const [open, setOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    loadError,
    connectionError,
    markRead,
    markAllRead,
  } = useNotifications()

  return (
    <div className={floating ? 'fixed bottom-5 left-5 z-[9998]' : 'relative'}>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        title="Notifications"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        className={`${floating ? 'h-11 w-11 rounded-full shadow-xl' : 'h-9 w-9 rounded-xl'} relative flex items-center justify-center border border-white/10 bg-[#171820] text-white/80 hover:bg-white/15`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <section className={`absolute z-50 ${floating ? 'bottom-14 left-0' : 'right-0 top-full mt-2'} w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#13141a] text-white shadow-2xl`}>
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-bold">Notifications</span>
            <button
              type="button"
              onClick={() => markAllRead().catch(error => console.error('[Notifications] Could not mark all as read:', error))}
              disabled={!unreadCount}
              className="text-xs text-blue-300 disabled:text-white/30"
            >
              Mark all read
            </button>
          </header>
          <div className="max-h-80 divide-y divide-white/5 overflow-y-auto">
            {loadError && <p className="px-4 py-3 text-xs text-red-300">{loadError}</p>}
            {connectionError && <p className="px-4 py-3 text-xs text-amber-300">{connectionError}</p>}
            {notifications.length === 0 && !loadError ? (
              <p className="px-4 py-8 text-center text-xs text-white/45">No notifications yet</p>
            ) : notifications.map(item => (
              <button
                type="button"
                key={item.id}
                onClick={async () => {
                  if (!Number(item.is_read)) {
                    try {
                      await markRead(item.id)
                    } catch (error) {
                      console.error('[Notifications] Could not mark notification as read:', error)
                    }
                  }
                  setOpen(false)
                  if (item.link) window.location.hash = `#${item.link}`
                }}
                className={`block w-full px-4 py-3 text-left hover:bg-white/5 ${Number(item.is_read) ? 'opacity-65' : ''}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold">{item.title}</span>
                  {!Number(item.is_read) && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />}
                </span>
                <span className="mt-1 block text-xs text-white/55">{item.message}</span>
                <time className="mt-2 block text-[10px] text-white/35">
                  {new Date(item.created_at).toLocaleString()}
                </time>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export { NotificationBell }
