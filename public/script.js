// script.js - Handles fetching menu, cart operations and checkout

// Global state
const foods = [];
const cart = {};

// Helper to format price
function formatPrice(num) {
  return '$' + num.toFixed(2);
}

// Render the food menu
function renderMenu() {
  const container = document.getElementById('food-list');
  container.innerHTML = '';
  foods.forEach(food => {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerHTML = `
      <img src="${food.image}?v=${Date.now()}" alt="${food.name}" />
      <h3>${food.name}</h3>
      <p>${formatPrice(food.price)}</p>
      <button data-id="${food.id}">Add to Cart</button>
    `;
    container.appendChild(div);
  });

  // Add click listeners for Add to Cart
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      addToCart(parseInt(id, 10));
    });
  });
}

function addToCart(id) {
  if (!cart[id]) {
    cart[id] = { id, qty: 1 };
  } else {
    cart[id].qty += 1;
  }
  updateCartUI();
}

function removeFromCart(id) {
  delete cart[id];
  updateCartUI();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
  }
  updateCartUI();
}

function updateCartUI() {
  const section = document.getElementById('cart-section');
  const tbody = document.querySelector('#cart-table tbody');
  tbody.innerHTML = '';
  let total = 0;
  Object.values(cart).forEach(entry => {
    const food = foods.find(f => f.id === entry.id);
    const lineTotal = food.price * entry.qty;
    total += lineTotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${food.name}</td>
      <td>${entry.qty}</td>
      <td>${formatPrice(food.price)}</td>
      <td>${formatPrice(lineTotal)}</td>
      <td>
        <button class="decrease" data-id="${food.id}">-</button>
        <button class="increase" data-id="${food.id}">+</button>
        <button class="remove" data-id="${food.id}">Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('cart-total').textContent = `Total: ${formatPrice(total)}`;

  // Show or hide cart section
  if (Object.keys(cart).length > 0) {
    section.classList.remove('hidden');
  } else {
    section.classList.add('hidden');
  }

  // Attach button listeners
  tbody.querySelectorAll('.increase').forEach(btn => {
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id, 10), 1));
  });
  tbody.querySelectorAll('.decrease').forEach(btn => {
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id, 10), -1));
  });
  tbody.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id, 10)));
  });
}

// Checkout flow
function showCheckout() {
  document.getElementById('checkout-section').classList.remove('hidden');
  document.getElementById('cart-section').classList.add('hidden');
}

function placeOrder(event) {
  event.preventDefault();
  const form = event.target;
  const customer = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim()
  };
  // Basic validation
  if (!customer.name || !customer.phone || !customer.address) {
    alert('Please fill in all fields');
    return;
  }
  const items = Object.values(cart).map(entry => ({
    id: entry.id,
    qty: entry.qty
  }));
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer, items })
  })
    .then(res => res.json())
    .then(data => {
      const msg = document.getElementById('order-message');
      if (data.success) {
        msg.textContent = 'Order placed! Your order ID is ' + data.orderId;
        msg.classList.remove('hidden');
        // Clear cart & form
        Object.keys(cart).forEach(k => delete cart[k]);
        updateCartUI();
        form.reset();
      } else {
        msg.textContent = 'Error: ' + (data.message || 'Failed to place order');
        msg.style.color = 'red';
        msg.classList.remove('hidden');
      }
    })
    .catch(err => {
      alert('Network error');
      console.error(err);
    });
}

// Initial loading
function init() {
  fetch('/api/foods')
    .then(res => res.json())
    .then(data => {
      foods.push(...data);
      renderMenu();
    })
    .catch(err => console.error('Failed to load foods', err));

  document.getElementById('checkout-button').addEventListener('click', showCheckout);
  document.getElementById('checkout-form').addEventListener('submit', placeOrder);
}

window.addEventListener('DOMContentLoaded', init);
