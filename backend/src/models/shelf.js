const { UUIDV4 } = require('sequelize')
const slugify = require('slugify')

module.exports = (sequelize, DataTypes) => {
  const Shelf = sequelize.define('Shelf', {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50)
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    publicity: {
      type: DataTypes.STRING(200),
      defaultValue: 'public'
    },
    coverImg: {
      type: DataTypes.STRING(200)
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  })

  Shelf.beforeCreate((shelf, options) => {
    shelf.slug = slugify(`${shelf.createdBy}-${shelf.name}`)
  })
  return Shelf
}
