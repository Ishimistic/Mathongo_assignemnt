const redis = require("redis");
let redisClient;

const connectRedis = async () => {
  try {
    const redisConfig = {
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
      }
    };

    if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    redisClient = redis.createClient(redisConfig);

    redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });
    
    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
    
    redisClient.on("ready", () => {
      console.log("Redis client is ready");
    });
    
    redisClient.on("end", () => {
      console.log("Redis connection closed");
    });

    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection error:", error.message);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client is not connected");
  }
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient,
};