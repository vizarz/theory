# node-auth-project/node-auth-project/README.md

# Node.js Authentication Project

This project is a Node.js application that implements user authentication and profile management. It includes features such as user registration, login, and role management (admin and student). The application also tracks user actions, such as completing projects and reading theory.

## Features

- User registration and login
- Role-based access control (Admin, Student)
- Profile management
- Action logging (e.g., completing projects, reading theory)
- MySQL database integration

## Project Structure

```
node-auth-project
├── src
│   ├── controllers
│   │   ├── auth.controller.js
│   │   └── profile.controller.js
│   ├── middlewares
│   │   └── auth.middleware.js
│   ├── models
│   │   ├── user.model.js
│   │   └── action.model.js
│   ├── routes
│   │   ├── auth.routes.js
│   │   └── profile.routes.js
│   ├── utils
│   │   └── db.js
│   └── app.js
├── package.json
├── .env
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd node-auth-project
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your database connection details and secret keys.

## Usage

To start the application, run the following command:

```
npm start
```

The server will start on the specified port, and you can access the API endpoints for authentication and profile management.

## API Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Log in an existing user

- **Profile Management**
  - `GET /api/profile` - Get user profile information
  - `PUT /api/profile` - Update user profile information
  - `POST /api/profile/action` - Record user actions

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.