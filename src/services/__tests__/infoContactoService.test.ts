import { describe, it, expect, beforeEach, jest } from '@jest/globals'

const fromMock = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: { from: fromMock }
}))

let infoContactoService: typeof import('@/services/infoContactoService').infoContactoService

beforeAll(async () => {
  const mod = await import('@/services/infoContactoService')
  infoContactoService = mod.infoContactoService
})

describe('infoContactoService.create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const makeQB = () => {
    const insert = jest.fn().mockReturnThis()
    const select = jest.fn().mockReturnThis()
    const single = jest.fn<() => Promise<{ data: { id: number }; error: null }>>().mockResolvedValue({ data: { id: 1 }, error: null })
    return { insert, select, single }
  }

  it('normaliza usuarioId -> usuarioid y elimina alias', async () => {
    const qb = makeQB()
    fromMock.mockReturnValue(qb)

    const payload = { id: 0 as any, nombre: 'John', usuarioId: 'abc-123' } as any
    const created = await infoContactoService.create(payload)

    // Assert supabase.from called for correct table
    expect(fromMock).toHaveBeenCalledWith('info_contacto')
    // Assert insert received usuarioid and not usuarioId
    const argPassed = qb.insert.mock.calls[0][0]
    expect(argPassed).toMatchObject({ usuarioid: 'abc-123' })
    expect(argPassed).not.toHaveProperty('usuarioId')
    expect(created).toEqual({ id: 1 })
  })
})
