/* eslint-disable @typescript-eslint/no-explicit-any */
import { snakeCase, camelCase } from 'lodash'

const unsafeToSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj instanceof File) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(unsafeToSnakeCase)
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[snakeCase(key)] = unsafeToSnakeCase(value)
    return acc
  }, {} as any)
}

/// toSnakeCase 将结构体字段全部递归地转换为 snake case
export function toSnakeCase<T, U>(obj: T): U {
  return unsafeToSnakeCase(obj) as unknown as U
} 

const unsafeToCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj instanceof File) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(unsafeToCamelCase)
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[camelCase(key)] = unsafeToCamelCase(value)
    return acc
  }, {} as any)
}

/// toCamelCase 将结构体字段全部递归地转换为 camel case
export function toCamelCase<T, U>(obj: T): U {
  return unsafeToCamelCase(obj) as U
}
