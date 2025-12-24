import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, chatAPI } from '../../services/api';
import { socketService } from '../../services/socket';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    if (user && user.id) {
      const socket = socketService.connect(user.id);
      
      if (!socket) {
        console.error('Failed to create socket connection');
        return;
      }

      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('✅ Connected to server');
        setSocketConnected(true);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
      });

      socket.on('disconnect', (reason) => {
        console.log('⚠️ Socket disconnected:', reason);
        setSocketConnected(false);
      });

      socket.on('receive-message', (message) => {
        console.log('📨 Received message:', message);
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          
          // Use ref to get current selectedUser value
          const currentSelected = selectedUserRef.current;
          // Add message if it's from the selected user or if no user is selected
          if (!currentSelected || (message.sender && message.sender._id === currentSelected._id)) {
            return [...prev, message];
          }
          return prev;
        });
      });

      socket.on('message-sent', (message) => {
        console.log('✅ Message sent:', message);
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          
          // Use ref to get current selectedUser value
          const currentSelected = selectedUserRef.current;
          // Add message if it's to the selected user
          if (currentSelected && message.receiver && message.receiver._id === currentSelected._id && message.sender && message.sender._id === user.id) {
            return [...prev, message];
          }
          return prev;
        });
      });

      socket.on('user-online', (data) => {
        console.log('🟢 User online:', data);
        setUsers(prev => prev.map(u => 
          u._id === data.userId ? { ...u, isOnline: true } : u
        ));
      });

      socket.on('user-offline', (data) => {
        console.log('🔴 User offline:', data);
        setUsers(prev => prev.map(u => 
          u._id === data.userId ? { ...u, isOnline: false } : u
        ));
      });

      socket.on('online-users', (onlineUsers) => {
        console.log('👥 Online users:', onlineUsers);
        setUsers(prev => prev.map(u => {
          const online = onlineUsers.find(ou => ou._id === u._id);
          return online ? { ...u, isOnline: true } : { ...u, isOnline: false };
        }));
      });

      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    }

    // Fetch users
    fetchUsers();

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (selectedUserData) => {
    setSelectedUser(selectedUserData);
    selectedUserRef.current = selectedUserData;
    setShowSidebar(false); // Hide sidebar on mobile when user is selected
    try {
      const response = await chatAPI.getMessages(selectedUserData._id);
      setMessages(response.messages);
      
      // Mark messages as read
      await chatAPI.markAsRead(selectedUserData._id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = (content) => {
    if (!socketRef.current) {
      console.error('Socket not initialized');
      alert('Socket not connected. Please refresh the page.');
      return;
    }
    
    if (!socketRef.current.connected) {
      console.error('Socket not connected');
      alert('Socket not connected. Please refresh the page.');
      return;
    }
    
    const currentSelected = selectedUserRef.current;
    if (!currentSelected || !content.trim()) {
      console.error('Missing selectedUser or content');
      return;
    }

    console.log('Sending message to:', currentSelected._id, 'Content:', content.trim());
    
    socketRef.current.emit('send-message', {
      receiverId: currentSelected._id,
      content: content.trim()
    });
  };

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    logout();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className={`chat-sidebar ${showSidebar ? 'show' : 'hide'}`}>
        <div className="chat-header">
          <div className="user-info">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h3>{user.username}</h3>
              <span className={`user-status ${socketConnected ? 'online' : 'offline'}`}>
                {socketConnected ? 'Online' : 'Connecting...'}
              </span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
        <div className="users-section">
          <UserList
            users={users}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
          />
        </div>
      </div>
      <div className="chat-main">
        {selectedUser ? (
            <ChatWindow
              selectedUser={selectedUser}
              messages={messages}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              socket={socketRef.current}
              onBack={() => {
                setShowSidebar(true);
                setSelectedUser(null);
                selectedUserRef.current = null;
              }}
            />
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h2>Select a user to start chatting</h2>
              <p>Choose someone from the sidebar to begin your conversation</p>
            </div>
          </div>
        )}
      </div>
      {!showSidebar && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setShowSidebar(true)}
        ></div>
      )}
    </div>
  );
};

export default Chat;

