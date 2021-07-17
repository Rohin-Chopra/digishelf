const { UUIDV4 } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Media = require('./../models/media')(sequelize, DataTypes)
  const Shelf = require('./../models/shelf')(sequelize, DataTypes)
  const ShelfMedia = sequelize.define('ShelfMedia', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true
    }
  })

  Media.belongsToMany(Shelf, { through: ShelfMedia, foreignKey: 'MediaId' })
  Shelf.belongsToMany(Media, { through: ShelfMedia, foreignKey: 'ShelfId' })
  return ShelfMedia
}
