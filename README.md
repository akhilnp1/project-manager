# ProjectFlow — Mini Project Management System

A full-stack project management app built with **FastAPI**, **Next.js**, and **PostgreSQL**.

---

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Backend    | FastAPI (Python 3.10/3.11 recommended) |
| Database   | PostgreSQL + SQLAlchemy ORM            |
| Migrations | Alembic                                |
| Auth       | JWT (python-jose + passlib/bcrypt)     |
| Frontend   | Next.js 14 (App Router, TypeScript)    |
| Styling    | Tailwind CSS                           |
| State      | Zustand                                |
| Forms      | React Hook Form + Zod                  |

---

## Architecture

```
project-manager/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   ├── seed.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── store/
│       └── types/
│
└── postman_collection.json
```

### Layered Architecture (Backend)

```
Request → Router → Service → Repository → Database → Response
```

* Router: Handles HTTP requests
* Service: Business logic
* Repository: Database operations
* Schema: Validation (Pydantic)
* Model: ORM definitions

---

## ER Diagram

```
users → projects → tasks
```

(Task status enum: `todo | in_progress | in_review | done`)

---

## Prerequisites

* Python 3.10 or 3.11 (Recommended)
* Node.js 18+
* PostgreSQL 14+

> ⚠️ Note: Python 3.13 may cause dependency issues.

---

## 1. PostgreSQL Setup

```sql
psql -U postgres
CREATE DATABASE project_manager;
```

---

## 2. Backend Setup

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/project_manager
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

Run:

```bash
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

---

## 3. Frontend Setup

```bash
cd frontend

npm install
cp .env.local.example .env.local

npm run dev
```

> Note: If font errors occur (Geist), replace with Inter.

---

## Default Credentials

| Role      | Email                                         | Password |
| --------- | --------------------------------------------- | -------- |
| Admin     | [admin@example.com](mailto:admin@example.com) | admin123 |
| Developer | [dev@example.com](mailto:dev@example.com)     | dev123   |

---

## API Base URL

```
http://localhost:8000/api/v1


## API Endpoints

### Auth
- POST /api/v1/auth/login → Login user

### Users
- POST /api/v1/users → Create user (Admin)
- GET /api/v1/users → List users

### Projects
- POST /api/v1/projects → Create project
- GET /api/v1/projects → List projects
- PUT /api/v1/projects/{id} → Update project
- DELETE /api/v1/projects/{id} → Delete project

### Tasks
- POST /api/v1/tasks → Create task
- GET /api/v1/tasks → List tasks (with filters)
- PUT /api/v1/tasks/{id}/status → Update task status
```

---

## Key Features

* JWT Authentication
* Role-based access (Admin / Developer)
* Project CRUD
* Task CRUD
* Task filtering
* Pagination
* Swagger API docs

---

## Debugging Tips

* Use browser DevTools → Network tab
* Check backend logs for errors
* Use Swagger: http://localhost:8000/docs
* Ensure correct API base URL (`/api/v1`)

---

## Known Issues & Fixes

### 1. Enum Case Sensitivity

PostgreSQL enums are case-sensitive.

❌ Problem:

```
TODO → error
```

✅ Fix:

```python
status = Column(
    Enum(TaskStatus, values_callable=lambda x: [e.value for e in x]),
    nullable=False
)
```

---

### 2. CORS Issue

Frontend requests blocked.

✅ Fix:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 3. Python 3.13 Compatibility

Some packages failed.

✅ Fix:

* Use Python 3.10 / 3.11

---

## Running Both Servers

```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

---

## Final Note

This project demonstrates:

* Full-stack development
* Clean architecture
* Real-world debugging (CORS, Enum mismatch, dependencies)
* Production-level thinking
