# Expert Health Diagnosis System

The **Expert Health Diagnosis System** is a comprehensive web application designed to bridge the gap between patients and healthcare providers. Built with a robust **Spring Boot** backend and a responsive **HTML/CSS/JS** frontend, this platform facilitates seamless interaction through appointment booking, real-time chat, video consultations, and automated health assessments.

## 🚀 Key Features

*   **👥 Multi-Role Architecture**: Secure access and workflows for **Admin**, **Doctor**, and **Patient** roles.
*   **📅 Appointment Management**: Full-featured system for booking, rescheduling, and managing doctor slots.
*   **💬 Real-time Communication**: Integrated **Chat** and **Video Call** functionality using WebSockets.
*   **🩺 Health Assessments**: Interactive questionnaires to provide preliminary health insights.
*   **📊 Admin Dashboard**: Comprehensive control panel for managing users, doctors, appointments, and system content.
*   **🔒 Secure Authentication**: Role-based access control secured with **JWT**.

## 🛠️ Technology Stack

### Backend
*   **Java 17**
*   **Spring Boot 3.4.2**
*   **Spring Security** (JWT Authentication)
*   **Spring Data JPA**
*   **Spring WebSocket**
*   **H2 Database** (File-based storage) / MySQL capable

### Frontend
*   **HTML5**
*   **CSS3**
*   **Vanilla JavaScript**

## 📂 Project Structure

```
Expert_Health_Diagnosis/
├── backend_app/         # Spring Boot Backend source code
│   ├── src/
│   └── pom.xml
├── frontend_app/        # Frontend HTML/CSS/JS files
│   ├── css/
│   ├── js/
│   └── *.html
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites
*   **Java JDK 17** or higher installed.
*   **Maven** installed (or use the included wrapper if available).

### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend_app
    ```
2.  Build the application:
    ```bash
    mvn clean install
    ```
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
    *   The server will start on `http://localhost:8080`.
    *   **Database**: The app uses an H2 file-based database stored in `./data/health_diagnosis`.
    *   **H2 Console**: Access at `http://localhost:8080/h2-console`
        *   **JDBC URL**: `jdbc:h2:file:./data/health_diagnosis`
        *   **User**: `sa`
        *   **Password**: `password`

### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend_app
    ```
2.  Open `index.html` in your web browser.
    *   For the best experience (and to avoid CORS issues), it is recommended to serve the frontend using a lightweight server like **Live Server** (VS Code extension) or `http-server` (Node.js).

## 📖 Usage

1.  **Register/Login**:
    *   Open the frontend application.
    *   Register as a **Patient** or **Doctor**.
    *   Login to access your dashboard.
2.  **Admin Access**:
    *   Admin accounts are typically pre-configured or created directly in the database.
3.  **Booking**:
    *   Patients can view doctor availability and book slots.
4.  **Chat/Video**:
    *   Navigate to the Chat or Video sections to communicate (requires active appointments/sessions).

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
