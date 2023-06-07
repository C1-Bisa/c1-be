'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Airline, {
        foreignKey:'airline_id',
        as: 'pesawat'
      })
      this.belongsTo(models.Airport, {
        foreignKey:'airport_id',
        as: 'bandara'
      })
    }
  }
  Flight.init({
    airline_id: DataTypes.INTEGER,
    airport_id: DataTypes.INTEGER,
    airplane: DataTypes.STRING,
    departure_date: DataTypes.DATE,
    departure_time: DataTypes.TIME,
    arrival_date: DataTypes.DATE,
    arrival_time: DataTypes.TIME,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    price: DataTypes.INTEGER,
    flight_class: {
      type: DataTypes.ENUM,
      values: ['Economy', 'Premium Economy', 'Bussiness', 'First Class']
    },
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Flight',
  });
  return Flight;
};