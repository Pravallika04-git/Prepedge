# PrepEdge - Placement Preparation Portal

PrepEdge is a comprehensive, full-stack placement preparation portal designed to help students prepare for campus recruitment and technical interviews.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Vanilla CSS & Modern Design System
- **Routing:** React Router 7
- **Data Visualization:** Chart.js & react-chartjs-2
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** Spring Boot 3.3.1 (Java 20)
- **Security:** Spring Security with JWT Authentication
- **Data Access:** Spring Data JPA / Hibernate
- **Database:** MySQL
- **Build Tool:** Apache Maven

---

## 🛠️ Project Structure

```
AD Project/
├── backend/                  # Spring Boot application
│   ├── src/main/java/        # Controllers, Services, Models, Repositories
│   ├── src/main/resources/   # application.properties & database configuration
│   ├── pom.xml               # Maven configuration
│   └── start-backend.bat     # Windows launcher for backend
├── frontend/                 # React + Vite application
│   ├── src/                  # Components, Pages, Context, Services
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite dev server & proxy settings
├── schema.sql                # MySQL Database schema & seed data
├── start-all.bat             # Unified launcher for both frontend & backend
└── package.json              # Root npm scripts
```

---

## ⚡ Getting Started

### 1. Database Setup
1. Ensure MySQL server is running on port `3306`.
2. Import or run `schema.sql` to initialize the `placement_portal` database:
   ```bash
   mysql -u root -p < schema.sql
   ```
3. Update database credentials in `backend/src/main/resources/application.properties` if needed.

### 2. Running Frontend & Backend
You can launch both services together with:
```cmd
start-all.bat
```
Or start each service separately:
- **Backend:**
  ```cmd
  cd backend
  start-backend.bat
  ```
  Backend runs at: `http://localhost:8080/api`
- **Frontend:**
  ```bash
  npm run dev
  ```
  Frontend runs at: `http://localhost:5173/`
