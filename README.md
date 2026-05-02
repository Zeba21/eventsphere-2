# 🎓 EventSphere — Intercollegiate Event Management Platform

A production-ready full-stack platform for managing and registering for college events across institutions.

**Stack:** PostgreSQL · Express · React · Node.js (PERN)

---

## 📁 Project Structure

```
college-events/
├── backend/
│   ├── config/
│   │   ├── db.js              # PostgreSQL pool
│   │   └── schema.sql         # Database schema + seed
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── teamController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js            # JWT + RBAC middleware
│   ├── routes/
│   │   └── index.js           # All API routes
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── Navbar.js
    │   │   ├── student/
    │   │   │   └── EventCard.js
    │   │   └── admin/
    │   │       └── AdminLayout.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── LoginPage.js       (also exports RegisterPage)
    │   │   ├── RegisterPage.js
    │   │   ├── EventsPage.js
    │   │   ├── EventDetailPage.js
    │   │   ├── MyRegistrationsPage.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js
    │   │       ├── AdminEvents.js
    │   │       ├── AdminUsers.js
    │   │       └── AdminEventDetail.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## 🚀 Local Setup

### 1. Database (PostgreSQL)

Create a PostgreSQL database (locally or on [Neon](https://neon.tech) / [Supabase](https://supabase.com)):

```sql
CREATE DATABASE college_events;
```

Then run the schema:

```bash
psql -U postgres -d college_events -f backend/config/schema.sql
```

This creates all tables and seeds a default admin user:
- **Email:** `admin@college.edu`
- **Password:** `password` *(change immediately in production!)*

---

### 2. Backend

```bash
cd backend
npm install

# Copy and fill env
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/college_events
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev   # development (nodemon)
# or
npm start     # production
```

Backend runs at `http://localhost:5000`

---

### 3. Frontend

```bash
cd frontend
npm install

# Copy env
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
```

Frontend runs at `http://localhost:3000`

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register student |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | ❌ | List all events |
| GET | `/api/events/:id` | ❌ | Get event |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Delete event |

### Registration
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | ✅ | Register for event |
| GET | `/api/register/my` | ✅ | My registrations |

### Teams
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/teams/create` | ✅ | Create team |
| POST | `/api/teams/join` | ✅ | Join team via code |
| GET | `/api/teams/my/:event_id` | ✅ | Get my team for event |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/events/:id/registrations` | Admin | Event registrations |

---

## ☁️ Deployment

### Backend → [Render](https://render.com)

1. Push backend code to GitHub
2. Create a new **Web Service** on Render
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `node server.js`
5. Add environment variables from `.env`
6. Set `NODE_ENV=production`
7. Your backend URL: `https://your-app.onrender.com`

### Frontend → [Vercel](https://vercel.com)

1. Push frontend code to GitHub
2. Import project on Vercel
3. Set **Root Directory:** `frontend`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```
5. Deploy — Vercel detects Create React App automatically

### Database → [Neon](https://neon.tech) (free PostgreSQL)

1. Create account & new project
2. Copy the connection string
3. Run schema: use Neon's SQL editor or `psql`
4. Update `DATABASE_URL` in backend env

---

## 🔐 Security Checklist

- [x] JWT authentication with expiry
- [x] bcrypt password hashing (salt rounds: 10)
- [x] Role-based access control (student / admin)
- [x] SQL parameterized queries (no injection)
- [x] Input validation on all endpoints
- [x] CORS configured for specific frontend origin
- [x] Environment variables for all secrets
- [ ] **Change default admin password immediately**
- [ ] Set strong `JWT_SECRET` (32+ random chars)
- [ ] Enable HTTPS in production (handled by Render/Vercel)

---

## ✨ Features

### Student
- Browse all events with search & filters
- View event details (date, venue, coordinator, contact)
- Individual event registration
- Team creation with shareable 6-char code
- Join teams via code
- WhatsApp group auto-redirect on registration
- View all personal registrations

### Admin
- Dashboard with live stats
- Full event CRUD with image support
- View all registered participants per event
- Export registrations as CSV
- User management with participation stats
- Dark/Light mode

---

## 🎨 Tech Choices

- **Framer Motion** — page transitions, card hover, modal animations
- **React Router v6** — nested protected routes
- **react-hot-toast** — toast notifications
- **Lucide React** — consistent icon set
- **Axios** — API client with JWT interceptors
- **CSS Variables** — dark/light theming with zero JS overhead
