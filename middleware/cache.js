const { getRedisClient } = require('../config/redis');


const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    try {
      const redis = getRedisClient();
      const key = `cache:${req.originalUrl}`;
      
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        // console.log('Cache hit for:', key);
        return res.json(JSON.parse(cachedData));
      }
      
      // console.log('Cache miss for:', key);
      const originalJson = res.json;
      
      res.json = async function(data) {
        try {
          await redis.setEx(key, duration, JSON.stringify(data));
          // console.log('Data cached for:', key);
        } catch (cacheError) {
          console.error('Error caching data:', cacheError);
        }
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // If Redis is down, continue without caching
      next();
    }
  };
};

const clearChaptersCache = async () => {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys('cache:/api/chapters*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

module.exports = {cacheMiddleware, clearChaptersCache};