const http = require('http');

const PORT = process.env.PORT || 3001;

// In-memory user storage
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' }
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  // GET /users - List all users
  if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200);
    res.end(JSON.stringify({ users, service: 'user-service' }));
    return;
  }

  // GET /users/:id - Get user by ID
  if (req.method === 'GET' && req.url.startsWith('/users/')) {
    const id = parseInt(req.url.split('/')[2]);
    const user = users.find(u => u.id === id);
    
    if (user) {
      res.writeHead(200);
      res.end(JSON.stringify({ user, service: 'user-service' }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'User not found' }));
    }
    return;
  }

  // POST /users - Create new user
  if (req.method === 'POST' && req.url === '/users') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newUser = JSON.parse(body);
        const user = {
          id: users.length + 1,
          name: newUser.name,
          email: newUser.email
        };
        users.push(user);
        res.writeHead(201);
        res.end(JSON.stringify({ user, service: 'user-service' }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Health check
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy', service: 'user-service' }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🧑 User Service running on port ${PORT}`);
});
