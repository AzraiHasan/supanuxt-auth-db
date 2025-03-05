<!-- pages/update-password.vue -->
<template>
  <div class="flex min-h-screen justify-center items-center">
    <UCard class="w-full max-w-md">
      <div v-if="authError" class="mb-4 p-4 bg-red-100 text-red-800 rounded">
        {{ authError }}
      </div>

      <h1 class="text-2xl font-bold mb-4">Set New Password</h1>
      <p class="mb-4 text-gray-600">Enter your new password below.</p>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">New Password</label>
        <UInput v-model="password" type="password" autocomplete="new-password" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Confirm New Password</label>
        <UInput v-model="confirmPassword" type="password" autocomplete="new-password" />
      </div>

      <div class="mt-4">
        <UButton @click="updatePassword" block :loading="loading">Update Password</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const password = ref('')
const confirmPassword = ref('')
const toast = useToast()
const loading = ref(false)
const authError = ref<string | null>(null)
const processingToken = ref(true)

// Process recovery token on mount
onMounted(async () => {
  try {
    // We need to process the token from the URL hash
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
  // Validation
  if (!password.value) {
    toast.add({ title: 'Error', description: 'Password is required', color: 'red' })
    return
  }
  
  if (password.value.length < 6) {
    toast.add({ title: 'Error', description: 'Password must be at least 6 characters', color: 'red' })
    return
  }
  
  if (password.value !== confirmPassword.value) {
    toast.add({ title: 'Error', description: 'Passwords do not match', color: 'red' })
    return
  }

  loading.value = true
  try {
    console.log('Updating password...')
    const { data, error } = await supabase.auth.updateUser({
      password: password.value
    })
    
    console.log('Update result:', { success: !!data.user, error })

    if (error) throw error

    toast.add({
      title: 'Success',
      description: 'Your password has been updated successfully.',
      color: 'green'
    })

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