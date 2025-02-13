import { Game, Gamegenre, Type, Difficulty } from '../models/index.js';
import { Op } from 'sequelize';

export const formController = {
  // Fetch all categories (genres, types, and difficulties)

  getCategories: async (req, res) => {
    // Use Promise.all to fetch data concurrently for better performance
    const [genres, types, difficulties] = await Promise.all([
      Gamegenre.findAll({ attributes: ['id', 'name'] }),
      Type.findAll({ attributes: ['id', 'name'] }),
      Difficulty.findAll({ attributes: ['id', 'name', 'value_xp'] }),
    ]);

    // Send categories data in the response
    res.json({
      genres,
      types,
      difficulties,
    });
  },

  // Search for games based on a search term
  searchGames: async (req, res) => {
    const { search } = req.query;

    // Only perform search if there's a search term
    const games = search
      ? await Game.findAll({
          where: {
            name: {
              [Op.like]: `${search}%`, // Match games starting with the search term
            },
          },
          attributes: ['id', 'name', 'image'],
          limit: 10, // Limit the results to avoid large payloads
        })
      : [];

    // Send the search results
    res.json(games);
  },
};
