const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/authMiddleware'); // Wait, I didn't make errorHandler yet, let's stick to basic default or add it.
// Actually let's just use simple error handling for now or add a custom one if needed.
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    // If accessing a specific page that exists in frontend/pages, let's try to map it or just serve index.html for unknown routes if it were SPA.
    // However, since we have multiple html files, static middleware handles them if they match.
    // If we want root / to go to index.html (login), static handles that (index.html is default).
    // If we want specific paths, we can define them or let the user navigate via links.
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
}
);
// NOTE: Ideally for multi-page static site, direct access to /pages/dashboard.html works via static middleware.
// The wildcard * might interfere if we want to access /pages/dashboard.html directly.
// Let's remove the wildcard catch-all for now to let static files resolve naturally, 
// or only use it for actual 404s if we were building a SPA. 
// Given it's a simple multi-page app, static should be enough for / and /pages/...
// But for "Protected routes", we might want to ensure user is logged in on frontend side.

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
