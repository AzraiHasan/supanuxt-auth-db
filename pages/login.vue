<!-- pages/login.vue -->
<template>
  <div class="flex min-h-screen justify-center items-center">
    <UCard class="w-full max-w-md">
      <div v-if="authError" class="mb-4 p-3 bg-red-100 text-red-800 rounded text-sm">
        {{ authError }}
      </div>

      <form @submit.prevent="onLogin">
        <h1 class="text-2xl font-bold mb-4">Sign In</h1>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <UInput v-model="email" type="email" autocomplete="email" />
          <p v-if="emailError" class="mt-1 text-sm text-red-500">{{ emailError }}</p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Password</label>
          <UInput v-model="password" type="password" autocomplete="current-password" />
          <p v-if="passwordError" class="mt-1 text-sm text-red-500">{{ passwordError }}</p>
        </div>

        <div class="mt-4">
          <UButton type="submit" block :loading="loading">Sign In</UButton>
        </div>
      </form>

      <div class="mt-4 text-center">
        <div>Don't have an account? <NuxtLink to="/register">
            <UButton color="primary" variant="link" class="text-primary" type="button">Register</UButton>
          </NuxtLink>
        </div>
        <div class="mt-2">
          <UButton variant="link" class="text-sm" to="/reset-password" type="button">Forgot your password?</UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const authError = ref('')

const { login, loading, error: loginError } = useAuth()

// Watch for auth errors from the composable
watch(loginError, (value) => {
  if (value) {
    authError.value = value
  }
})

function validateForm() {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''
  authError.value = ''
  
  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    emailError.value = 'Email is invalid'
    isValid = false
  }
  
  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    isValid = false
  }
  
  return isValid
}

async function onLogin() {
  if (!validateForm()) return
  
  try {
    console.log('Attempting login with:', email.value)
    const result = await login(email.value, password.value)
    
    if (result.success) {
      console.log('Login successful, redirecting to dashboard')
      navigateTo('/dashboard')
    } else {
      console.error('Login failed:', result.error)
    }
  } catch (error: any) {
    console.error('Error during login:', error)
    authError.value = error.message || 'An unexpected error occurred'
  }
}
</script>