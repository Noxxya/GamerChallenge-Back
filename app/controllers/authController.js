import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET; // Use a more secure secret key in production

export const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;


    // Check if the user exists

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }


    // Generate JWT token with additional information


    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      pseudo: user.pseudo,
      image: user.image,
      xp: user.xp
    }, SECRET_KEY);


    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        image: user.image,
        email: user.email,

        xp: user.xp,
      },
    });
  },
};
