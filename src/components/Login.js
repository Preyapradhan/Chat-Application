import React, { useState } from "react";
import { registerUser, loginUser, updateUserProfile } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "../styles/login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Ensure this preset exists in your Cloudinary account

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dvljtzv4r/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url; // Return Cloudinary URL
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      setError("Failed to upload image. Please try again."); // User-friendly error message
      return null;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading state

    try {
      if (isRegistering) {
        const user = await registerUser(email, password);
        let photoURL = "/images/addAvatar.png";

        if (avatar) {
          photoURL = await uploadToCloudinary(avatar);
        }

        await updateUserProfile(user, username, photoURL);
      } else {
        await loginUser(email, password);
      }
      navigate("/chat");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleAuth}>
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : (isRegistering ? "Register" : "Login")}
          </button>
        </form>
        <p onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an account? Login" : "Create an account"}
        </p>
      </div>
    </div>
  );
};

export default Login;