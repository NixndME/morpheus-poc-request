"use strict";
/**
 * Morpheus POC License Request Tool - Backend API Server
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./db/connection");
const pocRoutes_1 = require("./routes/pocRoutes");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
// ============================================================================
// MIDDLEWARE
// ============================================================================
// Security headers (relaxed for local dev)
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
// CORS - allow frontend origin
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
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
app.use('/api/poc-requests', pocRoutes_1.pocRouter);
// ============================================================================
// STATIC FILES (Production)
// ============================================================================
if (isProduction) {
    // Serve static files from the public directory (frontend build)
    const publicPath = path_1.default.join(__dirname, '..', 'public');
    app.use(express_1.default.static(publicPath));
    // SPA fallback - serve index.html for any unmatched routes
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(publicPath, 'index.html'));
    });
}
else {
    // Development 404 handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
}
// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// ============================================================================
// SERVER STARTUP
// ============================================================================
async function startServer() {
    // Test database connection
    const dbConnected = await (0, connection_1.testConnection)();
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
    await (0, connection_1.closePool)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down...');
    await (0, connection_1.closePool)();
    process.exit(0);
});
// Start the server
startServer();
//# sourceMappingURL=index.js.map