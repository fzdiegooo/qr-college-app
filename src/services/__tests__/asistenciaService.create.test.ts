import { describe, it, expect, beforeEach, jest, beforeAll } from '@jest/globals'

const fromMock = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabase: { from: fromMock }
}))

let createAsistencia: typeof import('@/services/asistenciaService').createAsistencia

beforeAll(async () => {
  const mod = await import('@/services/asistenciaService')
  createAsistencia = mod.createAsistencia
})

describe('asistenciaService.createAsistencia (registro de asistencia)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const makeQB = (result: any = { data: { id: 10 }, error: null }) => {
    const insert = jest.fn().mockReturnThis()
    const select = jest.fn().mockReturnThis()
    const single: any = jest.fn(() => Promise.resolve(result))
    return { insert, select, single }
  }

  it('inserta en la tabla correcta y devuelve el registro creado', async () => {
    const qb = makeQB({ data: { id: 123, usuarioId: 'u1' }, error: null })
    fromMock.mockReturnValue(qb)

    const payload = {
      // Omit<Asistencia, 'id'>
      usuarioId: 'u1',
      fecha: '2025-11-07',
      estado: 'ASISTENCIA',
      presente: true,
      hora_llegada: '07:58:00',
      hora_salida: null,
      tipo: null,
      observaciones: null
    } as any

    const created = await createAsistencia(payload)

    expect(fromMock).toHaveBeenCalledWith('asistencia')
    expect(qb.insert).toHaveBeenCalledWith(payload)
    expect(qb.select).toHaveBeenCalled()
    expect(qb.single).toHaveBeenCalled()
    expect(created).toEqual({ id: 123, usuarioId: 'u1' })
  })

  it('propaga el error de Supabase si ocurre durante el insert', async () => {
    const error = new Error('insert failed')
    const qb = makeQB({ data: null, error })
    fromMock.mockReturnValue(qb)

    const payload = {
      usuarioId: 'u2',
      fecha: '2025-11-07',
      estado: 'FALTA',
      presente: false
    } as any

    await expect(createAsistencia(payload)).rejects.toThrow('insert failed')
  })

  it('no muta el payload original', async () => {
    const qb = makeQB({ data: { id: 200 }, error: null })
    fromMock.mockReturnValue(qb)

    const payload = {
      usuarioId: 'u3',
      fecha: '2025-11-07',
      estado: 'TARDANZA',
      presente: true,
      observaciones: 'Llegó tarde por tráfico'
    } as any
    const snapshot = JSON.parse(JSON.stringify(payload))

    await createAsistencia(payload)
    expect(payload).toEqual(snapshot)
  })

  it('acepta campos opcionales (hora_llegada, hora_salida, tipo, observaciones)', async () => {
    const qb = makeQB({ data: { id: 201 }, error: null })
    fromMock.mockReturnValue(qb)

    const payload = {
      usuarioId: 'u4',
      fecha: '2025-11-07',
      estado: 'ASISTENCIA',
      presente: true,
      hora_llegada: null,
      hora_salida: '13:05:00',
      tipo: 'EXTRA',
      observaciones: null
    } as any

    await createAsistencia(payload)
    expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({
      hora_llegada: null,
      hora_salida: '13:05:00',
      tipo: 'EXTRA',
      observaciones: null
    }))
  })
})
