# Quick Start Guide

Follow these steps to get your Baat Cheet chat application up and running!

## Step 1: Install MongoDB

Make sure MongoDB is installed and running on your system.

**Windows:**
- Download MongoDB from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

Or use MongoDB Atlas (cloud) - just update the connection string in `.env`

## Step 2: Backend Setup

1. Open a terminal and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/baat_cheet
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

## Step 3: Frontend Setup

1. Open a **new terminal** and navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the frontend folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the React development server:
```bash
npm start
```

The browser should automatically open to `http://localhost:3000`

## Step 4: Test the Application

1. **Sign Up**: Create a new account with a username, email, and password
2. **Open another browser/incognito window**: Sign up with a different account
3. **Start Chatting**: Select a user from the sidebar and send messages in real-time!

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongosh` or check MongoDB service status
- Verify the `.env` file exists and has correct MongoDB URI
- Check if port 5000 is already in use

### Frontend won't connect
- Make sure the backend is running on port 5000
- Check browser console for errors
- Verify CORS settings in backend/server.js

### Messages not appearing
- Check browser console for Socket.io connection errors
- Verify JWT token is stored in localStorage
- Check backend console for errors

### MongoDB connection issues
- Verify MongoDB is running
- Check connection string format
- For MongoDB Atlas, ensure IP whitelist includes your IP

## Development Tips

- Use `npm run dev` in backend for auto-reload with nodemon
- React hot-reloads automatically when you save files
- Check browser DevTools and terminal for helpful error messages

Enjoy chatting! 💬

