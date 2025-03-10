import React, { useEffect, useState, useRef } from "react";
import { FaVideo, FaPhone, FaEllipsisV, FaPaperclip, FaImage, FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp,
  getDocs,
  setDoc,
  doc,
  where,
} from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Message from "./Message";
import "../styles/chatroom.scss";

const CLOUDINARY_PRESET = "ml_default";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dvljtzv4r/upload";

const ChatRoom = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
        await addUserToFirestore(currentUser);
        fetchContacts(currentUser.uid);
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!selectedChat || !user) return;
  
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid)
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.participants.includes(selectedChat.id))
        .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)); // Sort messages by timestamp
  
      setMessages(msgs);
      scrollToBottom();
    });
  
    return () => unsubscribe();
  }, [selectedChat, user]);
  
  const addUserToFirestore = async (currentUser) => {
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, {
      id: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      photoURL: currentUser.photoURL || "/images/addAvatar.png",
    }, { merge: true });
  };

  const fetchContacts = async (currentUserId) => {
    const usersCollection = await getDocs(collection(db, "users"));
    const usersData = usersCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((user) => user.id !== currentUserId);
    setContacts(usersData);
  };

  const sendMessage = async (messageContent, type = "text") => {
    if (!messageContent || !selectedChat) return;
  
    await addDoc(collection(db, "messages"), {
      text: type === "text" ? messageContent : "",
      fileUrl: type !== "text" ? messageContent : "",
      fileType: type,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      avatar: user.photoURL || "/images/addAvatar.png",
      receiverId: selectedChat.id,
      participants: [user.uid, selectedChat.id],
      timestamp: serverTimestamp(),
      
    });
  
    setNewMessage("");
  };
  

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);
  
    try {
      const response = await axios.post(
        CLOUDINARY_UPLOAD_URL,
        formData
      );
  
      const uploadedFileUrl = response.data.secure_url;
  
      sendMessage(uploadedFileUrl, fileType);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };
  
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="chatroom whatsapp-style"> 
      <div className="chat-container">
        <Sidebar user={user} selectUser={setSelectedChat} />
        <div className="chat-section">
          {selectedChat ? (
            <>
              <nav className="navbar">
                <img src={selectedChat.avatar} alt="User Avatar" className="avatar" />
                <h1 className="logo">{selectedChat.displayName}</h1>
                <div className="nav-icons">
                  <FaVideo className="icon" title="Video Call" />
                  <FaPhone className="icon" title="Voice Call" />
                  <FaEllipsisV className="icon" title="More Options" />
                </div>
              </nav>
              <div className="messages whatsapp-chat">
                {messages.map((msg) => (
                  <Message key={msg.id} msg={msg} currentUser={user} />
                ))}
                <div ref={messagesEndRef}></div>
              </div>
              <div className="message-input whatsapp-input">
                <label>
                  <FaPaperclip className="icon" />
                  <input type="file" onChange={(e) => handleFileUpload(e, "file")} hidden />
                </label>
                <label>
                  <FaImage className="icon" />
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} hidden />
                </label>
                <label>
                  <FaMicrophone className="icon" />
                  <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, "audio")} hidden />
                </label>
                <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                <FaPaperPlane className="icon send" onClick={() => sendMessage(newMessage, "text")} />
              </div>
            </>
          ) : (
            <p>Select a contact to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
