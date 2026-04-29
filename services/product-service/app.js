const http = require('http');

const PORT = process.env.PORT || 3002;

// In-memory product storage
const products = [
  { id: 101, name: 'Laptop', price: 999.99, stock: 15 },
  { id: 102, name: 'Mouse', price: 29.99, stock: 50 },
  { id: 103, name: 'Keyboard', price: 79.99, stock: 30 }
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  // GET /products - List all products
  if (req.method === 'GET' && req.url === '/products') {
    res.writeHead(200);
    res.end(JSON.stringify({ products, service: 'product-service' }));
    return;
  }

  // GET /products/:id - Get product by ID
  if (req.method === 'GET' && req.url.startsWith('/products/')) {
    const id = parseInt(req.url.split('/')[2]);
    const product = products.find(p => p.id === id);

    if (product) {
      res.writeHead(200);
      res.end(JSON.stringify({ product, service: 'product-service' }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Product not found' }));
    }
    return;
  }

  // POST /products - Create new product
  if (req.method === 'POST' && req.url === '/products') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newProduct = JSON.parse(body);
        const product = {
          id: Math.max(...products.map(p => p.id)) + 1,
          name: newProduct.name,
          price: newProduct.price,
          stock: newProduct.stock || 0
        };
        products.push(product);
        res.writeHead(201);
        res.end(JSON.stringify({ product, service: 'product-service' }));
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
    res.end(JSON.stringify({ status: 'healthy', service: 'product-service' }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`📦 Product Service running on port ${PORT}`);
});
