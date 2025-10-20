# Project Structure Guide

## Overview

This backend follows clean architecture principles with clear separation of concerns. Each layer has a specific responsibility and communicates through well-defined interfaces.

## Directory Organization

### `/config` - Configuration Layer
Central location for all application configuration.

- `database.js` - MongoDB connection with pooling (100 connections)
- `middleware.config.js` - Express middleware setup
- `routes.config.js` - Route mounting and error handlers
- `server.config.js` - Process event handlers (shutdown, exceptions)
- `warmup.js` - Database connection pre-warming

**Purpose:** Centralize configuration, keep entry files minimal.

---

### `/controllers` - Presentation Layer
Handle HTTP requests and responses.

- `auth.controller.js` - Authentication request handlers

**Responsibilities:**
- Parse request data
- Call service layer
- Format responses
- Handle HTTP-specific concerns

**Rules:**
- No business logic
- No database access
- Only HTTP concerns

---

### `/services` - Business Logic Layer
Core application logic and data orchestration.

- `auth.service.js` - Authentication business logic

**Responsibilities:**
- Implement business rules
- Orchestrate data operations
- Handle caching
- Perform validations

**Rules:**
- No HTTP concerns
- No direct response formatting
- Return pure data

---

### `/models` - Data Layer
Database schemas and data structure definitions.

- `user.model.js` - User schema with methods

**Responsibilities:**
- Define data structure
- Schema validation
- Instance methods
- Static methods

**Rules:**
- No business logic
- Only data-related operations

---

### `/middleware` - Cross-Cutting Concerns
Reusable request processing logic.

- `auth.middleware.js` - JWT verification, role checking
- `errorHandler.middleware.js` - Global error handling
- `rateLimiter.middleware.js` - Rate limiting configuration
- `requestId.middleware.js` - Request tracking
- `sanitize.middleware.js` - Input validation
- `security.middleware.js` - Security middleware (XSS, NoSQL injection)

**Responsibilities:**
- Request preprocessing
- Authentication/Authorization
- Error handling
- Security enforcement

---

### `/routes` - API Routing Layer
Define API endpoints and attach middleware.

- `index.js` - Route aggregator
- `auth.routes.js` - Authentication routes

**Responsibilities:**
- Define URL structure
- Attach middleware chains
- Route to controllers

**Rules:**
- No business logic
- Only routing configuration

---

### `/utils` - Helper Utilities
Reusable utility functions and classes.

- `errorHandler.js` - Custom error classes
- `fastHash.js` - Optimized password hashing
- `responsePool.js` - Response object pooling
- `tokenPool.js` - JWT token pooling

**Responsibilities:**
- Provide helper functions
- Implement optimization patterns
- Reusable utilities

**Rules:**
- Pure functions preferred
- No HTTP concerns
- No database access

---

## Data Flow

```
HTTP Request
    ↓
Middleware (security, validation, rate limiting)
    ↓
Routes (routing to correct controller)
    ↓
Controller (parse request, call service)
    ↓
Service (business logic, call model/cache)
    ↓
Model (database operations)
    ↓
Service (process data, apply business rules)
    ↓
Controller (format response)
    ↓
Middleware (compression, logging)
    ↓
HTTP Response
```

## Key Principles

### 1. Single Responsibility
Each file/module has ONE clear purpose.

### 2. Dependency Direction
```
Controllers → Services → Models
     ↓
Middleware ← Utils
```

### 3. No Circular Dependencies
Clear, unidirectional dependency flow.

### 4. Configuration Separation
All config in `/config`, not scattered in code.

### 5. Environment-Based Behavior
Use `process.env.NODE_ENV` for environment-specific logic.

## Adding New Features

### New Route
1. Create controller in `/controllers`
2. Create service in `/services`
3. Create model in `/models` (if needed)
4. Add routes in `/routes`
5. Wire up in `/routes/index.js`

### New Middleware
1. Create in `/middleware`
2. Add to `/config/middleware.config.js`

### New Utility
1. Create in `/utils`
2. Import where needed

## Best Practices

### Controllers
```javascript
// ✅ Good
async login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ❌ Bad - has business logic
async login(req, res, next) {
  const user = await User.findOne({ email }); // Don't access DB directly
  if (!user) { ... } // Business logic in controller
}
```

### Services
```javascript
// ✅ Good
async login(email, password) {
  this.validateLoginData(email, password);
  const user = await User.findOne({ email });
  // ... business logic
  return { user, token };
}

// ❌ Bad - has HTTP concerns
async login(req, res) {
  res.json({ ... }); // Don't touch response
}
```

### Models
```javascript
// ✅ Good
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
}

// ❌ Bad - has business logic
userSchema.methods.login = async function(password) {
  // Login should be in service, not model
}
```

## File Naming Conventions

- Controllers: `*.controller.js`
- Services: `*.service.js`
- Models: `*.model.js`
- Middleware: `*.middleware.js`
- Routes: `*.routes.js`
- Config: `*.config.js` or descriptive name
- Utils: Descriptive name (e.g., `tokenPool.js`)

## Summary

This structure ensures:
- ✅ Maintainability - Easy to find and modify code
- ✅ Scalability - Easy to add features without breaking existing code
- ✅ Testability - Each layer can be tested independently
- ✅ Readability - Clear organization and naming
- ✅ Professionalism - Industry-standard architecture

