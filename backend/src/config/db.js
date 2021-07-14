const Sequelize = require('sequelize')
const dbMode = process.env.NODE_ENV || 'development'
const env = require('./env.json')[dbMode]
console.log(env)
const sequelize = new Sequelize('test', 'root', '', {
  host: 'host.docker.internal',
  env: env.port,
  logging: false,
  dialect: env.dialect,
  operatorsAliases: 0,
  pool: {
    max: 5,
    min: 0,
    acquire: 20000,
    idle: 10000
  }
  // dialectOptions: {
  //   socketPath: '/var/run/mysqld/mysqld.sock'
  // }
})

module.exports = {
  Sequelize,
  sequelize
}
