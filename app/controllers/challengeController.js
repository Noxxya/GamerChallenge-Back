import {
  Challenge,
  Game,
  Type,
  Gamegenre,
  User,
  Difficulty,
  sequelize,
  Participate,
} from '../models/index.js';

import { HttpError } from '../error/httperror.js';
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';

export const challengeController = {
  getAll: async (req, res) => {
    const { searchTerm, challengeType, difficulty, gameGenre, sortOrder } =
      req.query;

    // Log pour vérifier les paramètres reçus

    const whereConditions = { statut: true };
    if (searchTerm) {
      whereConditions.title = { [Op.iLike]: `%${searchTerm}%` }; // Recherche partielle insensible à la casse
    }
    if (difficulty) {
      whereConditions['$difficulty.name$'] = difficulty;
    }
    if (challengeType) {
      whereConditions['$types.name$'] = challengeType;
    }
    if (gameGenre) {
      whereConditions['$gamegenres.name$'] = gameGenre;
    }

    const order =
      sortOrder === 'desc' ? [['title', 'DESC']] : [['title', 'ASC']];

    const challenges = await Challenge.findAll({
      where: whereConditions,
      include: [
        { association: 'difficulty' },
        { association: 'gamegenres' },
        { association: 'types' },
        { association: 'games' },
        {
          association: 'creator',
          attributes: { exclude: ['password', 'email'] },
        },
        {
          association: 'participants',
          attributes: { exclude: ['password', 'email'] },
        },
      ],
      order,
    });

    res.json(challenges);
  },

  // Get a specific challenge by ID
  // Get a specific challenge by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params; // Challenge ID
      
  
      // Récupérer le challenge avec les informations de base
      const challenge = await Challenge.findByPk(id, {
        include: [
          { association: 'difficulty' },
          { association: 'gamegenres' },
          { association: 'types' },
          { association: 'games' },
          {
            association: 'creator',
            attributes: { exclude: ['password', 'email'] },
          },
          {
            association: 'participants',
            attributes: ['id', 'pseudo'],
            through: {
              attributes: ['url_video', 'description', 'date', 'id'], // Inclure ID pour lier avec Participate
            },
          },
        ],
      });
  
      // Si le challenge n'est pas trouvé, retourner une erreur 404
      if (!challenge) {
        
        return res.status(404).json({ message: 'Challenge not found' });
      }
  
      // Récupérer toutes les participations pour ce challenge
      const participations = await Participate.findAll({
        where: { id_challenge: id },
        include: [
          {
            association: 'votersParticipations',
            attributes: ['id'], // ID des utilisateurs ayant voté
          },
          {
            association: 'user', // Inclure les infos de l'utilisateur
            attributes: ['id', 'pseudo'],
          },
        ],
      });
  
      // Transformer les données pour inclure les votes dans les participants
      const participantsWithVotes = participations.map((participation) => {
        const votedBy = participation.votersParticipations.map((voter) => voter.id); // Liste des utilisateurs ayant voté
        const hasVoted = votedBy.length > 0;
  
        return {
          id: participation.user.id,
          pseudo: participation.user.pseudo,
          url_video: participation.url_video,
          description: participation.description,
          date: participation.date,
          hasVoted,
          votedBy,
        };
      });
  
      // Ajouter les participants enrichis au challenge
      const challengeWithVotes = {
        ...challenge.toJSON(),
        participants: participantsWithVotes,
      };
  
      // Retourner les données du challenge enrichi
      
      res.json(challengeWithVotes);
    } catch (error) {
      console.error('Error retrieving the challenge:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  
  
  




  // Create a new challenge
  createChallenge: async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        title,
        description,
        trick,
        media,
        types,
        gamegenres,
        difficulty,
        creator,
        games,
      } = req.body;

      

      // Vérification que le créateur est présent
      if (!creator) {
        return res.status(400).json({ message: 'Le créateur est obligatoire pour créer un challenge.' });
      }

      // Création du challenge
      const newChallenge = await Challenge.create(
        {
          title,
          description: description || '',
          trick: trick || '',
          media: media || '',
          id_user: creator, // Lien avec le créateur (User)
          id_difficulty: difficulty, // Lien avec la difficulté
        },
        { transaction }
      );

      // Ajout des jeux associés au challenge
      if (games && games.length > 0) {
        const gameInstances = await Game.findAll({
          where: { id: games.map(game => game.id) },
          transaction,
        });
        await newChallenge.addGames(gameInstances, { transaction });
      }

      // Ajout des types associés au challenge
      if (types && types.length > 0) {
        const typeInstances = await Type.findAll({
          where: { id: types.map(type => type.id) },
          transaction,
        });
        await newChallenge.addTypes(typeInstances, { transaction });
      }

      // Ajout des genres de jeu associés au challenge
      if (gamegenres && gamegenres.length > 0) {
        const genreInstances = await Gamegenre.findAll({
          where: { id: gamegenres.map(genre => genre.id) },
          transaction,
        });
        await newChallenge.addGamegenres(genreInstances, { transaction }); // Notez l'utilisation de addGamegenres
      }

      // Commit de la transaction si toutes les étapes sont réussies
      await transaction.commit();

      // Retourner le challenge créé avec ses associations
      const fullChallenge = await Challenge.findByPk(newChallenge.id, {
        include: [
          { model: Game, as: 'games' },
          { model: Type, as: 'types' },
          { model: Gamegenre, as: 'gamegenres' },
          { model: Difficulty, as: 'difficulty' },
          { model: User, as: 'creator' },
        ],
      });

      res.status(201).json(fullChallenge);
    } catch (error) {
      console.error('Erreur lors de la création du challenge :', error);
      await transaction.rollback();
      res
        .status(500)
        .json({ message: 'Erreur lors de la création du challenge' });
    }
  },

  // Update an existing challenge
  patchChallenge: async (req, res) => {
    const { id } = req.params; // Get challenge ID from request parameters
    const updates = req.body; // Get update data from request body

    // Find the challenge by ID
    const challenge = await Challenge.findByPk(id);
    if (!challenge) {
      throw new HttpError('Challenge not found', 404);
    }

    // Update the challenge with new data
    await challenge.update(updates);

    // Respond with the updated challenge
    res.json(challenge);
  },

  // Get recent validated challenges
  getRecentValidatedChallenges: async (_, res) => {
    const recentChallenges = await Challenge.findAll({
      where: { statut: true }, // Only select challenges with statut = true
      order: [['createdAt', 'DESC']], // Order by creation date, most recent first
      limit: 3, // Limit the results to 3
      include: [
        { association: 'difficulty' },
        { association: 'gamegenres' },
        { association: 'types' },
        { association: 'games' },
        {
          association: 'creator',
          attributes: { exclude: ['password', 'email'] },
        },
        {
          association: 'participants',
          attributes: { exclude: ['password', 'email'] },
        },
      ],
    });
    res.json(recentChallenges);
  },

  // Get top games by number of challenges
  getTopGamesByChallenges: async (_, res) => {
    // SQL query to get the number of challenges per game and include game name
    const gameChallengeCounts = await sequelize.query(
      `SELECT Game.id AS gameId, 
              Game.name AS gameName, 
              Game.image AS gameImage, 
              COUNT(belong.id_challenge) AS challengeCount
       FROM belong
       JOIN Game ON Game.id = belong.id_game
       JOIN Challenge ON Challenge.id = belong.id_challenge
       WHERE Challenge.statut = true  -- Filter only challenges with statut = true
       GROUP BY Game.id, Game.name, Game.image
       ORDER BY challengeCount DESC
       LIMIT 3`,
      { type: sequelize.QueryTypes.SELECT }
    );
  
    
  
    // Return the results
    res.json(gameChallengeCounts);
  },

  // Get unvalidated challenges
  getUnvalidatedChallenges: async (req, res) => {
    const { userId, searchTerm, challengeType, difficulty, gameGenre, sortOrder } = req.query; // Inclure les paramètres nécessaires

    try {
      // Conditions de recherche de base
      const whereConditions = { statut: false }; // Filtrer uniquement les challenges non validés

      // Recherche par titre (searchTerm)
      if (searchTerm) {
        whereConditions.title = { [Op.iLike]: `%${searchTerm}%` }; // Recherche partielle insensible à la casse
      }

      // Tri par difficulté
      if (difficulty) {
        whereConditions['$difficulty.name$'] = difficulty;
      }

      // Filtrer par type de challenge
      if (challengeType) {
        whereConditions['$types.name$'] = challengeType;
      }

      // Filtrer par genre de jeu
      if (gameGenre) {
        whereConditions['$gamegenres.name$'] = gameGenre;
      }

      // Ordre de tri
      const order =
        sortOrder === 'desc' ? [['title', 'DESC']] : [['title', 'ASC']];

      // Requête principale
      const unvalidatedChallenges = await Challenge.findAll({
        where: whereConditions,
        include: [
          { association: 'difficulty' },
          { association: 'gamegenres' },
          { association: 'types' },
          { association: 'games' },
          {
            association: 'creator',
            attributes: { exclude: ['password', 'email'] },
          },
          {
            association: 'voters',
            attributes: ['id'], // Inclure uniquement les ID des votants
          },
        ],
        order, // Appliquer le tri
      });

      // Ajouter `hasVoted` pour chaque challenge
      const challengesWithHasVoted = unvalidatedChallenges.map((challenge) => {
        const hasVoted = challenge.voters.some((voter) => voter.id === Number(userId));
        return { ...challenge.toJSON(), hasVoted }; // Inclure `hasVoted` dans la réponse JSON
      });

      res.json(challengesWithHasVoted); // Retourner les challenges avec les informations enrichies
    } catch (error) {
      console.error('Erreur lors de la récupération des challenges non validés :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },
}
