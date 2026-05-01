const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const dbMiddleware = require('./middleware/dbMiddleware');

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://mini-keep.vercel.app',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5173',
].filter(Boolean);

app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow external CDNs (FontAwesome, marked)
}));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply database middleware to all API routes
app.use('/api', dbMiddleware);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        dbConnected: !!global.dbConnected,
        env: {
            hasMongoUri: !!process.env.MONGO_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
        },
    });
});

app.use('/api', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));


// Serve static files in all environments if needed, or rely on Vercel for production
// For local development, this is necessary.
app.use(express.static(path.join(__dirname, '../public')));

// Fallback for SPA if needed
app.get('*', (req, res) => {
    // If it's an API call that wasn't caught, return 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route not found' });
    }
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

app.use(errorHandler);

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Server started on port ${port}`));
}

module.exports = app;
