<!-- pages/login.vue -->
<template>
  <div class="flex min-h-screen justify-center items-center">
    <UCard class="w-full max-w-md">

      <UForm :state="state" @submit="onLogin" :validate="validate">
        <h1 class="text-2xl font-bold mb-4">Sign In</h1>

        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <div class="mt-4">
          <UButton type="submit" block :loading="loading">Sign In</UButton>
        </div>
      </UForm>

      <div class="mt-4 text-center">
        <div>Don't have an account? <NuxtLink to="/register">
            <UButton color="primary" variant="link" class="text-primary">Register</UButton>
          </NuxtLink>
        </div>
        <div class="mt-2">
          <UButton variant="link" class="text-sm" to="/reset-password">Forgot your password?</UButton>
        </div>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
interface LoginFormState {
  email: string;
  password: string;
}

definePageMeta({
 middleware: ['guest']
})

const state = ref<LoginFormState>({ email: '', password: '' })
const { login, loading, error } = useAuth()

const validate = (state: LoginFormState) => {
 const errors: Record<string, string> = {}
 if (!state.email) errors.email = 'Email is required'
 else if (!/^\S+@\S+\.\S+$/.test(state.email)) errors.email = 'Email is invalid'

 if (!state.password) errors.password = 'Password is required'
 else if (state.password.length < 6) errors.password = 'Password must be at least 6 characters'

 return errors
}

async function onLogin() {
  const result = await login(state.email, state.password)
  if (result.success) {
    navigateTo('/dashboard')
  }
}
</script>