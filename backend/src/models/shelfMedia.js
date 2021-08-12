const { UUIDV4, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const ShelfMedia = sequelize.define('ShelfMedia', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true
    }
  })

  return ShelfMedia
}
