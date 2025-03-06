// test/composables/useAuth.test.ts
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Create the mock objects first
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn()
  }
}

// Place vi.mock at the module level, not inside a function
vi.mock('#imports', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSupabaseUser: () => ({ value: { id: 'test-user-id', email: 'test@example.com' } }),
  useRouter: () => ({ push: vi.fn() }),
  useToast: () => ({ add: vi.fn() }),
  ref: vi.fn().mockImplementation((value) => ({ value })),
  watch: vi.fn()
}))

// Import after mocking
import { useAuth } from '@/composables/useAuth'

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
    mockSupabaseClient.auth.refreshSession.mockReset()
  })

  it('should login successfully', async () => {
  // Arrange
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: { session: { user: { id: 'test-user-id' } } },
    error: null
  })
  
  const { login } = useAuth()
  
  // Act
  const result = await login('test@example.com', 'password123')
  
  // Assert
  expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  })
  expect(result.success).toBe(true)
  expect(result.error).toBeUndefined()
})

it('should handle login errors', async () => {
  // Arrange
  const authError = new Error('Invalid login credentials')
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: { session: null },
    error: authError
  })
  
  const { login, error } = useAuth()
  
  // Act
  const result = await login('test@example.com', 'wrongpassword')
  
  // Assert
  expect(result.success).toBe(false)
  expect(result.error).toBe(authError)
  expect(error.value).toBe(authError.message)
})
})