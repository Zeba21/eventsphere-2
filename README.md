# EventSphere

### Where College Events Come Alive

**EventSphere** is a premium, full-stack intercollegiate event management platform designed to streamline the discovery, registration, and management of college competitions, hackathons, and cultural fests.



##  Problem Statement

Organizing and participating in intercollegiate events is often fragmented across multiple platforms, leading to:

- **Poor Visibility:** Students miss out on exciting opportunities due to a lack of a centralized hub.

- **Complex Registration:** Manual team formation and registration processes are prone to errors and delays.

- **Administrative Burden:** Event coordinators struggle to manage participants, team codes, and real-time statistics effectively.


**EventSphere** solves this by providing a unified, real-time ecosystem for students and administrators.


##  Key Features


### For Students

- **Smart Discovery:** Browse events with real-time search and type-based filtering.

- **Seamless Registration:** Register for solo or team events with a single click.

- **Team Synergy:** Create teams and generate unique 6-digit invite codes for group events.

- **Personal Dashboard:** Track all your registrations and upcoming event schedules.


### For Admins

- **Full Control:** A dedicated dashboard to create, edit, and manage events.

- **Live Analytics:** Track registration trends and participant statistics at a glance.

- **User Management:** Monitor registered users and manage their participation history.


### Premium Experience

- **Dynamic Themes:** Fully responsive design with high-end Dark and Light modes.

- **Fluid UI:** Powered by Framer Motion for smooth, interactive transitions.


##  Tech Stack

**Frontend:** React.js with Framer Motion for premium animations and Lucide React for iconography.

**Styling:** Vanilla CSS with a Custom Variable System for high-performance Light/Dark mode.

**Backend:** Node.js & Express.js providing a robust RESTful API for event and team logic.

**Database:** Cloud Firestore (Firebase) for real-time data syncing and NoSQL scalability.

**Authentication:** Firebase Auth for secure, multi-method user sign-ins.

**Security:** Firebase Security Rules and Environment Variables (.env) to ensure data integrity and credential safety.


##  Quick Setup

### 1. Backend

```bash

cd backend

npm install

# Add your firebase-service-account.json to backend/config/

npm run dev

```


### 2. Frontend

```bash

cd frontend

npm install

# Configure your .env with Firebase credentials

npm start

```


##  UI Previews

**Check out the high-fidelity dark and light mode interfaces below:**

 Dark Mode (Hero) | Light Mode (Dashboard) |



**The current version of EventSphere serves as a robust MVP (Minimum Viable Product). The core backend architecture and database schemas are fully integrated to ensure that event creation, team code generation, and registration flows work seamlessly out of the box.**

**Future Enhancements**
To further elevate the user experience, the following features are planned for future releases:

**User Profiles:** Detailed student profiles showcasing past participation, won accolades, and skill sets.

**Leaderboards:** Real-time ranking for competitive events and hackathons.

**In-App Notifications:** Automated alerts for registration deadlines and event reminders.

**Payment Integration:** Secure gateways for events with registration fees.

**Certificate Generation:** Automated digital certificate issuance for participants and winners.

**Note:** This project is built with scalability in mind. The Firebase Firestore structure allows for easy addition of new data fields without disrupting existing event logic.


**Developed with ❤️ for the College Community.**
