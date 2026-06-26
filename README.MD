# Task Management Mini App

Simple task management app with a Next.js client and Golang Gin backend.

## Requirements

- Node.js
- Go
- Docker and Docker Compose

## Environment

Create `client/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Run With Docker

Run this command from the repository root:

```bash
docker compose up --build
```

Open:

- Client: http://localhost:3000
- Server: http://localhost:8080

## Run Manually

Start the backend:

```bash
cd server
go run cmd/main.go
```

Start the frontend in another terminal:

```bash
cd client
npm install
npm run dev
```

Open:

- Client: http://localhost:3000
- Server: http://localhost:8080

## Login

This app uses dummy authentication. You can login with any username and password.

## Features

- Login with mock authentication
- View tasks
- Add task
- Edit task title and status
- Delete task
- Filter tasks by status
- Search tasks by title
- Paginated task table
- CRUD sub tasks
