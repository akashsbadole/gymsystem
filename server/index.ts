import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set trust proxy for production environments
if (isProduction) {
  app.set('trust proxy', 1);
}

// Add security headers for production
if (isProduction) {
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });
    next();
  });
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // Only show detailed error messages in development
    const message = isDevelopment 
      ? err.message || "Internal Server Error"
      : "Internal Server Error";

    res.status(status).json({ message });
    
    // Log the error
    console.error(err);
  });

  // Setup frontend serving based on environment
  if (isDevelopment) {
    // In development, use Vite dev server
    await setupVite(app, server);
  } else {
    // In production, serve static files and handle SPA routing
    const clientBuildPath = path.resolve(process.cwd(), 'dist/client');
    app.use(express.static(clientBuildPath));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }

  // Get port from environment variable or use default
  const port = process.env.PORT || 5000;
  
  // Get host from environment variable or use default
  // Use HOST=127.0.0.1 for local-only access, HOST=0.0.0.0 for all interfaces
  const host = process.env.HOST || '0.0.0.0';
  
  try {
    // Listen on specified host and port
    server.listen({
      port: Number(port),
      host: host,
      // Only use reusePort on platforms that support it
      ...(process.platform !== 'win32' ? { reusePort: true } : {})
    }, () => {
      log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      log(`Listening on ${host}:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    
    if (host === '0.0.0.0' && process.platform === 'win32') {
      console.log('\nTrying alternative configuration for Windows...');
      // On Windows, fallback to localhost if 0.0.0.0 fails
      server.listen(Number(port), 'localhost', () => {
        log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
        log(`Listening on localhost:${port}`);
      });
    } else {
      // Re-throw for other errors
      throw error;
    }
  }
})();
