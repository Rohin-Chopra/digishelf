const createAssociations = (sequelize) => {
  const { Shelf, ShelfMedia, Media } = sequelize.models

  Media.belongsToMany(Shelf, { through: ShelfMedia, foreignKey: 'MediaId' })
  Shelf.belongsToMany(Media, { through: ShelfMedia, foreignKey: 'ShelfId' })
}
module.exports = createAssociations
