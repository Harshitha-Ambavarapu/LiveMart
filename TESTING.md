# Day 3 Testing Checklist

## Backend API Tests
- [ ] POST /api/auth/register - Customer
- [ ] POST /api/auth/register - Retailer
- [ ] POST /api/auth/register - Wholesaler
- [ ] POST /api/auth/verify-otp
- [ ] POST /api/auth/resend-otp
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me (with token)

## Frontend Tests
- [ ] Register form validation
- [ ] Can navigate to register page
- [ ] Form submits successfully
- [ ] OTP page receives userId
- [ ] Can enter 6-digit OTP
- [ ] Login form works
- [ ] Token stored in localStorage
- [ ] Protected routes redirect when not logged in

## Integration Tests
- [ ] Complete registration flow works
- [ ] OTP verification redirects correctly
- [ ] Login sets user context
- [ ] Logout clears user data
