# MyGymWebApp - Gym Management System

A comprehensive gym management system tailored for Indian gym owners. This application helps gym owners manage memberships, track payments, and gain business insights through a user-friendly web interface.

## Features

- **User Management**: Admin, Owner, Manager, and Staff roles with appropriate permissions
- **Member Management**: Track member details, history, and memberships
- **Membership Plans**: Create and manage different membership plans
- **Payment Tracking**: Record and track all payment transactions
- **Staff Management**: Manage gym staff and their details
- **Dashboard**: Get insights about gym performance
- **Notifications**: Stay updated with important events

## Technology Stack

- **Frontend**: React.js, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mygymwebapp

# Server
PORT=5000
NODE_ENV=development

# Session Secret
SESSION_SECRET=your_secret_key
```

### Running Locally

1. Clone the repository
   ```
   git clone https://github.com/yourusername/mygymwebapp.git
   cd mygymwebapp
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Push database schema
   ```
   npm run db:push
   ```

4. Seed the database with sample data (optional)
   ```
   NODE_ENV=development tsx scripts/seed-sample-data.js
   ```
   
   Sample login credentials:
   - Admin: username `admin`, password `admin123`
   - Owner: username `owner`, password `owner123`
   - Manager: username `manager`, password `manager123`
   - Staff: username `staff`, password `staff123`

5. Start the development server
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

### Building for Production

1. Build the application
   ```
   npm run build
   ```

2. Start the production server
   ```
   npm run start
   ```

### Database Migrations

When you make changes to the database schema in `shared/schema.ts`, push those changes to the database:

```
npm run db:push
```

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/hooks` - Custom React hooks
  - `/src/pages` - Application pages
  - `/src/lib` - Utility functions and configuration
- `/server` - Backend Express application
  - `/routes.ts` - API routes
  - `/auth.ts` - Authentication logic
  - `/db.ts` - Database connection and configuration
  - `/storage.ts` - Database operations
- `/shared` - Shared code between frontend and backend
  - `/schema.ts` - Database schema definitions
- `/scripts` - Utility scripts for database operations

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.