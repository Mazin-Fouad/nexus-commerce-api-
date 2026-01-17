const db = require("../database");
const redisClient = require("../config/redis");

const getHealthStatus = async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    services: {
      database: "UNKNOWN",
      redis: "UNKNOWN",
    },
  };

  try {
    await db.sequelize.authenticate();
    healthCheck.services.database = "UP";
  } catch (e) {
    healthCheck.services.database = "DOWN";
    healthCheck.message = e.message;
    res.status(503);
  }

  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      healthCheck.services.redis = "UP";
    } else {
      healthCheck.services.redis = "DOWN";
      res.status(503);
    }
  } catch (e) {
    healthCheck.services.redis = "DOWN";
    healthCheck.message = e.message;
    res.status(503);
  }

  res.send(healthCheck);
};

module.exports = {
  getHealthStatus,
};
