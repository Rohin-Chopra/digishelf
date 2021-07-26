const Sequelize = require('sequelize')
const createAssociations = require('./createAssociations')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'host.docker.internal',
    env: process.env.DB_PORT,
    logging: false,
    dialect: 'mysql',
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
require('./../models/media')(sequelize)
require('./../models/shelf')(sequelize)
require('./../models/shelfMedia')(sequelize)

createAssociations(sequelize)

module.exports = sequelize
