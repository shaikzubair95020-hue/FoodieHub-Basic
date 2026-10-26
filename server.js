
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const foods = [
    { id: 1, name: 'Chicken Biryani', price: 9.99, image: '/images/chicken-biryani.jpg' },
    { id: 2, name: 'Veg Biryani', price: 8.99, image: '/images/veg-biryani.jpg' },
    { id: 3, name: 'Pizza', price: 8.99, image: '/images/pizza.jpg' },
    { id: 4, name: 'Burger', price: 6.49, image: '/images/burger.jpg' },
    { id: 5, name: 'Fried Rice', price: 7.50, image: '/images/fried-rice.jpg' },
    { id: 6, name: 'Ice Cream', price: 3.25, image: '/images/ice-cream.jpg' }
];

const orders = [];

app.get('/api/foods', (req, res) => {
    res.json(foods);
});

app.post('/api/orders', (req, res) => {
    const { customer, items } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.address || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ success: false, message: 'Invalid order details' });
    }

    const order = {
        id: orders.length + 1,
        customer,
        items,
        createdAt: new Date().toISOString()
    };

    orders.push(order);
    res.json({ success: true, orderId: order.id });
});

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(3000, () => {
    console.log('FoodieHub running at http://localhost:3000');
});

