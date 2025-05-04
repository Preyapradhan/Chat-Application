# 💬 Chat Application - Real-Time Messaging App (React + Firebase)

A fully functional real-time chat application built with **React** and **Firebase**, featuring sleek UI components, responsive design, and support for real-time communication between users. Perfect for personal messaging, as a foundation for more advanced communication platforms.

![Chat Application Banner](https://github.com/user-attachments/assets/a7fa9a02-5b67-4ad8-861c-ece1acfa8d13?auto=format&fit=crop&q=80&w=800)

## Features

- **Real-time Messaging**: Send and receive messages instantly.
- **Group Chats**: Create and participate in group conversations.
- **File Sharing**: Share images, audio, and other files.
- **User Management**: Block users, update profile pictures, and export chat history.
- **Responsive Design**: Optimized for various screen sizes.

## Technologies Used

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **React Router**: For navigation and routing between pages.
- **Lucide-React**: Icon library for UI components.
- **SCSS**: For styling the application with modular and reusable styles.

### Backend
- **Firebase Firestore**: A NoSQL cloud database for storing user and message data.
- **Firebase Authentication**: For user authentication and session management.

### Cloud Services
- **Cloudinary**: For uploading and managing media files like images and audio.

### Other Tools
- **Axios**: For making HTTP requests to Cloudinary.
- **Git**: Version control system for managing code changes.

## Project Structure

```
chat-app/
├── src/
│   ├── components/
│   │   ├── ChatRoom.js       # Main chat interface
│   │   ├── Sidebar.js        # Sidebar for user and group selection
│   │   ├── Message.js        # Component for displaying individual messages
│   │   ├── Groups.js         # Component for managing group chats
│   ├── styles/
│   │   ├── chatroom.scss     # Styles for the chatroom
│   │   ├── sidebar.scss      # Styles for the sidebar
│   │   ├── message.scss      # Styles for messages
│   │   ├── groups.scss       # Styles for group management
│   ├── firebaseConfig.js     # Firebase configuration
│   ├── App.js                # Main application entry point
├── package.json              # Project dependencies
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Preyapradhan/Chat-Application.git
   cd Chat-Application
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore and Authentication.
   - Replace the contents of `firebaseConfig.js` with your Firebase configuration.

4. Set up Cloudinary:
   - Create a Cloudinary account at [Cloudinary](https://cloudinary.com/).
   - Replace `CLOUDINARY_PRESET` and `CLOUDINARY_UPLOAD_URL` in `ChatRoom.js` with your Cloudinary details.

5. Start the development server:
   ```bash
   npm start
   ```

## Usage

- **Login**: Authenticate using Firebase Authentication.
- **Chat**: Select a user or group from the sidebar to start chatting.
- **File Sharing**: Use the attachment icons to upload and share files.
- **Profile Picture**: Update your profile picture by clicking on the avatar.
- **Export Chat**: Export chat history as a `.txt` file.

## Screenshots

### Chat Interface
![Screenshot 2025-05-04 193019](https://github.com/user-attachments/assets/a709fd80-0b5b-4338-8cb6-21b69c004742)


### Group Chat

![Screenshot 2025-05-04 193545](https://github.com/user-attachments/assets/ced03b84-9643-4a30-84a8-52ddcae72c89)

![Screenshot 2025-05-04 193205](https://github.com/user-attachments/assets/1374ae84-79fd-4b7b-9fe6-14f348d9213f)


### File Sharing
![Screenshot 2025-05-04 193239](https://github.com/user-attachments/assets/6a291684-85a8-462b-9180-258eeb6a1928)


## Acknowledgments

- [Firebase](https://firebase.google.com/)
- [Cloudinary](https://cloudinary.com/)
- [Lucide Icons](https://lucide.dev/)
