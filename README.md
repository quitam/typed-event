# typed-event

TypeScript-first EventEmitter with full type inference. Zero dependencies. < 1KB gzipped.

[![npm](https://img.shields.io/npm/v/typed-event)](https://www.npmjs.com/package/typed-event)
[![bundle size](https://img.shields.io/bundlephobia/minzip/typed-event)](https://bundlephobia.com/package/typed-event)
[![license](https://img.shields.io/npm/l/typed-event)](./LICENSE)

## The problem

```ts
// Node.js EventEmitter — no type safety
emitter.on('order:placed', (data: any) => {
  console.log(data.ordreId) // typo — no error
})
```

## The solution

```ts
// typed-event — full inference, no casting
const emitter = createEmitter<{
  'order:placed': { orderId: string; total: number }
}>()

emitter.on('order:placed', ({ orderId, total }) => {
  // orderId: string ✓  total: number ✓  — inferred automatically
  console.log(orderId) // typo → TypeScript error ✓
})
```

## Install

```bash
npm install typed-event
```

## Usage

```ts
import { createEmitter } from 'typed-event'

// 1. Define your event schema once
const emitter = createEmitter<{
  'user:login':   { userId: string; ip: string }
  'user:logout':  { userId: string }
  'order:placed': { orderId: string; total: number }
}>()

// 2. Subscribe — returns unsubscribe function
const unsub = emitter.on('user:login', ({ userId, ip }) => {
  console.log(`${userId} logged in from ${ip}`)
})

// 3. Emit
emitter.emit('user:login', { userId: 'abc', ip: '1.2.3.4' })

// 4. Unsubscribe
unsub()

// 5. Once — auto-unsubscribes after first call
emitter.once('order:placed', ({ orderId }) => {
  console.log(`First order: ${orderId}`)
})

// 6. Wildcard — listen to all events (useful for logging)
emitter.on('*', (event, payload) => {
  logger.info({ event, ...payload })
})
```

## API

### `createEmitter<T>(options?)`

Creates a new typed emitter.

```ts
const emitter = createEmitter<EventMap>({ maxListeners: 20 })
```

| Option | Type | Default | Description |
|---|---|---|---|
| `maxListeners` | `number` | `10` | Warn when exceeded. Set `0` to disable. |

### `emitter.on(event, handler)`

Subscribe to an event. Returns an `Unsubscribe` function.

### `emitter.once(event, handler)`

Subscribe once — auto-removes after first call. Returns an `Unsubscribe` function.

### `emitter.off(event, handler)`

Remove a specific handler.

### `emitter.emit(event, payload)`

Emit an event synchronously.

### `emitter.on('*', handler)`

Wildcard — called for every event. Handler receives `(eventName, payload)`.

### `emitter.listenerCount(event)`

Returns number of listeners for an event.

### `emitter.eventNames()`

Returns all event names with active listeners.

### `emitter.removeAllListeners(event?)`

Remove all listeners. If `event` is specified, only remove listeners for that event.

## License

MIT
