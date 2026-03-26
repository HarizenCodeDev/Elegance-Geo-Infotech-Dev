# Elegance EMS - Employee Management System

A full-stack employee management system with role-based access control.

## Features

- **Authentication**: JWT-based login with secure password hashing
- **Role-based Access**: Root, Admin, Manager, Team Lead, HR, Developer
- **Employee Management**: Add, edit, view, delete employees
- **Attendance**: Track daily attendance with check-in/check-out
- **Leave Management**: Request, approve, reject leaves
- **Announcements**: Post and view company announcements
- **Chat**: Direct and group messaging
- **Dashboard**: Real-time statistics and visualizations

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, PostgreSQL, Knex.js
- **Auth**: JWT, bcrypt

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## Setup Instructions

### 1. Install PostgreSQL

**Windows:**
Download from https://www.postgresql.org/download/windows/

**Mac:**
```bash
brew install postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
```

**Docker (Alternative):**
```bash
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=elegance_ems \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15
```

### 2. Start PostgreSQL

**Windows:** Start the PostgreSQL service

**Mac:**
```bash
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
```

### 3. Create Database

```bash
createdb elegance_ems -U postgres
```

Or using psql:
```bash
psql -U postgres -c "CREATE DATABASE elegance_ems;"
```

### 4. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Update .env with your PostgreSQL credentials
# Edit the .env file if needed

# Run migrations
npm run db:migrate

# Seed default admin user
npm run db:seed
```

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Default Admin Credentials

After running the seed:
- **Email**: admin@elegance.com
- **Password**: admin123

⚠️ **Important**: Change this password after first login!

## Project Structure

```
Elegance/
├── server/
│   ├── config/          # Database configuration
│   ├── controller/      # Route controllers
│   ├── migrations/      # Database migrations
│   ├── middleware/      # Auth, validation, error handling
│   ├── routes/          # API routes
│   ├── seeds/           # Database seeds
│   ├── uploads/         # Uploaded files
│   ├── index.js         # Entry point
│   └── .env             # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # React context (auth)
    │   ├── pages/       # Page components
    │   ├── App.jsx      # Main app
    │   └── main.jsx     # Entry point
    ├── .env             # Environment variables
    └── package.json
```

## Environment Variables

### Server (.env)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elegance_ems
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Default User (for seeding)
DEFAULT_EMAIL=admin@elegance.com
DEFAULT_PASSWORD=admin123
DEFAULT_NAME=Administrator
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/avatar` - Upload avatar

### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `PUT /api/employees/:id/attendance` - Update attendance

### Attendance
- `GET /api/attendance` - List attendance
- `POST /api/attendance` - Mark attendance

### Leaves
- `GET /api/leaves` - List leaves
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id/status` - Approve/reject leave

### Announcements
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Chat
- `GET /api/chat` - Get messages
- `POST /api/chat` - Send message

## Roles & Permissions

| Role      | Dashboard | Employees | Attendance | Leaves | Announcements | Chat |
|-----------|-----------|-----------|------------|--------|---------------|------|
| root      | Full      | Full      | Full       | Full   | Full          | Yes  |
| admin     | Full      | Full      | Full       | Full   | Full          | Yes  |
| manager   | Limited   | View/Edit | Full       | Full   | Full          | Yes  |
| teamlead  | Limited   | View      | View       | Own    | Post          | Yes  |
| hr        | Limited   | Full      | View       | Own    | Post          | Yes  |
| developer | Own       | View      | Own        | Own    | View          | Yes  |

## Production Deployment

### Backend (Self-hosted)

1. Set `NODE_ENV=production` in .env
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start index.js --name elegance-server
```

### Frontend

Build for production:
```bash
npm run build
```

Serve the `dist/` folder with nginx or any static file server.

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check .env credentials match your PostgreSQL setup
3. Verify the database exists

### Port Already in Use

Change the PORT in .env:
```env
PORT=3000
```

### CORS Errors

Update FRONTEND_URL in server .env:
```env
FRONTEND_URL=http://your-domain.com
```

## License

MIT
