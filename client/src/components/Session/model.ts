export interface ModelRecommendResponse {
  answer: {
    user_request: string
    analysis: {
      primary_task_type: string
      secondary_task_type: string
      language_requirement: string
      domain: string
      primary_keywords: string
      backup_keywords: string[]
      quality_constraints: {
        min_downloads: number
        min_likes: number
        recency_days: number
      }
    }
    recommendations: Recommendations[]
    notes: string
  }
  report: string
  confidence: number
  sources: string[]
  error: null
}

export interface Recommendations {
  model_id: string
  why: string
  risk: string
  estimates: {
    vram_gb: number
    latency_ms: number
  }
  usage: string
}
