import { vi } from 'vitest'

// Mock Supabase client
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

// Helper to mock Nuxt imports for testing
export function mockNuxtImport(importName: string, mockImplementation: any) {
  return vi.mock(importName, () => mockImplementation)
}