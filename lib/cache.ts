interface CacheEntry<T> {
  data: T
  timestamp: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly TTL = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const age = Date.now() - entry.timestamp

    if (age > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const age = Date.now() - entry.timestamp
    if (age > this.TTL) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

export const dataCache = new DataCache()
