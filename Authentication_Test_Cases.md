# Supabase Authentication - Test Cases

## Database and Backend Tests

### User Registration → Profile Creation
- [x] New user registration automatically creates profile record
- [x] Email field is correctly copied from auth to profile
- [x] Default values are properly set for new profiles

### Profile Permissions (Row Level Security)
- [x] Users can view their own profile data
- [x] Users cannot access other users' profile data
- [x] Users can update only their own profile

## Profile Page Tests

### Profile Loading
- [x] Loading state displays correctly while fetching profile
- [x] Profile information displays correctly after loading
- [x] Error handling works if profile fetch fails

### Profile Editing
- [x] Edit mode toggle buttons work correctly
- [x] Form validation prevents invalid submissions
- [x] Changes persist after saving and page reload
- [x] Cancel button reverts changes properly

### Form Validation
- [x] Empty required fields show appropriate errors
- [x] Username validation works correctly
- [x] Website URL format validation works

## Avatar Management Tests

### Upload Functionality
- [x] File selection dialog opens
- [x] Valid image uploads complete successfully
- [x] File type validation prevents non-image uploads
- [x] File size validation prevents oversized uploads

### Storage Integration
- [x] Uploaded avatar appears immediately after upload
- [x] Avatar URL is correctly saved to profile
- [x] Avatar persists across sessions and page reloads

### Avatar Deletion
- [x] Delete confirmation modal appears
- [x] Avatar is removed when confirmed
- [x] Profile shows default avatar/initials after deletion

## User Interface Component Tests

### UserAvatar Component
- [x] Shows uploaded avatar when available
- [x] Shows correct initials when no avatar exists
- [x] Different sizes render appropriately
- [x] Colors are consistent for the same user

### UserMenu Dropdown
- [x] Dropdown opens and closes correctly
- [x] All navigation links work as expected
- [x] Correct user information displays in menu
- [x] Logout functionality works properly

### Layout Integration
- [x] Header displays user menu when logged in
- [x] User menu provides access to profile page
- [x] Navigation between pages works correctly

## Cross-browser and Responsive Testing
- [ ] Profile page renders correctly on mobile devices
- [ ] Avatar upload works on mobile browsers
- [ ] UI components adapt to different screen sizes

## Common Issues to Watch For
- [x] Missing "avatars" storage bucket in Supabase
- [x] Row Level Security policy configuration issues
- [x] CORS problems with avatar URLs
- [x] Form validation errors not properly displayed
- [x] Database constraints preventing profile updates
- [x] Session handling issues after authentication actions
- [x] Storage permission issues for avatar uploads

## Additional RLS Configuration Tests
- [x] Verify bucket public/private settings are correct
- [x] Test file path handling in storage operations
- [x] Confirm RLS policies work with folder structures
- [x] Profile exists before attempting avatar operations
- [x] Error handling for storage operations is robust

## Troubleshooting Steps
1. Check if "avatars" bucket exists and is marked as public
2. Verify RLS policies on storage.objects table
3. Confirm profiles table has appropriate RLS policies
4. Test file upload with simplified naming (no folders)
5. Ensure profile record exists before updating avatar_url
6. Check console logs for specific error messages
7. Test bucket operations directly via SQL if needed