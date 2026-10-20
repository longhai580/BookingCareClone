'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Handbook extends Model {
    static associate(models) {
    }
  };
  Handbook.init({
    title: DataTypes.STRING,
    image: DataTypes.TEXT,
    description: DataTypes.TEXT,
    contentHTML: DataTypes.TEXT,
    contentMarkdown: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Handbook',
  });
  return Handbook;
};
