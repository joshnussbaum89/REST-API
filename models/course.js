'use strict';

const { Model } = require('sequelize');

/**
 * Course Model
 * Attributes: title, description, estimatedTime, materialsNeeded
 */
module.exports = (sequelize, DataTypes) => {
  class Course extends Model { };

  Course.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Title is required'
        },
        notEmpty: {
          msg: 'Please provide a title'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Description is required'
        },
        notEmpty: {
          msg: 'Please provide a description'
        }
      }
    },
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });

  Course.associate = (models) => {
    // one-to-one
    Course.belongsTo(models.User, {
      as: 'userOwner',
      foreignKey: 'userId'
    });
  }
  return Course;
};
