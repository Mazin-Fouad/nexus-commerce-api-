const { Sequelize } = require("sequelize");
const allConfigs = require("../config/config.js");

const config = allConfigs.development;

const sequelize = new Sequelize(config);

module.exports = {
  sequelize,
  Sequelize,
};
