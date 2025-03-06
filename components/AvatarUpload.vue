<script setup>
// Minimal setup - only for testing purposes
defineProps({
  avatarUrl: String,
  email: String
})

defineEmits(['update'])
</script>

<template>
  <div>
    <button>Upload Photo</button>
  </div>
</template>
