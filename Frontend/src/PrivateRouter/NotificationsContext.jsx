import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { io } from 'socket.io-client'
import api, { API_URL } from '../api'
import { useAuth } from './AuthContext'
import { NotificationsContext, useNotifications } from './NotificationsContext'

const socketUrl = API_URL.replace(/\/api\/?$/, '') || window.location.origin

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

  useEffect(() => {
    if (!userId || !token) return undefined

    let active = true
    let sessionInvalid = false
    const handleInvalidSession = error => {
      const isExpiredToken =
        error.response?.status === 403 &&
        error.response?.data?.message === 'Invalid or expired token'

      if (!isExpiredToken || sessionInvalid) return false
      sessionInvalid = true
      logout()
      return true
    }

    const refreshNotifications = () => api.get('/notifications', { params: { limit: 50 } })
      .then(({ data }) => {
        if (!active) return
        setNotifications(current => {
          const byId = new Map((data?.data || []).map(item => [item.id, item]))
          current.forEach(item => {
            if (!byId.has(item.id)) byId.set(item.id, item)
          })
          return [...byId.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        })
        setLoadError('')
      })
      .catch(error => {
        if (!active) return
        if (handleInvalidSession(error)) return
        console.error('[Notifications] Failed to load saved notifications:', error)
        setLoadError('Notifications could not be loaded.')
      })
    refreshNotifications()

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['polling'],
      reconnectionAttempts: 5,
    })

    socket.on('notification', notification => {
      setNotifications(current => [
        notification,
        ...current.filter(item => item.id !== notification.id),
      ].slice(0, 100))
      setToast(notification)

      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        const desktopNotification = new window.Notification(notification.title, {
          body: notification.message,
          tag: notification.id,
        })
        desktopNotification.onclick = () => {
          window.focus()
          if (notification.link) window.location.hash = `#${notification.link}`
          desktopNotification.close()
        }
      }
    })

    socket.on('connect', () => {
      setConnectionError('')
      refreshNotifications()
    })
    socket.on('connect_error', error => {
      if (error.message === 'Invalid or expired token') {
        if (!sessionInvalid) {
          sessionInvalid = true
          logout()
        }
      }
    })
    socket.io.on('reconnect_failed', () => {
      if (active) setConnectionError('Real-time notifications are temporarily unavailable.')
    })

    return () => {
      active = false
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
  const [desktopPermission, setDesktopPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'unsupported'
  )

  const enableDesktopNotifications = async () => {
    if (!('Notification' in window)) return
    try {
      setDesktopPermission(await window.Notification.requestPermission())
    } catch (error) {
      console.error('[Notifications] Desktop permission request failed:', error)
    }
  }

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
          {desktopPermission === 'default' && (
            <button
              type="button"
              onClick={enableDesktopNotifications}
              className="w-full border-b border-white/10 px-4 py-2 text-left text-xs text-blue-200 hover:bg-white/5"
            >
              Enable desktop notifications
            </button>
          )}
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
