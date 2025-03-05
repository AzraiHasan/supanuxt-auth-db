<!-- pages/update-password.vue -->
<template>
  <div class="flex min-h-screen justify-center items-center">
    <UCard class="w-full max-w-md">
      <div v-if="authError" class="mb-4 p-4 bg-red-100 text-red-800 rounded">
        {{ authError }}
      </div>

      <template v-if="processingToken">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-3xl mb-4" />
          <p>Processing your reset token...</p>
        </div>
      </template>

      <template v-else>
        <h1 class="text-2xl font-bold mb-4">Set New Password</h1>
        <p class="mb-4 text-gray-600">Enter your new password below.</p>

        <UForm :state="state" @submit="updatePassword" :validate="validate">
          <UFormGroup label="New Password" name="password">
            <UInput v-model="state.password" type="password" autocomplete="new-password" />
          </UFormGroup>

          <UFormGroup label="Confirm New Password" name="confirmPassword">
            <UInput v-model="state.confirmPassword" type="password" autocomplete="new-password" />
          </UFormGroup>

          <div class="mt-4">
            <UButton type="submit" block :loading="loading">Update Password</UButton>
          </div>
        </UForm>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface PasswordFormState {
  password: string;
  confirmPassword: string;
}

const supabase = useSupabaseClient()
const state = ref<PasswordFormState>({ password: '', confirmPassword: '' })
const toast = useToast()
const loading = ref(false)
const authError = ref<string | null>(null)
const processingToken = ref(true)

const validate = (state: PasswordFormState) => {
  const errors: Record<string, string> = {}
  
  if (!state.password) errors.password = 'Password is required'
  else if (state.password.length < 6) errors.password = 'Password must be at least 6 characters'
  
  if (!state.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (state.confirmPassword !== state.password) errors.confirmPassword = 'Passwords do not match'
  
  return errors
}

// Process recovery token on mount
onMounted(async () => {
  try {
    // Process the token from the URL hash
    console.log('Processing URL parameters...')
    
    // Get hash parameters from URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = hashParams.get('type')
    const accessToken = hashParams.get('access_token')
    
    console.log('Hash params:', { type, accessToken: accessToken ? '[REDACTED]' : null })
    
    if (type === 'recovery' && accessToken) {
      // We have a recovery token, set up a session
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      })
      
      console.log('Session established:', { success: !!data.session, error })
      
      if (error) {
        authError.value = 'Invalid recovery link: ' + error.message
      }
    } else {
      // Check if we already have a session (for cases where the token was already processed)
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        authError.value = 'No active session. Please use a valid reset link.'
      }
    }
  } catch (err: any) {
    console.error('Recovery processing error:', err)
    authError.value = 'Error processing recovery link: ' + (err.message || 'Unknown error')
  } finally {
    processingToken.value = false
  }
})

async function updatePassword() {
  loading.value = true
  try {
    console.log('Updating password...')
    const { data, error } = await supabase.auth.updateUser({
      password: state.password
    })
    
    console.log('Update result:', { success: !!data.user, error })

    if (error) throw error

    toast.add({
      title: 'Success',
      description: 'Your password has been updated successfully.',
      color: 'green'
    })

    // Clear hash parameters
    window.history.replaceState(null, '', window.location.pathname)
    
    // Redirect to login
    setTimeout(() => {
      navigateTo('/login')
    }, 1500)
  } catch (error: any) {
    console.error('Password update error:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update password',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>