export interface MovieResult {
  id: string
  title: string
  description: string
  year?: number
  genre?: string
  director?: string
  cast?: string[]
  platform?: string
  rating?: number
  posterUrl?: string
}

export interface SearchHistory {
  id: string
  query: string
  results: MovieResult[]
  created_at: string
  user_session?: string
}

export interface SearchRequest {
  query: string
  platform?: string
}
