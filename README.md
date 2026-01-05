# UBOX POS Backend API

Backend API for UBOX POS SaaS platform built with Express.js, PostgreSQL, and Prisma.

## 🚀 Features

- ✅ User authentication (JWT)
- ✅ Multi-tenant business management
- ✅ Device registration and authorization
- ✅ Role-based access control (OWNER, ADMIN, MONITOR, POS)
- ✅ PostgreSQL database with Prisma ORM
- ✅ TypeScript for type safety
- ✅ Ready for Railway deployment

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `env.example` to `.env` and update values:

```bash
cp env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3001

# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/ubox_pos?schema=public"

# JWT secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Business Management
- `POST /api/business` - Create new business (requires auth)
- `GET /api/business/:id` - Get business details (requires auth)
- `GET /api/business/:id/users` - List business users (requires auth)
- `POST /api/business/:id/users` - Add user to business (requires auth, OWNER/ADMIN only)

### Device Management
- `POST /api/device/register` - Register new device (public)
- `GET /api/device/check/:fingerprint` - Check device authorization (public)
- `GET /api/device/:businessId` - List business devices (requires auth)
- `PATCH /api/device/:id/authorize` - Authorize/revoke device (requires auth, OWNER/ADMIN only)

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ubox.com",
    "password": "password123",
    "name": "Admin User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ubox.com",
    "password": "password123"
  }'
```

### Create Business
```bash
curl -X POST http://localhost:3001/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Restaurant",
    "slug": "my-restaurant"
  }'
```

### Register Device
```bash
curl -X POST http://localhost:3001/api/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "fingerprint": "device-unique-id-123",
    "name": "POS Terminal 1",
    "businessId": "BUSINESS_ID_FROM_PREVIOUS_STEP",
    "role": "POS"
  }'
```

## 🚢 Railway Deployment

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Project
```bash
railway init
```

### 4. Add PostgreSQL Database
```bash
railway add
# Select PostgreSQL
```

### 5. Set Environment Variables

In Railway dashboard, add:
- `JWT_SECRET` - Generate a secure random string
- `JWT_EXPIRES_IN` - `7d`
- `ALLOWED_ORIGINS` - Your frontend URLs

`DATABASE_URL` is automatically set by Railway.

### 6. Deploy
```bash
railway up
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── business.controller.ts
│   │   └── device.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── business.routes.ts
│   │   └── device.routes.ts
│   ├── utils/           # Utilities
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── prisma.ts
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── package.json
├── tsconfig.json
└── .env
```

## 🔐 Security Notes

- Always use HTTPS in production
- Change `JWT_SECRET` to a strong random string
- Never commit `.env` file
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add input validation middleware

## 📝 Database Schema

### User
- Multi-user support
- Password hashing with bcrypt
- Role-based access (SUPER_ADMIN, USER)

### Business
- Multi-tenant architecture
- Each business is isolated
- Plan-based features (FREE, BASIC, PREMIUM)
- Active/inactive status for license control

### UserBusiness (Join Table)
- Links users to businesses
- Role per business (OWNER, ADMIN, MONITOR, POS)

### Device
- Device fingerprinting
- Authorization workflow
- Last seen tracking
- Role assignment (POS, KITCHEN, BAR)

## 🔄 Next Steps

1. **Electron Integration (PASO 2)**
   - Create login screen in Electron app
   - Store JWT token locally
   - Save businessId for sync

2. **Sync System (PASO 4)**
   - Implement sync queue
   - Send sales data to backend
   - Handle offline scenarios

3. **Web Dashboard (PASO 5)**
   - Build admin dashboard
   - Real-time reporting
   - Device management UI

## 📞 Support

For issues or questions, contact the development team.
