import { Model, DataTypes } from 'sequelize';
import { client } from './sequelizeClient.js';

export class Type extends Model {}

Type.init(
  {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: client,
    tableName: 'type',
  }
);
