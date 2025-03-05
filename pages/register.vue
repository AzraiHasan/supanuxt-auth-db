<!-- pages/register.vue -->
<template>
  <div class="flex min-h-screen justify-center items-center">
    <UCard class="w-full max-w-md">
      <UForm :state="state" @submit="onRegister" :validate="validate">
        <h1 class="text-2xl font-bold mb-4">Create Account</h1>

        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="confirmPassword">
          <UInput v-model="state.confirmPassword" type="password" />
        </UFormGroup>

        <div class="mt-4">
          <UButton type="submit" block :loading="loading">Register</UButton>
        </div>

        <div class="mt-4 text-center">
          <p>Already have an account? <NuxtLink to="/login" class="text-primary">Sign In</NuxtLink>
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
const state = ref({ email: '', password: '', confirmPassword: '' })
const toast = useToast()
const loading = ref(false)

const validate = (state) => {
  const errors = {}
  if (!state.email) errors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(state.email)) errors.email = 'Email is invalid'

  if (!state.password) errors.password = 'Password is required'
  else if (state.password.length < 6) errors.password = 'Password must be at least 6 characters'

  if (!state.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (state.confirmPassword !== state.password) errors.confirmPassword = 'Passwords do not match'

  return errors
}

async function onRegister() {
  loading.value = true
  try {
    const { error } = await supabase.auth.signUp({
      email: state.email,
      password: state.password
    })

    if (error) throw error

    toast.add({
      title: 'Success',
      description: 'Registration successful. Please check your email for verification.',
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