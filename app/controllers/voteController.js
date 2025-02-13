import { User, Challenge, Participate } from '../models/index.js';

export const voteController = {
  // Voting functionality for challenges
  challenge: {
    // Add a vote to a challenge
    addVote: async (req, res) => {
      
      const { userId, challengeId } = req.body;
      const VOTE_THRESHOLD = 5;


      // Find the user and the challenge
      const user = await User.findByPk(userId);
      const challenge = await Challenge.findByPk(challengeId);

      if (!user || !challenge) {
        return res.status(404).json({ message: 'User or Challenge not found' });
      }

      // Check if the user has already voted for this challenge
      const existingVote = await challenge.hasVoter(user);
      if (existingVote) {
        return res
          .status(400)
          .json({ message: 'User has already voted for this challenge' });
      }

      // Add a vote
      await user.addVotedChallenge(challenge);

      // Count the number of votes for the challenge
      const voteCount = await challenge.countVoters();

      // Validate the challenge if the vote count reaches the threshold
      if (voteCount >= VOTE_THRESHOLD) {
        await challenge.update({ statut: true });
        res.json({ message: `Challenge validated with ${voteCount} votes!` });
      } else {
        res.json({
          message: `Vote added. Current vote count for challenge: ${voteCount}`,
        });
      }
    },

    // Remove a vote from a challenge
    removeVote: async (req, res) => {
      
      const { userId, challengeId } = req.body;
      const VOTE_THRESHOLD = 5;

      // Find the user and the challenge
      const user = await User.findByPk(userId);
      const challenge = await Challenge.findByPk(challengeId);

      if (!user || !challenge) {
        return res.status(404).json({ message: 'User or Challenge not found' });
      }

      // Check if the vote exists
      const existingVote = await challenge.hasVoter(user);
      if (!existingVote) {
        return res
          .status(400)
          .json({ message: 'Vote does not exist for this user and challenge' });
      }

      // Remove the vote
      await user.removeVotedChallenge(challenge);

      // Count remaining votes for the challenge
      const remainingVotes = await challenge.countVoters();

      // If the number of votes is below the threshold, invalidate the challenge
      if (remainingVotes < VOTE_THRESHOLD && challenge.statut) {
        await challenge.update({ statut: false });
        res.json({
          message: `Vote removed. Challenge invalidated as it has ${remainingVotes} votes.`,
        });
      } else {
        res.json({
          message: `Vote removed. Current vote count for challenge: ${remainingVotes}`,
        });
      }
    },
  },

  // Voting functionality for participations
  participate: {
    addVote: async (req, res) => {
      
      // Add a vote to a participation
      const { userId, participateId } = req.body;

      const VOTE_THRESHOLD = 5; // Threshold for validating votes

      // Find the user and the participation
      const user = await User.findByPk(userId);
      const participate = await Participate.findByPk(participateId);

      if (!user || !participate) {
        return res
          .status(404)
          .json({ message: 'User or Participation not found' });
      }

      // Check if the user has already voted for this participation
      const existingVote = await participate.hasVotersParticipations(user); /// Use correct method name
      if (existingVote) {
        return res
          .status(400)
          .json({ message: 'User has already voted for this participation' });
      }

      // Add a vote
      await user.addVotedParticipation(participate);

      // Count the number of votes for the participation
      const voteCount = await participate.countVotersParticipations();

      // Validate the participation if the vote count reaches the threshold
      if (voteCount >= VOTE_THRESHOLD) {
        await participate.update({ statut: true });
        res.json({
          message: `Participation validated with ${voteCount} votes!`,
        });
      } else {
        res.json({ message: `Vote added. Current vote count: ${voteCount}` });
      }
    },

    // Remove a vote from a participation
    removeVote: async (req, res) => {
      const { userId, participateId } = req.body;
      const VOTE_THRESHOLD = 5;
    
      // Find the user and the participation
      const user = await User.findByPk(userId);
      const participate = await Participate.findByPk(participateId);
    
      if (!user || !participate) {
        return res.status(404).json({ message: 'User or Participation not found' });
      }
    
      // Check if the user has already voted
      const existingVote = await participate.hasVotersParticipations(user);
    
      // If the vote doesn't exist, we can allow the vote addition or tell the user.
      if (!existingVote) {
        return res.status(400).json({
          message: 'You have not voted for this participation yet.',
        });
      }
    
      // Remove the vote if the user has voted
      await user.removeVotedParticipation(participate);
    
      // Count remaining votes for the participation
      const remainingVotes = await participate.countVotersParticipations();
    
      // If the number of votes falls below the threshold, invalidate the participation
      if (remainingVotes < VOTE_THRESHOLD && participate.statut) {
        await participate.update({ statut: false });
        return res.json({
          message: `Vote removed. Participation invalidated as it has ${remainingVotes} votes.`,
        });
      }
    
      res.json({
        message: `Vote removed. Current vote count: ${remainingVotes}`,
      });
    }
    },
  };

