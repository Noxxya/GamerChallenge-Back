import { Model, DataTypes } from 'sequelize';
import { client } from './sequelizeClient.js';

export class Participate extends Model {}

Participate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url_video: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: { 
      type: DataTypes.TEXT,
      allowNull: true, 
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    value_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    statut: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: client,
    tableName: 'participate',
  }
);
