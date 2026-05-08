const DB_NAME    = 'flowdesk-offline'
const STORE_NAME = 'queue'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e)
  })
}

export async function enqueue(request) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add({
      url:       request.url,
      method:    request.method,
      body:      request.body,
      timestamp: Date.now(),
    })
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready
      await reg.sync.register('sync-tasks')
    }
  } catch (err) {
    console.error('OfflineQueue: Failed to enqueue', err)
  }
}

export async function getAll() {
  try {
    const db  = await openDB()
    const tx  = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    return new Promise((resolve, reject) => {
      req.onsuccess = (e) => resolve(e.target.result)
      req.onerror   = (e) => reject(e)
    })
  } catch {
    return []
  }
}

export async function remove(id) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
  } catch (err) {
    console.error('OfflineQueue: Failed to remove', err)
  }
}

export async function flush() {
  const items = await getAll()
  for (const item of items) {
    try {
      await fetch(item.url, {
        method:      item.method,
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(item.body),
        credentials: 'include',
      })
      await remove(item.id)
    } catch {
      // Still offline — leave in queue
    }
  }
}

export async function clearAll() {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
  } catch (err) {
    console.error('OfflineQueue: Failed to clear', err)
  }
}