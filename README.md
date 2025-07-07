# 💬 MERN Stack Chat App

A full-featured, real-time one-to-one chat application — inspired by WhatsApp — built using the MERN stack. It allows users to exchange messages, upload profile pictures, share images/files, edit or delete messages, and even register or log in securely using **Passkey-based WebAuthn MFA**. The app features a dark, modern, WhatsApp-like UI.

---

## 🚀 Features

- 🔒 **Passkey (WebAuthn) Login** – Advanced MFA for maximum security
- 💬 **Real-time One-to-One Chat** – Seamless message exchange
- 📤 **File & Image Sharing** – Supports PDFs, DOCX, JPEG, PNG, etc.
- 🖼️ **Profile Picture Upload** – Show off your avatar
- 📝 **Edit/Delete Messages** – Full CRUD on chat messages
- 🎨 **WhatsApp-like Dark UI** – Sleek and intuitive interface
- 🔐 **JWT Auth** – Secure endpoints with token-based authorization

---

## 🛠 Tech Stack

### Frontend:
- React.js
- Tailwind CSS (for styling)
- WebAuthn API (Passkeys)
- EventSource / Fetch API (for real-time simulation)

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- Multer (file uploads)
- simplewebauthn (Passkey support)
- JSON Web Token (JWT)
- Child Process (Python script execution for extra features, if any)

---

## 📦 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mern-chat-app.git
cd mern-chat-app
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Create Environment Variables

#### Backend `.env`
```env
PORT=5000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
RP_ID=localhost
ORIGIN=http://localhost:3000
```

#### Frontend `.env`
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### 4. Run the App

#### Start Backend
```bash
cd backend
npm start
```

#### Start Frontend
```bash
cd frontend
npm start
```

### ✅ Your app should now be running at:
```bash
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## 🧠 Folder Structure (Basic)

```
mern-chat-app/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
```

---

## 👨‍💻 Author

**Huzefa Dayanji**  
🔗 [LinkedIn](https://www.linkedin.com/in/huzefa-dayanji-74b811373)

---

## 🛡️ License

This project is licensed under the MIT License.

---

## ✨ Future Scope

- Group Chat Support
- End-to-End Encryption
- PWA Integration
- Push Notifications

---

## 📌 Note

> This project is currently under active development. Stay tuned for deployment updates and advanced features.
