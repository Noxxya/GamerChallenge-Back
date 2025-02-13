
import { client as sequelize } from './sequelizeClient.js';


// Import the models
import { Challenge } from './challenge.js';
import { Game } from './game.js';
import { Difficulty } from './difficulty.js';
import { User } from './user.js';
import { Type } from './type.js';
import { Participate } from './participate.js';
import { Gamegenre } from './gamegenre.js';

// Define relationships between the models

// Relation user <--> game
User.belongsToMany(Game, {
  through: 'favorite',
  foreignKey: 'id_user',
  as: 'favoriteGames',
});
Game.belongsToMany(User, {
  through: 'favorite',
  foreignKey: 'id_game',
  as: 'favoriteByUsers',
});

// Relation game <--> challenge (many-to-many)
Game.belongsToMany(Challenge, {
  through: 'belong',
  foreignKey: 'id_game',
  as: 'gameChallenges',
});
Challenge.belongsToMany(Game, {
  through: 'belong',
  foreignKey: 'id_challenge',
  as: 'games',
});

// Relation difficulty <--> challenge (one-to-many)
Difficulty.hasMany(Challenge, {
  foreignKey: 'id_difficulty',
  as: 'difficultyChallenges',
});
Challenge.belongsTo(Difficulty, {
  foreignKey: 'id_difficulty',
  as: 'difficulty',
});

// Relation type <--> challenge
Type.belongsToMany(Challenge, {
  through: 'have',
  foreignKey: 'id_type',
  as: 'typeChallenges',
});
Challenge.belongsToMany(Type, {
  through: 'have',
  foreignKey: 'id_challenge',
  as: 'types',
});

// Relation gamegenre <--> challenge
Gamegenre.belongsToMany(Challenge, {
  through: 'contain',
  foreignKey: 'id_gamegenre',
  as: 'gameGenreChallenges',
});
Challenge.belongsToMany(Gamegenre, {
  through: 'contain',
  foreignKey: 'id_challenge',
  as: 'gamegenres',
});

// Relation user <--> challenge (vote)
User.belongsToMany(Challenge, {
  through: 'vote',
  foreignKey: 'id_user',
  as: 'votedChallenges',
});
Challenge.belongsToMany(User, {
  through: 'vote',
  foreignKey: 'id_challenge',
  as: 'voters',
});

// Relation challenge <--> user (challenge creation)
User.hasMany(Challenge, {
  foreignKey: 'id_user',
  as: 'createdChallenges',
});
Challenge.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'creator',
});

// Relation challenge <--> user (participation)
User.belongsToMany(Challenge, {
  through: Participate,
  foreignKey: 'id_user',
  as: 'participatedChallenges',
});
Challenge.belongsToMany(User, {
  through: Participate,
  foreignKey: 'id_challenge',
  as: 'participants',
});

// Relation User <--> Participate for votes
User.belongsToMany(Participate, {
  through: 'user_participate_vote',
  foreignKey: 'id_user',
  otherKey: 'id_participate',
  as: 'votedParticipations', // L'alias à utiliser
});

Participate.belongsToMany(User, {
  through: 'user_participate_vote',
  foreignKey: 'id_participate',
  otherKey: 'id_user',
  as: 'votersParticipations', // L'alias pour les utilisateurs qui ont voté
});

// Relation in the Participate model (join table between User and Challenge)
Participate.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user',
});
Participate.belongsTo(Challenge, {
  foreignKey: 'id_challenge',
  as: 'challenge',
});



export {
  Challenge,
  Game,
  Difficulty,
  User,
  Type,
  Participate,
  Gamegenre,
  sequelize,


};
