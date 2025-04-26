# Authentication

This document describes the authentication mechanisms used in the BilanApp API.

## Overview

BilanApp uses JWT (JSON Web Token) for authentication. All API requests must include a valid JWT token in the Authorization header.

## JWT Token Structure

A JWT token consists of three parts:
1. Header
2. Payload
3. Signature

Example token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Obtaining a Token

### Login Endpoint
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

### Token Refresh
```http
POST /auth/refresh
```

Request:
```json
{
  "refreshToken": "refresh_token_here"
}
```

Response:
```json
{
  "token": "new_access_token_here",
  "refreshToken": "new_refresh_token_here"
}
```

## Using the Token

Include the token in the Authorization header of all API requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Expiration

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- After expiration, you must obtain a new token using the refresh token

## Error Responses

### Invalid Token
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  }
}
```

### Missing Token
```json
{
  "error": {
    "code": "MISSING_TOKEN",
    "message": "Authorization token is required"
  }
}
```

## Security Considerations

1. Always use HTTPS for API requests
2. Store tokens securely
3. Implement proper token refresh logic
4. Handle token expiration gracefully
5. Never share tokens with third parties

## Best Practices

1. Implement token refresh before expiration
2. Use secure storage for tokens
3. Implement proper error handling
4. Follow the principle of least privilege
5. Monitor for suspicious activity 