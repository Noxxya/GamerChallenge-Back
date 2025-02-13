import { Challenge, Participate, User } from '../models/index.js';
import { HttpError } from '../error/httperror.js';

export const participateController = {
  // Get all participations with associated data
  getAll: async (_, res) => {
    const participate = await Participate.findAll({
      include: [
        {
          association: 'user',
          attributes: {
            exclude: ['password', 'email'],
          },
        },
        {
          association: 'challenge',
          include: [
            { association: 'types' },
            { association: 'difficulty' },
            { association: 'gamegenres' },
            { association: 'games' },
          ],
        },
      ],
    });
    res.json(participate);
  },

  // Get a specific participation by ID
  getById: async (req, res) => {
    const { id } = req.params;
    const participate = await Participate.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: {
            exclude: ['password', 'email'],
          },
        },
        {
          association: 'challenge',
          include: [
            { association: 'types' },
            { association: 'difficulty' },
            { association: 'gamegenres' },
            { association: 'games' },
          ],
        },
      ],
    });
    if (!participate) {
      throw new HttpError(
        404,
        'Participate not found. Please verify the provided ID.'
      );
    }
    res.json(participate);
  },

  // Create a new participation
  createParticipate: async (req, res) => {
    const { userId, challengeId, url_video, description, value_xp = 0 } = req.body;
  
    // Vérifiez si l'utilisateur et le défi existent
    const [user, challenge] = await Promise.all([
      User.findByPk(userId),
      Challenge.findByPk(challengeId),
    ]);
  
    if (!user || !challenge) {
      throw new HttpError(404, 'Utilisateur ou défi introuvable');
    }
  
    // Vérifiez si la participation existe déjà
    const existingParticipation = await Participate.findOne({
      where: { id_user: userId, id_challenge: challengeId },
    });
  
    if (existingParticipation) {
      throw new HttpError(
        409,
        "L'utilisateur participe déjà à ce défi"
      );
    }
  
    // Créez une nouvelle participation
    const newParticipation = await Participate.create({
      id_user: userId,
      id_challenge: challengeId,
      url_video,
      description,
      value_xp,
      statut: true,
      date: new Date(),
    });
  
    // Récupérez la participation avec ses relations
    const participationWithRelations = await Participate.findByPk(
      newParticipation.id,
      {
        include: [
          {
            association: 'user',
            attributes: { exclude: ['password', 'email'] },
          },
          {
            association: 'challenge',
            include: [
              { association: 'types' },
              { association: 'difficulty' },
              { association: 'gamegenres' },
              { association: 'games' },
            ],
          },
        ],
      }
    );
  
    res.status(201).json(participationWithRelations);
  },

  // Update an existing participation
  patchParticipate: async (req, res) => {
    const { id } = req.params;
    const { status, enDate } = req.body;

    // Check if participation exists
    const participate = await Participate.findByPk(id);
    if (!participate) {
      throw new HttpError('Participation not found', 404);
    }

    // Update provided fields
    if (status !== undefined) {
      participate.status = status;
    }

    if (endDate !== undefined) {
      participate.endDate = new Date(endDate);
    }

    await participate.save();

    // Retrieve updated participation with its associations
    const updateParticipate = await Participate.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: {
            exclude: ['password', 'email'],
          },
        },
        {
          association: 'challenge',
          include: [
            { association: 'types' },
            { association: 'difficulty' },
            { association: 'gamegenres' },
            { association: 'games' },
          ],
        },
      ],
    });

    res.json(updateParticipate);
  },
};
