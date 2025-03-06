<template>
  <div class="p-4 space-y-8">
    <h1 class="text-xl font-bold">Avatar Replacement Test</h1>

    <UCard class="max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Avatar Replacement Testing</h2>
        <UBadge :color="testStatus.color as any">{{ testStatus.label }}</UBadge>
      </div>

      <div class="flex flex-col items-center mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 class="text-sm font-medium mb-3">Current Avatar</h3>
        <UserAvatar :avatar-url="avatarUrl" :email="user?.email || ''" size="xl" class="mb-2" />
        <p class="text-sm text-gray-500">{{ avatarUrl ? 'Avatar is set' : 'No avatar set' }}</p>
      </div>

      <div class="mb-6">
        <h3 class="text-sm font-medium mb-3">Test Steps:</h3>
        <ul class="text-sm space-y-2">
          <li class="flex items-start">
            <UIcon :name="avatarHistory.length > 0 ? 'i-heroicons-check-circle' : 'i-heroicons-circle'"
              class="mr-2 mt-0.5" :class="avatarHistory.length > 0 ? 'text-green-500' : 'text-gray-300'" />
            <span>1. Upload an initial avatar</span>
          </li>
          <li class="flex items-start">
            <UIcon :name="replacementDone ? 'i-heroicons-check-circle' : 'i-heroicons-circle'" class="mr-2 mt-0.5"
              :class="replacementDone ? 'text-green-500' : 'text-gray-300'" />
            <span>2. Replace the avatar with a new one</span>
          </li>
          <li class="flex items-start">
            <UIcon :name="verificationDone ? 'i-heroicons-check-circle' : 'i-heroicons-circle'" class="mr-2 mt-0.5"
              :class="verificationDone ? 'text-green-500' : 'text-gray-300'" />
            <span>3. Verify the replacement was successful</span>
          </li>
        </ul>
      </div>

      <AvatarUpload :avatar-url="avatarUrl" :email="user?.email || ''" @update="onAvatarUpdate" />

      <div class="mt-6 pt-4 border-t">
        <h3 class="font-medium mb-2">Test Results:</h3>
        <div class="space-y-2 text-sm">
          <div><span class="font-medium">Initial Avatar URL:</span> {{ initialAvatarUrl ? 'Set' : 'None' }}</div>
          <div><span class="font-medium">Current Avatar URL:</span> {{ truncatedUrl }}</div>
          <div><span class="font-medium">Avatar History:</span> {{ avatarHistory.length }}</div>
          <div><span class="font-medium">Last Action:</span> {{ lastAction }}</div>
          <div><span class="font-medium">Last Error:</span> {{ lastError || 'None' }}</div>
        </div>
      </div>

      <template v-if="avatarHistory.length > 0">
        <div class="mt-6 pt-4 border-t">
          <h3 class="font-medium mb-2">History Log:</h3>
          <div class="max-h-60 overflow-y-auto">
            <div v-for="(entry, index) in avatarHistory" :key="index" class="text-xs p-2 mb-2 rounded"
              :class="entry.type === 'replace' ? 'bg-blue-50' : entry.type === 'delete' ? 'bg-red-50' : 'bg-green-50'">
              <div class="font-medium">{{ entry.timestamp.toLocaleTimeString() }}: {{ entry.action }}</div>
              <div class="truncate">{{ entry.url || 'No URL' }}</div>
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const user = useSupabaseUser()
const client = useSupabaseClient()
const toast = useToast()

// Define interfaces for type checking
interface ProfileData {
  id: string;
  avatar_url?: string | null;
  email?: string;
}

// Avatar state tracking
const avatarUrl = ref<string | undefined>(undefined)
const initialAvatarUrl = ref<string | undefined>(undefined)
const lastAction = ref('None')
const lastError = ref<string | undefined>(undefined)
const avatarHistory = ref<Array<AvatarHistoryEntry | {
  timestamp: Date;
  action: string;
  url: string | null;
  type: 'initial' | 'replace' | 'delete';
}>>([])

// Test status tracking
const replacementDone = ref(false)
const verificationDone = ref(false)

// Computed properties for UI
const truncatedUrl = computed(() => {
  if (!avatarUrl.value) return 'None';
  return avatarUrl.value.length > 50 
    ? avatarUrl.value.substring(0, 25) + '...' + avatarUrl.value.substring(avatarUrl.value.length - 25)
    : avatarUrl.value;
})

const testStatus = computed(() => {
  if (!initialAvatarUrl.value) {
    return { label: 'Not Started', color: 'gray' };
  }
  if (!replacementDone.value) {
    return { label: 'In Progress', color: 'yellow' };
  }
  if (!verificationDone.value) {
    return { label: 'Verifying', color: 'blue' };
  }
  return { label: 'Completed', color: 'green' };
}) as unknown as { value: { label: string, color: string } }

// Lifecycle
onMounted(async () => {
  if (user.value?.id) {
    try {
      // Fetch current profile
      const { data, error } = await client
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.value?.id)
        .single()
      
      if (error) throw error
      
      const profileData = data as ProfileData
      avatarUrl.value = profileData?.avatar_url || undefined
      
      if (avatarUrl.value) {
        initialAvatarUrl.value = avatarUrl.value
        lastAction.value = 'Loaded existing avatar'
        avatarHistory.value.push({
          timestamp: new Date(),
          action: 'Loaded existing avatar',
          url: avatarUrl.value,
          type: 'initial'
        })
      } else {
        lastAction.value = 'No initial avatar found'
      }
    } catch (err: any) {
      lastError.value = err.message
      console.error('Error loading avatar:', err)
    }
  }
})

function onAvatarUpdate(newAvatarUrl: string | undefined) {
  const oldUrl = avatarUrl.value
  avatarUrl.value = newAvatarUrl
  
  // Track avatar changes for the test
  if (newAvatarUrl === undefined) {
    // Avatar was deleted
    lastAction.value = 'Avatar deleted'
    avatarHistory.value.push({
      timestamp: new Date(),
      action: 'Avatar deleted',
      url: undefined as unknown as string | null,
      type: 'delete'
    })
    // Reset test state if avatar was deleted
    replacementDone.value = false
    verificationDone.value = false
  } else if (oldUrl && newAvatarUrl && oldUrl !== newAvatarUrl) {
    // Avatar was replaced (this is what we're testing)
    lastAction.value = 'Avatar replaced'
    avatarHistory.value.push({
      timestamp: new Date(),
      action: 'Avatar replaced',
      url: newAvatarUrl,
      type: 'replace'
    })
    replacementDone.value = true
    
    // Verify replacement was successful
    setTimeout(async () => {
      try {
        // Double-check the profile record
        const { data, error } = await client
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.value?.id)
          .single()
        
        if (error) throw error
        
        const profileData = data as ProfileData
        if (profileData?.avatar_url === newAvatarUrl) {
          verificationDone.value = true
          avatarHistory.value.push({
            timestamp: new Date(),
            action: 'Replacement verified in database',
            url: newAvatarUrl,
            type: 'replace'
          })
          toast.add({
            title: 'Test Completed',
            description: 'Avatar replacement test successful',
            color: 'green'
          })
        } else {
          throw new Error('Avatar URL mismatch in database')
        }
      } catch (err: any) {
        lastError.value = err.message
        console.error('Verification error:', err)
      }
    }, 1000)
  } else if (!oldUrl && newAvatarUrl) {
    // Initial avatar upload
    lastAction.value = 'Initial avatar uploaded'
    initialAvatarUrl.value = newAvatarUrl
    avatarHistory.value.push({
      timestamp: new Date(),
      action: 'Initial avatar uploaded',
      url: newAvatarUrl,
      type: 'initial'
    })
  }
}
</script>