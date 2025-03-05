<template>
  <div class="p-6 space-y-6">
    <h1 class="text-xl font-bold">Supabase RLS Debug</h1>

    <UCard>
      <template #header>
        <h2 class="font-semibold">Profile Permissions Tests</h2>
      </template>

      <div class="space-y-4">
        <div>
          <UButton @click="testReadProfile" :loading="loading.readProfile">
            Test Read Profile
          </UButton>
          <div v-if="results.readProfile" class="mt-2 text-sm p-2 bg-gray-100 rounded">
            <pre>{{ JSON.stringify(results.readProfile, null, 2) }}</pre>
          </div>
        </div>

        <div>
          <UButton @click="testStorageAccess" :loading="loading.storage">
            Test Storage Access
          </UButton>
          <div v-if="results.storage" class="mt-2 text-sm p-2 bg-gray-100 rounded">
            <pre>{{ JSON.stringify(results.storage, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
})

const client = useSupabaseClient()
const user = useSupabaseUser()

const loading = reactive({
  readProfile: false,
  storage: false
})

const results = reactive({
  readProfile: null,
  storage: null
})

async function testReadProfile() {
  loading.readProfile = true

  try {
    // Test read access to profiles table
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value?.id)
      .single()

    results.readProfile = { data, error }
  } catch (e) {
    results.readProfile = { error: e.message }
  } finally {
    loading.readProfile = false
  }
}

async function testStorageAccess() {
  loading.storage = true

  try {
    // Test bucket existence and access
    const { data, error } = await client
      .storage
      .getBucket('avatars')

    results.storage = { bucketData: data, bucketError: error }

    // Also check if we can list files
    const { data: listData, error: listError } = await client
      .storage
      .from('avatars')
      .list()

    results.storage.listData = listData
    results.storage.listError = listError
  } catch (e) {
    results.storage = { error: e.message }
  } finally {
    loading.storage = false
  }
}
</script>