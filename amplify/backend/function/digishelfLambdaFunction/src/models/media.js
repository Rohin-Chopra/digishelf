const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  sequelize.define('Media', {
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  })
}
