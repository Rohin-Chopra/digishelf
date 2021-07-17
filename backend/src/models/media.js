module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true
    }
  })
  return Media
}
