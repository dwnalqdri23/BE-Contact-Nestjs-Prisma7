# NestJS Contact API

Simple REST API built with NestJS, Prisma ORM, and JWT Authentication for managing contacts.

##  Features

- ✅ User Registration & Login with JWT
- ✅ CRUD Operations for Contacts
- ✅ Authorization (users can only access their own contacts)
- ✅ Input Validation using class-validator
- ✅ Password Hashing with bcrypt
- ✅ MariaDB/MySQL Database with Prisma ORM
- ✅ Global Exception Handling
- ✅ Response Transformation
- ✅ E2E Testing

## Architecture Pattern

This project uses **Layered Architecture Pattern** with clear separation of concerns:

### Why Layered Architecture?

1. **Separation of Concerns**: Each layer has a specific responsibility
   - **Controller Layer**: Handle HTTP requests/responses
   - **Service Layer**: Business logic
   - **Data Access Layer**: Database operations (via Prisma)

2. **Maintainability**: Easy to locate and fix bugs, each layer is independent

3. **Testability**: Each layer can be tested independently (unit tests, integration tests, e2e tests)

4. **Scalability**: Easy to add new features without affecting existing code

5. **Reusability**: Services can be reused across different controllers

### Project Structure

```
src/
├── auth/              # Authentication module
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # JWT authentication guard
│   ├── strategies/    # Passport JWT strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── contact/           # Contact CRUD module
│   ├── dto/           # DTOs for contact operations
│   ├── contact.controller.ts
│   ├── contact.service.ts
│   └── contact.module.ts
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators (@CurrentUser)
│   ├── filters/       # Global exception filter
│   ├── interceptors/  # Response transformer
│   └── interfaces/    # Shared interfaces
├── prisma/            # Database service
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── generated/         # Prisma generated client
├── app.module.ts      # Root module
└── main.ts            # Entry point
```

### Additional Patterns Used

- **Dependency Injection**: NestJS native DI container
- **DTO Pattern**: Data Transfer Objects for validation
- **Guard Pattern**: JWT authentication guard
- **Decorator Pattern**: Custom decorators (@CurrentUser)
- **Filter Pattern**: Global exception filter
- **Interceptor Pattern**: Response transformation

## Tech Stack

- **Framework**: NestJS 10
- **Database**: MariaDB/MySQL with Prisma ORM 7
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt
- **Testing**: Jest + Supertest

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your database credentials
```

## Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (optional)
npm run prisma:studio
```

## Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## Testing

```bash
# E2E tests
npm run test:e2e

# Unit tests
npm test

# Test coverage
npm run test:cov
```

##  API Documentation

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Contacts (Requires Authentication)

All contact endpoints require `Authorization: Bearer <token>` header.

#### Create Contact
```http
POST /contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "phone": "+1234567890",
  "email": "jane@example.com"
}
```

#### Get All Contacts
```http
GET /contacts
Authorization: Bearer <token>
```

#### Get Single Contact
```http
GET /contacts/:id
Authorization: Bearer <token>
```

#### Update Contact
```http
PATCH /contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Updated",
  "phone": "+9876543210"
}
```

#### Delete Contact
```http
DELETE /contacts/:id
Authorization: Bearer <token>
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 10
- **JWT Authentication**: Stateless authentication with configurable token expiration
- **Authorization Guards**: Protect sensitive endpoints from unauthorized access
- **Input Validation**: Automatic validation on all endpoints using class-validator
- **SQL Injection Prevention**: Prisma ORM provides protection against SQL injection
- **User-level Access Control**: Users can only access their own contacts

##  Database Schema

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  contacts  Contact[]
}

model Contact {
  id        Int      @id @default(autoincrement())
  name      String
  phone     String
  email     String?
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    // response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // validation errors or error details
  ]
}
```

##  Test Coverage

The project includes comprehensive E2E tests covering:

### Auth Tests (7 tests)
- ✅ Register new user
- ✅ Duplicate email prevention
- ✅ Email format validation
- ✅ Password length validation
- ✅ Successful login
- ✅ Invalid password detection
- ✅ Non-existent user detection

### Contact Tests (13 tests)
- ✅ Create contact
- ✅ Get all contacts
- ✅ Get single contact
- ✅ Update contact
- ✅ Delete contact
- ✅ Authentication requirements
- ✅ Input validation
- ✅ Authorization checks (users can't access other users' contacts)

**Total: 20 tests passed ✅**

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=nestjs_contact_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
```

##  Project Scripts

```bash
# Development
npm run start:dev          # Start in development mode with watch
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start in production mode

# Testing
npm run test               # Run unit tests
npm run test:e2e          # Run E2E tests
npm run test:cov          # Generate test coverage

# Prisma
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

##  Deployment Considerations

Before deploying to production:

1.  Set strong `JWT_SECRET` in environment variables
2.  Use production database credentials
3.  Enable CORS with specific origins
4.  Add rate limiting (e.g., using `@nestjs/throttler`)
5.  Set up logging and monitoring
6.  Configure HTTPS
7.  Add API documentation (Swagger)
8.  Set up CI/CD pipeline


##  Author

Your Name - [Your GitHub Profile](https://github.com/yourusername)

