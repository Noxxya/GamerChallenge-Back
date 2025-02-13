import 'dotenv/config';
import { Sequelize } from 'sequelize';

export const client = new Sequelize(process.env.PG_URL, {
  dialect: 'postgres',
  define: {
    timestamps: false,
  },
  logging: false,
});
