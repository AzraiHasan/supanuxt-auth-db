# Auth Composable Tests

## Overview
This document outlines the testing strategy for the `useAuth` composable functionality. The tests will verify that all authentication methods work correctly and handle errors appropriately.

## Test Environment Setup

### Dependencies
- Vitest for testing framework
- Mock implementation of Supabase client
- Vue Test Utils for composable testing

### Test Configuration
```typescript
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
```

### Mock Utilities
```typescript
// tests/utils/mocks.ts
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
export function mockNuxtImport(importName, mockImplementation) {
  return vi.mock(importName, () => mockImplementation)
}
```

## Test Cases

### 1. Login Method

```typescript
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
```

### 2. Register Method

```typescript
it('should register user successfully', async () => {
  // Arrange
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { user: { id: 'new-user-id' } },
    error: null
  })
  
  const { register } = useAuth()
  
  // Act
  const result = await register('newuser@example.com', 'password123')
  
  // Assert
  expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
    email: 'newuser@example.com',
    password: 'password123'
  })
  expect(result.success).toBe(true)
})

it('should handle registration errors', async () => {
  // Arrange
  const authError = new Error('Email already registered')
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { user: null },
    error: authError
  })
  
  const { register, error } = useAuth()
  
  // Act
  const result = await register('existing@example.com', 'password123')
  
  // Assert
  expect(result.success).toBe(false)
  expect(result.error).toBe(authError)
  expect(error.value).toBe(authError.message)
})
```

### 3. Reset Password Method

```typescript
it('should request password reset successfully', async () => {
  // Arrange
  mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
    data: {},
    error: null
  })
  
  const { resetPassword } = useAuth()
  
  // Act
  const result = await resetPassword('user@example.com')
  
  // Assert
  expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
    'user@example.com',
    expect.objectContaining({ redirectTo: expect.any(String) })
  )
  expect(result.success).toBe(true)
})

it('should handle password reset errors', async () => {
  // Arrange
  const authError = new Error('User not found')
  mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
    data: null,
    error: authError
  })
  
  const { resetPassword, error } = useAuth()
  
  // Act
  const result = await resetPassword('unknown@example.com')
  
  // Assert
  expect(result.success).toBe(false)
  expect(result.error).toBe(authError)
  expect(error.value).toBe(authError.message)
})
```

### 4. Update Password Method

```typescript
it('should update password successfully', async () => {
  // Arrange
  mockSupabaseClient.auth.updateUser.mockResolvedValue({
    data: { user: { id: 'test-user-id' } },
    error: null
  })
  
  mockSupabaseClient.auth.refreshSession.mockResolvedValue({
    data: { session: { user: { id: 'test-user-id' } } },
    error: null
  })
  
  const { updatePassword } = useAuth()
  
  // Act
  const result = await updatePassword('newPassword123')
  
  // Assert
  expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
    password: 'newPassword123'
  })
  expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled()
  expect(result.success).toBe(true)
})

it('should handle password update errors', async () => {
  // Arrange
  const authError = new Error('Invalid password format')
  mockSupabaseClient.auth.updateUser.mockResolvedValue({
    data: { user: null },
    error: authError
  })
  
  const { updatePassword, error } = useAuth()
  
  // Act
  const result = await updatePassword('weak')
  
  // Assert
  expect(result.success).toBe(false)
  expect(result.error).toBe(authError)
  expect(error.value).toBe(authError.message)
})
```

### 5. Logout Method

```typescript
it('should logout successfully', async () => {
  // Arrange
  mockSupabaseClient.auth.signOut.mockResolvedValue({
    error: null
  })
  
  const { logout } = useAuth()
  
  // Act
  const result = await logout()
  
  // Assert
  expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
  expect(result.success).toBe(true)
})

it('should handle logout errors', async () => {
  // Arrange
  const authError = new Error('Network error')
  mockSupabaseClient.auth.signOut.mockResolvedValue({
    error: authError
  })
  
  const { logout, error } = useAuth()
  
  // Act
  const result = await logout()
  
  // Assert
  expect(result.success).toBe(false)
  expect(result.error).toBe(authError)
  expect(error.value).toBe(authError.message)
})
```

## Edge Cases and Additional Tests

### Loading State Tests

```typescript
it('should set loading state during operations', async () => {
  // Arrange
  mockSupabaseClient.auth.signInWithPassword.mockImplementation(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: { session: { user: { id: 'test-user-id' } } },
          error: null
        })
      }, 100)
    })
  })
  
  const { login, loading } = useAuth()
  
  // Act
  const loginPromise = login('test@example.com', 'password123')
  
  // Assert loading is true during operation
  expect(loading.value).toBe(true)
  
  // Wait for completion
  await loginPromise
  
  // Assert loading is false after completion
  expect(loading.value).toBe(false)
})
```

### Error Handling Tests

```typescript
it('should handle unexpected errors', async () => {
  // Arrange
  mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(
    new Error('Unexpected error')
  )
  
  const { login, error } = useAuth()
  
  // Act
  const result = await login('test@example.com', 'password123')
  
  // Assert
  expect(result.success).toBe(false)
  expect(error.value).toBe('Unexpected error')
})
```

## Integration with UI Components

These unit tests should be complemented with integration tests that verify the composable works correctly with UI components:

1. Test login form submission
2. Test registration flow
3. Test password reset workflow
4. Test user session persistence

## Next Steps

After implementing these tests, consider:

1. Setting up test coverage reporting
2. Automating tests in CI/CD pipeline
3. Creating end-to-end tests for critical auth flows
