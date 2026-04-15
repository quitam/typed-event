import { describe, it, expect, vi } from 'vitest'
import { createEmitter } from '../src'

describe('on / emit', () => {
  it('calls handler when emitting the correct event', () => {
    const emitter = createEmitter<{ ping: { msg: string } }>()
    const handler = vi.fn()
    emitter.on('ping', handler)
    emitter.emit('ping', { msg: 'hello' })
    expect(handler).toHaveBeenCalledWith({ msg: 'hello' })
  })

  it('does not call handler for a different event', () => {
    const emitter = createEmitter<{ a: void; b: void }>()
    const handler = vi.fn()
    emitter.on('a', handler)
    emitter.emit('b', undefined)
    expect(handler).not.toHaveBeenCalled()
  })

  it('calls multiple handlers for the same event', () => {
    const emitter = createEmitter<{ tick: number }>()
    const h1 = vi.fn()
    const h2 = vi.fn()
    emitter.on('tick', h1)
    emitter.on('tick', h2)
    emitter.emit('tick', 1)
    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledTimes(1)
  })

  it('does not throw when emitting an event with no listeners', () => {
    const emitter = createEmitter<{ ghost: void }>()
    expect(() => emitter.emit('ghost', undefined)).not.toThrow()
  })
})

describe('off', () => {
  it('does not call handler after off', () => {
    const emitter = createEmitter<{ ping: void }>()
    const handler = vi.fn()
    emitter.on('ping', handler)
    emitter.off('ping', handler)
    emitter.emit('ping', undefined)
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not throw when removing a handler that does not exist', () => {
    const emitter = createEmitter<{ ping: void }>()
    expect(() => emitter.off('ping', vi.fn())).not.toThrow()
  })
})

describe('unsubscribe function', () => {
  it('returns an unsubscribe function from on()', () => {
    const emitter = createEmitter<{ ping: void }>()
    const handler = vi.fn()
    const unsub = emitter.on('ping', handler)
    unsub()
    emitter.emit('ping', undefined)
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('once', () => {
  it('calls handler only once', () => {
    const emitter = createEmitter<{ ping: void }>()
    const handler = vi.fn()
    emitter.once('ping', handler)
    emitter.emit('ping', undefined)
    emitter.emit('ping', undefined)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

describe('wildcard', () => {
  it('calls wildcard handler for every event', () => {
    const emitter = createEmitter<{ a: number; b: string }>()
    const handler = vi.fn()
    emitter.on('*', handler)
    emitter.emit('a', 1)
    emitter.emit('b', 'hello')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith('a', 1)
    expect(handler).toHaveBeenCalledWith('b', 'hello')
  })
})

describe('listenerCount / eventNames', () => {
  it('returns the correct listener count', () => {
    const emitter = createEmitter<{ ping: void }>()
    emitter.on('ping', vi.fn())
    emitter.on('ping', vi.fn())
    expect(emitter.listenerCount('ping')).toBe(2)
  })

  it('returns 0 when there are no listeners', () => {
    const emitter = createEmitter<{ ping: void }>()
    expect(emitter.listenerCount('ping')).toBe(0)
  })

  it('eventNames returns the correct list of event names', () => {
    const emitter = createEmitter<{ a: void; b: void }>()
    emitter.on('a', vi.fn())
    emitter.on('b', vi.fn())
    expect(emitter.eventNames()).toContain('a')
    expect(emitter.eventNames()).toContain('b')
  })
})

describe('removeAllListeners', () => {
  it('removes all listeners', () => {
    const emitter = createEmitter<{ ping: void; pong: void }>()
    const h1 = vi.fn()
    const h2 = vi.fn()
    emitter.on('ping', h1)
    emitter.on('pong', h2)
    emitter.removeAllListeners()
    emitter.emit('ping', undefined)
    emitter.emit('pong', undefined)
    expect(h1).not.toHaveBeenCalled()
    expect(h2).not.toHaveBeenCalled()
  })

  it('removes listeners only for the specified event', () => {
    const emitter = createEmitter<{ ping: void; pong: void }>()
    const h1 = vi.fn()
    const h2 = vi.fn()
    emitter.on('ping', h1)
    emitter.on('pong', h2)
    emitter.removeAllListeners('ping')
    emitter.emit('ping', undefined)
    emitter.emit('pong', undefined)
    expect(h1).not.toHaveBeenCalled()
    expect(h2).toHaveBeenCalledTimes(1)
  })
})

describe('safe emit when handler unsubscribes during emit', () => {
  it('does not skip other handlers when one unsubscribes during emit', () => {
    const emitter = createEmitter<{ ping: void }>()
    const h2 = vi.fn()
    const unsub = emitter.on('ping', () => { unsub() })
    emitter.on('ping', h2)
    emitter.emit('ping', undefined)
    expect(h2).toHaveBeenCalledTimes(1)
  })
})
