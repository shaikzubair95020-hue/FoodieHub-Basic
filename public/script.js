
let foods = [];
let cart = {};

async function loadFoods() {
    let res = await fetch("/api/foods");
    foods = await res.json();

    document.getElementById("food-list").innerHTML = foods.map(f => `
        <div class="food-item">
            <img src="${f.image}" alt="${f.name}">
            <h3>${f.name}</h3>
            <p>$${Number(f.price).toFixed(2)}</p>
            <button onclick="add(${f.id})">Add to Cart</button>
        </div>
    `).join("");
}

function add(id) {
    cart[id] = (cart[id] || 0) + 1;
    showCart();
}

function remove(id) {
    if (--cart[id] <= 0) delete cart[id];
    showCart();
}

function showCart() {
    let total = 0, rows = "";

    for (let id in cart) {
        let f = foods.find(x => x.id == id);
        if (!f) continue;

        let price = f.price * cart[id];
        total += price;

        rows += `<tr>
            <td>${f.name}</td>
            <td>${cart[id]}</td>
            <td>$${Number(f.price).toFixed(2)}</td>
            <td>$${price.toFixed(2)}</td>
            <td>
                <button onclick="add(${id})">+</button>
                <button onclick="remove(${id})">-</button>
            </td>
        </tr>`;
    }

    document.querySelector("#cart-table tbody").innerHTML = rows;
    document.getElementById("cart-total").textContent = "Total: $" + total.toFixed(2);
    document.getElementById("cart-section").classList.toggle("hidden", !rows);
}

document.addEventListener("DOMContentLoaded", () => {
    loadFoods();

    document.getElementById("checkout-button").onclick = () => {
        if (!Object.keys(cart).length) return alert("Your cart is empty");
        document.getElementById("checkout-section").classList.remove("hidden");
        document.getElementById("cart-section").classList.add("hidden");
    };

    document.getElementById("checkout-form").onsubmit = async function(e) {
        e.preventDefault();

        let customer = {
            name: this.name.value.trim(),
            phone: this.phone.value.trim(),
            address: this.address.value.trim()
        };

        if (!customer.name || !customer.phone || !customer.address)
            return alert("Fill in all fields");

        let items = Object.keys(cart).map(id => ({id: Number(id), qty: cart[id]}));

        try {
            let res = await fetch("/api/orders", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({customer, items})
            });

            let data = await res.json();
            document.getElementById("order-message").textContent =
                data.success ? "Order placed! ID: " + data.orderId : "Order failed";
            document.getElementById("order-message").classList.remove("hidden");

            if (data.success) {
                cart = {};
                showCart();
                this.reset();
                document.getElementById("checkout-section").classList.add("hidden");
            }
        } catch {
            alert("Could not place order. Try again.");
        }
    };
});
