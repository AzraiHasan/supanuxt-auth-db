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
- Check console logs for login request/response
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
- Check browser console for detailed logs and errors
- Ensure the email is properly registered in the system

### Password Update Failures
- Check browser console for token processing errors
- Inspect URL parameters for proper token inclusion
- Verify console logs indicating successful session establishment
- Check for detailed error messages in the console

### Login Failures After Password Reset
- Check browser console for detailed login request/response logs
- Verify that the password was successfully updated (check logs)
- Ensure there are no validation errors in the login form
- Try clearing browser cache and cookies if issues persist

### Redirect Issues
- Ensure the `redirectTo` URL in the reset password request is correctly formatted
- Make sure Supabase's auto-redirection is properly configured in nuxt.config.ts
- Verify that the update-password page correctly processes URL hash parameters
- Check that the exclude list in nuxt.config.ts includes all necessary paths:
  ```typescript
  supabase: {
    redirectOptions: {
      exclude: ['/', '/reset-password', '/update-password'],
    }
  }
  ```

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