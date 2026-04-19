# 🏫 Smart Campus Operations Hub

## 📌 Project Overview

This project is developed as part of the **IT3030 – Programming Applications and Frameworks (PAF)** module.

The system is a **Smart Campus Operations Hub** that allows universities to manage:

- Facility & asset bookings (rooms, labs, equipment)
- Maintenance & incident tickets with attachments and comments
- Notifications
- OAuth2 login (Google) + role-based access control

The application follows a **full-stack architecture** using:

- **Frontend:** React 19 (Vite + TypeScript + Tailwind CSS v4)
- **Backend:** Spring Boot (Java 21)
- **Database:** PostgreSQL
- **Containerization:** Docker

---

## 🛠️ Tech Stack

### 🔹 Frontend

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Axios
- React Router v7

### 🔹 Backend

- Spring Boot (Java 21)
- Spring Data JPA
- Spring Security + OAuth2 Client (Google)
- REST API
- Maven

### 🔹 Database

- PostgreSQL

---

## 📁 Project Structure

```
it3030-paf-2026-smart-campus-group_WE_237_03.02/
├── smart-campus-backend/     # Spring Boot application (Java 21)
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── smart-campus-frontend/    # React + Vite application
│   ├── src/
│   └── package.json
└── README.MD
```

---

## 🚀 Setup Instructions

### 🔹 1. Clone Repository

```bash
git clone https://github.com/YOUR-USERNAME/it3030-paf-2026-smart-campus-group_WE_237_03.02.git
cd it3030-paf-2026-smart-campus-group_WE_237_03.02
```

---

### 🔹 2. Frontend Setup

```bash
cd smart-campus-frontend
npm install
npm run dev
```

Available scripts:

- `npm run dev` — start Vite dev server
- `npm run build` — production build (`tsc -b && vite build`)
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

Frontend runs on: `http://localhost:5173`

---

### 🔹 3. Backend Setup

```bash
cd smart-campus-backend
./mvnw spring-boot:run
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs on: `http://localhost:8080`

#### OAuth2 (Google) environment variables

Set these before starting the backend:

```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
export APP_OAUTH2_REDIRECT_SUCCESS_URI=http://localhost:5173/oauth2/callback
export APP_OAUTH2_REDIRECT_FAILURE_URI=http://localhost:5173/login
```

In your Google Cloud OAuth app (Web application), add this authorized redirect URI:

```text
http://localhost:8080/auth/oauth2/callback/google
```

---

### 🔹 4. Database Setup

- Install PostgreSQL
- Create database:

```sql
CREATE DATABASE smart_campus_db;
```

Update `smart-campus-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_campus_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

---

## 🐳 Docker Setup

### 🔹 Build and run the backend container

From the repository root:

```bash
cd smart-campus-backend
docker build -t smart-campus-backend:latest .
```

Run the container (connecting to a local PostgreSQL on the host):

```bash
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://host.docker.internal:5432/smart_campus_db" \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=YOUR_PASSWORD \
  -e GOOGLE_CLIENT_ID=your-google-client-id \
  -e GOOGLE_CLIENT_SECRET=your-google-client-secret \
  -e APP_OAUTH2_REDIRECT_SUCCESS_URI=http://localhost:5173/oauth2/callback \
  -e APP_OAUTH2_REDIRECT_FAILURE_URI=http://localhost:5173/login \
  --name smart-campus-backend \
  smart-campus-backend:latest
```

### 🔹 Quick PostgreSQL via Docker

```bash
docker run --name smart-campus-db \
  -e POSTGRES_DB=smart_campus_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:16
```

### 🔹 Useful Docker commands

```bash
docker ps                         # list running containers
docker logs -f smart-campus-backend
docker stop smart-campus-backend
docker rm smart-campus-backend
docker image rm smart-campus-backend:latest
```

---

## 🔐 Features & API Modules

| Module | Controller | Description |
| ------ | ---------- | ----------- |
| Authentication | `AuthController` | Local login/register + Google OAuth2 callback |
| Users | `UserController` | User profile & role management |
| Resources | `ResourceController` | Manage rooms, labs, equipment (admin) |
| Bookings | `BookingController` | Create / approve / reject / cancel bookings with conflict detection |
| Tickets | `TicketController` | Create tickets, assign technicians, track SLA |
| Ticket Comments | `TicketCommentController` | Threaded comments on tickets |
| Ticket Attachments | `TicketAttachmentController` | Upload / download ticket attachments |

### 📌 Module A – Facilities & Assets

- Manage resources (rooms, labs, equipment)
- Search and filter resources

### 📌 Module B – Booking Management

- Create booking requests
- Approve / Reject / Cancel bookings
- Conflict detection

### 📌 Module C – Maintenance & Tickets

- Create incident tickets
- Upload attachments
- Assign technicians (`assignedTechnicianName` surfaced in responses)
- Update status
- Add comments
- Track created-by user (`createdByUserName`)

### 📌 Module D – Notifications

- Booking updates
- Ticket status alerts
- Comment notifications

### 📌 Module E – Authentication & Authorization

- OAuth 2.0 login (Google)
- Role-based access (USER / ADMIN / TECHNICIAN)

---

## 🌟 Novelty Feature (Member 3)

### ⏱️ Service-Level Timer (SLA Tracking)

- Tracks ticket response and resolution time
- Measures:
  - Time-to-first-response
  - Time-to-resolution

---

## 👥 Team Contributions

| Member   | Responsibility                 |
| -------- | ------------------------------ |
| Member 1 | Facilities & Assets            |
| Member 2 | Booking Management             |
| Member 3 | Ticket System + SLA Feature    |
| Member 4 | Notifications + Authentication |

---

## 🧪 Testing

- API tested using Postman (collection under `smart-campus-backend/postman/`)
- Validation and error handling implemented

---

## ⚙️ Git Workflow

- Feature-based commits
- Clear commit messages
- Individual contributions tracked

---

## 📄 Submission Details

- GitHub Repository (public or accessible)
- Final PDF report
- Working system (local / Docker)

---

## 👨‍💻 Author

Developed as a group project for **SLIIT – Faculty of Computing**
