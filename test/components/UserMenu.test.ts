// test/components/UserMenu.test.ts

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UserMenu from '~/components/UserMenu.vue'

// Mock dependencies
vi.mock('#imports', async () => {
  const original = await vi.importActual('#imports')
  return {
    ...original,
    useSupabaseClient: () => mockSupabaseClient,
    useSupabaseUser: () => ({ value: mockUser }),
    useRouter: () => mockRouter
  }
})

// Mock data
const mockUser = { id: 'test-user-id', email: 'test@example.com' }
const mockSupabaseClient = {
  auth: {
    signOut: vi.fn().mockResolvedValue({ error: null })
  }
}
const mockRouter = {
  push: vi.fn()
}

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly with user information', () => {
    const wrapper = mount(UserMenu)
    expect(wrapper.exists()).toBe(true)
    
    // Check that user's display name is shown
    const displayName = wrapper.find('.sm\\:inline')
    expect(displayName.text()).toBe('test')
    
    // Check that UserAvatar component is used
    expect(wrapper.findComponent('[email="test@example.com"]').exists()).toBe(true)
  })
  
  it('renders dropdown menu with correct items', async () => {
    const wrapper = mount(UserMenu)
    
    // Find dropdown button and click it
    const dropdownButton = wrapper.find('button[aria-label="User menu"]')
    await dropdownButton.trigger('click')
    
    // Check menu items
    const menuItems = wrapper.findAll('.flex.items-center.w-full.px-4.py-3')
    
    // Should have 4 menu items (Profile, Dashboard, Change Password, Sign Out)
    expect(menuItems.length).toBe(4)
    
    // Check specific menu items
    expect(menuItems[0].text()).toContain('Profile')
    expect(menuItems[1].text()).toContain('Dashboard')
    expect(menuItems[2].text()).toContain('Change Password')
    expect(menuItems[3].text()).toContain('Sign Out')
  })
  
  it('navigates to the correct routes when menu items are clicked', async () => {
    const wrapper = mount(UserMenu)
    
    // Find dropdown button and click it
    const dropdownButton = wrapper.find('button[aria-label="User menu"]')
    await dropdownButton.trigger('click')
    
    // Find and click the Profile link
    const profileLink = wrapper.findAll('.flex.items-center.w-full.px-4.py-3')[0]
    await profileLink.trigger('click')
    
    // Vue Router should have been called with the correct route
    expect(mockRouter.push).toHaveBeenCalledWith('/profile')
  })
  
  it('signs out and redirects when Sign Out is clicked', async () => {
    const wrapper = mount(UserMenu)
    
    // Find dropdown button and click it
    const dropdownButton = wrapper.find('button[aria-label="User menu"]')
    await dropdownButton.trigger('click')
    
    // Find and click the Sign Out link
    const signOutLink = wrapper.findAll('.flex.items-center.w-full.px-4.py-3')[3]
    await signOutLink.trigger('click')
    
    // Assert that signOut was called
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    
    // Should redirect to login page
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })
  
  it('handles error during sign out', async () => {
    // Mock sign out to return an error
    mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ 
      error: new Error('Network error') 
    })
    
    const wrapper = mount(UserMenu)
    
    // Find dropdown button and click it
    const dropdownButton = wrapper.find('button[aria-label="User menu"]')
    await dropdownButton.trigger('click')
    
    // Find and click the Sign Out link
    const signOutLink = wrapper.findAll('.flex.items-center.w-full.px-4.py-3')[3]
    await signOutLink.trigger('click')
    
    // Assert that signOut was called
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    
    // Should not redirect on error
    expect(mockRouter.push).not.toHaveBeenCalled()
  })
})