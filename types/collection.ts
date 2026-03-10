export interface LocalizedString {
  en: string
  ru: string
}

export interface Collection {
  id: string
  title: LocalizedString
  description: LocalizedString
  slug: string
  year: number | null
  created_at: string
}

export interface CollectionWithProducts extends Collection {
  products?: import('./product').Product[]
}

export type CollectionInsert = Omit<Collection, 'id' | 'created_at'>
export type CollectionUpdate = Partial<CollectionInsert>
