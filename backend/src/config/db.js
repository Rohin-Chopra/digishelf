const Sequelize = require('sequelize')
const dbMode = process.env.NODE_ENV || 'development'
const env = require('./env.json')[dbMode]

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'host.docker.internal',
    env: process.env.DB_PORT,
    logging: false,
    dialect: process.env.DB_DIALECT,
    operatorsAliases: 0,
    pool: {
      maxConnections: 5,
      maxIdleTime: 30
    },
    dialectOptions: {
      ssl: 'Amazon RDS'
    }
  }
)

module.exports = {
  Sequelize,
  sequelize
}
