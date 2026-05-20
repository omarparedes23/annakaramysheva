import type { Product, ProductInsert, ProductUpdate, ProductWithImages, ProductMedia, InquiryInsert } from '~/types/product'

export const useProducts = () => {
  const supabase = useSupabaseClient()
  const { locale } = useI18n()

  // ─── Helpers ──────────────────────────────────────────────

  const localize = (field: { en?: string; ru?: string } | null | undefined): string => {
    if (!field) return ''
    const lang = locale.value as 'en' | 'ru'
    return field[lang] || field.en || field.ru || ''
  }

  const formatPrice = (price: number | null, currency = '₽'): string => {
    if (!price) return ''
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // ─── Public: fetch published products ─────────────────────

  const fetchPublishedProducts = async (): Promise<ProductWithImages[]> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        product_images:ak_product_images (
          id, image_url, position, media_type
        ),
        collections:ak_collections (
          id, title, slug
        )
      `)
      .in('status', ['published', 'sold_out'])
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return ((data ?? []) as ProductWithImages[]).map(p => ({
      ...p,
      product_images: (p.product_images ?? []).sort((a: ProductMedia, b: ProductMedia) => a.position - b.position),
    }))
  }

  // ─── Public: fetch by collection ─────────────────────────

  const fetchProductsByCollection = async (collectionId: string): Promise<ProductWithImages[]> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        product_images:ak_product_images (
          id, image_url, position, media_type
        )
      `)
      .eq('collection_id', collectionId)
      .in('status', ['published', 'sold_out'])
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return ((data ?? []) as ProductWithImages[]).map(p => ({
      ...p,
      product_images: (p.product_images ?? []).sort((a: ProductMedia, b: ProductMedia) => a.position - b.position),
    }))
  }

  // ─── Public: fetch single product by slug ────────────────

  const fetchProductBySlug = async (slug: string): Promise<ProductWithImages | null> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        product_images:ak_product_images (
          id, image_url, position, media_type
        ),
        collections:ak_collections (
          id, title, slug, year
        )
      `)
      .eq('slug', slug)
      .in('status', ['published', 'sold_out'])
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }

    const product = data as ProductWithImages
    product.product_images = (product.product_images ?? []).sort(
      (a: ProductMedia, b: ProductMedia) => a.position - b.position
    )
    return product
  }

  // ─── Admin: fetch all products ───────────────────────────

  const fetchAllProductsAdmin = async (): Promise<ProductWithImages[]> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        product_images:ak_product_images (
          id, image_url, position, media_type
        ),
        collections:ak_collections (
          id, title, slug
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return ((data ?? []) as ProductWithImages[]).map(p => ({
      ...p,
      product_images: (p.product_images ?? []).sort((a: ProductMedia, b: ProductMedia) => a.position - b.position),
    }))
  }

  // ─── Admin: fetch single by ID ────────────────────────────

  const fetchProductById = async (id: string): Promise<ProductWithImages | null> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        product_images:ak_product_images (
          id, image_url, position, media_type
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }

    const product = data as ProductWithImages
    product.product_images = (product.product_images ?? []).sort(
      (a: ProductMedia, b: ProductMedia) => a.position - b.position
    )
    return product
  }

  // ─── Admin: create product ────────────────────────────────

  const createProduct = async (payload: ProductInsert): Promise<Product> => {
    const { data, error } = await supabase
      .from('ak_products')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Product
  }

  // ─── Admin: update product ────────────────────────────────

  const updateProduct = async (id: string, payload: ProductUpdate): Promise<Product> => {
    const { data, error } = await supabase
      .from('ak_products')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Product
  }

  // ─── Admin: delete product ────────────────────────────────

  const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('ak_products')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  // ─── Image upload ─────────────────────────────────────────

  const uploadImage = async (
    file: File,
    collectionSlug: string,
    productSlug: string,
    position: number
  ): Promise<{ url: string; mediaType: 'image' | 'video' }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('collectionSlug', collectionSlug)
    formData.append('productSlug', productSlug)
    formData.append('position', String(position))

    const res = await fetch('/api/upload', { method: 'POST', body: formData })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.statusMessage || err.message || 'Upload failed')
    }

    const data = await res.json()
    return { url: data.url, mediaType: data.mediaType }
  }

  // ─── Save image records ───────────────────────────────────

  const saveProductImages = async (
    productId: string,
    items: { url: string; mediaType: 'image' | 'video' }[],
    startPosition = 0
  ): Promise<ProductMedia[]> => {
    const records = items.map((item, i) => ({
      product_id: productId,
      image_url: item.url,
      media_type: item.mediaType,
      position: startPosition + i,
    }))

    const { data, error } = await supabase
      .from('ak_product_images')
      .insert(records)
      .select()

    if (error) throw new Error(error.message)
    return data as ProductMedia[]
  }

  // ─── Delete image record + storage ───────────────────────

  const extractPathFromUrl = (imageUrl: string): string | null => {
    const r2Url = useRuntimeConfig().public.r2PublicUrl
    if (!r2Url) return null
    const prefix = r2Url + '/'
    if (imageUrl.startsWith(prefix)) {
      return imageUrl.slice(prefix.length)
    }
    return null
  }

  const deleteProductImage = async (imageId: string, imageUrl: string): Promise<void> => {
    const { error: dbError } = await supabase
      .from('ak_product_images')
      .delete()
      .eq('id', imageId)

    if (dbError) throw new Error(dbError.message)

    const path = extractPathFromUrl(imageUrl)
    if (path) {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })

      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.statusMessage || err.message || 'Delete failed')
      }
    }
  }

  // ─── Reorder images ───────────────────────────────────────

  const reorderImages = async (images: ProductMedia[]): Promise<void> => {
    const updates = images.map((img, i) =>
      supabase.from('ak_product_images').update({ position: i }).eq('id', img.id)
    )
    await Promise.all(updates)
  }

  // ─── Submit inquiry ───────────────────────────────────────

  const submitInquiry = async (payload: InquiryInsert): Promise<void> => {
    const { error } = await supabase
      .from('ak_inquiries')
      .insert({ ...payload, status: 'new' })

    if (error) throw new Error(error.message)
  }

  // ─── Generate slug ────────────────────────────────────────

  const generateSlug = (title: string): string => {
    // If title is empty or only contains non-ASCII characters, return empty
    if (!title || !title.trim()) return ''
    
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
    
    // If slug is empty (e.g., title was all Cyrillic), return empty to trigger fallback
    return slug
  }
  
  const generateFallbackSlug = (): string => {
    // Generate a slug using timestamp and random string
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 6)
    return `item-${timestamp}-${random}`
  }

  return {
    localize,
    formatPrice,
    fetchPublishedProducts,
    fetchProductsByCollection,
    fetchProductBySlug,
    fetchAllProductsAdmin,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    saveProductImages,
    deleteProductImage,
    reorderImages,
    submitInquiry,
    generateSlug,
    generateFallbackSlug,
    extractPathFromUrl,
  }
}
