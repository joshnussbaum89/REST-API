'use strict';

const { Model, DataTypes } = require('sequelize');

/**
 * User Model
 * Attributes: firstName, lastName, emailAddress, password
 */
module.exports = (sequelize) => {
  class User extends Model { };

  User.init({
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
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please enter a valid email address'
        },
        notNull: {
          msg: 'Email address is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
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

  User.associate = (models) => {
    // one-to-many
    User.hasMany(models.Course, {
      as: 'userOwner',
      foreignKey: 'userId',
    });
  }
  return User;
};
