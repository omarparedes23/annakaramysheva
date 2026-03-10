export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    await navigateTo('/admin/login')
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  }
}
