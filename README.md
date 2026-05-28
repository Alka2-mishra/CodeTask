# CodeTask - Task Management App

A full stack task management application built with React, Node.js, and MongoDB.

## Features
- User registration and login with JWT auth
- Role-based access control ready for protected task ownership
- CRUD for tasks
- Task status, priority, due date, and filtering
- Optional real-time task updates through Socket.IO
- Responsive UI for desktop and mobile

## Project Structure
- `client`: React + Vite frontend
- `server`: Express + MongoDB API

## Setup
1. Install dependencies from the repository root:
   ```bash
   npm install
   ```
2. Copy the example environment files and configure MongoDB/JWT values.
3. Start both apps:
   ```bash
   npm run dev
   ```

## Environment Variables
### Server
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN`

### Client
- `VITE_API_URL`

## Default API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
