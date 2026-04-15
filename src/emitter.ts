import type {
  EventMap,
  EventHandler,
  WildcardHandler,
  Unsubscribe,
  TypedEmitter,
  EmitterOptions,
} from './types'

const WILDCARD = '*'

export class TypedEmitterImpl<T extends EventMap> implements TypedEmitter<T> {
  private listeners = new Map<string, Set<Function>>()
  private maxListeners: number

  constructor(options: EmitterOptions = {}) {
    this.maxListeners = options.maxListeners ?? 10
  }

  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe
  on(event: '*', handler: WildcardHandler<T>): Unsubscribe
  on(event: any, handler: Function): Unsubscribe {
    const key = String(event)

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }

    const handlers = this.listeners.get(key)!

    if (this.maxListeners > 0 && handlers.size >= this.maxListeners) {
      console.warn(
        `[typed-event] Possible memory leak: ${handlers.size + 1} listeners added for event "${key}". ` +
        `Use emitter options { maxListeners: N } to increase the limit.`
      )
    }

    handlers.add(handler)

    return () => {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.listeners.delete(key)
      }
    }
  }

  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
    const unsub = this.on(event, (payload: T[K]) => {
      unsub()
      handler(payload)
    })
    return unsub
  }

  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const key = String(event)
    const handlers = this.listeners.get(key)
    if (!handlers) return
    handlers.delete(handler)
    if (handlers.size === 0) {
      this.listeners.delete(key)
    }
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    const key = String(event)

    const handlers = this.listeners.get(key)
    if (handlers) {
      for (const handler of [...handlers]) {
        handler(payload)
      }
    }

    const wildcardHandlers = this.listeners.get(WILDCARD)
    if (wildcardHandlers) {
      for (const handler of [...wildcardHandlers]) {
        handler(event, payload)
      }
    }
  }

  listenerCount(event: keyof T | '*'): number {
    return this.listeners.get(String(event))?.size ?? 0
  }

  eventNames(): Array<keyof T | '*'> {
    return [...this.listeners.keys()] as Array<keyof T | '*'>
  }

  removeAllListeners(event?: keyof T | '*'): void {
    if (event !== undefined) {
      this.listeners.delete(String(event))
    } else {
      this.listeners.clear()
    }
  }
}
