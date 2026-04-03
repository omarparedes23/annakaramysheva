import type { Product, ProductInsert, ProductUpdate, ProductWithImages, ProductImage, InquiryInsert } from '~/types/product'

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
        ak_product_images (
          id, image_url, position
        ),
        ak_collections (
          id, title, slug
        )
      `)
      .in('status', ['published', 'sold_out'])
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return ((data ?? []) as ProductWithImages[]).map(p => ({
      ...p,
      product_images: (p.product_images ?? []).sort((a: ProductImage, b: ProductImage) => a.position - b.position),
    }))
  }

  // ─── Public: fetch by collection ─────────────────────────

  const fetchProductsByCollection = async (collectionId: string): Promise<ProductWithImages[]> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        ak_product_images (
          id, image_url, position
        )
      `)
      .eq('collection_id', collectionId)
      .in('status', ['published', 'sold_out'])
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return ((data ?? []) as ProductWithImages[]).map(p => ({
      ...p,
      product_images: (p.product_images ?? []).sort((a: ProductImage, b: ProductImage) => a.position - b.position),
    }))
  }

  // ─── Public: fetch single product by slug ────────────────

  const fetchProductBySlug = async (slug: string): Promise<ProductWithImages | null> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        ak_product_images (
          id, image_url, position
        ),
        ak_collections (
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
      (a: ProductImage, b: ProductImage) => a.position - b.position
    )
    return product
  }

  // ─── Admin: fetch all products ───────────────────────────

  const fetchAllProductsAdmin = async (): Promise<ProductWithImages[]> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        ak_product_images (
          id, image_url, position
        ),
        ak_collections (
          id, title, slug
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return ((data ?? []) as ProductWithImages[]).map(p => ({
      ...p,
      product_images: (p.product_images ?? []).sort((a: ProductImage, b: ProductImage) => a.position - b.position),
    }))
  }

  // ─── Admin: fetch single by ID ────────────────────────────

  const fetchProductById = async (id: string): Promise<ProductWithImages | null> => {
    const { data, error } = await supabase
      .from('ak_products')
      .select(`
        *,
        ak_product_images (
          id, image_url, position
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
      (a: ProductImage, b: ProductImage) => a.position - b.position
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

  const uploadImage = async (file: File, productId: string): Promise<string> => {
    const ext = file.name.split('.').pop()
    const filename = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  // ─── Save image records ───────────────────────────────────

  const saveProductImages = async (
    productId: string,
    imageUrls: string[],
    startPosition = 0
  ): Promise<ProductImage[]> => {
    const records = imageUrls.map((url, i) => ({
      product_id: productId,
      image_url: url,
      position: startPosition + i,
    }))

    const { data, error } = await supabase
      .from('ak_product_images')
      .insert(records)
      .select()

    if (error) throw new Error(error.message)
    return data as ProductImage[]
  }

  // ─── Delete image record + storage ───────────────────────

  const deleteProductImage = async (imageId: string, imageUrl: string): Promise<void> => {
    const { error: dbError } = await supabase
      .from('ak_product_images')
      .delete()
      .eq('id', imageId)

    if (dbError) throw new Error(dbError.message)

    // Extract path from public URL
    const urlParts = imageUrl.split('/storage/v1/object/public/products/')
    if (urlParts[1]) {
      await supabase.storage.from('products').remove([urlParts[1]])
    }
  }

  // ─── Reorder images ───────────────────────────────────────

  const reorderImages = async (images: ProductImage[]): Promise<void> => {
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
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
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
  }
}
