import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = ({ selectedUser, messages, currentUserId, onSendMessage, socket, onBack }) => {
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('user-typing', (data) => {
        if (data.userId === selectedUser._id) {
          setIsTyping(data.isTyping);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('user-typing');
      }
    };
  }, [socket, selectedUser]);

  const handleTyping = (value) => {
    if (socket && socket.connected && value.length > 0) {
      if (!typing) {
        setTyping(true);
        socket.emit('typing', {
          receiverId: selectedUser._id,
          isTyping: true
        });
      }

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
        if (socket && socket.connected) {
          socket.emit('typing', {
            receiverId: selectedUser._id,
            isTyping: false
          });
        }
      }, 1000);
    } else if (socket && socket.connected && typing) {
      setTyping(false);
      socket.emit('typing', {
        receiverId: selectedUser._id,
        isTyping: false
      });
    }
  };

  const handleSend = (content) => {
    if (socket && socket.connected && typing) {
      setTyping(false);
      socket.emit('typing', {
        receiverId: selectedUser._id,
        isTyping: false
      });
    }
    onSendMessage(content);
  };

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <button 
          className="mobile-back-button-header" 
          onClick={onBack}
          aria-label="Back to users"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{selectedUser.username}</h3>
            <span className={`chat-user-status ${selectedUser.isOnline ? 'online' : 'offline'}`}>
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        selectedUser={selectedUser}
      />
      {isTyping && (
        <div className="typing-indicator">
          <span>{selectedUser.username} is typing...</span>
        </div>
      )}
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;

