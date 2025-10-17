# Paramount+ Automation System

A NestJS application that automates card management tasks on Paramount+ using Puppeteer, with secure user management and JWT authentication.

## 🚀 Features

- **User Management**: Complete CRUD operations with MongoDB
- **JWT Authentication**: Secure token-based API access
- **Card Automation**: Automated login and card information updates on Paramount+
- **Robust Error Handling**: Retry logic with exponential backoff
- **Encrypted Storage**: Secure card information encryption
- **Comprehensive Logging**: Detailed audit trails with timestamps
- **API Documentation**: Auto-generated Swagger documentation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Chrome/Chromium browser installed
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/KellynCodes/puppeteer-automation.git
cd puppeteer
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. MongoDB Setup

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Application
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/paramount-automation

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=1h

# Encryption (32 characters for AES-256)
ENCRYPTION_KEY=your-32-character-encryption-key!!

# Puppeteer
PUPPETEER_HEADLESS=false
PUPPETEER_TIMEOUT=30000
PUPPETEER_MAX_RETRIES=3

# Paramount+
PARAMOUNT_URL=https://www.paramountplus.com
```

### 5. Generate Encryption Key

You can generate a secure encryption key using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it for `ENCRYPTION_KEY` in your `.env` file.

## 🏃 Running the Application

### Development Mode

```bash
pnpm run start:dev
```

The application will start on `http://localhost:3000`

### Production Mode

```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the application is running, visit:

- **Swagger UI**: `http://localhost:3000/api/docs`

## 🔐 API Endpoints

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!",
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Management

All endpoints require `Authorization: Bearer <token>` header

#### Create User

```http
POST /users
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "password": "SecurePass456!",
}
```

#### Get All Users

```http
GET /users?page=1&limit=10
Authorization: Bearer <your-jwt-token>
```

#### Get User by ID

```http
GET /users/:id
Authorization: Bearer <your-jwt-token>
```

#### Update User

```http
PUT /users/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Delete User

```http
DELETE /users/:id
Authorization: Bearer <your-jwt-token>
```

### Automation

#### Add/Update Card

```http
POST /automation/add-card
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "cardNumber": "4111111111111111",
  "cardHolder": "John Doe",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "zipCode": "10001"
}
```

#### Get Automation Logs

```http
GET /automation/logs/:userId?page=1&limit=10
Authorization: Bearer <your-jwt-token>
```

## 🧪 Sample Test Data

### Test User 1

```json
{
  "email": "test1@example.com",
  "name": "Test User One",
  "password": "TestPass123!"
}
```

### Test User 2

```json
{
  "email": "test2@example.com",
  "name": "Test User Two",
  "password": "TestPass456!"
}
```

### Test Card Data (Use Test Card Numbers)

```json
{
  "cardNumber": "4111111111111111",
  "cardHolder": "Test User",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "zipCode": "10001"
}
```

**Note**: These are test Visa card numbers. For actual testing, use valid Paramount+ credentials.

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based access
- **Card Encryption**: AES-256-CBC encryption for sensitive data
- **Input Validation**: Request validation using class-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configured for security
- **Helmet**: Security headers enabled

## 📊 Logging

Logs are stored in the `logs/` directory:

- `application.log`: All application logs
- `error.log`: Error logs only

Log format includes:

- Timestamp
- Log level
- User information (when applicable)
- Action details
- Error stack traces (for errors)

## 🔄 Retry Logic

The automation module implements robust retry logic:

- **Max Retries**: 3 attempts (configurable)
- **Timeout**: 30 seconds per action (configurable)
- **Exponential Backoff**: Increasing delays between retries
- **Screenshot Capture**: Saves screenshots on failures
- **Detailed Error Logs**: Complete error context

## 🐛 Troubleshooting

### MongoDB Connection Error

### Puppeteer Chrome Not Found

```
Error: Could not find Chrome
```

**Solution**: Install Chromium:

```bash
# macOS
brew install chromium

# Ubuntu/Debian
sudo apt-get install chromium-browser

# Or let Puppeteer download it
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false npm install
```

### JWT Verification Failed

```
Error: Unauthorized
```

**Solution**:

1. Check if token is included in Authorization header
2. Verify token hasn't expired (1h default)
3. Login again to get a fresh token

### Automation Fails on Paramount+

**Solution**:

1. Verify Paramount+ credentials are correct
2. Check if Paramount+ website structure has changed
3. Review screenshots in `logs/screenshots/` directory
4. Ensure PUPPETEER_HEADLESS=false to watch the automation

## 📁 Project Structure

```
paramount-automation/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── schemas/
│   │   └── dto/
│   ├── automation/
│   │   ├── automation.controller.ts
│   │   ├── automation.service.ts
│   │   ├── automation.module.ts
│   │   ├── schemas/
│   │   └── dto/
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── interceptors/
│   ├── config/
│   │   └── configuration.ts
│   ├── app.module.ts
│   └── main.ts
├── logs/
│   └── screenshots/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
```

## ⚠️ Important Notes

1. **Legal Compliance**: This tool should only be used with valid Paramount+ accounts and user consent. Automated interactions may violate Terms of Service.

2. **Rate Limiting**: Avoid excessive automation to prevent account suspension.

3. **Production Deployment**:
   - Set `PUPPETEER_HEADLESS=true` in production
   - Use strong JWT secrets
   - Enable HTTPS
   - Implement proper monitoring and alerting

4. **Card Data Security**:
   - Card information is encrypted at rest
   - Never log full card numbers
   - Comply with PCI DSS requirements for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is for educational purposes only.

## 📞 Support

For issues and questions:

1. Check the Troubleshooting section
2. Review logs in `logs/` directory
3. Open an issue on GitHub

## 🎯 Development Tips

- Use `PUPPETEER_HEADLESS=false` during development to see browser actions
- Check `logs/screenshots/` for failed automation attempts
- Use Swagger UI for easy API testing

---

**Happy Automating! 🚀**
