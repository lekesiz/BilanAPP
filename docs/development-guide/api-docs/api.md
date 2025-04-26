# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Beneficiaries](#beneficiaries)
4. [Documents](#documents)
5. [Conversations](#conversations)
6. [Subscriptions](#subscriptions)
7. [Payments](#payments)
8. [Settings](#settings)
9. [Error Handling](#error-handling)

## Authentication

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "admin"
    }
  }
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Users

### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "admin",
    "profile": {
      "title": "Senior Consultant",
      "bio": "Experienced career consultant",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA"
      }
    },
    "preferences": {
      "notifications": {
        "email": true,
        "push": true
      },
      "privacy": {
        "profileVisibility": "public"
      }
    }
  }
}
```

### Update User Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "title": "Senior Consultant",
    "bio": "Updated bio",
    "phone": "+1234567890"
  }
}
```

## Beneficiaries

### Create Beneficiary
```http
POST /api/v1/beneficiaries
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "status": "active",
  "profile": {
    "education": "Bachelor's Degree",
    "experience": "5 years in marketing",
    "identifiedSkills": ["communication", "project management"]
  }
}
```

### Get Beneficiary Details
```http
GET /api/v1/beneficiaries/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "status": "active",
    "currentPhase": "assessment",
    "profile": {
      "education": "Bachelor's Degree",
      "experience": "5 years in marketing",
      "identifiedSkills": ["communication", "project management"]
    },
    "careerObjectives": {
      "shortTerm": "Find a marketing manager position",
      "longTerm": "Become a marketing director"
    },
    "actionPlan": {
      "steps": [
        {
          "title": "Update resume",
          "completed": true
        },
        {
          "title": "Network with industry professionals",
          "completed": false
        }
      ]
    }
  }
}
```

## Documents

### Upload Document
```http
POST /api/v1/documents
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

file: <file>
type: resume
beneficiaryId: 550e8400-e29b-41d4-a716-446655440000
```

### Get Document
```http
GET /api/v1/documents/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Conversations

### Start Conversation
```http
POST /api/v1/conversations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "beneficiaryId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "assessment",
  "message": "Hello, how can I help you today?"
}
```

### Get Conversation History
```http
GET /api/v1/conversations/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Subscriptions

### Get Subscription Details
```http
GET /api/v1/subscriptions/current
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "premium",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "autoRenew": true,
    "paymentMethod": "credit_card",
    "billingCycle": "monthly",
    "nextBillingDate": "2024-02-01T00:00:00.000Z",
    "metadata": {
      "features": {
        "maxBeneficiaries": 50,
        "maxAiGenerationsMonthly": 1000,
        "storageSpace": "10GB"
      }
    }
  }
}
```

## Payments

### Get Payment History
```http
GET /api/v1/payments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "amount": 99.99,
        "currency": "USD",
        "status": "completed",
        "type": "subscription",
        "paymentMethod": "credit_card",
        "processedAt": "2024-01-01T00:00:00.000Z",
        "metadata": {
          "invoiceNumber": "INV-2024-001",
          "subscriptionId": "550e8400-e29b-41d4-a716-446655440000"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
}
```

## Settings

### Get Application Settings
```http
GET /api/v1/settings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:
```json
{
  "success": true,
  "data": {
    "email": {
      "smtpHost": "smtp.example.com",
      "smtpPort": 587,
      "fromEmail": "noreply@example.com"
    },
    "storage": {
      "maxFileSize": 5242880,
      "allowedFileTypes": ["pdf", "doc", "docx"]
    },
    "ai": {
      "maxGenerationsPerMonth": 1000,
      "model": "gpt-4"
    }
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: User not authorized
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Resource conflict
- `RATE_LIMIT_ERROR`: Too many requests
- `INTERNAL_ERROR`: Server error

### Rate Limiting
- Default: 100 requests per 15 minutes
- Headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time until reset 