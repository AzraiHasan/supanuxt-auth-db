<template>
  <div class="p-4 space-y-8">
    <h1 class="text-xl font-bold">AvatarUpload Component Test</h1>

    <UCard class="max-w-md">
      <h2 class="text-lg font-semibold mb-4">Upload Functionality Test</h2>

      <AvatarUpload :avatar-url="avatarUrl" :email="user?.email || ''" @update="onAvatarUpdate" />

      <div class="mt-4 pt-4 border-t">
        <h3 class="font-medium mb-2">Test Results:</h3>
        <div class="space-y-2 text-sm">
          <div><span class="font-medium">Current Avatar URL:</span> {{ avatarUrl || 'None' }}</div>
          <div><span class="font-medium">Last Action:</span> {{ lastAction }}</div>
          <div><span class="font-medium">Last Error:</span> {{ lastError || 'None' }}</div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const user = useSupabaseUser()
const client = useSupabaseClient()
const avatarUrl = ref<string | null>(null)
const lastAction = ref('None')
const lastError = ref<string | null>(null)

onMounted(async () => {
  if (user.value?.id) {
    try {
      // Fetch current profile
      const { data, error } = await client
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.value.id)
        .single()
      
      if (error) throw error
      
      avatarUrl.value = data?.avatar_url || null
      lastAction.value = 'Loaded initial avatar'
    } catch (err: any) {
      lastError.value = err.message
    }
  }
})

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files.length) return
  
  const file = input.files[0]
  if (!file) return
  
  // Validate file type
  if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
    toast.add({
      title: 'Invalid File',
      description: 'Please select a valid image file (JPEG, PNG, or GIF)',
      color: 'red'
    })
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      title: 'File Too Large',
      description: 'Image must be smaller than 5MB',
      color: 'red'
    })
    return
  }
  
  uploading.value = true
  
  try {
    // First, ensure the profile exists
    await ensureProfileExists()
    
    // Create a simple unique filename without folders
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${user.value?.id}-${Date.now()}.${fileExt}`
    
    console.log('Uploading to path:', fileName)
    
    // Upload file to Supabase Storage with simple options
    const { data: uploadData, error: uploadError } = await client.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) throw uploadError
    
    console.log('Upload successful:', uploadData)
    
    // Get public URL
    const { data: publicURL } = client.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    if (!publicURL) throw new Error('Failed to get public URL')
    
    console.log('Public URL obtained:', publicURL.publicUrl)
    
    // Update profile with new avatar URL
    const { error: updateError } = await client
      .from('profiles')
      .update({ 
        avatar_url: publicURL.publicUrl,
        updated_at: new Date()
      })
      .eq('id', user.value?.id)
    
    if (updateError) throw updateError
    
    // Emit event to parent
    emit('update', publicURL.publicUrl)
    
    toast.add({
      title: 'Success',
      description: 'Profile photo updated',
      color: 'green'
    })
  } catch (error: any) {
    console.error('Avatar upload error:', error)
    toast.add({
      title: 'Upload Failed',
      description: error.message || 'Failed to upload avatar',
      color: 'red'
    })
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

// Helper function to ensure profile exists before updating
async function ensureProfileExists() {
  if (!user.value?.id) throw new Error('User not authenticated')
  
  // First check if profile exists
  const { data, error } = await client
    .from('profiles')
    .select('id')
    .eq('id', user.value.id)
  
  console.log('Profile check:', { data, error })
  
  // If no profile or error, try to create one
  if (error || !data || data.length === 0) {
    console.log('Creating profile for user:', user.value.id)
    
    const { error: insertError } = await client
      .from('profiles')
      .insert({
        id: user.value.id,
        email: user.value.email,
        created_at: new Date(),
        updated_at: new Date()
      })
    
    if (insertError) throw insertError
    
    console.log('Profile created successfully')
  }
}

function onAvatarUpdate(newAvatarUrl: string | null) {
  avatarUrl.value = newAvatarUrl
  lastAction.value = newAvatarUrl ? 'Avatar uploaded' : 'Avatar deleted'
}
</script>