<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Profile & Storage Diagnostics</h1>

    <UCard class="mb-6">
      <template #header>
        <h2 class="font-semibold">User Info</h2>
      </template>

      <div v-if="user" class="text-sm space-y-2">
        <div><strong>User ID:</strong> {{ user.id }}</div>
        <div><strong>Email:</strong> {{ user.email }}</div>
      </div>
      <div v-else>Not authenticated</div>
    </UCard>

    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Profile Test</h2>
          <UButton @click="testProfile" :loading="loading.profile">Test Profile Access</UButton>
        </div>
      </template>

      <div v-if="results.profile" class="text-sm">
        <pre class="bg-gray-100 p-3 rounded overflow-auto max-h-60">{{ JSON.stringify(results.profile, null, 2) }}</pre>
      </div>

      <div class="mt-4">
        <UButton @click="createProfile" :loading="loading.createProfile">Create/Update Profile</UButton>
      </div>
    </UCard>

    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Storage Test</h2>
          <UButton @click="testStorage" :loading="loading.storage">Test Storage Access</UButton>
        </div>
      </template>

      <div v-if="results.storage" class="text-sm">
        <pre class="bg-gray-100 p-3 rounded overflow-auto max-h-60">{{ JSON.stringify(results.storage, null, 2) }}</pre>
      </div>

      <div class="mt-4">
        <UButton @click="uploadTestImage" :loading="loading.upload">Upload Test Image</UButton>
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
const toast = useToast()

const loading = reactive({
  profile: false,
  createProfile: false,
  storage: false,
  upload: false
})

const results = reactive({
  profile: null,
  storage: null
})

async function testServiceRoleAccess() {
  // Use service role client (only on server side)
  const serviceClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await serviceClient
    .storage
    .from('avatars')
    .list()

  console.log('Service role access test:', { data, error })
}

// Add this function to fix-profile.vue
async function checkBucketExists() {
  try {
    // This is the correct way to check if a bucket exists
    const { data, error } = await client.storage.getBucket('avatars')

    if (error) {
      console.error('Bucket check error:', error)
      return false
    }

    console.log('Bucket exists:', data)
    return true
  } catch (err) {
    console.error('Bucket check exception:', err)
    return false
  }
}

// Then call this before any other storage operations
await checkBucketExists()

async function testProfile() {
  loading.profile = true

  try {
    // Test if we can access profiles table
    console.log('Testing profile access for user ID:', user.value?.id)

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', user.value?.id)

    results.profile = { data, error }

    if (error) {
      console.error('Profile access error:', error)
    } else {
      console.log('Profile data:', data)
    }
  } catch (e) {
    console.error('Profile test exception:', e)
    results.profile = { error: e.message }
  } finally {
    loading.profile = false
  }
}

async function createProfile() {
  loading.createProfile = true

  try {
    // Directly insert/update profile
    console.log('Creating/updating profile for user ID:', user.value?.id)

    const { data, error } = await client
      .from('profiles')
      .upsert({
        id: user.value?.id,
        email: user.value?.email,
        updated_at: new Date()
      })
      .select()

    if (error) {
      console.error('Profile create/update error:', error)
      toast.add({
        title: 'Error',
        description: error.message,
        color: 'red'
      })
    } else {
      console.log('Profile created/updated:', data)
      toast.add({
        title: 'Success',
        description: 'Profile created/updated',
        color: 'green'
      })

      // Refresh profile data
      await testProfile()
    }
  } catch (e) {
    console.error('Profile create exception:', e)
    toast.add({
      title: 'Error',
      description: e.message,
      color: 'red'
    })
  } finally {
    loading.createProfile = false
  }
}

async function testStorage() {
  loading.storage = true

  try {
    // Test storage access
    console.log('Testing storage access')

    // Test if bucket exists
    const { data: bucketData, error: bucketError } = await client
      .storage
      .getBucket('avatars')

    results.storage = { bucketData, bucketError }

    // Test if we can list files
    const { data: listData, error: listError } = await client
      .storage
      .from('avatars')
      .list()

    results.storage.listData = listData
    results.storage.listError = listError

    console.log('Storage test results:', results.storage)
  } catch (e) {
    console.error('Storage test exception:', e)
    results.storage = { error: e.message }
  } finally {
    loading.storage = false
  }
}

async function uploadTestImage() {
  loading.upload = true

  try {
    // Create a simple canvas with some content
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')

    // Draw a simple colored square
    ctx.fillStyle = 'blue'
    ctx.fillRect(0, 0, 100, 100)
    ctx.fillStyle = 'white'
    ctx.font = '20px Arial'
    ctx.fillText('Test', 30, 50)

    // Convert to blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png')
    })

    // Upload to storage
    console.log('Uploading test image for user ID:', user.value?.id)

    // Create a unique filename in the user's folder
    const fileName = `${user.value?.id}/test-${Date.now()}.png`

    const { data, error } = await client
      .storage
      .from('avatars')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      toast.add({
        title: 'Upload Failed',
        description: error.message,
        color: 'red'
      })
    } else {
      console.log('Upload successful:', data)

      // Get public URL
      const { data: urlData } = client.storage
        .from('avatars')
        .getPublicUrl(fileName)

      console.log('Public URL:', urlData)

      toast.add({
        title: 'Upload Success',
        description: 'Test image uploaded successfully',
        color: 'green'
      })

      // Refresh storage data
      await testStorage()
    }
  } catch (e) {
    console.error('Upload exception:', e)
    toast.add({
      title: 'Error',
      description: e.message,
      color: 'red'
    })
  } finally {
    loading.upload = false
  }
}
</script>