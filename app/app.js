import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors'; // Import the CORS middleware
import { router } from './routers/index.js';

dotenv.config();

export const app = express();

// Use CORS middleware with the specified origin from the .env file
app.use(
  cors({
    origin: process.env.CORS, // valeur du fichier .env
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Use the main router for handling routes

app.use(router);
