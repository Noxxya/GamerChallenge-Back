import 'dotenv/config';
import { createServer } from 'node:http';
import { app } from './app/app.js';

const PORT = process.env.PORT; // Get the port from environment variables

// Create an HTTP server using the Express app
const server = createServer(app);

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`); // Log the server URL to the console
});
