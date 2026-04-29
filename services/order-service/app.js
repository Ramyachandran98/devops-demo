const http = require('http');

const PORT = process.env.PORT || 3003;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

// In-memory order storage
let orders = [
  { id: 1001, userId: 1, productId: 101, quantity: 2, status: 'completed' }
];

// Helper to make HTTP calls
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // GET /orders - List all orders
  if (req.method === 'GET' && req.url === '/orders') {
    res.writeHead(200);
    res.end(JSON.stringify({ orders, service: 'order-service' }));
    return;
  }

  // GET /orders/:id - Get order by ID with enriched data
  if (req.method === 'GET' && req.url.startsWith('/orders/')) {
    const orderId = parseInt(req.url.split('/')[2]);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Order not found' }));
      return;
    }

    // Fetch user and product data from other services
    Promise.all([
      httpGet(`${USER_SERVICE_URL}/users/${order.userId}`),
      httpGet(`${PRODUCT_SERVICE_URL}/products/${order.productId}`)
    ])
      .then(([userData, productData]) => {
        res.writeHead(200);
        res.end(JSON.stringify({
          order: {
            ...order,
            user: userData.user,
            product: productData.product
          },
          service: 'order-service'
        }));
      })
      .catch(err => {
        res.writeHead(503);
        res.end(JSON.stringify({ error: 'Failed to fetch order details', details: err.message }));
      });
    return;
  }

  // POST /orders - Create new order
  if (req.method === 'POST' && req.url === '/orders') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newOrder = JSON.parse(body);

        // Validate user and product exist
        Promise.all([
          httpGet(`${USER_SERVICE_URL}/users/${newOrder.userId}`),
          httpGet(`${PRODUCT_SERVICE_URL}/products/${newOrder.productId}`)
        ])
          .then(([userData, productData]) => {
            const order = {
              id: Math.max(...orders.map(o => o.id)) + 1,
              userId: newOrder.userId,
              productId: newOrder.productId,
              quantity: newOrder.quantity,
              status: 'pending'
            };
            orders.push(order);
            res.writeHead(201);
            res.end(JSON.stringify({ order, service: 'order-service' }));
          })
          .catch(err => {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid user or product ID' }));
          });
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
    res.end(JSON.stringify({ status: 'healthy', service: 'order-service' }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`📋 Order Service running on port ${PORT}`);
});
