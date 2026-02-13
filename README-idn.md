# NestJS Contact API

REST API sederhana yang dibangun dengan NestJS, Prisma ORM, dan JWT Authentication untuk mengelola kontak.

##  Fitur

- ✅ Registrasi & Login Pengguna dengan JWT
- ✅ Operasi CRUD untuk Kontak
- ✅ Otorisasi (pengguna hanya dapat mengakses kontak mereka sendiri)
- ✅ Validasi Input menggunakan class-validator
- ✅ Password Hashing dengan bcrypt
- ✅ Database MariaDB/MySQL dengan Prisma ORM
- ✅ Global Exception Handling
- ✅ Response Transformation
- ✅ E2E Testing

##  Pola Arsitektur

Project ini menggunakan **Pola Arsitektur Berlapis (Layered Architecture Pattern)** dengan memisahkan fungsi dan tanggung jawab yang jelas

### Mengapa Layered Architecture?

1. **Separation of Concerns**: Setiap layer memiliki tanggung jawab spesifik
   - **Controller Layer**: Menangani HTTP requests/responses
   - **Service Layer**: Business logic
   - **Data Access Layer**: Operasi database (via Prisma)

2. **Maintainability**: Mudah menemukan dan memperbaiki bug, setiap layer independen

3. **Testability**: Setiap layer dapat ditest secara independen (unit tests, integration tests, e2e tests)

4. **Scalability**: Mudah menambahkan fitur baru tanpa mempengaruhi kode yang sudah ada

5. **Reusability**: Services dapat digunakan kembali di berbagai controller

### Struktur Project

```
src/
├── auth/              # Modul autentikasi
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # JWT authentication guard
│   ├── strategies/    # Passport JWT strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── contact/           # Modul CRUD kontak
│   ├── dto/           # DTOs untuk operasi kontak
│   ├── contact.controller.ts
│   ├── contact.service.ts
│   └── contact.module.ts
├── common/            # Utilitas bersama
│   ├── decorators/    # Custom decorators (@CurrentUser)
│   ├── filters/       # Global exception filter
│   ├── interceptors/  # Response transformer
│   └── interfaces/    # Interfaces bersama
├── prisma/            # Service database
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── generated/         # Prisma generated client
├── app.module.ts      # Root module
└── main.ts            # Entry point
```

### Pola Tambahan yang Digunakan

- **Dependency Injection**: NestJS native DI container
- **DTO Pattern**: Data Transfer Objects untuk validasi
- **Guard Pattern**: JWT authentication guard
- **Decorator Pattern**: Custom decorators (@CurrentUser)
- **Filter Pattern**: Global exception filter
- **Interceptor Pattern**: Response transformation

##  Tech Stack

- **Framework**: NestJS 10
- **Database**: MariaDB/MySQL dengan Prisma ORM 7
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt
- **Testing**: Jest + Supertest

##  Instalasi

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env dengan kredensial database Anda
```

##  Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Jalankan migrations
npm run prisma:migrate

# Buka Prisma Studio (opsional)
npm run prisma:studio
```

##  Menjalankan Aplikasi

```bash
# Mode development
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

API Running di : `http://localhost:3000`

##  Testing

```bash
# E2E tests
npm run test:e2e

# Unit tests
npm test

# Test coverage
npm run test:cov
```

##  Dokumentasi API

### Autentikasi

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

### Kontak (Memerlukan Autentikasi)

Semua endpoint kontak memerlukan header `Authorization: Bearer <token>`.

#### Buat Kontak
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

#### Dapatkan Semua Kontak
```http
GET /contacts
Authorization: Bearer <token>
```

#### Dapatkan Kontak Tertentu
```http
GET /contacts/:id
Authorization: Bearer <token>
```

#### Update Kontak
```http
PATCH /contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Updated",
  "phone": "+9876543210"
}
```

#### Hapus Kontak
```http
DELETE /contacts/:id
Authorization: Bearer <token>
```

##  Fitur Keamanan

- **Password Hashing**: Password di-hash menggunakan bcrypt dengan salt rounds 10
- **JWT Authentication**: Autentikasi stateless dengan token expiration yang dapat dikonfigurasi
- **Authorization Guards**: Melindungi endpoint sensitif dari akses tidak valid
- **Input Validation**: Validasi otomatis di semua endpoint menggunakan class-validator
- **SQL Injection Prevention**: Prisma ORM memberikan perlindungan terhadap SQL injection
- **User-level Access Control**: Pengguna hanya dapat mengakses kontak mereka sendiri

##  Skema Database

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

##  Format Response API

### Response Sukses
```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    // data response di sini
  }
}
```

### Response Error
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": [
    // validation errors atau detail error
  ]
}
```

##  Cakupan Testing

Project ini mencakup E2E tests yang meliputi:

### Auth Tests (7 tests)
- ✅ Registrasi pengguna baru
- ✅ Pencegahan email duplikat
- ✅ Validasi format email
- ✅ Validasi panjang password
- ✅ Login berhasil
- ✅ Deteksi password salah
- ✅ Deteksi pengguna tidak ditemukan

### Contact Tests (13 tests)
- ✅ Buat kontak
- ✅ Dapatkan semua kontak
- ✅ Dapatkan kontak tertentu
- ✅ Update kontak
- ✅ Hapus kontak
- ✅ Requirement autentikasi
- ✅ Validasi input
- ✅ Pengecekan otorisasi (pengguna tidak dapat mengakses kontak pengguna lain)

**Total: 20 tests passed ✅**

##  Environment Variables

Buat file `.env` di root directory:

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

##  Script Project

```bash
# Development
npm run start:dev          # Jalankan dalam mode development dengan watch
npm run start:debug        # Jalankan dalam mode debug

# Production
npm run build              # Build untuk production
npm run start:prod         # Jalankan dalam mode production

# Testing
npm run test               # Jalankan unit tests
npm run test:e2e          # Jalankan E2E tests
npm run test:cov          # Generate test coverage

# Prisma
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Jalankan database migrations
npm run prisma:studio     # Buka Prisma Studio

# Code Quality
npm run lint              # Jalankan ESLint
npm run format            # Format kode dengan Prettier
```

##  Pertimbangan Deployment

Sebelum deploy ke production:

1. ✅ Set `JWT_SECRET` yang kuat di environment variables
2. ✅ Gunakan kredensial database production
3. ✅ Enable CORS dengan origin spesifik
4. ✅ Tambahkan rate limiting (misalnya menggunakan `@nestjs/throttler`)
5. ✅ Setup logging dan monitoring
6. ✅ Konfigurasi HTTPS
7. ✅ Tambahkan dokumentasi API (Swagger)
8. ✅ Setup CI/CD pipeline


##  Pembuat

Nama Anda - [GitHub Profile Anda](https://github.com/yourusername)

