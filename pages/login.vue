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

<script setup>
definePageMeta({
 middleware: ['guest']
})

const supabase = useSupabaseClient()
const state = ref({ email: '', password: '' })
const toast = useToast()
const loading = ref(false)

const validate = (state) => {
 const errors = {}
 if (!state.email) errors.email = 'Email is required'
 else if (!/^\S+@\S+\.\S+$/.test(state.email)) errors.email = 'Email is invalid'

 if (!state.password) errors.password = 'Password is required'
 else if (state.password.length < 6) errors.password = 'Password must be at least 6 characters'

 return errors
}

async function onLogin() {
 loading.value = true
 try {
  const { error } = await supabase.auth.signInWithPassword({
   email: state.email,
   password: state.password
  })

  if (error) throw error

  navigateTo('/dashboard')
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
