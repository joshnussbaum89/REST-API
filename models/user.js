'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model { };

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'First name is required'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Last name is required'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Email address is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required'
        }
      }
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  User.association = (models) => {
    // one-to-many
    User.hasMany(models.Course, {
      as: 'userOwner',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
      // foreignKey: 'userId',
    });
  }
  return User;
};