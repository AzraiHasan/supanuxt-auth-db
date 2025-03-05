// composables/useAuth.ts
interface AuthState {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface AuthResponse {
  success: boolean;
  error?: Error;
}

export const useAuth = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const router = useRouter()
  const toast = useToast()
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  // Login with email/password
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: authError } = await client.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        title: 'Error',
        description: err.message,
        color: 'red'
      })
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Register with email/password
  const register = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: authError } = await client.auth.signUp({
        email,
        password
      })

      if (authError) throw authError
      
      toast.add({
        title: 'Success',
        description: 'Registration successful. Please check your email for verification.',
        color: 'green'
      })
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        title: 'Error',
        description: err.message,
        color: 'red'
      })
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Reset password request
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: authError } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (authError) throw authError
      
      toast.add({
        title: 'Success',
        description: 'Password reset link has been sent to your email.',
        color: 'green'
      })
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        title: 'Error',
        description: err.message,
        color: 'red'
      })
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Update password
  const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: authError } = await client.auth.updateUser({
        password: newPassword
      })

      if (authError) throw authError
      
      toast.add({
        title: 'Success',
        description: 'Your password has been updated successfully.',
        color: 'green'
      })
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        title: 'Error',
        description: err.message,
        color: 'red'
      })
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async (): Promise<AuthResponse> => {
    loading.value = true
    error.value = null
    
    try {
      const { error: authError } = await client.auth.signOut()
      if (authError) throw authError
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      toast.add({
        title: 'Error',
        description: err.message,
        color: 'red'
      })
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    resetPassword,
    updatePassword,
    logout
  }
}