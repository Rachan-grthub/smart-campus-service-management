# Smart Campus Service Management System

A centralized platform for students to request and track on-campus services such as certificates, lab equipment, maintenance work, leave applications, and other college-related services.

## Project overview
This starter project includes:
- A React frontend for students and staff
- An Express API backend
- JSON-based persistence for requests and service catalogs
- Service request creation, tracking, and status updates
- Dashboard summary for campus operations

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Data storage: JSON files (easy to replace with MongoDB/PostgreSQL later)

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```
3. Open the frontend at:
   ```text
   http://localhost:5173
   ```
4. API is available at:
   ```text
   http://localhost:5000/api
   ```

## Included modules
- Certificate requests
- Lab equipment requests
- Maintenance requests
- Leave applications
- Service tracking dashboard
- Admin status progression

## Folder structure
```text
smart-campus-service-management/
├── client/
│   ├── src/
│   ├── index.html
│   └── package.json
├── server/
│   ├── data/
│   └── src/
├── package.json
├── .gitignore
└── README.md
```

## API examples
- GET /api/health
- GET /api/services
- GET /api/requests
- POST /api/requests
- PATCH /api/requests/:id/status
- GET /api/stats

## Next enhancements
- Authentication and role-based access
- Admin approval workflows
- Email/SMS notifications
- File upload for requests
- Database migration to MongoDB or PostgreSQL
- Reporting and analytics dashboards
