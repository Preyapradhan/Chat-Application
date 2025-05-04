import React, { useEffect, useState, useRef } from "react";
import { MessageCircle, Video, Phone, MoreVertical, Paperclip, Image, Mic, Send, Camera } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import {
  updateDoc,
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  where,
} from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Message from "./Message";
import Groups from "./Groups";
import "../styles/chatroom.scss";

const CLOUDINARY_PRESET = "ml_default";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dvljtzv4r/upload";

const ChatRoom = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
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

  // Separate message fetching logic for clarity
  useEffect(() => {
    if (!user) return;

    let unsubscribe = () => {};

    if (selectedChat) {
      // Individual chat messages
      const q = query(
        collection(db, "messages"),
        where("participants", "array-contains", user.uid)
      );

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((msg) => msg.participants?.includes(selectedChat.id))
          .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        setMessages(msgs);
        scrollToBottom();
      });
    } else if (selectedGroup) {
      // Group chat messages
      const q = query(
        collection(db, "messages"),
        where("groupId", "==", selectedGroup.id)
      );

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
        setMessages(msgs);
        scrollToBottom();
      });
    }

    return () => unsubscribe();
  }, [selectedChat, selectedGroup, user]);

  const addUserToFirestore = async (currentUser) => {
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, {
      id: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      photoURL: currentUser.photoURL || "/images/addAvatar.png",
    }, { merge: true });
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      const uploadedFileUrl = response.data.secure_url;
      
      // Update Firestore with new profile picture
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL: uploadedFileUrl });
      
      // Update local state to reflect change immediately
      setUser((prevUser) => ({ ...prevUser, photoURL: uploadedFileUrl }));
    } catch (error) {
      console.error("Profile picture upload failed", error);
    }
  };

  const fetchContacts = async (currentUserId) => {
    const usersCollection = await getDocs(collection(db, "users"));
    const usersData = usersCollection.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user) => user.id !== currentUserId);
    setContacts(usersData);
  };

  const sendMessage = async (messageContent, type = "text") => {
    if (!messageContent || (!selectedChat && !selectedGroup)) return;
  
    const messageData = {
      text: type === "text" ? messageContent : "",
      fileUrl: type !== "text" ? messageContent : "",
      fileType: type,
      senderId: user.uid,
      userName: user.displayName || "Anonymous",
      avatar: user.photoURL || "/images/addAvatar.png",
      timestamp: serverTimestamp(),
    };
  
    if (selectedChat) {
      // Individual chat message
      messageData.receiverId = selectedChat.id;
      messageData.participants = [user.uid, selectedChat.id];
    } else if (selectedGroup) {
      // Group chat message
      messageData.groupId = selectedGroup.id;
      messageData.groupName = selectedGroup.name;
    }
  
    await addDoc(collection(db, "messages"), messageData);
    setNewMessage("");
  };

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
      const uploadedFileUrl = response.data.secure_url;
      sendMessage(uploadedFileUrl, fileType);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteChat = async () => {
    if (!selectedChat && !selectedGroup) return;

    let q;
    
    if (selectedChat) {
      q = query(
        collection(db, "messages"),
        where("participants", "array-contains", user.uid)
      );
    } else if (selectedGroup) {
      q = query(
        collection(db, "messages"),
        where("groupId", "==", selectedGroup.id),
        where("senderId", "==", user.uid)
      );
    }

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      if (doc.data().senderId === user.uid) {
        await deleteDoc(doc.ref);
      }
    });
    
    setMessages([]);
  };

  const blockUser = async () => {
    if (!selectedChat) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      blockedUsers: selectedChat.id,
    });
  };

  const exportChat = () => {
    if (messages.length === 0) return;

    const chatTitle = selectedChat ? `chat_with_${selectedChat.displayName}` : `group_${selectedGroup.name}`;
    const chatData = messages
      .map((msg) => `${msg.userName}: ${msg.text || msg.fileUrl}`)
      .join("\n");

    const blob = new Blob([chatData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chatTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle chat/group selection
  const handleChatSelect = (selected) => {
    if (selected.isGroup) {
      setSelectedChat(null);
      setSelectedGroup(selected);
    } else {
      setSelectedGroup(null);
      setSelectedChat(selected);
    }
  };

  return (
    <div className="chatroom whatsapp-style"> 
      <div className="chat-container">
        <Sidebar
          currentUser={user}
          selectUser={handleChatSelect}
        />

        <div className="chat-section">
          {(selectedChat || selectedGroup) ? (
            <>
              <nav className="navbar">
                <label>
                  <img
                    src={
                      selectedChat
                        ? selectedChat.photoURL || "/images/addAvatar.png"
                        : "/images/group-icon.png"
                    }
                    alt="Chat Avatar"
                    className="avatar"
                  />
                  {selectedChat && (
                    <>
                      <Camera className="camera-icon" />
                      <input type="file" accept="image/*" hidden onChange={handleProfilePictureChange} />
                    </>
                  )}
                </label>
                <h1 className="logo">
                  {selectedChat ? selectedChat.displayName : selectedGroup?.name}
                </h1>

                <div className="nav-icons">
                  <Video className="icon" title="Video Call" />
                  <Phone className="icon" title="Voice Call" />
                  <MoreVertical className="icon" title="More Options" onClick={() => setShowOptions(!showOptions)} />
                  
                  {showOptions && (
                    <div className="dropdown">
                      <button onClick={deleteChat}>Delete Chat</button>
                      {selectedChat && <button onClick={blockUser}>Block User</button>}
                      <button onClick={exportChat}>Export Chat</button>
                    </div>
                  )}
                </div>
              </nav>
              <div className="messages whatsapp-chat">
                {messages.map((msg) => (
                  <Message 
                    key={msg.id} 
                    msg={msg} 
                    currentUser={user} 
                    isGroupMessage={!!selectedGroup}
                  />
                ))}
                <div ref={messagesEndRef}></div>
              </div>
              <div className="message-input whatsapp-input">
                <label>
                  <Paperclip className="icon" />
                  <input type="file" onChange={(e) => handleFileUpload(e, "file")} hidden />
                </label>
                <label>
                  <Image className="icon" />
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} hidden />
                </label>
                <label>
                  <Mic className="icon" />
                  <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, "audio")} hidden />
                </label>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage, "text")}
                />
                <Send className="icon send" onClick={() => sendMessage(newMessage, "text")} />
              </div>
            </>
          ) : (
            <Groups 
              user={user} 
              selectGroup={(group) => {
                setSelectedChat(null);
                setSelectedGroup(group);
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;