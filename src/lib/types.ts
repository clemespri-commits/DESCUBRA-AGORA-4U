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

export interface MovieIdentification {
  id: string
  user_id: string
  user_description: string
  identified_title: string
  identified_year: number
  identified_synopsis: string
  confidence_score: number
  ai_analysis: any
  created_at: string
}

export interface FoundContent {
  id: string
  user_id: string
  content_id: string
  title: string
  description: string
  year: number
  genre: string
  platform: string
  rating: number
  poster_url: string
  search_query: string
  created_at: string
}

export interface IdentificationResult {
  identified: boolean
  confidence: number
  title: string
  year: number
  synopsis: string
  director: string
  cast: string[]
  genre: string
  platform: string
  reasoning: string
  possibleMatches?: Array<{
    title: string
    year: number
    synopsis: string
  }>
}
