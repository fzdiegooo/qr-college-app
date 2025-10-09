import { PaginationParams } from "@/types/database.types"

export const buildQuery = <T extends Record<string, any>>(query: any, filters?: T) => {
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Solo usar ilike en campos string conocidos
        if (["nombre", "documento"].includes(key)) {
          query = query.ilike(key, `%${value}%`)
        } else {
          query = query.eq(key, value)
        }
      }
    })
  }
  return query
}

export type { PaginationParams }
