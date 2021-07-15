'use strict'
const { UUIDV4 } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: DataTypes.STRING(200),
    type: DataTypes.STRING(50),
    coverImg: DataTypes.String(400)
  })

  return Media
}
