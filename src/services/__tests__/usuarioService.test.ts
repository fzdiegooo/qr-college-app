import { describe, it, expect, beforeEach, jest } from '@jest/globals'

const fromMock = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: { from: fromMock }
}))

let usuarioService: typeof import('@/services/alumnosService').usuarioService

beforeAll(async () => {
  const mod = await import('@/services/alumnosService')
  usuarioService = mod.usuarioService
})

describe('usuarioService.getAll', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const makeQB = () => {
    const calls: Array<{ op: string; args: any[] }> = []
    const api: any = {
      select: jest.fn(function () { calls.push({ op: 'select', args: Array.from(arguments) }); return api }),
      order: jest.fn(function () { calls.push({ op: 'order', args: Array.from(arguments) }); return api }),
      ilike: jest.fn(function () { calls.push({ op: 'ilike', args: Array.from(arguments) }); return api }),
      eq: jest.fn(function () { calls.push({ op: 'eq', args: Array.from(arguments) }); return api }),
      range: jest.fn(function () { calls.push({ op: 'range', args: Array.from(arguments) }); return api }),
    }
    const exec = { data: [], error: null, count: 0 }
    const thenable = Promise.resolve(exec) as any
    return { api, calls, thenable }
  }

  it('calcula rango, aplica filtros y orden correcto', async () => {
    const { api, calls, thenable } = makeQB()
    fromMock.mockReturnValue({ ...api, then: thenable.then.bind(thenable) })

    await usuarioService.getAll({ page: 2, limit: 5, filters: { nombre: 'Ju', gradoid: 3 } })

    // range should be called with from=5 to=9 (segunda página)
    const rangeCall = calls.find(c => c.op === 'range')
    expect(rangeCall?.args).toEqual([5, 9])

    // Orders: gradoid -> seccionid -> nombre
    const orderCalls = calls.filter(c => c.op === 'order')
    expect(orderCalls.map(c => c.args[0])).toEqual(['gradoid', 'seccionid', 'nombre'])

    // Filter nombre uses ilike
    const ilikeCall = calls.find(c => c.op === 'ilike')
    expect(ilikeCall?.args).toEqual(['nombre', '%Ju%'])
    // Filter gradoid uses eq
    const eqCall = calls.find(c => c.op === 'eq')
    expect(eqCall?.args).toEqual(['gradoid', 3])
  })
})
