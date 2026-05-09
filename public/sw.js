'use client'

const CACHE_NAME = 'flowdesk-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/tasks',
  '/dashboard/projects',
  '/dashboard/team',
  '/dashboard/analytics',
  '/dashboard/time',
  '/dashboard/settings',
]

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET and API requests
  if (request.method !== 'GET') return
  if (request.url.includes('/api/')) return
  if (request.url.includes('socket.io')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // Fallback to root for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/')
          }
        })
      })
  )
})

// Background sync for offline task queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncOfflineTasks())
  }
})

async function syncOfflineTasks() {
  try {
    const db = await openDB()
    const tasks = await getAllPending(db)
    for (const task of tasks) {
      try {
        await fetch(task.url, {
          method:  task.method,
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(task.body),
          credentials: 'include',
        })
        await deletePending(db, task.id)
      } catch {
        // Will retry on next sync
      }
    }
  } catch {
    // IndexedDB not available
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('flowdesk-offline', 1)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('queue', { keyPath: 'id', autoIncrement: true })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e)
  })
}

function getAllPending(db) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('queue', 'readonly')
    const req = tx.objectStore('queue').getAll()
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e)
  })
}

function deletePending(db, id) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('queue', 'readwrite')
    const req = tx.objectStore('queue').delete(id)
    req.onsuccess = () => resolve()
    req.onerror   = (e) => reject(e)
  })
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'FlowDesk', {
      body:    data.body || '',
      icon:    '/icon-192.png',
      badge:   '/icon-72.png',
      tag:     data.tag || 'flowdesk',
      data:    data.url || '/dashboard',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data || '/dashboard')
  )
})