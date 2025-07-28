# Express API Server

This is the backend Node.js/Express server for the MERN stack project.

## Development

### Running outside Docker
```bash
npm run dev
```

Check `package.json` for additional scripts and information on libraries.

Check `tsconfig.json` for additional configuration regarding typescript.

### Running in Docker
The server is configured to run as part of the Docker-composed MERN stack. See the [global README](../README.md) for complete setup.

### Docker Configuration 
Environment variables (if any) should be set in `.env` file (see .env.example)

## API Endpoints
//todo: describe how API is acquired, where it's stored and how

## Project Structure
```
//Todo: update this section
src/
  controllers/  # Route controllers
  models/       # MongoDB models
  routes/       # API routes
  utils/        # Utility functions
  app.ts        # Express app setup
  server.ts     # Server entry point
```
