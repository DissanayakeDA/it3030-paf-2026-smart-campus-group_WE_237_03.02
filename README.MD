# 🏫 Smart Campus Operations Hub

## 📌 Project Overview

This project is developed as part of the **IT3030 – Programming Applications and Frameworks (PAF)** module.

The system is a **Smart Campus Operations Hub** that allows universities to manage:

- Facility & asset bookings (rooms, labs, equipment)
- Maintenance & incident tickets
- Notifications
- Role-based access control

The application follows a **full-stack architecture** using:

- **Frontend:** React (Vite + TypeScript + Tailwind CSS)
- **Backend:** Spring Boot (Java)
- **Database:** PostgreSQL
- **Version Control:** GitHub (Monorepo)

---

## 🛠️ Tech Stack

### 🔹 Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

### 🔹 Backend

- Spring Boot
- Spring Data JPA
- Spring Security
- REST API
- Maven

### 🔹 Database

- PostgreSQL

---

## 📁 Project Structure

```
smart-campus-frontend/
├── frontend/        # React application
├── backend/         # Spring Boot application
├── README.md
└── .gitignore
```

---

## 🚀 Setup Instructions

### 🔹 1. Clone Repository

```bash
git clone https://github.com/YOUR-USERNAME/it3030-paf-2026-smart-campus-groupXX.git
cd it3030-paf-2026-smart-campus-groupXX
```

---

### 🔹 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

### 🔹 3. Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```powershell
.\mvnw spring-boot:run
```

Backend will run on:

```
http://localhost:8080
```

---

### 🔹 4. Database Setup

- Install PostgreSQL
- Create database:

```sql
CREATE DATABASE smart_campus_db;
```

Update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_campus_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

---

## 🔐 Features

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
- Assign technicians
- Update status
- Add comments

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

- API tested using Postman
- Validation and error handling implemented
- Unit / integration testing (optional)

---

## 📷 Evidence

- Screenshots included in the final report
- Demonstration during viva

---

## ⚙️ Git Workflow

- Feature-based commits
- No bulk commits
- Clear commit messages
- Individual contributions tracked

---

## 📄 Submission Details

- GitHub Repository (public or accessible)
- Final PDF report
- Working system (local)

---

## 📌 Notes

- Follow REST API best practices
- Use proper HTTP status codes
- Maintain clean architecture
- Ensure secure file handling

---

## 👨‍💻 Author

Developed as a group project for **SLIIT – Faculty of Computing**
