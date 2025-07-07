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

### ScreenShots

Login Screen
![ss1](https://github.com/user-attachments/assets/e3a41e98-fa51-459b-8a9c-8b091b470c65)

Signup Screen
![ss6](https://github.com/user-attachments/assets/debb7f39-18dc-4f48-87fc-31ae288eaf55)


Passkey-Based MFA Screen (If user has setup a passkey)
![ss2](https://github.com/user-attachments/assets/0d278b24-8643-4eac-bfc6-e80c8018ac98)

Forgot Password Screen
![ss7](https://github.com/user-attachments/assets/b650cbf0-27fd-4c72-b483-8d1855312bc9)

Home Screen
![ss3](https://github.com/user-attachments/assets/647acf08-2674-4e9f-852c-f2d570f6fa0e)

Manage Profile Screen
![ss4](https://github.com/user-attachments/assets/51cf68a8-beab-475f-af79-93d5ebf00670)

Chat Screen
![ss5](https://github.com/user-attachments/assets/7d00e8ce-f77a-468d-9232-67809bab3f99)

Password Reset Email
![ss8](https://github.com/user-attachments/assets/183d8235-d4f3-4ae0-9572-2ab9a2724ae7)
![ss9](https://github.com/user-attachments/assets/ed3d0568-90cc-4615-95da-876234b7f6c6)
![ss10](https://github.com/user-attachments/assets/5f09499b-c4c0-40d4-aaf9-6bb0c41da05e)






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
