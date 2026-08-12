import { apiFetch } from './client'
import type { Bookshelf } from '../types'

export async function fetchBookshelves() {
  return apiFetch<{ data: Bookshelf[] }>('/bookshelves')
}
