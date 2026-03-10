import type { LocalizedString } from './collection'

export type ProductStatus = 'draft' | 'published' | 'sold_out'

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  position: number
}

export interface Product {
  id: string
  title: LocalizedString
  description: LocalizedString
  slug: string
  price: number | null
  status: ProductStatus
  external_link: string | null
  collection_id: string | null
  created_at: string
}

export interface ProductWithImages extends Product {
  product_images?: ProductImage[]
  collections?: import('./collection').Collection | null
}

export type ProductInsert = Omit<Product, 'id' | 'created_at'>
export type ProductUpdate = Partial<ProductInsert>

export interface Inquiry {
  id: string
  name: string
  email: string
  message: string
  status: 'new' | 'archived'
  created_at: string
}

export type InquiryInsert = Omit<Inquiry, 'id' | 'created_at' | 'status'>
