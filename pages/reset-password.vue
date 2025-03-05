<!-- pages/reset-password.vue -->
<template>
  <div class="flex min-h-screen justify-center items-center">
    <UCard class="w-full max-w-md">
      <UForm :state="state" @submit="onResetRequest" :validate="validate">
        <h1 class="text-2xl font-bold mb-4">Reset Password</h1>

        <p class="mb-4 text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>

        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" />
        </UFormGroup>

        <div class="mt-4">
          <UButton type="submit" block :loading="loading">Send Reset Link</UButton>
        </div>

        <div class="mt-4 text-center">
          <p>Remember your password? <NuxtLink to="/login" class="text-primary">Sign In</NuxtLink>
          </p>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['guest']
})

const supabase = useSupabaseClient()
const state = ref({ email: '' })
const toast = useToast()
const loading = ref(false)

const validate = (state) => {
  const errors = {}
  if (!state.email) errors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(state.email)) errors.email = 'Email is invalid'

  return errors
}

async function onResetRequest() {
  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(state.email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) throw error

    toast.add({
      title: 'Success',
      description: 'Password reset link has been sent to your email.',
      color: 'green'
    })
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
