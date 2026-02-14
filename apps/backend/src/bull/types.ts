export type ContentImportJobData = {
  userId: string
  organizationId: string
  url: string
}

export type ContentImportJobResult = {
  category: 'RECIPE' | 'PLACE' | 'PRODUCT'
  slug: string
  recordId: string
  success: boolean
  error?: string
}
