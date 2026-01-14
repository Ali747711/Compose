# It is Full-stack E-commerce project for selling coffee online, Demo Korean Compose coffee web app

# 🌟 Compose Coffee - Backend API

A robust and scalable backend API for Compose Coffee e-commerce platform, built with Node.js, Express, TypeScript, and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 🔐 **JWT Authentication** - Secure authentication with httpOnly cookies
- 👤 **User Management** - Registration, login, profile updates
- 🛍️ **Product Management** - CRUD operations for products with categories
- 🛒 **Shopping Cart** - Add, update, remove items
- 📦 **Order Management** - Create and track orders
- 📍 **Address Management** - Multiple delivery addresses
- 💳 **Payment Integration** - Payment method management
- ☁️ **Cloud Storage** - Cloudinary integration for image uploads
- 🚦 **Rate Limiting** - Upstash Redis-based rate limiting
- 🔍 **Product Search** - Search and filter products
- ⭐ **Reviews & Ratings** - Product review system
- 🔒 **Security** - CORS, Helmet, input validation
- 📊 **Logging** - Morgan HTTP request logging

## 🛠️ Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express.js 5.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB 7.x with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Rate Limiting:** Upstash Redis
- **Password Hashing:** bcryptjs
- **Validation:** Custom validators
- **Security:** CORS, Cookie-parser, Helmet
- **Logging:** Morgan

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.19.0
- **npm** >= 10.0.0
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary Account** (for image uploads)
- **Upstash Redis** (for rate limiting)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/compose-coffee-backend.git
cd compose-coffee-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) section for details.

### 4. Build the project

```bash
npm run build
```

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3003

# Database
DB_URI=mongodb://localhost:27017/compose-coffee
# For MongoDB Atlas:
# DB_URI=mongodb+srv://username:password@cluster.mongodb.net/compose-coffee?retryWrites=true&w=majority

# JWT Configuration
SECRET_TOKEN=your-super-secure-random-string-at-least-32-characters
AUTH_TIMER=24

# Cloudinary Configuration
CLOUDINARY_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Production Environment

For production, create `.env.production`:

```env
NODE_ENV=production
PORT=3003
DB_URI=mongodb+srv://username:password@production-cluster.mongodb.net/compose-coffee
SECRET_TOKEN=production-secret-token-very-secure
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start at `http://localhost:3003` with hot reload enabled.

### Production Mode

```bash
# Build the project
npm run build

# Start production server
npm start
```

### Available Scripts

| Script               | Description                             |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Start development server with nodemon   |
| `npm run build`      | Compile TypeScript to JavaScript        |
| `npm start`          | Start production server                 |
| `npm run clean`      | Remove dist folder                      |
| `npm run type-check` | Check TypeScript types without emitting |

#### 🏥 Health Check

| Method | Endpoint  | Description         | Auth Required |
| ------ | --------- | ------------------- | ------------- |
| GET    | `/health` | Server health check | ❌            |

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2026-01-14T10:30:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

### Error Responses

All errors follow this format:

```json
{
  "code": 400,
  "message": "Error message here"
}
```

**Common Error Codes:**

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🚀 Deployment

### Deploying to Render

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Configure build settings:**

   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node

4. **Set environment variables** (see [Environment Variables](#environment-variables))

5. **Deploy!**

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Whitelist IP: `0.0.0.0/0` (all IPs)
4. Create database user
5. Get connection string and add to `DB_URI`

### Cloudinary Setup

1. Create Cloudinary account
2. Get credentials from dashboard
3. Add to environment variables

### Upstash Redis Setup

1. Create Upstash account
2. Create Redis database
3. Copy REST URL and token
4. Add to environment variables

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens in httpOnly cookies
- ✅ CORS configured for allowed origins
- ✅ Rate limiting on all endpoints
- ✅ Input validation on all requests
- ✅ Environment variables for secrets
- ✅ Helmet for security headers
- ✅ No sensitive data in responses

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Check MongoDB URI
echo $DB_URI

# Test connection
mongosh "your-connection-string"
```

### Cloudinary Upload Failed

```bash
# Verify credentials
echo $CLOUDINARY_NAME
echo $CLOUDINARY_API_KEY

# Check file size (max 10MB)
```

### CORS Errors

```bash
# Verify ALLOWED_ORIGINS includes your frontend URL
echo $ALLOWED_ORIGINS
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

Made with ☕ by Nabiev
