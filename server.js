const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://my-tools-box.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

// Professional API Info - Main endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "🚀 Full-Stack Authentication API",
    version: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: {
      name: "Express.js Authentication Server",
      port: process.env.PORT || 5000,
      uptime: Math.round(process.uptime())
    },
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me"
      },
      system: {
        health: "GET /api/health",
        docs: "GET /api/docs"
      }
    },
    database: {
      status: "connected",
      type: "MongoDB",
      name: "auth-app"
    },
    security: {
      jwt: "enabled",
      cors: "enabled",
      bcrypt: "enabled",
      passwordHashing: "12 rounds"
    },
    features: [
      "User Registration",
      "User Authentication", 
      "JWT Token Management",
      "Password Encryption",
      "Protected Routes",
      "Input Validation"
    ]
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    environment: process.env.NODE_ENV || 'development',
    database: "connected",
    services: {
      express: "✅ Running",
      mongodb: "✅ Connected",
      jwt: "✅ Active",
      cors: "✅ Enabled"
    }
  };
  
  res.json(healthCheck);
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    title: "🔐 Full-Stack Authentication API Documentation",
    version: "1.0.0",
    description: "JWT-based authentication system with MongoDB and Express.js",
    baseURL: `http://localhost:${process.env.PORT || 5000}` || 'https://my-tools-box.vercel.app',
    author: "Full-Stack Developer",
    lastUpdated: new Date().toISOString(),
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        description: "Register a new user account",
        authentication: "Not required",
        requestBody: {
          name: "string (required, min 1 char)",
          email: "string (required, valid email)",
          password: "string (required, min 6 chars)"
        },
        responses: {
          "201": {
            success: true,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: {
              id: "507f1f77bcf86cd799439011",
              name: "John Doe",
              email: "john@example.com"
            }
          },
          "400": {
            success: false,
            message: "User already exists"
          }
        }
      },
      {
        method: "POST", 
        path: "/api/auth/login",
        description: "Login with existing user credentials",
        authentication: "Not required",
        requestBody: {
          email: "string (required)",
          password: "string (required)"
        },
        responses: {
          "200": {
            success: true,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: {
              id: "507f1f77bcf86cd799439011",
              name: "John Doe", 
              email: "john@example.com"
            }
          },
          "400": {
            success: false,
            message: "Invalid credentials"
          }
        }
      },
      {
        method: "GET",
        path: "/api/auth/me",
        description: "Get current authenticated user profile",
        authentication: "Required - Bearer Token",
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        },
        responses: {
          "200": {
            success: true,
            user: {
              id: "507f1f77bcf86cd799439011",
              name: "John Doe",
              email: "john@example.com"
            }
          },
          "401": {
            success: false,
            message: "No token, authorization denied"
          }
        }
      }
    ],
    examples: {
      register: {
        curl: `curl -X POST http://localhost:${process.env.PORT || 5000}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "John Doe", "email": "john@example.com", "password": "123456"}'`
      },
      login: {
        curl: `curl -X POST http://localhost:${process.env.PORT || 5000}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "john@example.com", "password": "123456"}'`
      },
      getProfile: {
        curl: `curl -X GET http://localhost:${process.env.PORT || 5000}/api/auth/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
      }
    }
  });
});

// 404 handler for API routes - Fixed syntax
app.use('/api', (req, res, next) => {
  // If we reach here, it means no API route matched
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: "🔍 API Endpoint Not Found",
      error: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
      suggestion: "Check the available endpoints below",
      availableEndpoints: {
        authentication: [
          "POST /api/auth/register - Register new user",
          "POST /api/auth/login - Login user", 
          "GET /api/auth/me - Get user profile"
        ],
        system: [
          "GET /api/health - Server health check",
          "GET /api/docs - API documentation"
        ]
      },
      documentation: `http://localhost:${process.env.PORT || 5000}/api/docs`,
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = {
      stack: err.stack,
      details: err
    };
  }

  res.status(err.status || 500).json(errorResponse);
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('\n🚀 ================================');
      console.log('🎉 SERVER STARTED SUCCESSFULLY!');
      console.log('🚀 ================================');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 Main API: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: MongoDB Connected`);
      console.log('🚀 ================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();