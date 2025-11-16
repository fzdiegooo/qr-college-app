import { describe, it, expect } from '@jest/globals'
import { buildQuery } from '@/services/helpers'

// A tiny fake query object that records applied filters
const createQuery = () => {
  const calls: Array<{ op: string; key: string; value: any }> = []
  const api = {
    ilike: (key: string, value: any) => {
      calls.push({ op: 'ilike', key, value })
      return api
    },
    eq: (key: string, value: any) => {
      calls.push({ op: 'eq', key, value })
      return api
    }
  }
  return { api, calls }
}

describe('buildQuery', () => {
  it('aplica ilike para campos de texto conocidos', () => {
    const { api, calls } = createQuery()
    const result = buildQuery(api as any, { nombre: 'ana', documento: '123' })
    expect(result).toBe(api)
    expect(calls).toEqual([
      { op: 'ilike', key: 'nombre', value: '%ana%' },
      { op: 'ilike', key: 'documento', value: '%123%' }
    ])
  })

  it('aplica eq para otros campos y omite vacíos', () => {
    const { api, calls } = createQuery()
    buildQuery(api as any, { gradoid: 2, seccionid: null, rolid: undefined, nombre: '' })
    expect(calls).toEqual([{ op: 'eq', key: 'gradoid', value: 2 }])
  })
})
