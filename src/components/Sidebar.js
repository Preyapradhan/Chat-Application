import React, { useState, useEffect, useRef } from "react";
import { query, where, orderBy, limit, collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Search, Users, User, MessageCircle } from "lucide-react";
import { db } from "../firebaseConfig";
import Sidenav from "./sidenav";
import "../styles/sidebar.scss";

const Sidebar = ({ selectUser, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUserData, setCurrentUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("contacts");
  const currentUserDataRef = useRef(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const unsubscribe = onSnapshot(collection(db, "users"), async (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        let currentUserInfo = null;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            currentUserInfo = { id: currentUser.uid, ...userDoc.data() };
            setCurrentUserData(currentUserInfo);
            currentUserDataRef.current = currentUserInfo;
            localStorage.setItem("currentUserData", JSON.stringify(currentUserInfo));
          }
        }

        const filteredUsers = usersData.filter((user) => user.id !== currentUser?.uid);
        setUsers([...filteredUsers]);
      });

      return () => unsubscribe();
    };

    fetchUsers();
  }, [currentUser]);

  // Fetch groups
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const groupData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isGroup: true,
      }));
      setGroups(groupData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch last messages for users and groups
  useEffect(() => {
    if (!currentUser) return;
    
    // For each user, get the last message
    users.forEach(async (user) => {
      const q = query(
        collection(db, "messages"),
        where("senderId", "in", [currentUser.uid, user.id]),
        where("receiverId", "in", [currentUser.uid, user.id]),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const lastMsg = querySnapshot.docs[0].data();
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.id === user.id 
                ? { 
                    ...u, 
                    lastMessage: lastMsg.fileType === "text" 
                      ? lastMsg.text 
                      : `Sent ${lastMsg.fileType}`,
                    lastMessageTime: lastMsg.timestamp
                  } 
                : u
            )
          );
        }
      });
      
      return () => unsubscribe();
    });
    
    // For each group, get the last message
    groups.forEach(async (group) => {
      const q = query(
        collection(db, "messages"),
        where("groupId", "==", group.id),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const lastMsg = querySnapshot.docs[0].data();
          setGroups(prevGroups => 
            prevGroups.map(g => 
              g.id === group.id 
                ? { 
                    ...g, 
                    lastMessage: 
                      lastMsg.senderId === "system"
                        ? lastMsg.text
                        : `${lastMsg.userName}: ${lastMsg.fileType === "text" 
                            ? lastMsg.text 
                            : `Sent ${lastMsg.fileType}`}`,
                    lastMessageTime: lastMsg.timestamp
                  } 
                : g
            )
          );
        }
      });
      
      return () => unsubscribe();
    });
  }, [currentUser, users.length, groups.length]);

  // Sort users and groups by last message time
  const sortedUsers = [...users].sort((a, b) => {
    const timeA = a.lastMessageTime?.seconds || 0;
    const timeB = b.lastMessageTime?.seconds || 0;
    return timeB - timeA;
  });
  
  const sortedGroups = [...groups].sort((a, b) => {
    const timeA = a.lastMessageTime?.seconds || 0;
    const timeB = b.lastMessageTime?.seconds || 0;
    return timeB - timeA;
  });

  // Filter by search
  const filteredUsers = sortedUsers.filter(
    (user) => user.displayName?.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredGroups = sortedGroups.filter(
    (group) => group.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sidebar">
      <Sidenav user={currentUserData} />

      <div className="sidebar-header">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts or groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <User size={18} />
            <span>Contacts</span>
          </button>
          <button 
            className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <Users size={18} />
            <span>Groups</span>
          </button>
        </div>
      </div>

      <div className="users-list">
        {activeTab === 'contacts' && (
          <>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="user"
                  onClick={() => selectUser({ ...user, isGroup: false })}
                >
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
          </>
        )}

        {activeTab === 'groups' && (
          <>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="user group-item"
                  onClick={() => selectUser(group)}
                >
                  <img src={group.photoURL || "/images/group-icon.png"} alt={group.name} />
                  <div className="user-info">
                    <h4>{group.name}</h4>
                    <p className="last-message">{group.lastMessage || "No messages yet"}</p>
                  </div>
                  {group.unread && <span className="unread-dot"></span>}
                </div>
              ))
            ) : (
              <p className="no-users">No groups available</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;