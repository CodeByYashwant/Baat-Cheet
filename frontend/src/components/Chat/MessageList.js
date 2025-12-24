import React from 'react';
import './MessageList.css';

const MessageList = ({ messages, currentUserId, selectedUser }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="empty-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isOwn = message.sender._id === currentUserId;
        return (
          <div key={message._id} className={`message ${isOwn ? 'own' : 'other'}`}>
            {!isOwn && (
              <div className="message-avatar">
                {message.sender.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="message-content-wrapper">
              {!isOwn && (
                <div className="message-sender">{message.sender.username}</div>
              )}
              <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                <p>{message.content}</p>
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;

