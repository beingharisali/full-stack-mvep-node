# Express Backend with MongoDB

This is a complete Express.js backend with MongoDB connection using Mongoose.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/mvep
PORT=5000
JWT_SECRET=jwtSecretKey123456789
JWT_LIFETIME=1d
```

## Running the Application

- Development: `npm run dev` (requires nodemon: `npm install -g nodemon`)
- Production: `npm start`

## Features

- Express.js server
- MongoDB connection with Mongoose
- User authentication (register/login)
- JWT-based authentication
- Security middleware (helmet, xss-clean, rate limiting)
- Error handling
- CORS support

## API Routes

- `GET /health` - Health check endpoint
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login