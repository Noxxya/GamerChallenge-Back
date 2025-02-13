import { Model, DataTypes } from 'sequelize';
import { client } from './sequelizeClient.js';

export class Game extends Model {}

Game.init(
  {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: client,
    tableName: 'game',
  }
);
