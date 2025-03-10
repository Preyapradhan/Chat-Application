import React from "react";
import "../styles/navbar.scss";

const Sidenav = ({ user }) => {
  return (
    <nav className="navbar">
      <h1 className="logo">Contacts</h1>
      <div className="nav-profile">
        <img src={user.photoURL || "/images/addAvatar.png"} alt="User  Avatar" className="avatar" />
      </div>
    </nav>
  );
};

export default Sidenav;