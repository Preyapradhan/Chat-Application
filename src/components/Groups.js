import React, { useState, useEffect } from "react";
import { 
  query, 
  collection, 
  where, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  getDocs, 
  updateDoc,
  doc 
} from "firebase/firestore";
import { UserPlus, Users } from "lucide-react";
import { db } from "../firebaseConfig";
import "../styles/groups.scss";

const Groups = ({ user, selectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  

  // Fetch groups where user is a member
  useEffect(() => {
    if (!user) return;
  
    const q = query(
      collection(db, "groups"),
      where("members", "array-contains", user.uid)
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const groupData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(groupData);
    });
  
    return () => unsubscribe();
  }, [user]);

  // Fetch available users for adding to groups
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const usersCollection = await getDocs(collection(db, "users"));
      const usersData = usersCollection.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.id !== user.uid);
      setAvailableUsers(usersData);
    };

    fetchUsers();
  }, [user]);
  
  const createGroup = async () => {
    if (!groupName.trim() || !user) return;
    
    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        members: [user.uid],
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        admin: [user.uid],
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random`

      });

      // Add initial welcome message to the group
      await addDoc(collection(db, "messages"), {
        text: `Welcome to ${groupName}! This group was created by ${user.displayName || "Anonymous"}`,
        fileType: "text",
        senderId: "system",
        userName: "System",
        avatar: "/images/group-icon.png",
        timestamp: serverTimestamp(),
        groupId: groupRef.id,
        groupName: groupName
      });

      setGroupName("");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const addMemberToGroup = async (groupId, userId) => {
    if (!groupId || !userId) return;
    
    try {
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDocs(query(collection(db, "groups"), where("id", "==", groupId)));
      
      if (groupDoc.empty) return;
      
      const currentMembers = groups.find(g => g.id === groupId)?.members || [];
      
      // Only add if not already a member
      if (!currentMembers.includes(userId)) {
        await updateDoc(groupRef, {
          members: [...currentMembers, userId]
        });

        // Add system message about new member
        const userToAdd = availableUsers.find(u => u.id === userId);
        await addDoc(collection(db, "messages"), {
          text: `${userToAdd?.displayName || "A new user"} has joined the group`,
          fileType: "text",
          senderId: "system",
          userName: "System",
          avatar: "/images/group-icon.png",
          timestamp: serverTimestamp(),
          groupId: groupId,
          groupName: groups.find(g => g.id === groupId)?.name
        });
      }
      
      setShowAddMember(false);
    } catch (error) {
      console.error("Error adding member to group:", error);
    }
  };

  const toggleAddMember = (groupId) => {
    setSelectedGroupId(groupId);
    setShowAddMember(!showAddMember);
  };

  // Filter users based on search term
  const filteredUsers = availableUsers.filter(
    (user) => user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="groups-container">
      <h2>Groups</h2>
      
      <div className="create-group">
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && createGroup()}
        />
        <button onClick={createGroup}>Create Group</button>
      </div>
      
      <div className="group-list">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.id} className="group-item">
              <div className="group-info" onClick={() => selectGroup(group)}>
              <img src={group.photoURL || "/images/group-icon.png"} alt={group.name} className="group-avatar" />
                <div className="group-details">
                  <h4>{group.name}</h4>
                  <p>{group.members?.length || 1} members</p>
                </div>
              </div>
              
              {/* Only show add member button for group creators */}
              {group.createdBy === user?.uid && (
                <button 
                  className="add-member-btn"
                  onClick={() => toggleAddMember(group.id)}
                  title="Add member"
                >
                  <UserPlus size={18} />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-groups">No groups yet. Create one to get started!</p>
        )}
      </div>
      
      {/* Add member modal */}
      {showAddMember && (
        <div className="add-member-modal">
          <div className="modal-content">
            <h3>Add Members</h3>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-search"
            />
            
            <div className="user-list">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="user-item"
                    onClick={() => addMemberToGroup(selectedGroupId, user.id)}
                  >
                    <img src={user.photoURL || "/images/addAvatar.png"} alt={user.displayName} />
                    <p>{user.displayName}</p>
                  </div>
                ))
              ) : (
                <p>No users found</p>
              )}
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowAddMember(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;