import { http } from '@/api'

export interface Model {
  id: string
  sessionId: string
  messageId: string
  trainId: string | null
  ragId: string | null
  externalId: string
  modelUri: string
  task: string
  modelType: string
  note: string | null
  existsLocal: boolean | null
  fileSize: number | null
  mtime: string | null
  externalCreatedAt: string | null
  createdAt: string
}

export interface ModelListResponse {
  code: number
  message: string
  data: Model[]
}

export const modelApi = {
  getLocalModels: (sessionId: string) =>
    http.get<ModelListResponse>(`/model/local/${sessionId}`),

  getAllModels: () =>
    http.get<ModelListResponse>('/model/all'),
}
