# Quick Start Guide - Paramount+ Automation

This guide will help you get the application up and running in under 5 minutes.

## Prerequisites Checklist

- ✅ Node.js v18+ installed
- ✅ MongoDB installed and running
- ✅ Chrome/Chromium browser installed
- ✅ Valid Paramount+ account credentials

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

manually create `.env` file:
```bash
cp .env.example .env
```

```bash
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

## Testing the API

### Option 1: Using Swagger UI (Recommended for Beginners)

1. Open your browser and go to: http://localhost:3000/api/docs
2. You'll see the interactive API documentation
3. Follow the testing flow below

### Option 2: Using cURL

#### Step 1: Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!",
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Save the `access_token` for subsequent requests.

#### Step 2: Create Another User (Optional)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "email": "user2@example.com",
    "name": "User Two",
    "password": "SecurePass456!",
  }'
```

#### Step 3: Get All Users
```bash
curl -X GET "http://localhost:3000/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Step 4: Automate Card Addition
```bash
curl -X POST http://localhost:3000/automation/add-card \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "userId": "USER_ID_FROM_PREVIOUS_RESPONSE",
    "cardNumber": "4111111111111111",
    "cardHolder": "Test User",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "zipCode": "10001"
  }'
```

**Note:** Use test card numbers for testing. The automation will:
- Open a browser window (you'll see it!)
- Login to Paramount+
- Navigate to payment settings
- Fill in card details
- Submit the form

#### Step 5: Check Automation Logs
```bash
curl -X GET "http://localhost:3000/automation/logs/USER_ID?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Option 3: Using Postman

1. Import the `Paramount-Automation.postman_collection.json` file
2. The collection includes all endpoints with examples
3. Environment variables are pre-configured

## Watching the Automation

Since `PUPPETEER_HEADLESS=false` is set in development:

1. When you trigger the card automation, a Chrome browser window will open
2. You'll see the automation in real-time:
   - Navigation to Paramount+
   - Login process
   - Navigation to payment settings
   - Card form filling
3. Screenshots are saved in `logs/screenshots/` for debugging

## Common Test Scenarios

### Scenario 1: Basic User Flow
```bash
# 1. Register
# 2. Login
# 3. Get user profile
# 4. Update user info
```

### Scenario 2: Card Automation Flow
```bash
# 1. Register user with Paramount credentials
# 2. Trigger card automation
# 3. Watch browser automation (headed mode)
# 4. Check logs for success/failure
# 5. View screenshots if needed
```

### Scenario 3: Error Handling
```bash
# 1. Try automation with invalid Paramount credentials
# 2. Check error logs
# 3. View error screenshots
```

## Test Card Numbers

Use these test card numbers (they won't charge anything):

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111111111111111 | 123 | Any future date |
| Visa | 4242424242424242 | 123 | Any future date |
| Mastercard | 5555555555554444 | 123 | Any future date |
| Amex | 378282246310005 | 1234 | Any future date |

## Checking Logs

### Application Logs
```bash
tail -f logs/application.log
```

### Error Logs
```bash
tail -f logs/error.log
```

### Screenshots
```bash
ls -la logs/screenshots/
```

Screenshots are named with timestamps:
- `paramount_homepage_1234567890.png`
- `card_form_filled_1234567890.png`
- `error_screenshot_1234567890.png`

## Troubleshooting

### Issue: Port 3000 Already in Use
Edit `.env` and change the port:
```env
PORT=3001
```

### Issue: Puppeteer Can't Find Chrome
```bash
# Install Chromium
brew install chromium  # macOS
sudo apt-get install chromium-browser  # Ubuntu
```

### Issue: Card Automation Fails
1. Check `logs/error.log` for details
2. Look at screenshots in `logs/screenshots/`
3. Verify Paramount+ credentials are correct
4. Ensure Paramount+ website hasn't changed structure

### Issue: JWT Token Expired
The token expires after 1 hour. Just login again:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## Next Steps

1. ✅ Explore Swagger documentation at http://localhost:3000/api/docs
2. ✅ Check MongoDB data using MongoDB Compass
3. ✅ Review logs for automation details
4. ✅ Customize Puppeteer selectors if Paramount+ changes
5. ✅ Add more automation features as needed

## Important Notes

⚠️ **Security Reminders:**
- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Keep encryption keys secure
- Don't share Paramount+ credentials

⚠️ **Legal Considerations:**
- Only use with accounts you own
- Automation may violate Terms of Service
- Use responsibly and ethically

## Support

If you encounter issues:
1. Check the main README.md
2. Review logs in `logs/` directory
3. Check screenshots for visual debugging
4. Verify all prerequisites are installed

---

**You're all set! 🎉 Start automating!**