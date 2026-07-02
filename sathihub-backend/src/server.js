const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/user');
const bookingRoutes = require('./routes/bookings');
const searchRoutes  = require('./routes/search');
const uploadRoutes  = require('./routes/upload');
const adminRoutes   = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1); // ← Fix for ERR_ERL_UNEXPECTED_X_FORWARDED_FOR

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait and try again.' },
});

app.get('/', (req, res) => res.json({ success: true, message: 'SathiHub API is running', version: 'v1' }));
app.get('/api/v1/health', (req, res) => res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() }));

app.use('/api/v1/auth',     authLimiter, authRoutes);
app.use('/api/v1/user',     userRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/search',   searchRoutes);
app.use('/api/v1/upload',   uploadRoutes);
app.use('/api/v1/admin',    adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SathiHub backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/v1/health\n`);
});
