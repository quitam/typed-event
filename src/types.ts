export type EventMap = Record<string, unknown>

export type EventHandler<T> = (payload: T) => void

export type WildcardHandler<T extends EventMap> = (
  event: keyof T,
  payload: T[keyof T]
) => void

export type Unsubscribe = () => void

export interface TypedEmitter<T extends EventMap> {
  /**
   * Subscribe to an event.
   * Returns an unsubscribe function — call it to remove the listener.
   */
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe

  /**
   * Subscribe to all events (wildcard).
   * Handler receives (eventName, payload).
   */
  on(event: '*', handler: WildcardHandler<T>): Unsubscribe

  /**
   * Subscribe once — auto-unsubscribes after first call.
   */
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe

  /**
   * Unsubscribe a specific handler from an event.
   */
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void

  /**
   * Emit an event with payload.
   * Calls all registered handlers synchronously.
   */
  emit<K extends keyof T>(event: K, payload: T[K]): void

  /**
   * Returns number of listeners for a specific event.
   */
  listenerCount(event: keyof T | '*'): number

  /**
   * Returns all event names that currently have listeners.
   */
  eventNames(): Array<keyof T | '*'>

  /**
   * Remove all listeners. If event is specified, only remove listeners for that event.
   */
  removeAllListeners(event?: keyof T | '*'): void
}

export interface EmitterOptions {
  /**
   * Max listeners per event before warning is printed.
   * Default: 10. Set to 0 to disable warning.
   */
  maxListeners?: number
}
