<!-- components/AvatarUpload.vue -->
<template>
  <div>
    <div class="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-3 sm:space-y-0">
      <UserAvatar :avatar-url="avatarUrl" :email="email" size="lg" />

      <div class="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
        <UButton size="sm" @click="openFileDialog" :loading="uploading" icon="i-heroicons-camera">
          {{ avatarUrl ? 'Change Photo' : 'Upload Photo' }}
        </UButton>

        <UButton v-if="avatarUrl" size="sm" variant="ghost" color="red" @click="confirmDelete" icon="i-heroicons-trash">
          Remove Photo
        </UButton>
      </div>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />

    <!-- Delete confirmation modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Delete profile photo</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" class="h-8 w-8 p-0"
              @click="showDeleteModal = false" />
          </div>
        </template>
        <p>
          Are you sure you want to delete your profile photo? This action cannot be undone.
        </p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" @click="showDeleteModal = false">
              Cancel
            </UButton>
            <UButton color="red" :loading="deleting" @click="deleteAvatar">
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Define database schema types
interface ProfileRow {
  id: string
  email?: string | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

interface ProfileInsert {
  id: string
  email?: string | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

interface ProfileUpdate {
  id?: string
  email?: string | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
    }
  }
}

const props = defineProps({
  avatarUrl: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update', url: string | null): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const deleting = ref(false)
const showDeleteModal = ref(false)
const toast = useToast()
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()

function openFileDialog() {
  fileInput.value?.click()
}

function confirmDelete() {
  showDeleteModal.value = true
}

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
    // If there's an existing avatar, delete it first
    if (props.avatarUrl) {
      try {
        // Extract the filename from the URL
        const match = props.avatarUrl.match(/\/avatars\/(.+)$/) || 
                     props.avatarUrl.match(/\/storage\/v1\/object\/public\/avatars\/(.+)$/);
        
        if (match && match[1]) {
          console.log('Attempting to delete old avatar file:', match[1]);
          
          // Delete the old file
          const { error: deleteError } = await client.storage
            .from('avatars')
            .remove([match[1]]);
          
          if (deleteError) {
            console.warn('Error deleting old avatar:', deleteError);
            // Continue with upload even if deletion fails
          } else {
            console.log('Old avatar file deleted successfully');
          }
        }
      } catch (deleteErr) {
        console.warn('Could not delete old avatar:', deleteErr);
        // Continue with upload even if deletion fails
      }
    }
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.value?.id}-${Date.now()}.${fileExt}`
    const filePath = `${user.value?.id}/${fileName}`
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await client.storage
      .from('avatars')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: publicURL } = client.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    if (!publicURL) throw new Error('Failed to get public URL')
    
    // Update profile with new avatar URL
    const { error: updateError } = await client
      .from('profiles')
      .update({ 
        avatar_url: publicURL.publicUrl,
        updated_at: new Date().toISOString()
      } as ProfileUpdate)
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

async function deleteAvatar() {
  if (!props.avatarUrl || !user.value?.id) {
    showDeleteModal.value = false
    return
  }
  
  deleting.value = true
  
  try {
    console.log('Starting avatar deletion process')
    
    // Extract the complete path including user ID folder from the URL
const match = props.avatarUrl.match(/\/avatars\/(.+)$/) || 
             props.avatarUrl.match(/\/storage\/v1\/object\/public\/avatars\/(.+)$/);
    
    if (!match || !match[1]) {
      throw new Error('Could not extract file path from avatar URL')
    }
    
    // Full path as used during upload
    const filePath = match[1]
    console.log('Extracted path:', filePath)
    
    // Delete the file using the path
    console.log('Attempting to delete file:', filePath)
    const { data: deleteData, error: deleteError } = await client.storage
      .from('avatars')
      .remove([filePath])
    
    console.log('Delete response:', { data: deleteData, error: deleteError })
    
    if (deleteError) {
      throw deleteError
    }
    
    // Update profile
    console.log('Updating profile to remove avatar_url')
    const { error: updateError } = await client
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      } as ProfileUpdate)
      .eq('id', user.value?.id)
    
    if (updateError) {
      throw updateError
    }
    
    // Emit event to parent
    emit('update', null)
    
    toast.add({
      title: 'Success',
      description: 'Profile photo removed',
      color: 'green'
    })
  } catch (error: any) {
    console.error('Avatar delete error:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to remove avatar',
      color: 'red'
    })
  } finally {
    deleting.value = false
    showDeleteModal.value = false
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as ProfileInsert)
    
    if (insertError) throw insertError
    
    console.log('Profile created successfully')
  }
}
</script>
