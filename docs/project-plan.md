# Task Management — Project Plan

## Overview
A Jira-like task management application built to showcase real-time WebSocket capabilities, modern full-stack development, and Kubernetes deployment. This is a portfolio project demonstrating production-grade architecture and engineering decisions.

## Goals
- Demonstrate real-time collaboration using WebSockets (Socket.IO)
- Build a clean, modern UI with live updates across all connected clients
- Deploy with Docker and Kubernetes to showcase DevOps skills
- Use industry-standard tools and services (Clerk for auth, PostgreSQL, Redis)

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| NestJS | Server framework (modular, enterprise-grade) |
| PostgreSQL | Primary database |
| Prisma | ORM with type-safe queries and migrations |
| Socket.IO | Real-time WebSocket communication |
| Redis | Pub/Sub for Socket.IO across multiple K8s pods |
| Clerk | Authentication (JWT-based) |

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework + build tool |
| TypeScript | Type safety across the project |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | UI component library |
| Zustand | Client-side state management |
| TanStack Query | Server state / data fetching |
| Socket.IO Client | Real-time communication |

### Infrastructure (Future)
| Technology | Purpose |
|---|---|
| Docker | Containerization per service |
| Kubernetes | Orchestration and scaling |
| GitHub Actions | CI/CD pipelines |
| Helm / Kustomize | K8s manifest templating |

---

## Features

### MVP

#### 1. Authentication (Clerk)
- Sign up / Sign in via Clerk UI components
- Social logins (Google, GitHub)
- JWT tokens verified on backend (REST + WebSocket)
- Clerk webhook syncs user data to PostgreSQL

#### 2. Projects / Boards
- Create and manage projects
- Kanban board view per project
- Default columns: To Do, In Progress, In Review, Done
- Customizable columns

#### 3. Tasks (Tickets)
- Create, edit, delete tasks
- Fields: title, description, status, priority, assignee, due date
- Drag-and-drop between columns
- Task detail view with full editing

#### 4. Real-Time Features (Core Showcase)
- **Live board updates** — task moves/edits appear instantly for all users
- **Live editing indicators** — "User X is editing this task"
- **Presence** — see who is online and viewing the board
- **Real-time notifications** — toast when assigned a task or mentioned
- **Activity feed** — live stream of board activity

#### 5. Comments
- Add comments on tasks
- Comments appear in real-time for everyone viewing the task

### Nice-to-Have (Post-MVP)

#### 6. RBAC (Role-Based Access Control)
- Roles: Owner, Admin, Member, Viewer
- Permission-based UI (buttons/actions hidden based on role)
- Real-time role changes — downgrade takes effect instantly via WebSocket

#### 7. Labels & Tags
- Color-coded labels on tasks
- Filter by label

#### 8. Search & Filter
- Search tasks by title, description, assignee
- Filter by status, priority, label, due date

#### 9. Sprint Planning
- Group tasks into sprints
- Sprint board view

#### 10. File Attachments
- Upload files to tasks
- Image preview

#### 11. Dashboard & Reporting
- Charts: tasks per status, tasks per assignee, velocity
- Demonstrates database aggregation and data visualization

---

## Architecture

```
┌─────────────┐         ┌──────────────┐
│   React +   │  HTTP    │              │
│   Vite      │────────→ │   NestJS     │
│   (SPA)     │  WS      │   Backend    │
│             │◄────────→│              │
└─────────────┘         └──────┬───────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
               ┌────▼───┐ ┌───▼────┐ ┌───▼───┐
               │ Clerk  │ │ Postgres│ │ Redis │
               │ (Auth) │ │  (DB)  │ │(Pub/Sub)│
               └────────┘ └────────┘ └───────┘
```

---

## Implementation Order
1. Backend: Docker + PostgreSQL + Redis + Prisma setup
2. Backend: Clerk integration + user sync
3. Backend: REST API — CRUD for projects and tasks
4. Backend: WebSocket gateway — real-time events
5. Frontend: Clerk auth flow
6. Frontend: Board view with drag-and-drop
7. Frontend: Socket integration — live updates
8. Frontend: Presence and editing indicators
9. Infrastructure: Dockerfiles for both services
10. Infrastructure: Kubernetes manifests + Redis adapter
11. Nice-to-haves: RBAC, search, labels, dashboard

---

## Phase 1: Docker + PostgreSQL + Prisma Setup

### Prerequisites
- Install Docker Desktop (includes docker-compose, requires WSL 2 on Windows)

### Step 1: Create `docker-compose.yml`
Location: `taskmanagement_back/docker-compose.yml`

Two services:
- **PostgreSQL** — port 5432, with volume for data persistence
- **Redis** — port 6379 (needed later for Socket.IO adapter, set up now)

### Step 2: Environment variables
Create `.env.example` (committed — template for other devs) and `.env` (gitignored — local secrets):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskmanagement
REDIS_URL=redis://localhost:6379
```

### Step 3: Install & initialize Prisma
```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

### Step 4: Define database schema
Location: `taskmanagement_back/prisma/schema.prisma`

```
User
├── id (uuid)
├── clerkId (unique — synced from Clerk webhook)
├── email (unique)
├── name
├── avatarUrl
├── createdAt / updatedAt

Project
├── id (uuid)
├── name
├── description
├── ownerId → User
├── createdAt / updatedAt

ProjectMember (join table — user ↔ project)
├── id (uuid)
├── projectId → Project
├── userId → User
├── role (enum: OWNER, ADMIN, MEMBER, VIEWER)
├── joinedAt

Board
├── id (uuid)
├── projectId → Project
├── name
├── createdAt / updatedAt

Column
├── id (uuid)
├── boardId → Board
├── name (e.g. "To Do", "In Progress", "Done")
├── position (int — for drag-and-drop ordering)

Task
├── id (uuid)
├── columnId → Column
├── title
├── description (nullable)
├── priority (enum: LOW, MEDIUM, HIGH, URGENT)
├── position (int — ordering within column)
├── assigneeId → User (nullable)
├── reporterId → User
├── dueDate (nullable)
├── createdAt / updatedAt

Comment
├── id (uuid)
├── taskId → Task
├── authorId → User
├── content
├── createdAt / updatedAt
```

### Step 5: Create Prisma service in NestJS
Files:
- `src/prisma/prisma.module.ts` — NestJS module exporting PrismaService
- `src/prisma/prisma.service.ts` — extends PrismaClient with lifecycle hooks

### Step 6: Run migration
```bash
docker-compose up -d
npx prisma migrate dev --name init
```

### Verification
1. `docker-compose up -d` — containers start without errors
2. `npx prisma migrate dev` — tables created
3. `npx prisma studio` — visual confirmation of schema in browser
4. `npm run start:dev` — NestJS connects to database
