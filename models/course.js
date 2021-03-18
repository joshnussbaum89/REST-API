'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model { };

  Course.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });

  Course.association = (models) => {
    // one-to-one
    Course.belongsTo(models.User, {
      as: 'userOwner',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
      // foreignKey: 'userId',
    });
  }
  return Course;
};