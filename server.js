// server.js - Simple Express server for FoodieHub-Basic
// Serves static files from the public folder and provides API endpoints.

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000; // you can change the port if needed

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// ----- In‑memory data -----
// Food menu – six simple items with an id, name, price and image URL.
const foods = [
  { id: 1, name: 'Chicken Biryani', price: 9.99, image: '/images/chicken-biryani.jpg' },
  { id: 2, name: 'Veg Biryani', price: 8.99, image: '/images/veg-biryani.jpg' },
  { id: 3, name: 'Pizza', price: 8.99, image: '/images/pizza.jpg' },
  { id: 4, name: 'Burger', price: 6.49, image: '/images/burger.jpg' },
  { id: 5, name: 'Fried Rice', price: 7.5, image: '/images/fried-rice.jpg' },
  { id: 6, name: 'Ice Cream', price: 3.25, image: '/images/ice-cream.jpg' }
];

// Orders – stored only for the lifetime of the server process.
const orders = [];

// ----- API routes -----
// GET /api/foods – returns the food menu.
app.get('/api/foods', (req, res) => {
  res.json(foods);
});

// POST /api/orders – receives an order, validates basic fields, stores it.
app.post('/api/orders', (req, res) => {
  const { customer, items } = req.body;

  // Very basic validation
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ success: false, message: 'Missing customer information.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty.' });
  }

  // Create a simple order object and store it in memory.
  const order = {
    id: orders.length + 1,
    customer,
    items,
    createdAt: new Date().toISOString()
  };
  orders.push(order);

  res.json({ success: true, orderId: order.id, message: 'Order placed successfully.' });
});

// GET /api/orders – returns all orders placed since the server started.
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Fallback route – if a request does not match any API, send the index.html.
app.use((req, res) => {
  // Serve the SPA entry point for any unknown route
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FoodieHub server is running at http://localhost:${PORT}`);
  console.log('Note: Orders are stored only in server memory and will be lost when the server restarts.');
});
