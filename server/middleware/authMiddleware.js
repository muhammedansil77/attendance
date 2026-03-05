const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'teacher') {
            req.teacher = decoded;
        } else {
            // Default to admin set if no role or role is admin (backward compatibility or explicit)
            req.admin = decoded;
        }

        req.user = decoded; // Generic user object
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
