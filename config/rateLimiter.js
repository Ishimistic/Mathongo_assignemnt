const { getRedisClient } = require('./redis');

const rateLimiter = async (req, res, next) => {
  try {
    const redis = getRedisClient();
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const key = `rate_limit:${ip}`;
    
    // Current count
    const current = await redis.incr(key);
    
    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, 60);
    }
    
    // Check if limit exceeded
    if (current > 30) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Try again in a minute.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(); // Continue if Redis fails
  }
};

module.exports = { rateLimiter };