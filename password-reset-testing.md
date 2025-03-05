# Testing Password Reset Functionality

This document outlines the steps to test the password reset functionality in our Supabase-authenticated application.

## Prerequisites

- Supabase project properly configured with email authentication
- Development environment running (`npm run dev`)
- A valid user account already registered in the system
- Access to the email account used for registration (for production testing)

## Test Flow 1: Request Password Reset

### Step 1: Access the Reset Password Page
- Navigate to the login page (`/login`)
- Click the "Forgot your password?" link
- Verify you are redirected to `/reset-password`
- Confirm the reset password form is displayed correctly

### Step 2: Submit Password Reset Request
- Enter your registered email address in the form
- Click the "Send Reset Link" button
- Verify the loading state appears during submission
- Confirm a success toast appears with the message "Password reset link has been sent to your email"
- Check browser console for successful API response logs (no errors)

### Step 3: Email Verification
**Development Environment:**
- Open the Supabase dashboard
- Navigate to Authentication → Users
- Find your user in the list
- Click on the user and use "Send Reset Password Email" option
- Check browser console for request/response logs

**Production Environment:**
- Check your email inbox (including spam/junk folders)
- Verify receipt of the password reset email
- Confirm the email contains a reset link

## Test Flow 2: Update Password

### Step 1: Access the Update Password Page
- Click the password reset link received in your email
- Verify redirection to the `/update-password` page
- Confirm the password update form loads correctly
- Verify the session token is properly processed from URL hash (check console logs)
- Look for "Session established: success: true" in the console logs

### Step 2: Submit New Password
- Enter a new password in the "New Password" field
- Confirm the password in the "Confirm New Password" field
- Click the "Update Password" button
- Verify the loading state appears during submission
- Check console logs for password update response
- Confirm a success toast appears with "Your password has been updated successfully"
- Verify redirection to the login page (`/login`)

### Step 3: Verify Login with New Password
- Enter your email address
- Enter the newly created password
- Click "Sign In"
- Check console logs for "Login successful, redirecting to dashboard"
- Verify successful authentication and redirection to dashboard

## Form Validation Testing

Test the following validation scenarios:

### Reset Password Request Form:
- Submit with empty email field → Error: "Email is required"
- Submit with invalid email format → Error: "Email is invalid"

### Update Password Form:
- Submit with empty password → Error: "Password is required"
- Submit with password less than 6 characters → Error: "Password must be at least 6 characters"
- Submit with non-matching confirmation → Error: "Passwords do not match"
- Submit with empty confirmation → Error: "Please confirm your password"

## Security Testing Results

All security consideration tests have been completed successfully:

### 1. Protected Route Access ✅
- Unauthenticated users are properly redirected to login page when attempting to access protected routes
- No protected content is momentarily visible during redirection

### 2. Token Expiration ✅
- Password reset tokens properly expire after successful use
- Attempting to reuse a consumed token is rejected with appropriate error message

### 3. Invalid Token Handling ✅
- Modified or tampered tokens are properly rejected
- System prevents unauthorized password changes

### 4. Error Messages ✅
- Error messages are informative but do not expose implementation details
- Users are properly guided to request new links when tokens are invalid/expired
- Consistent error handling across different failure scenarios

### 5. Sensitive Information Protection ✅
- No sensitive data (passwords, tokens) appears in console logs
- Authentication tokens are properly masked in network requests
- Internal error structures are not exposed in browser console

## Known Issues and Solutions

### Form Validation Errors
When using UForm with custom validation, you may encounter these errors:
- `TypeError: (intermediate value).filter is not a function`
- `TypeError: formErrors?.value?.find is not a function`

**Solution:** Replace UForm with a standard form and implement manual validation:
```vue
<form @submit.prevent="updatePassword">
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">New Password</label>
    <UInput v-model="password" type="password" autocomplete="new-password" />
    <p v-if="passwordError" class="mt-1 text-sm text-red-500">{{ passwordError }}</p>
  </div>
  <!-- Other form elements -->
</form>
```

### Session Handling Issues
If password update succeeds in UI but fails during login:

**Solution:** Verify active session before updating password:
```typescript
// Get the current session to ensure we have a valid token
const { data: sessionData } = await supabase.auth.getSession()
    
if (!sessionData.session) {
  throw new Error('No active session. Please use a valid reset link.')
}
```

### Router Navigation Warnings
If you see warnings about `history.replaceState`:

**Solution:** Use router navigation instead:
```typescript
// Instead of window.history.replaceState
router.push('/login')
```

## Troubleshooting

### Reset Emails Not Sending
- Check Supabase email provider configuration in dashboard
- Verify your app's URL is in the allowed redirect URLs list
- Check browser console for detailed logs and errors
- Ensure the email is properly registered in the system

### Password Update Failures
- Check browser console for token processing errors
- Look for "Session established: success: true" in console logs
- Verify token successful extraction from URL hash
- Ensure password meets requirements (min 6 characters)
- Check that password and confirmation match

### Login Failures After Password Reset
- Check browser console for detailed login request/response logs
- Verify update result shows `{success: true, error: null}`
- Check Supabase Auth logs for successful password update
- Try clearing browser cache and cookies if issues persist

### Dual Password Reset Pages
The application has both `/update-password.vue` and `/recovery.vue` pages:
- `/update-password.vue` is the primary implementation used with redirect URLs
- Test both if needed, but focus on `/update-password.vue` for consistency

## Manual Testing Without Email (Development Only)

To test the update password flow without receiving an actual email:

1. Login to Supabase dashboard
2. Navigate to Authentication → Users
3. Find your test user and click on their entry
4. Use the "Send Reset Password Email" option
5. In the network tab of browser DevTools, look for the request containing the reset URL
6. Copy the reset URL and modify it to point to your local development URL
   (e.g., replace `https://your-app.com` with `http://localhost:3000`)
7. Paste the modified URL in your browser to test the password reset flow

## Security Considerations

- Verify that unauthenticated users cannot access protected routes
- Confirm that password reset tokens expire after use
- Test that invalid or expired tokens are properly rejected
- Ensure proper error messages are shown for expired/invalid tokens
- Verify console logs do not expose sensitive information