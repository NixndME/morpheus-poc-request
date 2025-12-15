/**
 * Morpheus POC License Request Tool - Backend API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { testConnection, closePool } from './db/connection';
import { pocRouter } from './routes/pocRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers (relaxed for local dev)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS - allow frontend origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/poc-requests', pocRouter);

// ============================================================================
// STATIC FILES (Production)
// ============================================================================

if (isProduction) {
  // Serve static files from the public directory (frontend build)
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  
  // SPA fallback - serve index.html for any unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Development 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  // Start server
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║     Morpheus POC License Request Tool - Backend API       ║
╠═══════════════════════════════════════════════════════════╣
║  Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}                                        ║
║  Server running on port ${PORT}                              ║
║  Health check: http://localhost:${PORT}/health               ║
║  API endpoint: http://localhost:${PORT}/api/poc-requests     ║
${isProduction ? '║  Frontend: http://localhost:' + PORT + '/                        ║\n' : ''}╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  await closePool();
  process.exit(0);
});

// Start the server
startServer();
