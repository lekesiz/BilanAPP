# Security Guide

## Table of Contents
1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Infrastructure Security](#infrastructure-security)
6. [Compliance](#compliance)
7. [Incident Response](#incident-response)
8. [Best Practices](#best-practices)

## Authentication

### Password Security
- Minimum 12 characters
- Require mix of:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
- Password hashing using bcrypt
- Password history (prevent reuse)
- Password expiration (90 days)

Example:
```javascript
// Password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

// Password hashing
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### Two-Factor Authentication
- Required for admin accounts
- Optional for regular users
- Support for:
  - SMS
  - Authenticator apps
  - Backup codes
- Rate limiting for 2FA attempts

Example:
```javascript
// 2FA setup
const secret = authenticator.generateSecret();
const qrCode = authenticator.keyuri(user.email, 'BilanApp', secret);

// 2FA verification
const isValid = authenticator.verify({
  token: userInput,
  secret: user.twoFactorSecret
});
```

### Session Management
- JWT tokens with short expiration
- Refresh tokens with longer expiration
- Session timeout (30 minutes)
- Concurrent session limit
- Session revocation

Example:
```javascript
// JWT configuration
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '30m' }
);

// Refresh token
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

## Authorization

### Role-Based Access Control
- Predefined roles:
  - Super Admin
  - Admin
  - Consultant
  - User
- Custom permissions
- Role hierarchy
- Permission inheritance

Example:
```javascript
// Role definition
const roles = {
  SUPER_ADMIN: {
    permissions: ['*']
  },
  ADMIN: {
    permissions: [
      'users:read',
      'users:create',
      'users:update'
    ]
  }
};

// Permission check
const hasPermission = (user, permission) => {
  return user.role.permissions.includes(permission);
};
```

### Resource Access Control
- Object-level permissions
- Attribute-based access control
- Context-aware authorization
- Audit logging

Example:
```javascript
// Resource access check
const canAccessResource = async (user, resource) => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (resource.ownerId === user.id) return true;
  return false;
};
```

## Data Protection

### Encryption
- Data at rest:
  - AES-256 for sensitive data
  - Transparent data encryption
- Data in transit:
  - TLS 1.3
  - Perfect forward secrecy
- Key management:
  - Hardware security modules
  - Key rotation
  - Key backup

Example:
```javascript
// Data encryption
const encryptedData = crypto.encrypt(data, {
  algorithm: 'aes-256-gcm',
  key: process.env.ENCRYPTION_KEY
});

// Key rotation
const rotateKeys = async () => {
  const newKey = await generateKey();
  await migrateData(oldKey, newKey);
  await updateKey(newKey);
};
```

### Data Masking
- Sensitive data masking
- Dynamic data masking
- Role-based masking
- Audit trail for unmasked access

Example:
```javascript
// Data masking
const maskData = (data, role) => {
  if (role === 'USER') {
    return {
      ...data,
      ssn: '***-**-****',
      creditCard: '****-****-****-****'
    };
  }
  return data;
};
```

## API Security

### Input Validation
- Request validation
- Parameter sanitization
- Content type validation
- Size limits

Example:
```javascript
// Input validation
const validateInput = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(12).required()
  });
  return schema.validate(data);
};
```

### Rate Limiting
- IP-based limiting
- User-based limiting
- Endpoint-specific limits
- Burst protection

Example:
```javascript
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### API Keys
- Key rotation
- Key scoping
- Usage tracking
- Revocation

Example:
```javascript
// API key management
const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const validateApiKey = async (key) => {
  const apiKey = await ApiKey.findOne({ key });
  return apiKey && !apiKey.revoked;
};
```

## Infrastructure Security

### Network Security
- Firewall configuration
- DDoS protection
- VPN access
- Network segmentation

### Server Security
- OS hardening
- Regular updates
- Minimal services
- File system permissions

### Container Security
- Image scanning
- Runtime protection
- Resource limits
- Network policies

Example:
```yaml
# Docker security configuration
version: '3'
services:
  app:
    image: bilan-app:latest
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
```

## Compliance

### GDPR
- Data minimization
- Right to erasure
- Data portability
- Privacy by design

### HIPAA
- PHI protection
- Audit controls
- Access controls
- Encryption requirements

### SOC 2
- Security controls
- Availability monitoring
- Processing integrity
- Confidentiality measures

## Incident Response

### Detection
- Security monitoring
- Log analysis
- Alert systems
- Anomaly detection

### Response
- Incident classification
- Response procedures
- Communication plan
- Documentation

### Recovery
- Backup verification
- System restoration
- Data recovery
- Post-incident review

Example:
```javascript
// Security monitoring
const monitorSecurity = async () => {
  const alerts = await SecurityAlert.find({
    where: {
      status: 'active',
      severity: { $gte: 'high' }
    }
  });
  await notifySecurityTeam(alerts);
};
```

## Best Practices

### Code Security
- Regular security audits
- Dependency scanning
- Secure coding guidelines
- Code review process

### Access Control
- Principle of least privilege
- Regular access reviews
- Temporary access management
- Access logging

### Data Handling
- Data classification
- Secure data disposal
- Data retention policies
- Backup procedures

### Monitoring
- Real-time monitoring
- Log aggregation
- Alert thresholds
- Incident tracking

### Training
- Security awareness
- Phishing prevention
- Password management
- Incident reporting 