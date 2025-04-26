# 💬 Chat Application - Real-Time Messaging App (React + Firebase)

A fully functional real-time chat application built with **React** and **Firebase**, featuring sleek UI components, responsive design, and support for real-time communication between users. Perfect for personal messaging, as a foundation for more advanced communication platforms.

![Chat Application Banner](https://github.com/user-attachments/assets/a7fa9a02-5b67-4ad8-861c-ece1acfa8d13?auto=format&fit=crop&q=80&w=800)

## 🚀 Features

- 💬 Real-time messaging powered by Firebase
- 🔐 Secure user authentication (email/password or Google sign-in)
- 🧑‍🤝‍🧑 Support for multiple users and chat rooms
- 🗂️ Display all active users and recent messages in the sidebar
- 👤 User profile with avatar and last message shown
- 📱 Fully responsive, modern UI 

## 🛠️ Tech Stack

- **Frontend:**
  - React 18
  - React Router DOM
  - Zustand (state management)
  - Lucide React (icons)

- **Backend:**
  - Firebase Firestore (real-time database)
  - Firebase Auth (user authentication)
  - Firebase Storage (for profile images, if used)
  - Cloudinary (third-party platform for media library)

## 🧠 Features in Detail

- 🔄 Real-time synchronization with Firestore
- 👥 Sidebar with all user contacts and their last message
- 🖼️ Avatar support during sign-up/login
- 🧭 Navigation with dynamic chat room routing 
- 🗂️ Handling media library through third-party platform

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/Preyapradhan/Chat-Application.git
cd Chat-Application
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Firestore, Authentication (Email/Password or Google), and Firebase Storage
- Add your Firebase config to `.env`:
```env
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

4. **Start the development server**
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── components/       # Reusable components (Message, Sidebar, Navbar, etc.)
├── pages/            # ChatRoom and Auth pages
├── store/            # Zustand store
├── lib/              # Firebase utilities and helpers
└── assets/           # Avatars and static media
```

## 📦 Additional Features

- 👀 Real-time typing indicators (optional)
- 🌙 Dark mode support (optional)
- 📎 File/image attachment support (extendable)
- 🔔 Notification support (extendable)

## 🙏 Acknowledgments

- Firebase for the backend services
- Cloudinary for Multi-media Library
- Lucide React for icons
- UI design inspired by popular chat applications

## 🖼️ Chat Application Images

![Screenshot 2025-03-31 110502](https://github.com/user-attachments/assets/f4edc610-69bd-4bb0-b5c7-2465e6cf50c0)


![Screenshot 2025-03-31 110526](https://github.com/user-attachments/assets/93015090-f31c-4330-9a77-698c992076e5)


![Screenshot 2025-04-02 153148](https://github.com/user-attachments/assets/967c2b16-ecab-40ec-8f77-721cec20c5c6)


![Screenshot 2025-04-02 153231](https://github.com/user-attachments/assets/b03d3eb8-b09a-463b-ac95-733509e772d1)


![Screenshot 2025-04-02 153218](https://github.com/user-attachments/assets/97992477-2fd3-4d36-8098-e9a57924cd74)


