
# 🎓 EventSphere — Intercollegiate Event Management Platform

A production-ready full-stack platform for managing and registering for college events across institutions, now powered by **Firebase**.

**Stack:** Firebase (Firestore & Auth) · Express · React · Node.js

---

## 📁 Project Structure

```
college-events/
├── backend/
│   ├── config/
│   │   ├── firebase.js                # Firebase Admin SDK initialization
│   │   └── firebase-service-account.json # Service Account Key (KEEP PRIVATE)
│   ├── controllers/
│   │   ├── authController.js          # User profile sync with Firebase Auth
│   │   ├── eventController.js         # Event CRUD operations
│   │   ├── registrationController.js  # Registration logic
│   │   ├── teamController.js          # Team creation/joining logic
│   │   └── adminController.js         # Admin-only management
│   ├── middleware/
│   │   └── auth.js                    # Firebase ID Token verification
│   ├── routes/
│   │   └── index.js                   # All API routes
│   ├── server.js                      # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/                # Reusable UI components
    │   ├── context/
    │   │   └── AuthContext.js         # Firebase Auth state management
    │   ├── pages/                     # Application views
    │   ├── firebase.js                # Firebase Client SDK config
    │   ├── utils/
    │   │   └── api.js                 # Axios instance with Auth interceptors
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🚀 Local Setup

### 1. Firebase Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project named `EventSphere`.
3.  **Authentication:** Enable the **Email/Password** provider.
4.  **Firestore Database:** Create a database in **Production Mode** (you will set rules later).
5.  **Project Settings:**
    *   Go to **Service Accounts** → Click **Generate New Private Key**. Save this file as `backend/config/firebase-service-account.json`.
    *   Go to **General** → Register a new **Web App**. Copy the `firebaseConfig` object for the frontend.

---

### 2. Backend Configuration

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

*Note: Ensure `backend/config/firebase-service-account.json` is present.*

Run the server:
```bash
npm run dev
```

---

### 3. Frontend Configuration

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Run the app:
```bash
npm start
```

---

## 🌐 API Reference

Authentication is handled via Firebase ID Tokens. The frontend sends the token in the `Authorization: Bearer <token>` header.

### Auth & Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/sync` | ✅ | Sync Firebase user with Firestore profile |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | ❌ | List all events |
| GET | `/api/events/:id` | ❌ | Get specific event details |
| POST | `/api/events` | Admin | Create new event |
| PUT | `/api/events/:id` | Admin | Update event details |
| DELETE | `/api/events/:id` | Admin | Delete event |

### Registration & Teams
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | ✅ | Register for an event |
| GET | `/api/register/my` | ✅ | Get all personal registrations |
| POST | `/api/teams/create` | ✅ | Create a team for an event |
| POST | `/api/teams/join` | ✅ | Join a team via 6-digit code |

---

## ✨ Key Features

### 👨‍🎓 For Students
*   **Discovery:** Browse events with search and category filters.
*   **Seamless Registration:** Quick registration for individual and team events.
*   **Team Management:** Create teams, generate invite codes, and manage members.
*   **Dashboard:** Track all registered events and team statuses.
*   **Social Integration:** Auto-redirect to WhatsApp groups upon registration.

### 👩‍💼 For Admins
*   **Event Management:** Full CRUD capabilities for events.
*   **Live Analytics:** Dashboard showing registration trends and statistics.
*   **Participant Tracking:** Export registration lists as CSV for offline management.
*   **User Control:** Manage user roles and view participation history.

---

## 🔐 Security & Architecture

*   **Firebase Authentication:** Secure, industry-standard authentication.
*   **RBAC:** Role-Based Access Control managed via Firestore user documents.
*   **Data Validation:** Backend validation for team sizes, deadlines, and duplicate registrations.
*   **Firestore Security Rules:** Ensure data integrity at the database level.
*   **Environment Safety:** All secrets managed via environment variables.

---

## ☁️ Deployment

### Backend (Render/Heroku)
1.  Connect your repository.
2.  Set Build Command: `npm install`.
3.  Set Start Command: `node server.js`.
4.  **Important:** Paste the content of your `firebase-service-account.json` into an environment variable or use a secret file manager.

### Frontend (Vercel/Netlify)
1.  Connect repository.
2.  Set Build Command: `npm run build`.
3.  Set Output Directory: `build`.
4.  Add all `REACT_APP_FIREBASE_*` variables to the dashboard.
