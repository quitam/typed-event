import { expectType, expectError } from 'tsd'
import { createEmitter } from '../src'

const emitter = createEmitter<{
  'user:login': { userId: string; ip: string }
  'order:placed': { orderId: string; total: number }
}>()

// on() phải infer đúng payload type
emitter.on('user:login', (payload) => {
  expectType<string>(payload.userId)
  expectType<string>(payload.ip)
})

// emit() phải báo lỗi nếu thiếu field
expectError(emitter.emit('user:login', { userId: '123' })) // thiếu ip

// emit() phải báo lỗi nếu sai type
expectError(emitter.emit('user:login', { userId: 123, ip: '1.2.3.4' })) // userId phải string

// emit() phải báo lỗi nếu sai event name
expectError(emitter.emit('nonexistent', {}))
