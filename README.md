# 🧩 WorkPro — Company Project Management Suite

A production-ready project management tool for companies. WorkPro centralises company profiles, team collaboration, task tracking, projects, and chat — with invitation links for seamless onboarding.

---

## 🌟 Overview

WorkPro helps companies:

- Create a company profile and invite members via links
- Manage roles: owner, manager, and employee
- Plan projects and assign tasks with statuses and priorities
- Collaborate in channels with conversation threads
- Organise teams and categories like a normal company workflow

---

## 🚀 Key Features

### 🏢 Company Profiles + Invitations
- Create company with profile fields (name, website, description)
- Invite via tokenized links; accept to auto-join with assigned role

### 🗂️ Projects & Tasks
- Project lifecycle statuses (planned, active, on-hold, completed)
- Tasks with `to-do`, `in-progress`, `blocked`, `done` + priority/due date
- Managers assign tasks; assignees update status

### 💬 Channels & Conversations
- Company channels with message threads
- Simple REST-based chat (WebSockets can be added later)

### 👤 User Accounts & Roles
- JWT authentication, secure profile updates
- Role-based access: owner, manager, employee

### 📱 Responsive UI/UX
- React + Tailwind UI, Vite tooling

---

## 🛠️ Tech Stack (MERN)

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
 - Role-aware controllers and middleware

### Database
- MongoDB
- Mongoose ODM

### Security
- JSON Web Tokens (JWT)
- Bcrypt.js for password hashing
- Protected API routes and middleware
 - Invitation tokens (TTL expiry)

---

## ☁️ Deployment

### 🐳 Dockerization
- Frontend and backend containerized using Docker
- Consistent environments across development and production
- Simplified deployment and scalability

### ⚙️ CI/CD Pipeline
- Automated CI/CD pipeline using **GitHub Actions**
- Automatically builds, tests, and deploys the application
- Reduces manual deployment errors

### 🖥️ Hosting
- Suitable for cloud VMs; Nginx reverse proxy included via frontend nginx.conf

### 🌐 Domain & DNS Management
- **Domain Provider:** Name.com
- **DNS Management:** Cloudflare
  - Secure DNS routing
  - Performance optimisation
  - HTTPS-ready configuration

---

## ⚙️ Environment Variables

Create `.env` in `backend/` with:

```
MONGO_URI=mongodb://localhost:27017/workpro
JWT_SECRET=changeme
APP_BASE_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

## 🔧 Quick Start (Dev)

Run backend and frontend locally:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

## 🧭 Key API Endpoints

- Companies: `POST /api/companies`, `GET /api/companies/mine`, `GET /api/companies/:id`
- Invitations: `POST /api/companies/:companyId/invitations`, `POST /api/companies/invitations/accept`
- Projects: `POST /api/projects`, `GET /api/projects?companyId=...`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`
- Tasks: `POST /api/tasks`, `GET /api/tasks?companyId=...`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`
- Channels: `POST /api/channels`, `GET /api/channels?companyId=...`, `POST /api/channels/:id/messages`, `GET /api/channels/:id/messages`

## 🧑‍💻 Frontend Pages

- Company Creation: `/company/create`
- Invitation Acceptance: `/invite/accept?token=...`
- Dashboard Tasks: `/dashboard/tasks`
- Dashboard Channels: `/dashboard/channels`

---
This repository now targets company project management workflows while keeping the original MERN foundation.
