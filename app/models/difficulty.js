import { Model, DataTypes } from 'sequelize';
import { client } from './sequelizeClient.js';

export class Difficulty extends Model {}

Difficulty.init(
  {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    value_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: client,
    tableName: 'difficulty',
  }
);
