const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

connectDB();

const app = express();

app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow external CDNs (FontAwesome, marked)
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});

app.use(errorHandler);
// NOTE: Ideally for multi-page static site, direct access to /pages/dashboard.html works via static middleware.
// The wildcard * might interfere if we want to access /pages/dashboard.html directly.
// Let's remove the wildcard catch-all for now to let static files resolve naturally, 
// or only use it for actual 404s if we were building a SPA. 
// Given it's a simple multi-page app, static should be enough for / and /pages/...
// But for "Protected routes", we might want to ensure user is logged in on frontend side.

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Server started on port ${port}`));
}

module.exports = app;
