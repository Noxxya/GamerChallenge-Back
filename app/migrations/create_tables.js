import { sequelize } from '../models/index.js';


console.log('🗑️ Suppression des tables existantes...'); // Useful for resetting the database when rerunning the script
await sequelize.drop();

console.log('🚧 Création des tables...'); // Synchronize Sequelize models with the database, i.e., recreate tables from Sequelize models
await sequelize.sync();

console.log('✅ Migration OK ! Fermeture de la base...'); // Close the connection tunnel to ensure the script stops correctly

await sequelize.close();
