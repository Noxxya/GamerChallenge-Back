import { Model, DataTypes } from 'sequelize';
import { client } from './sequelizeClient.js';

export class Gamegenre extends Model {}

Gamegenre.init(
  {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
  },

  {
    sequelize: client,
    tableName: 'gamegenre',
  }
);
