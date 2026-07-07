import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyCBiQyuqUAhT42ks3WMr2sJmCZcv40JFxQ",
    authDomain: "delievery-catering-website.firebaseapp.com",
    projectId: "delievery-catering-website",
    storageBucket: "delievery-catering-website.appspot.com",
    messagingSenderId: "784914986635",
    appId: "1:784914986635:web:2b0819a7e32df3644dc68e"
};

// 2. INITIALIZE SERVICES
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const menuRef = collection(db, "menu");

// 3. GLOBAL VARIABLES
const MY_WHATSAPP = "233544662523"; 
let cart = [];

// 4. REAL-TIME MENU RENDERER
onSnapshot(menuRef, (snapshot) => {
    const container = document.getElementById('menu-items');
    if (!container) return;
    container.innerHTML = '';
    
    snapshot.forEach((doc) => {
        const item = doc.data();
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.style.cssText = "margin-bottom:15px; padding:10px; border:1px solid #ddd; border-radius:8px;";
        
        const singleOrderLink = `https://wa.me/${MY_WHATSAPP}?text=${encodeURIComponent('I want to order: ' + item.name + ' (' + item.price + ')')}`;
        
        div.innerHTML = `
            <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
            <div>
                <strong>${item.name}</strong> - <span>${item.price}</span>
            </div>
            <div style="margin-top:10px;">
                <a href="${singleOrderLink}" target="_blank" style="background:#25D366; color:white; padding:5px 10px; text-decoration:none; border-radius:3px; margin-right:5px;">Order Now</a>
                <button onclick="addToCart('${item.name}', '${item.price}')">Add to Cart</button>
                ${sessionStorage.getItem('isAdmin') === 'true' 
                    ? `<button onclick="deleteItem('${doc.id}')" style="background:#ff4444; color:white; border:none; padding:5px; margin-left:5px;">Delete</button>` 
                    : ''}
            </div>
        `;
        container.appendChild(div);
    });
});

// 5. CART LOGIC
window.addToCart = function(name, price) {
    cart.push({ name, price });
    updateCartUI();
};

function updateCartUI() {
    const cartDiv = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!cartDiv) return;
    
    cartDiv.innerHTML = cart.map(i => `<div>${i.name} - ${i.price}</div>`).join('');
    checkoutBtn.style.display = cart.length > 0 ? 'block' : 'none';
}

window.sendOrder = function() {
    let message = "Hi! I would like to place an order:%0A";
    cart.forEach(i => message += `- ${i.name} (${i.price})%0A`);
    window.open(`https://wa.me/${MY_WHATSAPP}?text=${message}`, '_blank');
};

// 6. ADMIN FUNCTIONS
window.addItem = async function() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const img = document.getElementById('itemImg').value;

    if (!name || !price || !img) return alert("Fill all fields!");

    try {
        await addDoc(menuRef, { name, price, img });
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemImg').value = '';
    } catch (e) {
        alert("Error adding item: " + e.message);
    }
};

window.deleteItem = async function(id) {
    if(confirm("Delete this item?")) {
        await deleteDoc(doc(db, "menu", id));
    }
};

// 7. UI TOGGLE & INITIALIZATION
window.toggleMenu = function() {
    document.getElementById('navLinks').classList.toggle('active');
};

document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel && sessionStorage.getItem('isAdmin') === 'true') {
        adminPanel.style.display = 'block';
    }
});