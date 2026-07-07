import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 1. YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCBiQyuqUAhT42ks3WMr2sJmCZcv40JFxQ",
    authDomain: "delievery-catering-website.firebaseapp.com",
    projectId: "delievery-catering-website",
    storageBucket: "delievery-catering-website.appspot.com",
    messagingSenderId: "784914986635",
    appId: "1:784914986635:web:2b0819a7e32df3644dc68e"
};

// 2. INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const menuRef = collection(db, "menu");

// 3. YOUR WHATSAPP NUMBER (Update this!)
const MY_WHATSAPP = "233XXXXXXXXXX"; 

// 4. REAL-TIME LISTENER (Syncs data across all devices)
onSnapshot(menuRef, (snapshot) => {
    const container = document.getElementById('menu-items');
    if (!container) return;
    container.innerHTML = '';
    
    snapshot.forEach((doc) => {
        const item = doc.data();
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.style.cssText = "display:flex; align-items:center; gap:10px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;";
        
        // WhatsApp Logic: Creates a professional order message
        const orderText = `Hello! I would like to order: ${item.name} (${item.price})`;
        const whatsappLink = `https://wa.me/${MY_WHATSAPP}?text=${encodeURIComponent(orderText)}`;
        
        div.innerHTML = `
            <img src="${item.img}" style="width:70px; height:70px; object-fit:cover; border-radius:8px;">
            <div style="flex-grow:1;">
                <strong style="display:block; font-size:1.1em;">${item.name}</strong>
                <span style="color:#666;">${item.price}</span>
            </div>
            <a href="${whatsappLink}" target="_blank" style="background:#25D366; color:white; padding:8px 12px; border-radius:5px; text-decoration:none; font-weight:bold;">Order Now</a>
            ${sessionStorage.getItem('isAdmin') === 'true' 
                ? `<button onclick="deleteItem('${doc.id}')" style="background:#ff4444; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">Delete</button>` 
                : ''}
        `;
        container.appendChild(div);
    });
});

// 5. ADMIN FUNCTIONS
window.addItem = async function() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const img = document.getElementById('itemImg').value;

    if (!name || !price || !img) return alert("Please fill in all fields!");

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
    if(confirm("Are you sure you want to delete this item?")) {
        await deleteDoc(doc(db, "menu", id));
    }
};

// 6. UI TOGGLE
window.toggleMenu = function() {
    document.getElementById('navLinks').classList.toggle('active');
};

document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel && sessionStorage.getItem('isAdmin') === 'true') {
        adminPanel.style.display = 'block';
    }
});