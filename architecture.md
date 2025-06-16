# RealWorld Express Prisma Backend Architecture

## File + Folder Structure

```
realworld-express-prisma/
├── .env.development          # Development environment variables
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore file
├── CODE_OF_CONDUCT.md        # Code of conduct documentation
├── LICENSE                   # License information
├── README.md                 # Project documentation
├── favicon.ico               # Favicon icon
├── jest.config.ts            # Jest testing configuration
├── logo.png                  # Project logo
├── logs/                     # Directory for application logs
├── node_modules/             # Node.js dependencies
├── package-lock.json         # Lock file for npm dependencies
├── package.json              # Project metadata and dependencies
├── prisma/                   # Prisma ORM configuration
│   └── schema.prisma         # Database schema definition
├── src/                      # Source code
│   ├── app.ts                # Express application setup
│   ├── controllers/          # Business logic controllers
│   │   ├── articlesController/  # Article-related controllers
│   │   ├── commentsController/  # Comment-related controllers
│   │   ├── profileController/   # Profile-related controllers
│   │   ├── tagsController/      # Tag-related controllers
│   │   ├── userController/      # User-related controllers
│   │   └── usersController/     # Users-related controllers
│   ├── middleware/           # Request processing middleware
│   │   ├── articlesValidator/   # Article request validators
│   │   ├── auth/                # Authentication middleware
│   │   ├── commentsValidator/   # Comment request validators
│   │   ├── errorHandling/       # Error handling middleware
│   │   └── userValidator/       # User request validators
│   ├── routes/               # API routes definition
│   │   └── api/                 # API endpoints
│   │       ├── articles.ts      # Articles routes
│   │       ├── profiles.ts      # Profiles routes
│   │       ├── tags.ts          # Tags routes
│   │       ├── user.ts          # User routes
│   │       └── users.ts         # Users routes
│   ├── server.ts             # Server entry point
│   ├── test/                 # Test files
│   ├── utils/                # Utility functions
│   │   ├── db/                  # Database utility functions
│   │   └── logger.ts            # Logging utility
│   └── view/                 # View formatting functions
└── tsconfig.json             # TypeScript configuration
```

## What Each Part Does

### Core Files

- **server.ts**: Entry point of the application. Initializes the Express server and sets up signal handlers for graceful shutdown.
- **app.ts**: Configures the Express application by setting up middleware, routes, and error handlers.

### Database (Prisma)

- **schema.prisma**: Defines the database schema with four main models:
  - **User**: Represents application users with authentication details and relationships.
  - **Article**: Represents blog articles with content and metadata.
  - **Comment**: Represents comments on articles.
  - **Tag**: Represents article tags for categorization.

### Controllers

Controllers handle the business logic of the application, processing requests and preparing responses:

- **articlesController/**: Handles article-related operations:
  - Creating, updating, and deleting articles
  - Retrieving articles (single, list, feed)
  - Favoriting/unfavoriting articles
- **commentsController/**: Manages article comments:
  - Creating, retrieving, and deleting comments
- **profileController/**: Handles user profile operations:
  - Retrieving profiles
  - Following/unfollowing users
- **tagsController/**: Manages article tags:
  - Retrieving all tags
- **userController/**: Handles authenticated user operations:
  - Getting current user
  - Updating user information
- **usersController/**: Handles user registration and authentication:
  - User registration
  - User login

### Middleware

Middleware functions process requests before they reach controllers:

- **auth/authenticator.ts**: Provides JWT-based authentication:
  - `authenticate`: Requires valid authentication
  - `optionalAuthenticate`: Allows requests with or without authentication
- **articlesValidator/**: Validates article-related requests:
  - Creation, update, listing, and feed requests
- **commentsValidator/**: Validates comment-related requests
- **userValidator/**: Validates user-related requests:
  - Registration, login, and update requests
- **errorHandling/**: Handles various types of errors:
  - Authentication errors
  - Prisma database errors
  - General application errors

### Routes

Routes define the API endpoints and connect them to controllers:

- **api/articles.ts**: Article-related endpoints:
  - GET /api/articles: List articles
  - GET /api/articles/feed: Get personalized feed
  - GET /api/articles/:slug: Get single article
  - POST /api/articles: Create article
  - PUT /api/articles/:slug: Update article
  - DELETE /api/articles/:slug: Delete article
  - POST /api/articles/:slug/comments: Add comment
  - GET /api/articles/:slug/comments: Get comments
  - DELETE /api/articles/:slug/comments/:id: Delete comment
  - POST /api/articles/:slug/favorite: Favorite article
  - DELETE /api/articles/:slug/favorite: Unfavorite article
- **api/profiles.ts**: Profile-related endpoints:
  - GET /api/profiles/:username: Get profile
  - POST /api/profiles/:username/follow: Follow user
  - DELETE /api/profiles/:username/follow: Unfollow user
- **api/tags.ts**: Tag-related endpoints:
  - GET /api/tags: Get all tags
- **api/user.ts**: Current user endpoints:
  - GET /api/user: Get current user
  - PUT /api/user: Update user
- **api/users.ts**: User authentication endpoints:
  - POST /api/users: Register
  - POST /api/users/login: Login

### Utils

Utility functions that support the application:

- **db/**: Database interaction utilities:
  - Prisma client wrappers for CRUD operations
- **logger.ts**: Logging utility for application events

### Views

- **view/**: Functions that format data for API responses:
  - Transforming database models to API response format

## Where State Lives & How Services Connect

### State Management

1. **Database State**:
   - The primary application state is stored in a PostgreSQL database, accessed through Prisma ORM.
   - The database schema defines four main models: User, Article, Comment, and Tag.
   - Relationships between models are defined in the schema.prisma file.

2. **Environment Variables**:
   - Configuration state is managed through environment variables (.env.development).
   - Critical settings like DATABASE_URL and JWT_SECRET are stored here.

3. **JWT Authentication**:
   - User authentication state is maintained through JWT tokens.
   - Tokens are generated upon login and sent with subsequent requests.
   - The auth middleware validates these tokens.

### Service Connections

1. **Express to Routes**:
   - The Express application (app.ts) connects to route definitions.
   - Routes are mounted at specific paths (e.g., /api/articles).

2. **Routes to Controllers**:
   - Routes delegate request handling to specific controller functions.
   - Controllers contain the business logic for each endpoint.

3. **Controllers to Database**:
   - Controllers use utility functions in the utils/db directory to interact with the database.
   - These utilities abstract Prisma client operations.

4. **Middleware Integration**:
   - Authentication middleware verifies user identity before protected routes.
   - Validation middleware ensures request data is valid before reaching controllers.
   - Error handling middleware catches and processes errors at different levels.

5. **Response Formatting**:
   - View functions format data from the database into the expected API response format.
   - This creates a separation between data storage and presentation.

### Data Flow

1. **Request Flow**:
   - Client sends request → Express server → Middleware (auth, validation) → Controller → Database → Response formatting → Client
   
2. **Error Flow**:
   - Error occurs → Specific error handler (auth, prisma) → General error handler → Client

This architecture follows a clean separation of concerns, with distinct layers for routing, business logic, data access, and presentation, making the codebase maintainable and extensible.
