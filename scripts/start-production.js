#!/usr/bin/env node

/**
 * Production startup script for MyGymWebApp
 * 
 * This script handles the startup process for production environments.
 * It sets environment variables and starts the server.
 */

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Import the compiled server code
import('../dist/index.js')
  .then(() => {
    console.log('Server started successfully in production mode');
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });