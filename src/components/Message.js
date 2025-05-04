import React from "react";
import "../styles/message.scss";
import moment from "moment";

const Message = ({ msg, currentUser }) => {
  const isOwnMessage = msg.senderId === currentUser.uid;

  return (
    <div className={`message ${isOwnMessage ? "own" : "other"}`}>
      {/* Show avatar for received messages */}
      {!isOwnMessage && <img src={msg.avatar} alt="User Avatar" className="avatar" />}

      <div className="message-content">
        {!isOwnMessage && <h4 className="username">{msg.userName}</h4>}
        {isOwnMessage && <h4 className="username">You</h4>}

        {/* Text Messages */}
        {msg.fileType === "text" && <p className="text">{msg.text}</p>}

        {/* Image Messages */}
        {msg.fileType === "image" && msg.fileUrl && (
          <img src={msg.fileUrl} alt="Sent by user" className="message-image" />
        )}

        {/* Video Messages */}
        {msg.fileType === "video" && msg.fileUrl && (
          <video controls className="message-video">
            <source src={msg.fileUrl} type="video/mp4" />
          </video>
        )}

        {/* Audio Messages */}
        {msg.fileType === "audio" && msg.fileUrl && (
          <audio controls className="message-audio">
            <source src={msg.fileUrl} type="audio/mpeg" />
          </audio>
        )}
        
        {/* Other File Types */}
        {msg.fileType === "file" && msg.fileUrl && (
          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="message-file">
            📎 Download File
          </a>
        )}

        <p className="timestamp">
          {msg.timestamp?.toDate ? moment(msg.timestamp.toDate()).format("h:mm A") : "Just now"}
        </p>
      </div>

      {/* Show avatar for sent messages */}
      {isOwnMessage && <img src={msg.avatar} alt="User Avatar" className="avatar" />}
    </div>
  );
};

export default Message;