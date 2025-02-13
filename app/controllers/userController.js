import { User, Game } from '../models/index.js';
import { HttpError } from '../error/httperror.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';


function validatePassword(password) {
  const minLength = 8; // Longueur minimale
  const regexSpecialChar = /[!@#$%^&*(),.?":{}|<>]/; // Doit contenir au moins un caractère spécial

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  if (!regexSpecialChar.test(password)) {
    return 'Password must contain at least one special character.';
  }

  return null; // Aucun problème, mot de passe valide
};

export const userController = {
  // Get all users with associated data
  getAll: async (_, res) => {
    const user = await User.findAll({
      include: [
        { association: 'favoriteGames' },
        {
          association: 'participatedChallenges',
          include: [{ association: 'difficulty' }],
        },
        { association: 'createdChallenges' },
      ],
      attributes: {
        exclude: ['email'],
      },
    });
    res.json(user);
  },

  // Get a specific user by ID
  getUserById: async (req, res) => {
    const id = req.user.userId;
    const user = await User.findByPk(id, {
      include: [
        { association: 'favoriteGames' },
        {
          association: 'participatedChallenges',
          include: [{ association: 'difficulty' }],
        },
        { association: 'createdChallenges' },
      ],
      attributes: {
        exclude: ['email'],
      },
    });
    if (!user) {
      throw new HttpError(404, 'user not found, please verify the provided id');
    }
    res.json(user);
  },

  // Get top users by XP
  getTopUsersByXP: async (_, res) => {
    const topUsers = await User.findAll({
      attributes: {
        exclude: ['password', 'email'], // Exclude sensitive fields
      },
      order: [['xp', 'DESC']], // Order by xp in descending order
      limit: 10, // Limit to the top 10 users
    });

    res.json(topUsers);
  },

  // Get top users with current user's position
  getTopUsersWithCurrentPosition: async (req, res) => {
    const { userId: currentUserId } = req.user; // Use req.user.userId to access the user ID
    const TOP_LIMIT = 10;

    // Fetch top 10 users by XP
    const topUsers = await User.findAll({
      attributes: { exclude: ['password', 'email'] },
      order: [['xp', 'DESC']],
      limit: TOP_LIMIT,
    });

    // Get current user and rank
    const currentUser = await User.findByPk(currentUserId, {
      attributes: { exclude: ['password', 'email'] },
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const currentUserRank =
      (await User.count({
        where: { xp: { [Op.gt]: currentUser.xp } },
      })) + 1;

    const [userAbove, userBelow] = await Promise.all([
      User.findOne({
        where: { xp: { [Op.gt]: currentUser.xp } },
        order: [['xp', 'ASC']],
        attributes: { exclude: ['password', 'email'] },
      }),
      User.findOne({
        where: { xp: { [Op.lt]: currentUser.xp } },
        order: [['xp', 'DESC']],
        attributes: { exclude: ['password', 'email'] },
      }),
    ]);

    res.json({
      topUsers,
      currentUser: { user: currentUser, rank: currentUserRank },
      neighbors: { above: userAbove || null, below: userBelow || null },
    });
  },

  // Create a new user
  createUser: async (req, res) => {
    const { pseudo, email, password } = req.body;

    // Check if pseudo, email, and password are provided
    if (!pseudo || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Pseudo, email, and password are required fields.' });
    }

     // Validation du mot de passe
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

    // Check if a user with this email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'This email is already in use.' });
    }

    // Check if a user with this pseudo already exists
    const existingUser = await User.findOne({ where: { pseudo } });
    if (existingUser) {
      return res.status(409).json({ message: 'This pseudo already exist.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with initial XP of 0
    const newUser = await User.create({
      pseudo,
      email,
      password: hashedPassword,
      xp: 0,
    });

    // Respond with user details excluding password
    res.status(201).json({
      message: 'User successfully created',
      user: {
        id: newUser.id,
        pseudo: newUser.pseudo,
        email: newUser.email,
        xp: newUser.xp,
      },
    });
  },


  updateUser: async (req, res) => {
    const { userId } = req.user; // ID of the authenticated user
    const {
      pseudo,
      description,
      favoriteGames,
      image,
      currentPassword,
      newPassword,
    } = req.body;

    try {
      // Retrieve the user from the database
      const user = await User.findByPk(userId, {
        include: [{ model: Game, as: 'favoriteGames' }],
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const changes = {};

      // Update standard profile fields
      if (pseudo && pseudo !== user.pseudo) {
        // Check if the new pseudo is already taken
        const existingUser = await User.findOne({ where: { pseudo } });
        if (existingUser) {
          return res
            .status(409)
            .json({ message: 'This pseudo already exists' });
        }
        changes.pseudo = pseudo;
      }

      if (description && description !== user.description) {
        changes.description = description;
      }

      if (image && image !== user.image) {
        // Check if the image is a valid URL (basic validation)
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!urlRegex.test(image)) {
          return res.status(400).json({ message: 'Invalid image URL' });
        }
        changes.image = image;
      }

      // Password change handling
      if (newPassword) {
        if (!currentPassword) {
          return res
            .status(400)
            .json({
              message: 'Current password is required to change the password',
            });
        }

        // Verify that the current password matches
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isCurrentPasswordValid) {
          return res
            .status(401)
            .json({ message: 'Current password is incorrect' });
        }

         // Validation of the new password
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        changes.password = hashedNewPassword;
      }

      // Apply changes to the user profile fields
      try {
        await user.update(changes);
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de l'utilisateur :",
          error
        );
        return res
          .status(500)
          .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
      }

      // Update favorite games (many-to-many relationship)
      if (favoriteGames && Array.isArray(favoriteGames)) {
        try {
          // Extraire les identifiants des jeux
          const gameIds = favoriteGames.map((game) => game.id);

          // Rechercher les jeux correspondants dans la base de données en utilisant les identifiants uniquement
          const gameInstances = await Game.findAll({
            where: { id: gameIds },
          });

          // Mettre à jour la relation favoriteGames avec les jeux trouvés
          await user.setFavoriteGames(gameInstances);
        } catch (error) {
          console.error(
            'Erreur lors de la mise à jour des jeux favoris :',
            error
          );
          return res
            .status(500)
            .json({
              message: 'Erreur lors de la mise à jour des jeux favoris',
            });
        }
      }

      // Respond with updated user information, including favorite games
      const updatedUser = await User.findByPk(userId, {
        include: [{ model: Game, as: 'favoriteGames' }],
      });

      res.json({
        message: 'User profile updated successfully',
        user: {
          id: updatedUser.id,
          pseudo: updatedUser.pseudo,
          description: updatedUser.description,
          favoriteGames: updatedUser.favoriteGames.map((game) => ({
            id: game.id,
            name: game.name,
          })), // Retourner uniquement id et name
          image: updatedUser.image,
          email: updatedUser.email,
          xp: updatedUser.xp,
        },
      });
    } catch (error) {
      console.error(
        "Erreur générale lors de la mise à jour de l'utilisateur :",
        error
      );
      res
        .status(500)
        .json({
          message: "Erreur générale lors de la mise à jour de l'utilisateur",
        });
    }
  },
};
