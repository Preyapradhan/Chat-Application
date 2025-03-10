import React, { useState, useEffect } from "react";
import { query, where, orderBy, limit, collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FaSearch } from "react-icons/fa";
import Sidenav from "./sidenav";
import "../styles/sidebar.scss";

const Sidebar = ({ selectUser, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), async (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersData);
      setCurrentUserData(usersData.find(user => user.id === currentUser?.uid));
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || users.length === 0) return;

    users.forEach((user) => {
      const chatId =
        currentUser.uid > user.id
          ? `${currentUser.uid}_${user.id}`
          : `${user.id}_${currentUser.uid}`;

      const lastMessageQuery = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const unsubscribeLastMessage = onSnapshot(lastMessageQuery, (snapshot) => {
        if (!snapshot.empty) {
          const lastMessageData = snapshot.docs[0].data();
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === user.id ? { ...u, lastMessage: lastMessageData.text || "Media file" } : u
            )
          );
          if (user.id === currentUser.uid) {
            setCurrentUserData(prev => ({ ...prev, lastMessage: lastMessageData.text || "Media file" }));
          }
        }
      });

      return () => unsubscribeLastMessage();
    });
  }, [users, currentUser]);

  return (
    <div className="sidebar">
      <Sidenav user={users} />
      <div className="sidebar-header">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="users-list">
        {currentUserData && (
          <div className="user current-user">
            <img src={currentUserData.photoURL || "/images/addAvatar.png"} alt={currentUserData.displayName} />
            <div className="user-info">
              <h4>{currentUserData.displayName}</h4>
              <p className="last-message">{currentUserData.lastMessage || "No messages yet"}</p>
            </div>
          </div>
        )}

        {users.length > 0 ? (
          users
            .filter((user) => user.id !== currentUser?.uid)
            .filter((user) =>
              user.displayName?.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => (
              <div key={user.id} className="user" onClick={() => selectUser(user)}>
                <img src={user.photoURL || "/images/addAvatar.png"} alt={user.displayName} />
                <div className="user-info">
                  <h4>{user.displayName}</h4>
                  <p className="last-message">{user.lastMessage || "No messages yet"}</p>
                </div>
                {user.unread && <span className="unread-dot"></span>}
              </div>
            ))
        ) : (
          <p className="no-users">No contacts available</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
