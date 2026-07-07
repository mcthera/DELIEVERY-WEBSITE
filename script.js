import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBiQyuqUAhT42ks3WMr2sJmCZcv40JFxQ",
    authDomain: "delievery-catering-website.firebaseapp.com",
    projectId: "delievery-catering-website",
    storageBucket: "delievery-catering-website.appspot.com",
    messagingSenderId: "784914986635",
    appId: "1:784914986635:web:2b0819a7e32df3644dc68e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const menuRef = collection(db, "menu");
const ordersRef = collection(db, "orders");

const MY_WHATSAPP = "233544662523";
let cart = [];

// 1. HELPER: Toasts
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

// 2. HELPER: Cart UI
function updateCartUI() {
    const cartDiv = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!cartDiv) return;

    let total = 0;
    cartDiv.innerHTML = cart.map((i, index) => {
        const itemTotal = i.price * i.qty;
        total += itemTotal;
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${i.qty} x ${i.name} - ₵${itemTotal.toFixed(2)}</span>
                <button onclick="window.removeFromCart(${index})" style="background: #ff4444; color:white; border:none; padding: 2px 8px; cursor:pointer;">Remove</button>
            </div>
        `;
    }).join('');
    
    cartDiv.innerHTML += `<h3>Total: ₵${total.toFixed(2)}</h3>`;
    if (checkoutBtn) checkoutBtn.style.display = cart.length > 0 ? 'block' : 'none';
}
window.removeFromCart = (index) => {
    cart.splice(index, 1); // Removes the item at this specific position
    updateCartUI();        // Re-draws the cart immediately
    showToast("Item removed from cart");
};

// 3. MENU RENDERER
onSnapshot(menuRef, (snapshot) => {
    const container = document.getElementById('menu-items');
    if (!container) return;
    container.innerHTML = '';
    snapshot.forEach((doc) => {
        const item = doc.data();
        const div = document.createElement('div');
        div.className = 'menu-item';
        // We set the innerHTML first, then add the listener to avoid quote errors
        div.innerHTML = `
            <div>
                <img src="${item.img}" style="width: 50px; height: 50px; object-fit: cover;">
                <strong>${item.name}</strong> - $${item.price}
            </div>
            <div>
                <input type="number" id="qty-${doc.id}" value="1" min="1" style="width: 50px;">
                <button id="btn-${doc.id}">Add to Cart</button>
                ${sessionStorage.getItem('isAdmin') === 'true' ? `<button onclick="window.deleteItem('${doc.id}')">Delete</button>` : ''}
            </div>
        `;
        container.appendChild(div);

        // Attach event listener directly to the button
        document.getElementById(`btn-${doc.id}`).onclick = () => {
            const qty = parseInt(document.getElementById(`qty-${doc.id}`).value);
            window.addToCart(item.name, item.price, qty);
        };
    });
});

// 4. LOGIC
window.addToCart = (name, price, qty) => {
    cart.push({ name, price: parseFloat(price), qty });
    updateCartUI();
    showToast(qty + " x " + name + " added!");
};

window.login = () => {
    const pass = document.getElementById('adminPass').value;
    if (pass === "Admin123") {
        sessionStorage.setItem('isAdmin', 'true');
        window.location.href = "menu.html";
    } else { alert("Incorrect Password"); }
};

window.sendOrder = async () => {
    // 1. Get Customer Details (Including Comment)
    const name = document.getElementById('custName').value;
    const loc = document.getElementById('custLoc').value;
    const phone = document.getElementById('custPhone').value;
    const date = document.getElementById('orderDate').value;
    const comment = document.getElementById('custComment').value; // Get the comment

    if (!name || !loc || !phone) {
        alert("Please fill in your Name, Location, and Phone Number!");
        return;
    }

    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

    // 2. Build Message with Comment
    let msg = `New Order Details:%0A%0A`;
    msg += `Name: ${name}%0A`;
    msg += `Location: ${loc}%0A`;
    msg += `Phone: ${phone}%0A`;
    msg += `Date: ${date}%0A`;
    msg += `Notes: ${comment}%0A%0A`; // Added Notes to the message
    msg += `Items:%0A` + cart.map(i => `${i.qty} x ${i.name} - ₵${(i.price * i.qty).toFixed(2)}`).join('%0A');
    msg += `%0A%0A-------------------%0ATotal Amount: ₵${total.toFixed(2)}`;

    window.open(`https://wa.me/${MY_WHATSAPP}?text=${msg}`, '_blank');
    
    // 3. Reset
    cart = [];
    updateCartUI();
    document.getElementById('cart-items').innerHTML = '';
    // Clear the form fields as well
    document.getElementById('custComment').value = ''; 
    document.getElementById('checkout-form').style.display = 'none';
    document.getElementById('checkout-btn').style.display = 'none';
};

window.addItem = async () => {
    await addDoc(menuRef, { name: document.getElementById('itemName').value, price: document.getElementById('itemPrice').value, img: document.getElementById('itemImg').value });
};

window.deleteItem = (id) => deleteDoc(doc(db, "menu", id));

// 5. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        const adminPanel = document.querySelector('.admin-panel');
        if (adminPanel) adminPanel.style.display = 'block';
    }
    const toggleBtn = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('navLinks');
    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
});