import React, { useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/navbar.scss";

const Sidenav = ({ user, setCurrentUser }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Replace with your Cloudinary preset

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dvljtzv4r/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url; // Return Cloudinary URL
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file)); // Preview the selected image

    const imageUrl = await uploadToCloudinary(file);
    if (!imageUrl) return;

    try {
      // Update Firebase Authentication profile
      await updateProfile(user, { photoURL: imageUrl });

      // Update Firestore database
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL: imageUrl });

      // Update global user state to trigger UI updates
      setCurrentUser((prev) => ({ ...prev, photoURL: imageUrl }));

      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  return (
    <nav className="navbar">
      <h1 className="logo">Contacts</h1>
      <div className="nav-profile">
        <label htmlFor="profile-upload" className="profile-label">
          <img src={selectedImage || user?.photoURL || "/images/addAvatar.png"} alt="User Avatar" className="avatar" />
          <input type="file" id="profile-upload" accept="image/*" onChange={handleImageChange} hidden />
        </label>
        <p>{user?.displayName}</p>
      </div>
    </nav>
  );
};

export default Sidenav;
