const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables explicitly from .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded .env file successfully.');
} else {
  dotenv.config();
}

// 6. Fail fast if required environment variables are missing
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('\n❌ Fatal startup error: Missing required environment variable(s):');
  missingEnvVars.forEach((v) => console.error(`   - ${v}`));
  console.error('Please configure these in your environment or host settings before starting.\n');
  process.exit(1);
}

// 4. Ensure uploads directory exists at startup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

// 1. Read PORT from process.env
const PORT = process.env.PORT || 5000;

// 3. Trust proxy so express-rate-limit sees real client IPs behind reverse proxies (Render, Railway, etc.)
app.set('trust proxy', 1);

// 2. CORS allowlist: CLIENT_URL origins (comma-separated) + localhost:5173 when not in production
const clientUrlOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [...clientUrlOrigins];
if (process.env.NODE_ENV !== 'production') {
  const localDevOrigin = 'http://localhost:5173';
  if (!allowedOrigins.includes(localDevOrigin)) {
    allowedOrigins.push(localDevOrigin);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server, health checks)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      const corsError = new Error(`Origin ${origin} is not allowed by CORS`);
      corsError.status = 403;
      return callback(corsError);
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

