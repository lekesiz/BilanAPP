# BilanApp API Documentation

This documentation contains the necessary information for using the BilanApp application's API.

## General Information

### Authentication
All API requests require JWT token authentication. Send the token in the `Authorization` header using the `Bearer` scheme:

```
Authorization: Bearer <token>
```

### Base URL
```
https://api.bilanapp.com/v1
```

## API Endpoints

### Authentication

#### Login
```http
POST /auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### User Management

#### User List
```http
GET /users
```

Response:
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create User
```http
POST /users
```

Request:
```json
{
  "email": "new@example.com",
  "password": "password123",
  "role": "user"
}
```

### Beneficiaries

#### Beneficiary List
```http
GET /beneficiaries
```

Response:
```json
{
  "beneficiaries": [
    {
      "id": 1,
      "name": "John Doe",
      "birthDate": "1990-01-01",
      "status": "active"
    }
  ]
}
```

#### Beneficiary Details
```http
GET /beneficiaries/:id
```

### Questionnaires

#### Questionnaire List
```http
GET /questionnaires
```

#### Create Questionnaire
```http
POST /questionnaires
```

Request:
```json
{
  "title": "Health Questionnaire",
  "questions": [
    {
      "text": "How is your general health condition?",
      "type": "multiple_choice",
      "options": ["Good", "Fair", "Poor"]
    }
  ]
}
```

### Documents

#### Document Upload
```http
POST /documents
Content-Type: multipart/form-data
```

#### Document List
```http
GET /documents
```

### Appointments

#### Create Appointment
```http
POST /appointments
```

Request:
```json
{
  "beneficiaryId": 1,
  "date": "2024-03-20T14:00:00Z",
  "type": "checkup"
}
```

#### Appointment List
```http
GET /appointments
```

### Messages

#### Send Message
```http
POST /messages
```

Request:
```json
{
  "recipientId": 1,
  "subject": "Important Information",
  "content": "Hello, please check this."
}
```

#### Message List
```http
GET /messages
```

## Error Responses

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {
      "field": "Error detail"
    }
  }
}
```

## Rate Limiting

- API requests are limited to 100 requests per minute
- When rate limit is exceeded, a 429 Too Many Requests response is returned

## Versioning

API versions are specified in the URL:
```
/v1/endpoint
```

## More Information

Visit [Swagger UI](https://api.bilanapp.com/docs) for detailed API documentation. 