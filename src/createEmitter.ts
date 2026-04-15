import { TypedEmitterImpl } from './emitter'
import type { EventMap, TypedEmitter, EmitterOptions } from './types'

export function createEmitter<T extends EventMap>(
  options?: EmitterOptions
): TypedEmitter<T> {
  return new TypedEmitterImpl<T>(options)
}
