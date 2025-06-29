# WebSocket Server Setup for Real-time Collaboration

This guide explains how to set up a WebSocket server for the VibeLux real-time collaboration features.

## Quick Start

### Option 1: Mock Server (Development)

For development and testing, you can use a simple mock WebSocket server:

```javascript
// mock-ws-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

const projects = new Map();

wss.on('connection', (ws, req) => {
  const projectId = req.url.split('/').pop();
  
  // Add to project room
  if (!projects.has(projectId)) {
    projects.set(projectId, new Set());
  }
  projects.get(projectId).add(ws);
  
  console.log(`User connected to project: ${projectId}`);
  
  // Handle messages
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    // Broadcast to all other users in the project
    const projectUsers = projects.get(projectId);
    projectUsers.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  // Handle disconnect
  ws.on('close', () => {
    const projectUsers = projects.get(projectId);
    projectUsers.delete(ws);
    
    if (projectUsers.size === 0) {
      projects.delete(projectId);
    }
    
    console.log(`User disconnected from project: ${projectId}`);
  });
});

console.log('WebSocket server running on ws://localhost:3001');
```

Run with:
```bash
npm install ws
node mock-ws-server.js
```

### Option 2: Production Server (Node.js + Socket.io)

For production, use a more robust implementation:

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Project rooms
const projects = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join project room
  socket.on('join-project', (projectId, user) => {
    socket.join(projectId);
    socket.data.projectId = projectId;
    socket.data.user = user;
    
    // Track presence
    if (!projects.has(projectId)) {
      projects.set(projectId, new Map());
    }
    projects.get(projectId).set(socket.id, {
      user,
      cursor: { x: -100, y: -100 },
      lastActive: new Date(),
      status: 'active'
    });
    
    // Notify others
    socket.to(projectId).emit('user-joined', user);
    
    // Send current users
    const currentUsers = Array.from(projects.get(projectId).values());
    socket.emit('presence-update', currentUsers);
  });
  
  // Handle cursor updates
  socket.on('cursor', (data) => {
    const projectId = socket.data.projectId;
    if (!projectId) return;
    
    const userPresence = projects.get(projectId)?.get(socket.id);
    if (userPresence) {
      userPresence.cursor = data;
      userPresence.lastActive = new Date();
    }
    
    socket.to(projectId).emit('cursor', {
      userId: socket.data.user.id,
      ...data
    });
  });
  
  // Handle edits
  socket.on('edit', (data) => {
    const projectId = socket.data.projectId;
    if (!projectId) return;
    
    socket.to(projectId).emit('edit', {
      userId: socket.data.user.id,
      ...data
    });
  });
  
  // Handle comments
  socket.on('comment', (data) => {
    const projectId = socket.data.projectId;
    if (!projectId) return;
    
    socket.to(projectId).emit('comment', {
      userId: socket.data.user.id,
      ...data
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const projectId = socket.data.projectId;
    if (!projectId) return;
    
    const projectUsers = projects.get(projectId);
    if (projectUsers) {
      projectUsers.delete(socket.id);
      
      if (projectUsers.size === 0) {
        projects.delete(projectId);
      } else {
        socket.to(projectId).emit('user-left', socket.data.user);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Environment Variables

Set these in your `.env.local` file:

```bash
NEXT_PUBLIC_WS_URL=ws://localhost:3001  # Development
# NEXT_PUBLIC_WS_URL=wss://your-domain.com  # Production
```

## Deployment Options

### 1. Heroku

```json
// package.json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

```bash
heroku create your-app-name
heroku config:set CLIENT_URL=https://your-client.vercel.app
git push heroku main
```

### 2. Railway

```bash
railway login
railway init
railway add
railway up
```

### 3. Fly.io

```toml
# fly.toml
app = "vibelux-collab"

[env]
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
  
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

```bash
fly launch
fly deploy
```

## Security Considerations

1. **Authentication**: Verify JWT tokens before allowing connections
2. **Rate Limiting**: Implement message rate limiting
3. **Input Validation**: Sanitize all incoming data
4. **SSL/TLS**: Use WSS in production
5. **CORS**: Configure allowed origins properly

## Monitoring

Track these metrics:
- Active connections
- Messages per second
- Memory usage
- Error rates
- Latency

## Testing

```javascript
// test-client.js
const io = require('socket.io-client');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected');
  
  socket.emit('join-project', 'test-project', {
    id: 'test-user',
    name: 'Test User',
    color: '#ff0000'
  });
  
  // Send test cursor
  setInterval(() => {
    socket.emit('cursor', {
      x: Math.random() * 1000,
      y: Math.random() * 600
    });
  }, 1000);
});
```

## Troubleshooting

### Connection Issues
- Check firewall settings
- Verify CORS configuration
- Ensure WebSocket upgrade headers are allowed

### Performance Issues
- Implement message throttling
- Use Redis for horizontal scaling
- Consider using binary protocols

### Debugging
Enable debug mode:
```bash
DEBUG=socket.io:* node server.js
```