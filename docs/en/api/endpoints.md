# BilanApp API Documentation

## Base URL
```
https://api.bilanapp.com/v1
```

## Authentication
All API requests require authentication using a JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### User Management

#### Get User Profile
```http
GET /users/profile
```

**Response**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Update User Profile
```http
PUT /users/profile
```

**Request Body**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com"
}
```

**Response**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Beneficiaries

#### List Beneficiaries
```http
GET /beneficiaries
```

**Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `status` (optional): Filter by status

**Response**
```json
{
  "data": [
    {
      "id": "ben_123",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Create Beneficiary
```http
POST /beneficiaries
```

**Request Body**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890"
}
```

**Response**
```json
{
  "id": "ben_123",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Questionnaires

#### List Questionnaires
```http
GET /questionnaires
```

**Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `type` (optional): Filter by type

**Response**
```json
{
  "data": [
    {
      "id": "quest_123",
      "title": "Initial Assessment",
      "description": "Initial assessment questionnaire",
      "type": "assessment",
      "status": "active",
      "questions": [
        {
          "id": "q1",
          "text": "Question 1",
          "type": "multiple_choice",
          "options": ["Option 1", "Option 2"]
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Submit Questionnaire Response
```http
POST /questionnaires/:id/responses
```

**Request Body**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": "Option 1"
    }
  ]
}
```

**Response**
```json
{
  "id": "resp_123",
  "questionnaireId": "quest_123",
  "beneficiaryId": "ben_123",
  "answers": [
    {
      "questionId": "q1",
      "answer": "Option 1"
    }
  ],
  "submittedAt": "2024-01-01T00:00:00Z"
}
```

### Documents

#### Upload Document
```http
POST /documents
```

**Request Body (multipart/form-data)**
- `file`: Document file
- `type`: Document type
- `beneficiaryId`: Beneficiary ID
- `description`: Document description

**Response**
```json
{
  "id": "doc_123",
  "filename": "document.pdf",
  "type": "assessment",
  "beneficiaryId": "ben_123",
  "url": "https://storage.bilanapp.com/documents/doc_123.pdf",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### List Documents
```http
GET /documents
```

**Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `beneficiaryId` (optional): Filter by beneficiary
- `type` (optional): Filter by type

**Response**
```json
{
  "data": [
    {
      "id": "doc_123",
      "filename": "document.pdf",
      "type": "assessment",
      "beneficiaryId": "ben_123",
      "url": "https://storage.bilanapp.com/documents/doc_123.pdf",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### Appointments

#### Create Appointment
```http
POST /appointments
```

**Request Body**
```json
{
  "beneficiaryId": "ben_123",
  "date": "2024-01-01T10:00:00Z",
  "duration": 60,
  "type": "assessment",
  "notes": "Initial assessment appointment"
}
```

**Response**
```json
{
  "id": "app_123",
  "beneficiaryId": "ben_123",
  "date": "2024-01-01T10:00:00Z",
  "duration": 60,
  "type": "assessment",
  "status": "scheduled",
  "notes": "Initial assessment appointment",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### List Appointments
```http
GET /appointments
```

**Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `status` (optional): Filter by status
- `type` (optional): Filter by type

**Response**
```json
{
  "data": [
    {
      "id": "app_123",
      "beneficiaryId": "ben_123",
      "date": "2024-01-01T10:00:00Z",
      "duration": 60,
      "type": "assessment",
      "status": "scheduled",
      "notes": "Initial assessment appointment",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### Messages

#### Send Message
```http
POST /messages
```

**Request Body**
```json
{
  "beneficiaryId": "ben_123",
  "subject": "Appointment Reminder",
  "content": "Your appointment is scheduled for tomorrow at 10:00 AM",
  "type": "notification"
}
```

**Response**
```json
{
  "id": "msg_123",
  "beneficiaryId": "ben_123",
  "subject": "Appointment Reminder",
  "content": "Your appointment is scheduled for tomorrow at 10:00 AM",
  "type": "notification",
  "status": "sent",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### List Messages
```http
GET /messages
```

**Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `beneficiaryId` (optional): Filter by beneficiary
- `type` (optional): Filter by type
- `status` (optional): Filter by status

**Response**
```json
{
  "data": [
    {
      "id": "msg_123",
      "beneficiaryId": "ben_123",
      "subject": "Appointment Reminder",
      "content": "Your appointment is scheduled for tomorrow at 10:00 AM",
      "type": "notification",
      "status": "sent",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

## Error Handling

All API errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

Common error codes:
- `INVALID_TOKEN`: Invalid or expired authentication token
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- Authenticated users: 100 requests per minute
- Unauthenticated users: 20 requests per minute

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests per minute
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time until rate limit resets (Unix timestamp) 