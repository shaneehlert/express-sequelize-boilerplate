'use strict';
module.exports = function(sequelize, DataTypes) {
  var locations = sequelize.define('locations', {
    latitude: {
      type: DataTypes.STRING
    },
    longitude: {
      type: DataTypes.STRING
    },
    apiendpoint: {
      type: DataTypes.STRING
    },
    inittime: {
      type: DataTypes.STRING
    },
    locationname: {
      type: DataTypes.STRING 
    },
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return locations;
};