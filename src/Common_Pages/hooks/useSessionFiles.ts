import { useEffect, useRef, useState } from 'react'

// Like useSessionState, but for picked files (File objects).
//
// Why a separate hook? sessionStorage can only hold text, so File objects can't
// go in it. IndexedDB CAN store File/Blob objects directly, so we keep the files
// there. IndexedDB is shared across tabs and survives a refresh/restart, so the
// chosen files persist everywhere until the form is submitted (which clears them).

// A File[] per upload field, e.g. { surveyPlan: [File], photos: [File, File] }.
type FileMap = Record<string, File[]>

const DB_NAME = 'valuation-files'
const STORE = 'files'

// Open (or create on first use) the tiny IndexedDB database.
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Run one transaction against the store and resolve with its result (if any).
async function withStore(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<unknown> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = run(tx.objectStore(STORE))
    tx.oncomplete = () => {
      db.close()
      resolve(req.result)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

const idbGet = (key: string) =>
  withStore('readonly', (s) => s.get(key)) as Promise<FileMap | undefined>
const idbSet = (key: string, val: FileMap) => withStore('readwrite', (s) => s.put(val, key))
const idbDel = (key: string) => withStore('readwrite', (s) => s.delete(key))

// Clear a form's saved files. Call this after a successful submit so the next
// visit starts with a clean, empty form.
export async function clearSessionFiles(key: string) {
  try {
    await idbDel(key)
  } catch {
    /* ignore */
  }
}

export function useSessionFiles(key: string, initial: FileMap) {
  const [files, setFiles] = useState<FileMap>(initial)
  const ready = useRef(false) // true once the first load has finished

  // Restore any previously chosen files (shared across tabs, survives refresh).
  useEffect(() => {
    let cancelled = false
    idbGet(key)
      .then((saved) => {
        if (!cancelled && saved) setFiles((prev) => ({ ...prev, ...saved }))
      })
      .finally(() => {
        ready.current = true
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Save on every change — but only after the initial load, so the empty
  // starting value never overwrites saved files before we've read them.
  useEffect(() => {
    if (!ready.current) return
    idbSet(key, files).catch(() => {
      /* ignore storage errors */
    })
  }, [key, files])

  return [files, setFiles] as const
}
