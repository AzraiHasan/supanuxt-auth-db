<!-- pages/update-password.vue -->
<template>
  <div class="flex min-h-screen justify-center items-center">
    <UCard class="w-full max-w-md">
      <UForm :state="state" @submit="onUpdatePassword" :validate="validate">
        <h1 class="text-2xl font-bold mb-4">Update Password</h1>

        <p class="mb-4 text-gray-600">Enter your new password below.</p>

        <UFormGroup label="New Password" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <UFormGroup label="Confirm New Password" name="confirmPassword">
          <UInput v-model="state.confirmPassword" type="password" />
        </UFormGroup>

        <div class="mt-4">
          <UButton type="submit" block :loading="loading">Update Password</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const state = ref({ password: '', confirmPassword: '' })
const toast = useToast()
const loading = ref(false)

const validate = (state) => {
  const errors = {}

  if (!state.password) errors.password = 'Password is required'
  else if (state.password.length < 6) errors.password = 'Password must be at least 6 characters'

  if (!state.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (state.confirmPassword !== state.password) errors.confirmPassword = 'Passwords do not match'

  return errors
}

async function onUpdatePassword() {
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: state.password
    })

    if (error) throw error

    toast.add({
      title: 'Success',
      description: 'Your password has been updated successfully.',
      color: 'green'
    })

    // Redirect to login page after successful password update
    navigateTo('/login')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>