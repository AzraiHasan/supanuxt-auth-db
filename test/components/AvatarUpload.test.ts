// test/components/AvatarUpload.test.ts

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AvatarUpload from '~/components/AvatarUpload.vue'

// Mock dependencies
vi.mock('#imports', async () => {
  const original = await vi.importActual('#imports')
  return {
    ...original,
    useSupabaseClient: () => mockSupabaseClient,
    useSupabaseUser: () => ({ value: mockUser }),
    useToast: () => mockToast
  }
})

// Mock data and functions
const mockUser = { id: 'test-user-id', email: 'test@example.com' }
const mockToast = { add: vi.fn() }
const mockSupabaseClient = {
  storage: {
    from: vi.fn().mockReturnThis(),
    upload: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn()
  },
  from: vi.fn().mockReturnThis(),
  update: vi.fn(),
  eq: vi.fn()
}

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount(AvatarUpload)
    expect(wrapper.exists()).toBe(true)
  })
})

it('triggers file input when upload button is clicked', async () => {
  const wrapper = mount(AvatarUpload)
  
  // Mock the openFileDialog method
  const openFileDialogSpy = vi.spyOn(wrapper.vm, 'openFileDialog')
  
  // Find and click the upload button (has camera icon and Upload/Change text)
  const uploadButton = wrapper.findComponent('[icon="i-heroicons-camera"]')
  await uploadButton.trigger('click')
  
  // Verify the method was called
  expect(openFileDialogSpy).toHaveBeenCalled()
})

it('validates file type and size on selection', async () => {
  const wrapper = mount(AvatarUpload)
  
  // Mock files for testing
  const validFile = new File(['valid image content'], 'image.jpg', { type: 'image/jpeg' })
  const invalidTypeFile = new File(['invalid content'], 'document.pdf', { type: 'application/pdf' })
  const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
  
  // Get the file input
  const fileInput = wrapper.find('input[type="file"]')
  
  // Test invalid file type
  Object.defineProperty(fileInput.element, 'files', {
    value: [invalidTypeFile],
    writable: true
  })
  await fileInput.trigger('change')
  
  // Should show error toast for invalid type
  expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
    color: 'red',
    title: 'Invalid File'
  }))
  
  // Clear mock calls
  mockToast.add.mockClear()
  
  // Test oversized file
  Object.defineProperty(fileInput.element, 'files', {
    value: [oversizedFile],
    writable: true
  })
  await fileInput.trigger('change')
  
  // Should show error toast for file size
  expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
    color: 'red',
    title: 'File Too Large'
  }))
})

it('validates file type and size on selection', async () => {
  const wrapper = mount(AvatarUpload)
  
  // Mock files for testing
  const invalidTypeFile = new File(['invalid content'], 'document.pdf', { type: 'application/pdf' })
  
  // Create a large file mock
  const largeFile = new File(['content'], 'large.jpg', { type: 'image/jpeg' })
  Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }) // 6MB
  
  // Find the file input
  const fileInput = wrapper.find('input[type="file"]')
  
  // Test invalid file type
  await fileInput.setValue('')  // Reset input
  const invalidTypeEvent = {
    target: {
      files: [invalidTypeFile]
    }
  }
  await fileInput.trigger('change', invalidTypeEvent)
  
  // Should show error toast for invalid type
  expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
    color: 'red',
    title: 'Invalid File'
  }))
  
  mockToast.add.mockClear()
  
  // Test oversized file
  await fileInput.setValue('')  // Reset input
  const oversizedEvent = {
    target: {
      files: [largeFile]
    }
  }
  await fileInput.trigger('change', oversizedEvent)
  
  // Should show error toast for file size
  expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
    color: 'red',
    title: 'File Too Large'
  }))
})

// Test upload success handling
it('handles successful file upload and emits update event', async () => {
  // Mock Supabase client for successful upload
  mockSupabaseClient.storage.from.mockReturnValue({
    upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ 
      data: { publicUrl: 'https://example.com/avatar.jpg' } 
    }),
    remove: vi.fn().mockResolvedValue({ data: null, error: null })
  })
  
  mockSupabaseClient.from.mockReturnValue({
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    })
  })
  
  // Mount component
  const wrapper = mount(AvatarUpload)
  
  // Create a valid file
  const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
  
  // Simulate file selection
  const fileInput = wrapper.find('input[type="file"]')
  Object.defineProperty(fileInput.element, 'files', {
    value: [file]
  })
  await fileInput.trigger('change')
  
  // Wait for promises to resolve
  await vi.runAllTimers()
  
  // Check success toast was shown
  expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Success',
    description: 'Profile photo updated',
    color: 'green'
  }))
  
  // Check update event was emitted with the URL
  const emitted = wrapper.emitted('update')
  expect(emitted).toBeTruthy()
  if (emitted) {
    expect(emitted[0]).toEqual(['https://example.com/avatar.jpg'])
  }
})

// Test avatar deletion functionality
it('deletes avatar when confirmation is confirmed', async () => {
  // Mock Supabase client for successful deletion
  mockSupabaseClient.storage.from.mockReturnValue({
    remove: vi.fn().mockResolvedValue({ data: {}, error: null })
  })
  
  mockSupabaseClient.from.mockReturnValue({
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    })
  })
  
  // Mount component with existing avatar
  const wrapper = mount(AvatarUpload, {
    props: {
      avatarUrl: 'https://example.com/avatars/test-user-id/avatar.jpg'
    }
  })
  
  // Find the Remove Photo button
  const removeButton = wrapper.find('button[icon="i-heroicons-trash"]')
  await removeButton.trigger('click')
  
  // Modal should be visible now
  // Find the Delete button in the modal
  const deleteButton = wrapper.find('button[color="red"]')
  await deleteButton.trigger('click')
  
  // Wait for promises to resolve
  await vi.runAllTimers()
  
  // Check success toast was shown
  expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Success',
    description: 'Profile photo removed',
    color: 'green'
  }))
  
  // Check update event was emitted with null
  const emitted = wrapper.emitted('update')
  expect(emitted).toBeTruthy()
  if (emitted) {
    expect(emitted[0]).toEqual([null])
  }
})