import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon database for serverless environments
neonConfig.webSocketConstructor = ws;

// Environment-specific configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Log current environment
console.log(`Running in ${process.env.NODE_ENV} environment`);

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  const errorMessage = isDevelopment 
    ? "DATABASE_URL must be set for local development. Create a .env file with your database connection string:\n\n" +
      "DATABASE_URL=postgresql://username:password@localhost:5432/mygymwebapp\n\n" +
      "If running on your local machine, make sure PostgreSQL is installed and running."
    : "DATABASE_URL must be set. Did you forget to provision a database?";
  
  throw new Error(errorMessage);
}

// Initialize database connection pool with appropriate settings
const poolConfig: any = { 
  connectionString: process.env.DATABASE_URL 
};

// Add SSL configuration for production environments
if (isProduction) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });

// Setup process handlers to close pool on exit
process.on('exit', () => {
  console.log('Closing database pool');
  pool.end();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - closing database pool');
  pool.end(() => {
    process.exit(0);
  });
});
