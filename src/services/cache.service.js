const redisClient = require("../config/redis");
const logger = require("../config/logger.config");

/**
 * Löscht alle Cache-Einträge, die einem bestimmten Muster entsprechen.
 * @param {string} pattern - Das Suchmuster (z.B. "products:*")
 */
const clearCache = async (pattern) => {
  try {
    if (!redisClient.isOpen) {
      // Falls Redis nicht läuft, brechen wir leise ab, damit die App nicht crasht
      return;
    }

    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cache für Muster '${pattern}' wurde geleert.`);
    }
  } catch (err) {
    logger.error(
      `Fehler beim Leeren des Caches für '${pattern}': ${err.message}`
    );
  }
};

module.exports = {
  clearCache,
};
