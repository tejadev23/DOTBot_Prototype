# DOTBot – GDOT Contractor Assistant

This is the frontend + API integration project for DOTBot, the assistant for GDOT Contractors. It includes Firebase Authentication and secure backend APIs built with Firebase Cloud Functions and MongoDB.

---

## 🔧 Prerequisites

- Node.js (v18+)
- Firebase CLI
- MongoDB Atlas account (used via backend)
- A Firebase Project (already setup: `dotbot-34790`)

---

## 📁 Setup Instructions

1. **Clone the Repo**
   ```bash
   git clone https://github.com/tejadev23/DOTBot_Prototype.git
   cd dotbot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Add Firebase Config**
   In `src/auth/firebase.js`, paste the Firebase SDK config:
   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "dotbot-34790.firebaseapp.com",
     projectId: "dotbot-34790",
     storageBucket: "dotbot-34790.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Run the Frontend**
   ```bash
   npm start
   ```

---

## 🔐 Authentication Supported

- Email/Password Signup
- Login
- Google Login
- Facebook Login
- Forgot Password

All users are authenticated via Firebase Auth. After login, `idToken` is used to authorize backend API requests.

---

## 📡 Backend API

Backend is deployed on Firebase Cloud Functions:

> **Base URL**: `https://api-azjv7cvnxq-uc.a.run.app`

### Available Endpoints:
| Endpoint                | Method | Auth? | Description                     |
|------------------------|--------|-------|---------------------------------|
| `/auth/signup`         | POST   | ❌    | Register user                   |
| `/auth/reset-password` | POST   | ❌    | Send reset email                |
| `/auth/social-login`   | POST   | ✅    | Google/Facebook login handler   |
| `/save-chat`           | POST   | ✅    | Save chat (prompt + response)   |
| `/chat`                | POST   | ✅    | Get DOTBot placeholder reply    |
| `/get-chat-history`    | GET    | ✅    | Fetch user chat history         |

---

## 🧪 API Testing

Use the included Postman collection:  
📁 `DOTBot_API_Collection_<date>.json`  
Import into Postman to test all routes.

---

## 🧠 Notes

- MongoDB stores users & chat data (`dotbot.users`, `dotbot.chats`)
- GPT integration is mocked for now (real responses coming soon)

---

## 👨‍💻 Developed by Vishnu @ GDOT Contractor
