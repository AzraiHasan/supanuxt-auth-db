// test/components/UserAvatar.test.ts

import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import UserAvatar from '~/components/UserAvatar.vue'

describe('UserAvatar', () => {
  it('renders properly', () => {
    const wrapper = mount(UserAvatar)
    expect(wrapper.exists()).toBe(true)
  })
})

it('displays the image when avatarUrl is provided', () => {
  const wrapper = mount(UserAvatar, {
    props: {
      avatarUrl: 'https://example.com/avatar.jpg'
    }
  })
  
  const img = wrapper.find('img')
  expect(img.exists()).toBe(true)
  expect(img.attributes('src')).toBe('https://example.com/avatar.jpg')
})

it('displays initials when only email is provided', () => {
  const wrapper = mount(UserAvatar, {
    props: {
      email: 'john.doe@example.com'
    }
  })
  
  // Should not render an image
  expect(wrapper.find('img').exists()).toBe(false)
  
  // Should render the initials "JD"
  const initialsElement = wrapper.find('div.uppercase')
  expect(initialsElement.exists()).toBe(true)
  expect(initialsElement.text()).toBe('JD')
})

it('displays a fallback icon when neither avatarUrl nor email is provided', () => {
  const wrapper = mount(UserAvatar)
  
  // Should not render an image or initials
  expect(wrapper.find('img').exists()).toBe(false)
  expect(wrapper.find('div.uppercase').exists()).toBe(false)
  
  // Should render the fallback icon
  const icon = wrapper.findComponent('[name="i-heroicons-user"]')
  expect(icon.exists()).toBe(true)
})

it('applies correct size classes based on size prop', () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  
  // Expected classes for each size
  const sizeClasses: Record<typeof sizes[number], string> = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  }
  
  // Test each size
  sizes.forEach((size) => {
    const wrapper = mount(UserAvatar, {
      props: { size }
    })
    
    const avatar = wrapper.find('div').element
    expect(avatar.className).toContain(sizeClasses[size])
  })
})
