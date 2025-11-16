import { describe, it, expect, beforeEach, jest } from '@jest/globals'

const fromMock = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: { from: fromMock }
}))

let getByUsuarioId: typeof import('@/services/asistenciaService').getByUsuarioId

beforeAll(async () => {
  const mod = await import('@/services/asistenciaService')
  getByUsuarioId = mod.getByUsuarioId
})

describe('asistenciaService.getByUsuarioId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const makeQB = () => {
    const calls: Array<{ op: string; args: any[] }> = []
    const api: any = {
      select: jest.fn(function () { calls.push({ op: 'select', args: Array.from(arguments) }); return api }),
      eq: jest.fn(function () { calls.push({ op: 'eq', args: Array.from(arguments) }); return api }),
      gte: jest.fn(function () { calls.push({ op: 'gte', args: Array.from(arguments) }); return api }),
      lte: jest.fn(function () { calls.push({ op: 'lte', args: Array.from(arguments) }); return api }),
      order: jest.fn(function () { calls.push({ op: 'order', args: Array.from(arguments) }); return api }),
      range: jest.fn(function () { calls.push({ op: 'range', args: Array.from(arguments) }); return api }),
    }
    const exec = { data: [], error: null, count: 0 }
    const thenable = Promise.resolve(exec) as any
    return { api, calls, thenable }
  }

  it('aplica gte y lte para fechas y eq para otros filtros', async () => {
    const { api, calls, thenable } = makeQB()
    fromMock.mockReturnValue({ ...api, then: thenable.then.bind(thenable) })

    await getByUsuarioId('user-1', {
      page: 2,
      limit: 10,
      filters: { fechaDesde: '2025-01-01', fechaHasta: '2025-01-31', estado: 'ASISTENCIA' }
    })

    // Verify basic query chain aspects
    const ops = calls.map(c => c.op)
    expect(ops).toContain('select')
    expect(ops).toContain('eq') // usuarioid filter
    expect(ops).toContain('gte')
    expect(ops).toContain('lte')
    expect(ops).toContain('order')
    expect(ops).toContain('range')

    // Verify specific arguments
    expect(calls.find(c => c.op === 'eq')!.args).toEqual(['usuarioid', 'user-1'])
    expect(calls.find(c => c.op === 'gte')!.args).toEqual(['fecha', '2025-01-01'])
    expect(calls.find(c => c.op === 'lte')!.args).toEqual(['fecha', '2025-01-31'])

    // The custom filter 'estado' should use eq
    const estadoEq = calls.filter(c => c.op === 'eq').find(c => c.args[0] === 'estado')
    expect(estadoEq?.args).toEqual(['estado', 'ASISTENCIA'])
  })
})
