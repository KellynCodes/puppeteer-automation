# API Documentation

Complete API reference for the Paramount+ Automation System.

## Base URL

```
Development: http://localhost:3000
Production: https://yourdomain.com
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User

Create a new user account and receive an access token.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!",
  "paramountEmail": "paramount@example.com",
  "paramountPassword": "ParamountPass123!"
}
```

**Validation Rules:**
- `email`: Must be valid email format
- `name`: Required, non-empty string
- `password`: Minimum 6 characters
- `paramountEmail`: Optional, valid email format
- `paramountPassword`: Optional, string

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Responses:**
- `409 Conflict`: User with email already exists
- `400 Bad Request`: Invalid input data

---

### Login

Authenticate existing user and receive access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

## User Management Endpoints

### Create User

Create a new user (requires authentication).

**Endpoint:** `POST /users`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "password": "SecurePass456!",
  "paramountEmail": "paramount2@example.com",
  "paramountPassword": "ParamountPass456!"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "paramountEmail": "paramount2@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Note:** Password fields are never returned in responses.

---

### Get All Users

Retrieve paginated list of all users.

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /users?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "paramountEmail": "paramount@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

---

### Get User by ID

Retrieve specific user details.

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```
GET /users/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "paramountEmail": "paramount@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: User does not exist

---

### Update User

Update user information.

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "email": "updated@example.com",
  "name": "Updated Name",
  "password": "NewPassword123!",
  "paramountEmail": "newparamount@example.com",
  "paramountPassword": "NewParamountPass!"
}
```

**Example Request:**
```
PUT /users/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "updated@example.com",
  "name": "Updated Name",
  "paramountEmail": "newparamount@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:45:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: User does not exist
- `409 Conflict`: Email already in use by another user

---

### Delete User

Delete a user account permanently.

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```
DELETE /users/507f1f77bcf86cd799439011
```

**Response (204 No Content):**
```
(Empty response body)
```

**Error Responses:**
- `404 Not Found`: User does not exist

---

## Automation Endpoints

### Add Card

Automate the process of logging into Paramount+ and adding/updating card information.

**Endpoint:** `POST /automation/add-card`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
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

**Field Validations:**
- `userId`: Valid MongoDB ObjectId
- `cardNumber`: 13-19 digits
- `cardHolder`: Non-empty string
- `expiryMonth`: 01-12 format
- `expiryYear`: YYYY format
- `cvv`: 3-4 digits
- `zipCode`: 5-10 characters

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "action": "add_card",
  "status": "success",
  "cardLast4Digits": "1111",
  "cardHolder": "John Doe",
  "duration": 15340,
  "screenshotPath": "/logs/screenshots/card_submission_result_1705318200000.png",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response Fields:**
- `_id`: Log entry ID
- `userId`: User who initiated the automation
- `action`: Type of action performed
- `status`: success/failed/pending
- `cardLast4Digits`: Last 4 digits of card (for reference)
- `cardHolder`: Name on card
- `duration`: Time taken in milliseconds
- `screenshotPath`: Path to screenshot (if taken)
- `createdAt`: Timestamp

**Automation Process:**
1. Validates user exists and has Paramount+ credentials
2. Launches browser (visible in dev, headless in production)
3. Navigates to Paramount+
4. Logs in with user's Paramount+ credentials
5. Navigates to payment settings
6. Fills in card information
7. Submits the form
8. Takes screenshots at key points
9. Encrypts and stores card data
10. Returns success/failure status

**Error Responses:**
- `404 Not Found`: User does not exist
- `400 Bad Request`: User missing Paramount+ credentials
- `500 Internal Server Error`: Automation failed (check logs)

**Error Response Example:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "action": "add_card",
  "status": "failed",
  "errorMessage": "Login failed: Invalid credentials",
  "errorDetails": {
    "stack": "Error: Login failed...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "screenshotPath": "/logs/screenshots/error_screenshot_1705318200000.png",
  "duration": 8230,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Important Notes:**
- Card data is encrypted using AES-256-CBC before storage
- Only last 4 digits are stored in plain text
- Screenshots are saved for debugging
- Retry logic automatically handles temporary failures
- Maximum 3 retry attempts with exponential backoff

---

### Get Automation Logs

Retrieve automation history for a specific user.

**Endpoint:** `GET /automation/logs/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /automation/logs/507f1f77bcf86cd799439011?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "action": "add_card",
      "status": "success",
      "cardLast4Digits": "1111",
      "cardHolder": "John Doe",
      "duration": 15340,
      "screenshotPath": "/logs/screenshots/card_submission_result_1705318200000.png",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "action": "add_card",
      "status": "failed",
      "errorMessage": "Timeout waiting for card form",
      "duration": 30120,
      "createdAt": "2024-01-15T09:15:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

**Note:** Encrypted card data is not returned in list responses for security.

---

## Error Handling

All endpoints follow consistent error response format:

### Error Response Structure

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., email) |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default Limit:** 100 requests per hour per IP
- **Authentication:** 10 login attempts per hour per IP
- **Automation:** 5 card operations per hour per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705318200
```

**Rate Limit Exceeded Response (429):**
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

---

## Pagination

All list endpoints support pagination with consistent format:

**Request Parameters:**
- `page`: Page number (starting from 1)
- `limit`: Items per page (max: 100)

**Response Format:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "totalPages": 15
}
```

---

## Testing with cURL

### Complete Workflow Example

```bash
# 1. Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!",
    "paramountEmail": "paramount@test.com",
    "paramountPassword": "ParamountPass123!"
  }'

# Save the access_token from response

# 2. Get all users
curl -X GET "http://localhost:3000/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Update user
curl -X PUT http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'

# 4. Add card automation
curl -X POST http://localhost:3000/automation/add-card \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "cardNumber": "4111111111111111",
    "cardHolder": "Test User",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "zipCode": "10001"
  }'

# 5. Get automation logs
curl -X GET "http://localhost:3000/automation/logs/USER_ID?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## WebSocket Support

Currently not implemented, but planned for future releases:
- Real-time automation progress updates
- Live log streaming
- Browser screenshot streaming

---

## API Versioning

Current version: **v1** (implicit)

Future versions will be explicitly versioned:
- `/api/v1/users`
- `/api/v2/users`

---

## Security Best Practices

### When Using the API

1. **Never log or expose JWT tokens**
2. **Use HTTPS in production**
3. **Rotate JWT secrets regularly**
4. **Implement token refresh mechanism**
5. **Validate all input on client-side**
6. **Store tokens securely** (not in localStorage)
7. **Implement CSRF protection**
8. **Use strong passwords** (min 8 chars, mixed case, numbers, symbols)

### Card Data Security

1. **PCI DSS Compliance:** Full card numbers are encrypted at rest
2. **Transmission Security:** Always use HTTPS
3. **Storage:** Only last 4 digits stored in plain text
4. **Encryption:** AES-256-CBC with unique IVs
5. **Access Control:** Only authenticated users can access their own data

---

## Swagger/OpenAPI

Interactive API documentation available at:
```
http://localhost:3000/api/docs
```

Features:
- Try out endpoints directly
- View request/response schemas
- Authentication support
- Example values
- Error response examples

---

## Common Use Cases

### Use Case 1: User Registration and Card Setup

```javascript
// 1. Register user
const registerResponse = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'SecurePass123!',
    paramountEmail: 'paramount@example.com',
    paramountPassword: 'ParamountPass123!'
  })
});

const { access_token } = await registerResponse.json();

// 2. Add card
const cardResponse = await fetch('http://localhost:3000/automation/add-card', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    userId: 'USER_ID',
    cardNumber: '4111111111111111',
    cardHolder: 'John Doe',
    expiryMonth: '12',
    expiryYear: '2025',
    cvv: '123',
    zipCode: '10001'
  })
});
```

### Use Case 2: Batch User Creation

```javascript
const users = [
  { email: 'user1@example.com', name: 'User 1', password: 'Pass123!' },
  { email: 'user2@example.com', name: 'User 2', password: 'Pass456!' },
  { email: 'user3@example.com', name: 'User 3', password: 'Pass789!' }
];

for (const user of users) {
  await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(user)
  });
}
```

---

## Support and Feedback

For API issues or feature requests:
1. Check logs in `logs/` directory
2. Review Swagger documentation
3. Open GitHub issue with details

---

**API Version:** 1.0  
**Last Updated:** January 2025  
**Documentation Format:** OpenAPI 3.0