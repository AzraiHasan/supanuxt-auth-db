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

### Step 3: Email Verification
**Development Environment:**
- Open the Supabase dashboard
- Navigate to Authentication → Users
- Find your user in the list
- Verify that you can manually trigger a password reset email

**Production Environment:**
- Check your email inbox (including spam/junk folders)
- Verify receipt of the password reset email
- Confirm the email contains a reset link

## Test Flow 2: Update Password

### Step 1: Access the Update Password Page
**Development Environment:**
- Manually navigate to `/update-password`
- Note: In development, you may need to be already authenticated or use a valid reset token

**Production Environment:**
- Click the password reset link received in your email
- Verify redirection to the update password page

### Step 2: Submit New Password
- Enter a new password in the "New Password" field
- Confirm the password in the "Confirm New Password" field
- Click the "Update Password" button
- Verify the loading state appears during submission
- Confirm a success toast appears with "Your password has been updated successfully"
- Verify redirection to the login page (`/login`)

### Step 3: Verify Login with New Password
- Enter your email address
- Enter the newly created password
- Click "Sign In"
- Verify successful authentication
- Confirm redirection to the dashboard (`/dashboard`)

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

## Troubleshooting

### Reset Emails Not Sending
- Check Supabase email provider configuration in dashboard
- Verify your app's URL is in the allowed redirect URLs list
- Check for console errors during the request submission

### Password Update Failures
- Ensure user is authenticated when accessing update-password page
- Check browser console for API error messages
- Verify the reset token is valid and not expired

### Redirect Issues
- Confirm the `redirectTo` URL in the reset password request is correctly formatted
- Ensure the redirect URL includes the full origin (e.g., `https://yourdomain.com/update-password`)
- Verify that password reset routes are added to the exclude list in nuxt.config.ts:
  ```typescript
  supabase: {
    redirectOptions: {
      exclude: ['/', '/reset-password', '/update-password'],
    }
  }
  ```
- Ensure that buttons inside forms have `type="button"` attribute to prevent form submission:
  ```html
  <UButton to="/reset-password" variant="link" type="button">Forgot your password?</UButton>
  ```

## Manual Testing Without Email (Development Only)

To test the update password flow without receiving an actual email:

1. Login to Supabase dashboard
2. Navigate to Authentication → Users
3. Find your test user and click on their entry
4. Use the "Send Reset Password Email" option or copy the reset URL directly
5. Replace the redirect portion with your local development URL
   (e.g., `http://localhost:3000/update-password`)

## Security Considerations

- Verify that unauthenticated users cannot access protected routes
- Confirm that password reset tokens expire after use
- Test that invalid or expired tokens are properly rejected
