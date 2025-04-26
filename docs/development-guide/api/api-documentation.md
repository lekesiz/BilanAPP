# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Users](#users)
   - [Beneficiaries](#beneficiaries)
   - [Documents](#documents)
   - [Conversations](#conversations)
   - [Subscriptions](#subscriptions)
   - [Payments](#payments)
6. [Webhooks](#webhooks)
7. [SDKs](#sdks)

## Authentication

### JWT Authentication
```javascript
// Request header
Authorization: Bearer <jwt_token>

// Token format
{
  "alg": "HS256",
  "typ": "JWT"
}
{
  "sub": "user_id",
  "iat": 1516239022,
  "exp": 1516242622
}
```

### Token Generation
```bash
# Generate token
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

## Base URL

### Development
```
http://localhost:3000/api
```

### Staging
```
https://staging.bilan-app.com/api
```

### Production
```
https://api.bilan-app.com/api
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {
      "field": "error details"
    }
  }
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

### Limits by Subscription Tier
- Free: 100 requests/hour
- Basic: 1000 requests/hour
- Professional: 5000 requests/hour
- Enterprise: Custom limits

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1516242622
```

## Endpoints

### Users

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "avatar": "https://...",
    "phone": "+1234567890"
  }
}
```

#### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "phone": "+1234567890"
  }
}

Response: 200 OK
{
  "message": "Profile updated successfully"
}
```

### Beneficiaries

#### Create Beneficiary
```http
POST /beneficiaries
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "profile": {
    "education": "Bachelor's Degree",
    "experience": "5 years"
  }
}

Response: 201 Created
{
  "id": "beneficiary_id",
  "message": "Beneficiary created successfully"
}
```

#### List Beneficiaries
```http
GET /beneficiaries
Authorization: Bearer <token>
Query Parameters:
  - page: 1
  - limit: 10
  - sort: createdAt
  - order: desc

Response: 200 OK
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Documents

#### Upload Document
```http
POST /documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "title": "Document Title",
  "description": "Document Description",
  "type": "resume",
  "beneficiaryId": "beneficiary_id"
}

Response: 201 Created
{
  "id": "document_id",
  "url": "https://...",
  "message": "Document uploaded successfully"
}
```

#### Get Document
```http
GET /documents/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "document_id",
  "title": "Document Title",
  "url": "https://...",
  "metadata": {
    "size": 1024,
    "type": "application/pdf"
  }
}
```

### Conversations

#### Start Conversation
```http
POST /conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "beneficiaryId": "beneficiary_id",
  "message": "Hello, how can I help you?",
  "type": "text"
}

Response: 201 Created
{
  "id": "conversation_id",
  "message": "Conversation started successfully"
}
```

#### Send Message
```http
POST /conversations/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Message content",
  "type": "text"
}

Response: 201 Created
{
  "id": "message_id",
  "message": "Message sent successfully"
}
```

### Subscriptions

#### Get Subscription Plans
```http
GET /subscriptions/plans
Authorization: Bearer <token>

Response: 200 OK
{
  "plans": [
    {
      "id": "plan_id",
      "name": "Basic",
      "price": 9.99,
      "features": [...]
    }
  ]
}
```

#### Subscribe to Plan
```http
POST /subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "plan_id",
  "paymentMethodId": "payment_method_id"
}

Response: 201 Created
{
  "id": "subscription_id",
  "message": "Subscription created successfully"
}
```

### Payments

#### Create Payment Method
```http
POST /payments/methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "card",
  "card": {
    "number": "4242424242424242",
    "expMonth": 12,
    "expYear": 2025,
    "cvc": "123"
  }
}

Response: 201 Created
{
  "id": "payment_method_id",
  "message": "Payment method created successfully"
}
```

#### Process Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 9.99,
  "currency": "USD",
  "paymentMethodId": "payment_method_id"
}

Response: 201 Created
{
  "id": "payment_id",
  "status": "succeeded",
  "message": "Payment processed successfully"
}
```

## Webhooks

### Available Events
- `user.created`
- `user.updated`
- `beneficiary.created`
- `beneficiary.updated`
- `document.uploaded`
- `document.deleted`
- `conversation.created`
- `conversation.updated`
- `subscription.created`
- `subscription.updated`
- `payment.succeeded`
- `payment.failed`

### Webhook Format
```json
{
  "event": "user.created",
  "data": {
    "id": "user_id",
    "email": "user@example.com"
  },
  "timestamp": "2024-03-20T12:00:00Z"
}
```

## SDKs

### JavaScript/Node.js
```javascript
const BilanApp = require('bilan-app-sdk');

const client = new BilanApp({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Example usage
const user = await client.users.getProfile();
```

### Python
```python
from bilan_app import BilanApp

client = BilanApp(
    api_key='your_api_key',
    environment='production'
)

# Example usage
user = client.users.get_profile()
```

### PHP
```php
use BilanApp\Client;

$client = new Client([
    'api_key' => 'your_api_key',
    'environment' => 'production'
]);

// Example usage
$user = $client->users->getProfile();
``` 