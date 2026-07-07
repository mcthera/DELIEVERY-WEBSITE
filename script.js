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

// 1. MENU RENDERER
onSnapshot(menuRef, (snapshot) => {
    const container = document.getElementById('menu-items');
    if (!container) return;
    container.innerHTML = '';
    snapshot.forEach((doc) => {
        const item = doc.data();
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <div><strong>${item.name}</strong> - ${item.price}</div>
            <div>
                <a href="https://wa.me/${MY_WHATSAPP}?text=I want: ${item.name}" target="_blank">Order Now</a>
                <button onclick="window.addToCart('${item.name}', '${item.price}')">Add to Cart</button>
                ${sessionStorage.getItem('isAdmin') === 'true' ? `<button onclick="window.deleteItem('${doc.id}')" class="btn-delete">Delete</button>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
});

// 2. LOGIN LOGIC (Crucial for Admin Access)
window.login = () => {
    const pass = document.getElementById('adminPass').value;
    if (pass === "Admin123") { // Replace with your secure password
        sessionStorage.setItem('isAdmin', 'true');
        alert("Logged in as Admin!");
        window.location.href = "menu.html";
    } else {
        alert("Incorrect Password");
    }
};

// 3. CART & ORDERS
window.addToCart = (name, price) => {
    cart.push({ name, price });
    const cartDiv = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (cartDiv) cartDiv.innerHTML = cart.map(i => `<div>${i.name} - ${i.price}</div>`).join('');
    if (checkoutBtn) checkoutBtn.style.display = 'block';
};

window.sendOrder = async () => {
    await addDoc(ordersRef, { 
        items: cart, 
        total: cart.reduce((s, i) => s + parseFloat(i.price), 0), 
        timestamp: serverTimestamp() 
    });
    let msg = "Order:%0A" + cart.map(i => `- ${i.name}`).join('%0A');
    window.open(`https://wa.me/${MY_WHATSAPP}?text=${msg}`, '_blank');
    cart = [];
    document.getElementById('cart-items').innerHTML = '';
    document.getElementById('checkout-btn').style.display = 'none';
};

// 4. ADMIN DASHBOARD & ADD/DELETE
onSnapshot(query(ordersRef, orderBy("timestamp", "desc")), (snapshot) => {
    const div = document.getElementById('admin-orders');
    if (!div) return;
    div.innerHTML = '<h3>Incoming Orders</h3>' + snapshot.docs.map(d => 
        `<div style="margin:10px; border-bottom:1px solid #ccc;">Total: ${d.data().total}</div>`
    ).join('');
});

window.addItem = async () => {
    await addDoc(menuRef, { 
        name: document.getElementById('itemName').value, 
        price: document.getElementById('itemPrice').value, 
        img: document.getElementById('itemImg').value 
    });
};

window.deleteItem = (id) => deleteDoc(doc(db, "menu", id));

// 5. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Show admin panel if logged in
    if (sessionStorage.getItem('isAdmin') === 'true') {
        const adminPanel = document.querySelector('.admin-panel');
        if (adminPanel) adminPanel.style.display = 'block';
    }

    // Mobile Menu Toggle
    const toggleBtn = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('navLinks');
    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});