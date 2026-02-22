# How "Expert Health Diagnosis" Works

> **Ideally, this project is like a very smart Restaurant.**
>
> *   **The Frontend (JavaScript/HTML)** is the **Waiter**. It shows you the menu (what you can do), takes your order (what you type/click), and brings you the food (data).
> *   **The Backend (Spring Boot)** is the **Kitchen**. It has the Chefs who cook (process logic), the Fridge where ingredients are kept (Database), and the Manager who checks if you are allowed to enter (Security).

---

## 1. The Waiter: Frontend (What You See)
The frontend is the "Face" of the application. It lives in your browser.

*   **HTML (`.html` files)**: This is the **Structure**. Just like the walls and tables of the restaurant.
    *   `index.html`: The entrance door.
    *   `dashboard.html`: The main table where you sit.
    *   `chat.html`: The private booth for talking.
*   **CSS (`.css` files)**: This is the **Decoration**. It makes the restaurant look fancy (colors, spacing, fonts).
*   **JavaScript (`.js` files)**: This is the **Waiter's Brain**.
    *   It listens when you click a button.
    *   It sends "fetch" requests (orders) to the Kitchen (Backend).
    *   **Example**: When you click "Login", `auth.js` takes your username/password and runs to the kitchen to check if they are correct.

---

## 2. The Kitchen: Backend (The Brains)
The backend lives on the server. It does all the heavy lifting. We use **Java Spring Boot**.

### A. The "Controllers" (The Head Chefs)
Each Chef creates a specific type of food.
*   **`AuthController`**: The Bouncer. Handles Login/Register. Checks your ID.
*   **`DoctorController`**: Manages doctor doctors profiles.
*   **`AppointmentController`**: Manages the reservation book.
*   **`ChatController`**: Handles passing notes between tables (messages).

### B. The "Services" (The Sous Chefs)
The Head Chef (Controller) shouts an order, and the Sous Chef (Service) actually does the work.
*   *Example*: Controller says "Book an appointment!". The Service checks the calendar, writes it down, and confirms it's free.

### C. The "Repository" & Database (The Fridge)
This is where we store data permanently so it's not lost when we turn off the lights.
*   We use **H2 Database** (a file-based fridge) or **MySQL**.
*   We store: Users, Appointments, Chat Messages, Notifications.

---

## 3. The "Special Magic": WebSockets (Real-Time Chat)
Normal web requests are like walking to the kitchen and asking "Is my food ready?" over and over.
**WebSockets** are like a **Phone Line**.
*   Once you open the Chat, we open a direct phone line between you and the other person.
*   When you type, it goes *instantly* to the other person without them needing to refresh the page.
*   **Code**: `ChatWebSocketHandler.java` acts as the telephone operator.

---

## 4. How a "User Journey" works

### Scenario: Booking an Appointment
1.  **YOU (Frontend)**: Click "Book Slot 10:00 AM" on the dashboard.
2.  **WAITER (JS)**: Sends a message `POST /api/appointments/book` to the backend.
3.  **MANAGER (Security)**: Checks "Is this person logged in?" (JWT Token).
4.  **CHEF (Controller)**: Receives the booking request.
5.  **SOUS CHEF (Service)**: Checks "Is 10:00 AM actually free?". If yes, saves it in the Fridge (Database).
6.  **RESPONSE**: Backend says "Success!".
7.  **WAITER (JS)**: Shows a green success message on your screen.

---

## 5. Summary for "The Sister Explanation"
> "I built a digital hospital.
> The **Java Backend** is the hospital staff and unseen machinery keeping everything running and safe.
> The **HTML/JS Frontend** is the reception area and rooms where people actually go.
> They talk to each other using 'API calls' (like passing notes) and 'WebSockets' (like a phone call) so doctors and patients can chat instantly."
