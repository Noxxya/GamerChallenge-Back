import axios from 'axios';
import {
  Challenge,
  Game,
  Difficulty,
  User,
  Type,
  Participate,
  Gamegenre,
  sequelize,
} from '../models/index.js';

const API_KEY = process.env.API_KEY; // API key for accessing the RAWG API
const BASE_URL = process.env.BASE_URL; // Base URL for fetching games
const PAGE_SIZE = 40; // Maximum number of games per page (limited to 40 by RAWG)
const TOTAL_PAGES = 10; // Number of pages to fetch to reach our goal (10 pages for this example)

// Main function to fetch and save games from RAWG
async function fetchAndSaveGamesFromRAWG() {
  console.log(
    '🔄 Récupération et insertion des jeux et genres depuis RAWG API...'
  );

  // Arrays to store created games and genres for future use
  const createdGames = [];
  const createdGenres = [];

  try {
    // Loop through each page, from the first to TOTAL_PAGES
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      console.log(`Récupération des jeux - Page ${page}/${TOTAL_PAGES}`);

      // Request to the RAWG API to fetch games from a specific page
      const response = await axios.get(BASE_URL, {
        params: {
          key: API_KEY, // API key for authentication
          page_size: PAGE_SIZE, // Number of games per page
          page: page, // Page number to fetch
        },
      });

      // Store the list of games returned by the API in `games`
      const games = response.data.results;

      // Loop through each game in the `games` list
      for (const game of games) {
        // Prepare the data for each game to insert into the database
        const gameData = {
          name: game.name, // Game name
          image: game.background_image, // Game image (URL)
        };

        // Insert or update the game in the database with `upsert`
        // `upsert` inserts a new record if no game with the same name exists,
        // or updates the existing record if the game is already present.
        const [createdGame] = await Game.upsert(gameData, { returning: true });
        createdGames.push(createdGame); // Add the created game to `createdGames`

        // Handle associated genres for each game
        if (game.genres && game.genres.length > 0) {
          // Check if the game has associated genres
          for (const genreData of game.genres) {
            // Find the genre in the database or create it if it doesn't exist
            const [genre] = await Gamegenre.findOrCreate({
              where: { name: genreData.name }, // Search by genre name
            });

            // Add the genre to `createdGenres` if it's not already present
            if (!createdGenres.some((g) => g.name === genre.name)) {
              createdGenres.push(genre); // Add genre for future use
            }
          }
        }
      }
    }

    console.log(
      'Tous les jeux et genres ont été ajoutés ou mis à jour dans la base de données.'
    );
    return { createdGames, createdGenres }; // Return created games and genres
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des jeux depuis RAWG API:',
      error
    );
    return { createdGames, createdGenres }; // Return partially created games/genres anyway
  }
}

seedDatabase();

async function seedDatabase() {
  console.log('🔄 GamerChallenge seeding started...');

  try {
    // Create difficulty
    // Here we create a const 'difficulties' which allows us to enter data
    const difficulties = [
      { name: 'Facile', value_xp: 100 },
      { name: 'Moyen', value_xp: 200 },
      { name: 'Difficile', value_xp: 300 },
    ];

    // Loop to create each difficulty level
    // this loop allows you to search for all the elements in the table above
    const createdDifficulties = await Promise.all(
      difficulties.map((difficulty) => Difficulty.create(difficulty))
    );

    //   Create Types
    const types = [
      { name: 'Coopératif' },
      { name: 'PVP' },
      { name: 'PVE' },
      { name: 'Solo' },
      { name: 'Speedrun' },
      { name: 'Exploration' },
    ];

    // Loop to create each type of game
    const createdTypes = await Promise.all(
      types.map((type) => Type.create(type))
    );

    // Call function to import RAWG and store games and genres
    const { createdGames, createdGenres } = await fetchAndSaveGamesFromRAWG();

    //   Create User
    const users = [
      {
        pseudo: 'XxDragonSlayer99xX',
        description: 'Passionné de RPG et amateur de défis impossibles',
        image: 'dragon_slayer.jpg',
        email: 'dragonslayer99@gmail.com',
        password: 'f1r3Br34th3r!',
        xp: 5000,
      },
      {
        pseudo: 'NinjaGamer42',
        description:
          'Stealth games are my jam. Always up for a sneaky challenge!',
        image: 'ninja_shadow.png',
        email: 'silent_ninja@hotmail.com',
        password: 'Sh4d0wM4st3r42',
        xp: 3200,
      },
      {
        pseudo: 'SpeedRunnerPro',
        description:
          'Je vis pour battre des records. Prêt à relever tous les défis chrono !',
        image: 'speedrun_trophy.jpg',
        email: 'gotta_go_fast@yahoo.com',
        password: 'Qu1ckS1lv3r!',
        xp: 7500,
      },
      {
        pseudo: 'StrategyQueen',
        description:
          'Reine des jeux de stratégie. Échec et mat à tous les coups.',
        image: 'chess_queen.png',
        email: 'strategic_mind@outlook.com',
        password: 'Ch3ssM4st3r2024',
        xp: 6300,
      },
      {
        pseudo: 'CasualGamerDad',
        description:
          'Père de famille cherchant des défis amusants entre deux couches',
        image: 'gaming_dad.jpg',
        email: 'daddy_gamer@gmail.com',
        password: 'D4dL1f3G4m3r',
        xp: 1500,
      },
    ];

    // Loop to create each user
    const createdUsers = await Promise.all(
      users.map((user) => User.create(user))
    );

    // Create Challenges
    const challenges = [
      {
        title: 'Speedrun Mario 64 - 70 étoiles',
        description:
          'Terminez Super Mario 64 en collectant 70 étoiles le plus rapidement possible',
        trick:
          'Utilisez les sauts longs et les wall-jumps pour gagner du temps dans les niveaux ouverts',
        media: 'darksouls_nohit.jpg',
        statut: true,
      },
      {
        title: 'No-Hit Dark Souls',
        description: 'Terminez Dark Souls sans subir aucun dégât',
        trick:
          "Maîtrisez le timing des roulades et utilisez les anneaux qui augmentent l'invincibilité",
        media: 'darksouls_nohit.jpg',
        statut: false,
      },
      {
        title: 'Fortnite Victory Royale Sans Armes',
        description: "Gagnez une partie de Fortnite sans utiliser d'armes",
        trick:
          'Concentrez-vous sur la collecte de matériaux et la construction pour la défense',
        media: 'fortnite_noweapons.png',
        statut: true,
      },
      {
        title: 'Pacifiste Undertale',
        description: 'Terminez Undertale sans tuer aucun monstre',
        trick:
          "Utilisez l'option 'Mercy' dans chaque combat et résolvez les puzzles pacifiquement",
        media: 'undertale_pacifist.gif',
        statut: true,
      },
    ];

    // Loop to create each challenge
    const createdChallenges = await Promise.all(
      challenges.map((challenge) => Challenge.create(challenge))
    );

    // List of relations between User and Game
    const userGameRelations = [
      { userIndex: 0, gameIndex: 0 },
      { userIndex: 0, gameIndex: 3 },
      { userIndex: 0, gameIndex: 6 },
      { userIndex: 1, gameIndex: 5 },
      { userIndex: 1, gameIndex: 4 },
      { userIndex: 1, gameIndex: 8 },
      { userIndex: 1, gameIndex: 2 },
      { userIndex: 2, gameIndex: 5 },
      { userIndex: 2, gameIndex: 6 },
      { userIndex: 2, gameIndex: 1 },
      { userIndex: 2, gameIndex: 3 },
    ];

    // Loop to create each user-game relation
    for (const relation of userGameRelations) {
      const user = createdUsers[relation.userIndex];
      const game = createdGames[relation.gameIndex];

      await user.addFavoriteGame(game);
    }

    // List of relations between challenge and difficulty
    const difficultyChallengeRelations = [
      { difficultyIndex: 0, challengeIndex: 0 },
      { difficultyIndex: 1, challengeIndex: 1 },
      { difficultyIndex: 2, challengeIndex: 2 },
      { difficultyIndex: 1, challengeIndex: 3 },
    ];

    // Loop to create each difficulty-challenge relation
    for (const relation of difficultyChallengeRelations) {
      const difficulty = createdDifficulties[relation.difficultyIndex];
      const challenge = createdChallenges[relation.challengeIndex];

      await challenge.setDifficulty(difficulty);
    }

    // List of relations between challenge and type
    const typeChallengeRelations = [
      { typeIndex: 0, challengeIndex: 0 },
      { typeIndex: 2, challengeIndex: 0 },
      { typeIndex: 1, challengeIndex: 1 },
      { typeIndex: 2, challengeIndex: 2 },
      { typeIndex: 4, challengeIndex: 3 },
      { typeIndex: 2, challengeIndex: 3 },
      { typeIndex: 5, challengeIndex: 3 },
    ];

    // Loop to create each type-challenge relation
    for (const relation of typeChallengeRelations) {
      const type = createdTypes[relation.typeIndex];
      const challenge = createdChallenges[relation.challengeIndex];

      await challenge.addType(type);
    }

    // List of relations between challenge and genre
    const genreChallengeRelations = [
      { genreIndex: 0, challengeIndex: 0 },
      { genreIndex: 2, challengeIndex: 0 },
      { genreIndex: 1, challengeIndex: 1 },
      { genreIndex: 2, challengeIndex: 2 },
      { genreIndex: 4, challengeIndex: 3 },
      { genreIndex: 2, challengeIndex: 3 },
      { genreIndex: 5, challengeIndex: 3 },
    ];

    // Loop to create each genre-challenge relation
    for (const relation of genreChallengeRelations) {
      const genre = createdGenres[relation.genreIndex];
      const challenge = createdChallenges[relation.challengeIndex];

      await challenge.addGamegenre(genre);
    }

    // List of relations between challenge and game
    const gameChallengeRelations = [
      { gameIndex: 0, challengeIndex: 0 },
      { gameIndex: 6, challengeIndex: 0 },
      { gameIndex: 1, challengeIndex: 1 },
      { gameIndex: 2, challengeIndex: 2 },
      { gameIndex: 4, challengeIndex: 3 },
      { gameIndex: 5, challengeIndex: 3 },
      { gameIndex: 7, challengeIndex: 3 },
    ];

    // Loop to create each game-challenge relation
    for (const relation of gameChallengeRelations) {
      const game = createdGames[relation.gameIndex];
      const challenge = createdChallenges[relation.challengeIndex];

      await challenge.addGame(game);
    }

    // List of relations between challenge and user
    const userCreateChallengeRelations = [
      { userIndex: 0, challengeIndex: 0 },
      { userIndex: 1, challengeIndex: 1 },
      { userIndex: 2, challengeIndex: 2 },
      { userIndex: 4, challengeIndex: 3 },
    ];

    // Loop to create each game-challenge relation
    for (const relation of userCreateChallengeRelations) {
      const user = createdUsers[relation.userIndex];
      const challenge = createdChallenges[relation.challengeIndex];

      await challenge.setCreator(user);
    }

    //   Create Participate
    const findAllUsers = await User.findAll();
    const findAllChallenges = await Challenge.findAll();

    const participations = [
      {
        id_user: findAllUsers[0].id,
        id_challenge: findAllChallenges[0].id,
        url_video: 'https://example.com/video1.mp4',
        value_xp: 100,
      },
      {
        id_user: findAllUsers[1].id,
        id_challenge: findAllChallenges[1].id,
        url_video: 'https://example.com/video2.mp4',
        value_xp: 150,
      },
      {
        id_user: findAllUsers[2].id,
        id_challenge: findAllChallenges[2].id,
        url_video: 'https://example.com/video3.mp4',
        value_xp: 150,
      },
      {
        id_user: findAllUsers[3].id,
        id_challenge: findAllChallenges[3].id,
        url_video: 'https://example.com/video4.mp4',
        value_xp: 150,
      },
    ];

    await Promise.all(
      participations.map((participate) => Participate.create(participate))
    );

    console.log('les tables ont été créer');
  } catch (error) {
    console.error('erreur lors de la seeding', error);
  }
}
