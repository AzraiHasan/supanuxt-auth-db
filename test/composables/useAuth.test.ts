// test/composables/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../../composables/useAuth'

// Mock dependencies
vi.mock('#app', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSupabaseUser: () => mockUser,
  useRouter: () => mockRouter,
  useToast: () => mockToast,
}))

// Mock values
const mockUser = vi.fn()
const mockRouter = {
  push: vi.fn()
}
const mockToast = {
  add: vi.fn()
}
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    refreshSession: vi.fn(),
    signOut: vi.fn(),
  }
}

describe('useAuth composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should return success=true when login succeeds', async () => {
      // Setup mock to return success
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: { user: { id: 'test-id' } } },
        error: null
      })

      const { login } = useAuth()
      const result = await login('test@example.com', 'password')

      // Verify success
      expect(result.success).toBe(true)
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })

    it('should return success=false when login fails', async () => {
      // Setup mock to return error
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: new Error('Invalid login credentials')
      })

      const { login } = useAuth()
      const result = await login('test@example.com', 'wrong-password')

      // Verify failure
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Login Failed',
        color: 'red'
      }))
    })
  })
})