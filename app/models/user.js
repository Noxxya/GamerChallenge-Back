import { Model, DataTypes } from 'sequelize';
import { client } from './sequelizeClient.js';

export class User extends Model {}

User.init(
  {
    pseudo: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique : true,
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
    },
  },
  {
    sequelize: client,
    tableName: 'user',
  }
);
