import type { Collection, CollectionInsert, CollectionUpdate, CollectionWithProducts } from '~/types/collection'

export const useCollections = () => {
  const supabase = useSupabaseClient()
  const { locale } = useI18n()

  // ─── Helpers ──────────────────────────────────────────────

  /**
   * Parse a JSONB localized field using current locale, fallback to 'en'.
   */
  const localize = (field: { en?: string; ru?: string } | null | undefined): string => {
    if (!field) return ''
    const lang = locale.value as 'en' | 'ru'
    return field[lang] || field.en || field.ru || ''
  }

  // ─── Fetch all collections (public) ──────────────────────

  const fetchCollections = async (): Promise<Collection[]> => {
    const { data, error } = await supabase
      .from('ak_collections')
      .select('*')
      .order('year', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as Collection[]
  }

  // ─── Fetch single collection by slug ─────────────────────

  const fetchCollectionBySlug = async (slug: string): Promise<CollectionWithProducts | null> => {
    const { data, error } = await supabase
      .from('ak_collections')
      .select(`
        *,
        products:ak_products (
          *,
          product_images:ak_product_images (
            id, image_url, position
          )
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }

    return data as CollectionWithProducts
  }

  // ─── Admin: fetch all (including counts) ─────────────────

  const fetchAllCollectionsAdmin = async (): Promise<Collection[]> => {
    const { data, error } = await supabase
      .from('ak_collections')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as Collection[]
  }

  // ─── Admin: create ────────────────────────────────────────

  const createCollection = async (payload: CollectionInsert): Promise<Collection> => {
    const { data, error } = await supabase
      .from('ak_collections')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Collection
  }

  // ─── Admin: update ────────────────────────────────────────

  const updateCollection = async (id: string, payload: CollectionUpdate): Promise<Collection> => {
    const { data, error } = await supabase
      .from('ak_collections')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Collection
  }

  // ─── Admin: delete ────────────────────────────────────────

  const deleteCollection = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('ak_collections')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  // ─── Generate slug from title ─────────────────────────────

  const generateSlug = (title: string): string => {
    if (!title || !title.trim()) return ''
    return slugify(title)
  }

  return {
    localize,
    fetchCollections,
    fetchCollectionBySlug,
    fetchAllCollectionsAdmin,
    createCollection,
    updateCollection,
    deleteCollection,
    generateSlug,
  }
}
