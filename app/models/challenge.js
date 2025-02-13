import { Model, DataTypes } from 'sequelize';
import { client } from './sequelizeClient.js';

export class Challenge extends Model {}

Challenge.init(
  {
    title: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    trick: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media: {
      type: DataTypes.TEXT,
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
    tableName: 'challenge',
    timestamps: true,
  }
);
