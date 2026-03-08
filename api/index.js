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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/authRoutes'));
app.use('/notes', require('./routes/noteRoutes'));

if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '../public')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });
}

app.use(errorHandler);

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Server started on port ${port}`));
}

module.exports = app;
