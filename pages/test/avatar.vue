<template>
 <div class="p-4 space-y-8">
  <h1 class="text-xl font-bold">UserAvatar Component Test</h1>

  <div>
   <h2 class="text-lg font-semibold mb-2">Email Only Test (Initials)</h2>
   <div class="flex space-x-4">
    <UserAvatar email="john.doe@example.com" />
    <UserAvatar email="alice.smith@example.com" />
    <UserAvatar email="no-dots@example.com" />
   </div>
  </div>

  <div>
   <h2 class="text-lg font-semibold mb-2">Avatar URL Test</h2>
   <div class="flex space-x-4">
    <UserAvatar avatarUrl="https://ui-avatars.com/api/?name=Test+User&background=random" email="test@example.com" />
   </div>
  </div>

  <div>
   <h2 class="text-lg font-semibold mb-2">No Props Test</h2>
   <div class="flex space-x-4">
    <UserAvatar />
   </div>
  </div>

  <div>
   <h2 class="text-lg font-semibold mb-2">Size Variations</h2>
   <div class="flex items-end space-x-4">
    <UserAvatar email="test@example.com" size="xs" />
    <UserAvatar email="test@example.com" size="sm" />
    <UserAvatar email="test@example.com" size="md" />
    <UserAvatar email="test@example.com" size="lg" />
    <UserAvatar email="test@example.com" size="xl" />
   </div>
  </div>
 </div>
</template>