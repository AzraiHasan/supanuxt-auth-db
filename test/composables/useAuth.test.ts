// tests/composables/useAuth.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuth } from '@/composables/useAuth'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport, mockSupabaseClient } from '../utils/mocks'

// Mock Nuxt-specific composables
vi.mock('#imports', async () => {
  return {
    useSupabaseClient: () => mockSupabaseClient,
    useSupabaseUser: () => ({ value: { id: 'test-user-id', email: 'test@example.com' } }),
    useRouter: () => ({ push: vi.fn() }),
    useToast: () => ({ add: vi.fn() }),
    ref: vi.fn().mockImplementation((value) => ({ value })),
    watch: vi.fn()
  }
})

describe('useAuth', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.clearAllMocks()
    mockSupabaseClient.auth.signInWithPassword.mockReset()
    mockSupabaseClient.auth.signUp.mockReset()
    mockSupabaseClient.auth.resetPasswordForEmail.mockReset()
    mockSupabaseClient.auth.updateUser.mockReset()
    mockSupabaseClient.auth.signOut.mockReset()
  })

  // Tests will go here
})