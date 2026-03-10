const connectDB = require('../config/db');

const dbMiddleware = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = dbMiddleware;
