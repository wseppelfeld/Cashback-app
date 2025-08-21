# Cashback App

A comprehensive regionalized cashback application with full-stack implementation including mobile app, web dashboard, and API backend.

## 🏗️ Project Structure

```
cashback-app/
├── apps/
│   ├── api/                 # Node.js/Express TypeScript backend
│   ├── web-app/             # React.js web dashboard for merchants
│   └── mobile-app/          # React Native mobile app for users
├── packages/
│   ├── shared/              # Shared TypeScript interfaces and utilities
│   └── database/            # Database schemas and migrations
├── infra/                   # Docker configurations and infrastructure
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Option 1: Docker Setup (Recommended)

1. Clone the repository
2. Run the setup script:
   ```bash
   ./setup.sh
   ```

This will start all services with Docker Compose:
- **API**: http://localhost:3000
- **Web Dashboard**: http://localhost:3001
- **Database**: PostgreSQL on port 5432
- **Redis**: Redis on port 6379

### Option 2: Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build shared packages:
   ```bash
   npm run build
   ```

3. Set up your environment files:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web-app/.env.example apps/web-app/.env
   ```

4. Start PostgreSQL and Redis locally

5. Run database migrations:
   ```bash
   cd apps/api && npm run migrate
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 - API
   npm run api:dev
   
   # Terminal 2 - Web App
   npm run web:dev
   
   # Terminal 3 - Mobile App (optional)
   cd apps/mobile-app && npm start
   ```

## 📱 Applications

### API Backend (`apps/api`)

Node.js/Express TypeScript backend with:

- **Authentication**: JWT-based authentication system
- **Database**: PostgreSQL with comprehensive schema
- **Services**: User, merchant, transaction, and wallet services
- **Event System**: Asynchronous event processing
- **API Endpoints**: RESTful APIs for all functionality

**Key Features:**
- User registration and authentication
- Merchant management and onboarding
- Transaction processing with cashback calculation
- Wallet system with credit/debit tracking
- Regional support with data isolation
- Event-driven architecture

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `GET /api/merchants` - List merchants
- `POST /api/merchants` - Create merchant
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/redeem` - Redeem cashback
- `GET /api/regions` - List regions

### Web Dashboard (`apps/web-app`)

React.js dashboard for merchants with Material-UI:

- **Dashboard**: Overview with statistics and charts
- **Merchant Management**: Create and manage merchants
- **Transaction Tracking**: View and monitor transactions
- **Authentication**: Login/register with region selection

**Technologies:**
- React.js with TypeScript
- Material-UI for design system
- React Query for state management
- React Router for navigation
- Vite for build tooling

### Mobile App (`apps/mobile-app`)

React Native mobile app for users:

- **Dashboard**: User overview with balance and recent activity
- **Transaction History**: View all transactions with details
- **Wallet Management**: View balance, movements, and redeem cashback
- **Profile**: User account management

**Technologies:**
- React Native with Expo
- TypeScript
- React Navigation
- React Query for API calls
- Expo Vector Icons

## 📊 Database Schema

### Core Tables

- **users**: User accounts with wallet balance
- **regions**: Geographical regions with cashback rates
- **merchants**: Merchant accounts with commission rates
- **transactions**: Purchase transactions with cashback
- **wallet_movements**: All wallet credit/debit movements
- **settlements**: Merchant settlement records

### Key Features

- **Regional Isolation**: Users and merchants belong to specific regions
- **Automatic Cashback**: Calculated based on region cashback rates
- **Wallet System**: Track all movements with running balance
- **Event Triggers**: Database triggers for updated_at timestamps
- **Comprehensive Indexing**: Optimized for query performance

## 🛠️ Development

### Monorepo Structure

This project uses npm workspaces for monorepo management:

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run linting
npm run lint

# Clean all build artifacts
npm run clean
```

### Package Dependencies

- **API**: Depends on shared and database packages
- **Web App**: Depends on shared package
- **Mobile App**: Depends on shared package
- **Database**: Depends on shared package

### Development Commands

```bash
# Start API development server
npm run api:dev

# Start web app development server
npm run web:dev

# Start mobile app development server
npm run mobile:dev

# Build specific package
npm run build --workspace=apps/api
```

## 🔧 Configuration

### Environment Variables

**API (apps/api/.env):**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cashback_app
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Web App (apps/web-app/.env):**
```env
VITE_API_URL=http://localhost:3000/api
```

### Database Configuration

The database includes default regions:
- North America (USD, 5% cashback)
- Europe (EUR, 4% cashback)
- Asia Pacific (USD, 6% cashback)
- Latin America (USD, 5% cashback)

## 🧪 Testing

The application includes comprehensive error handling and validation:

- **Input Validation**: Using express-validator
- **Authentication**: JWT middleware
- **Error Handling**: Centralized error handling middleware
- **Type Safety**: Full TypeScript coverage

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input sanitization and validation
- CORS protection
- Security headers with Helmet.js

## 📈 Scalability Features

- **Regional Architecture**: Data isolation by region
- **Event-Driven System**: Asynchronous event processing
- **Caching**: Redis for session and data caching
- **Database Indexing**: Optimized queries
- **Microservice Ready**: Modular architecture
- **Docker Support**: Container-based deployment

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose -f infra/docker-compose.yml up -d --build

# View logs
docker-compose -f infra/docker-compose.yml logs -f

# Stop services
docker-compose -f infra/docker-compose.yml down
```

### Production Considerations

- Use environment-specific JWT secrets
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Use production database credentials
- Configure monitoring and logging
- Set up backup strategies

## 📄 API Documentation

The API follows RESTful conventions with consistent response formats:

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
