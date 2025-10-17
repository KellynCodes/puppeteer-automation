# Project Structure

Complete overview of the Paramount+ Automation System architecture and file organization.

## Directory Structure

```
paramount-automation/
├── src/
│   ├── auth/                          # Authentication module
│   │   ├── dto/
│   │   │   └── auth.dto.ts           # Login/Register DTOs
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts     # JWT authentication guard
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts       # Passport JWT strategy
│   │   ├── auth.controller.ts         # Auth endpoints
│   │   ├── auth.service.ts           # Auth business logic
│   │   └── auth.module.ts            # Auth module definition
│   │
│   ├── users/                         # User management module
│   │   ├── dto/
│   │   │   └── user.dto.ts           # User DTOs (Create, Update, Response)
│   │   ├── schemas/
│   │   │   └── user.schema.ts        # MongoDB User schema
│   │   ├── users.controller.ts        # User CRUD endpoints
│   │   ├── users.service.ts          # User business logic
│   │   └── users.module.ts           # Users module definition
│   │
│   ├── automation/                    # Automation module
│   │   ├── dto/
│   │   │   └── automation.dto.ts     # Card automation DTOs
│   │   ├── schemas/
│   │   │   └── card-log.schema.ts    # MongoDB CardLog schema
│   │   ├── services/
│   │   │   ├── encryption.service.ts # Card data encryption
│   │   │   └── puppeteer.service.ts  # Puppeteer utilities
│   │   ├── automation.controller.ts   # Automation endpoints
│   │   ├── automation.service.ts     # Automation business logic
│   │   └── automation.module.ts      # Automation module definition
│   │
│   ├── common/                        # Shared utilities
│   │   └── logger/
│   │       └── logger.service.ts     # Winston logger service
│   │
│   ├── config/
│   │   └── configuration.ts          # Configuration loader
│   │
│   ├── app.module.ts                  # Root application module
│   └── main.ts                        # Application entry point
│
├── logs/                              # Application logs
│   ├── screenshots/                   # Puppeteer screenshots
│   ├── application.log               # General application logs
│   └── error.log                     # Error logs only
│
├── .env                               # Environment variables (not in git)
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── nest-cli.json                      # NestJS CLI configuration
├── package.json                       # Project dependencies
├── tsconfig.json                      # TypeScript configuration
├── setup.sh                           # Setup automation script
├── README.md                          # Main documentation
├── QUICKSTART.md                      # Quick start guide
├── DEPLOYMENT.md                      # Deployment guide
├── API_DOCUMENTATION.md               # API reference
├── PROJECT_STRUCTURE.md               # This file
└── Paramount-Automation.postman_collection.json  # Postman collection
```

## Module Architecture

### 1. Auth Module (`src/auth/`)

**Purpose:** Handle user authentication and JWT token management

**Components:**
- **DTOs:** Request/response data transfer objects
  - `LoginDto`: Email and password for login
  - `RegisterDto`: User registration data
  - `AuthResponseDto`: JWT token response

- **Guards:** Route protection
  - `JwtAuthGuard`: Validates JWT tokens

- **Strategies:** Authentication strategies
  - `JwtStrategy`: Passport JWT validation

- **Service:** Business logic
  - Login validation
  - Token generation
  - User registration

- **Controller:** HTTP endpoints
  - `POST /auth/login`
  - `POST /auth/register`

### 2. Users Module (`src/users/`)

**Purpose:** User CRUD operations and management

**Components:**
- **Schemas:** MongoDB data models
  - `User`: User document schema with timestamps

- **DTOs:** Data validation and transformation
  - `CreateUserDto`: New user validation
  - `UpdateUserDto`: Update user validation
  - `UserResponseDto`: Response formatting

- **Service:** Business logic
  - Create, read, update, delete users
  - Password hashing (bcrypt)
  - Email uniqueness validation
  - Pagination support

- **Controller:** HTTP endpoints
  - `POST /users` - Create user
  - `GET /users` - List users
  - `GET /users/:id` - Get user
  - `PUT /users/:id` - Update user
  - `DELETE /users/:id` - Delete user

### 3. Automation Module (`src/automation/`)

**Purpose:** Puppeteer automation for Paramount+ card management

**Components:**
- **Schemas:** MongoDB data models
  - `CardLog`: Automation attempt logging

- **DTOs:** Request validation
  - `AddCardDto`: Card information validation
  - `CardLogResponseDto`: Log response formatting

- **Services:**
  - `EncryptionService`: AES-256-CBC card encryption
  - `PuppeteerService`: Browser automation utilities
    - Retry logic with exponential backoff
    - Element waiting and interaction
    - Screenshot capture
    - Error handling

- **Main Service:** Orchestration
  - Browser launch and navigation
  - Paramount+ login automation
  - Card form filling
  - Success/failure logging
  - Screenshot management

- **Controller:** HTTP endpoints
  - `POST /automation/add-card` - Automate card addition
  - `GET /automation/logs/:userId` - Get automation logs

### 4. Common Module (`src/common/`)

**Purpose:** Shared utilities across modules

**Components:**
- `LoggerService`: Winston-based logging
  - File logging (application.log, error.log)
  - Console logging (development)
  - Structured JSON logs
  - Log rotation

### 5. Config Module (`src/config/`)

**Purpose:** Environment configuration management

**Components:**
- `configuration.ts`: Centralized config
  - Database settings
  - JWT configuration
  - Encryption settings
  - Puppeteer options

## Data Flow

### Authentication Flow
```
Client Request
    ↓
POST /auth/login (Controller)
    ↓
AuthService.login() (Validation)
    ↓
UsersService.findByEmail() (DB Query)
    ↓
Password Validation (bcrypt)
    ↓
JWT Generation (JwtService)
    ↓
Response with Token
```

### Card Automation Flow
```
Client Request
    ↓
POST /automation/add-card (Controller)
    ↓
AuthGuard (JWT Validation)
    ↓
AutomationService.addCard()
    ↓
├─ UsersService.findOne() (Get user)
├─ PuppeteerService.createBrowser()
├─ Navigate to Paramount+
├─ Login with credentials
├─ Navigate to payment settings
├─ Fill card form
├─ Submit
├─ EncryptionService.encryptCardData()
├─ Save CardLog to MongoDB
└─ Return result
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  name: String,
  password: String (bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### CardLogs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  action: String (enum: 'add_card', 'update_card', 'login'),
  status: String (enum: 'success', 'failed', 'pending', indexed),
  cardLast4Digits: String (optional),
  cardHolder: String (optional),
  encryptedCardData: Object (optional) {
    cardNumber: { encryptedData, iv },
    cvv: { encryptedData, iv },
    expiryMonth: String,
    expiryYear: String
  },
  errorMessage: String (optional),
  errorDetails: Object (optional),
  screenshotPath: String (optional),
  duration: Number (milliseconds),
  createdAt: Date (indexed)
}
```

## Security Architecture

### Layer 1: Network Security
- HTTPS/TLS encryption
- CORS configuration
- Helmet security headers
- Rate limiting

### Layer 2: Authentication
- JWT token-based auth
- Bcrypt password hashing (10 rounds)
- Token expiration (1 hour default)
- Bearer token in Authorization header

### Layer 3: Authorization
- JWT Guard on protected routes
- User-specific resource access
- Role-based access (future enhancement)

### Layer 4: Data Security
- AES-256-CBC encryption for card data
- Unique IV per encryption
- Separate encryption keys per environment
- Only last 4 digits stored in plain text

### Layer 5: Input Validation
- class-validator DTOs
- Type checking
- Format validation (email, card number, etc.)
- Sanitization

## Configuration Management

### Environment Variables
```
.env (local, gitignored)
    ↓
ConfigModule (loads and validates)
    ↓
configuration.ts (centralizes access)
    ↓
Services (inject ConfigService)
```

### Configuration Categories
1. **Application:** Port, environment
2. **Database:** MongoDB URI
3. **Authentication:** JWT secret, expiration
4. **Encryption:** AES key
5. **Puppeteer:** Headless mode, timeout, retries
6. **External:** Paramount+ URL

## Logging Strategy

### Log Levels
- **error:** Application errors, failures
- **warn:** Warnings, deprecated features
- **info:** General information, success messages
- **debug:** Debugging information (dev only)
- **verbose:** Detailed traces (dev only)

### Log Files
- `application.log`: All logs
- `error.log`: Errors only
- Both rotate at 5MB, keep 5 files

### Log Format
```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-01-15 10:30:00",
  "service": "paramount-automation",
  "context": "AuthService",
  "userId": "507f1f77bcf86cd799439011"
}
```

## Error Handling

### Global Exception Filter
```
Exception Thrown
    ↓
Exception Filter (catches all)
    ↓
Log Error (Winston)
    ↓
Format Response (standardized)
    ↓
Return to Client
```

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request"
}
```
- Automation scenarios

## Performance Optimizations

### Database
- Indexes on frequently queried fields
- Pagination for large datasets
- Selective field projection

### Puppeteer
- Reusable browser instances (future)
- Screenshot optimization
- Timeout configuration
- Retry logic with backoff

### API
- Response caching (future)
- Compression (future)
- Connection pooling

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancer compatible
- Job queue for automation (future)
- Redis session storage (future)

### Vertical Scaling
- Resource optimization
- Memory management
- CPU utilization

## Development Workflow

```
1. Pull latest code
2. Install dependencies (npm install)
3. Configure .env
4. Run development server (npm run start:dev)
5. Make changes
6. Test locally
7. Commit changes
8. Push to repository
9. Deploy to production
```


