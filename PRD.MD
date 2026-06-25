# Case Title: Task Management Mini App

- Goal
Build a simple Task Management application where users can manage their own tasks. Users
should be able to view, add, edit, delete, and mark tasks as done. Filtering by status (all, active,
completed) should also be supported.

- Backend (Golang)
1 Use Golang with Chi or Gin router.
2 Organize the project with a clean structure (internal/, cmd/).
3 Use SQLite or in-memory data storage.
4 Implement at least these endpoints:
1 POST /api/login – returns dummy JWT (mock authentication).
2 GET /api/tasks – lists all tasks owned by the user.
3 POST /api/tasks – creates a new task.
4 PUT /api/tasks/:id – updates a task (title/status).
5 DELETE /api/tasks/:id – deletes a task.

Evaluation Points (Backend)
1 Clean and modular code.
2 Proper RESTful design.
3 Middleware usage (e.g., dummy JWT validation).
4 Optional concurrency (goroutine-safe cache).

- Frontend (React + Next.js + Tailwind)
1 Create a login page (dummy login accepted).
2 Display 'My Tasks' page after login.
3 Allow viewing, adding, updating, deleting tasks.
4 Support filtering by status (all/active/completed).
5 Use React Hooks (useState, useEffect) and Axios for fetching.

Bonus Points
1 Use React Query or SWR for data fetching.
2 Add UI/UX improvements (loading state, toast notification).
3 Make it responsive with Tailwind CSS.

- Evaluation Criteria
1 Backend API – Golang syntax, REST design, modularity.
2 Frontend UI – React/Next.js structure, data fetching, state management.
3 Integration – Proper API connection and error handling.
4 Code Quality – Naming, maintainability, and structure.
5 Bonus – Dockerfile, linting, or test coverage.

- Advanced Challenge (Optional)


1 Implement pagination and sorting on /tasks endpoint.
2 Add WebSocket support for real-time updates.
3 Support sub-tasks (nested structure).
4 Add /api/stats endpoint for task completion summary per user.


