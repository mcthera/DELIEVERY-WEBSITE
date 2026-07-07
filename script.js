import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 1. YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCBiQyuqUAhT42ks3WMr2sJmCZcv40JFxQ",
  authDomain: "delievery-catering-website.firebaseapp.com",
  projectId: "delievery-catering-website",
  storageBucket: "delievery-catering-website.firebasestorage.app",
  messagingSenderId: "784914986635",
  appId: "1:784914986635:web:778523f949e047c04dc68e",
  measurementId: "G-H5WL6WGS2N"
};

// 2. INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const menuRef = collection(db, "menu");

// 3. LISTEN FOR REAL-TIME UPDATES (Syncs everywhere!)
onSnapshot(menuRef, (snapshot) => {
    const container = document.getElementById('menu-items');
    if (!container) return;
    container.innerHTML = '';
    
    snapshot.forEach((doc) => {
        const item = doc.data();
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <img src="${item.img}" style="width:60px; height:60px; object-fit:cover;">
            <div style="flex-grow:1;">
                <strong>${item.name}</strong><br>
                <span>${item.price}</span>
            </div>
            ${sessionStorage.getItem('isAdmin') === 'true' 
                ? `<button onclick="deleteItem('${doc.id}')">Delete</button>` 
                : ''}
        `;
        container.appendChild(div);
    });
});

// 4. ADMIN FUNCTIONS
window.addItem = async function() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const img = document.getElementById('itemImg').value;

    if (!name || !price || !img) return alert("Fill all fields!");

    await addDoc(menuRef, { name, price, img });

    // Clear inputs
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemImg').value = '';
};

window.deleteItem = async function(id) {
    await deleteDoc(doc(db, "menu", id));
};

// 5. AUTH & UI
window.toggleMenu = function() {
    document.getElementById('navLinks').classList.toggle('active');
};

document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel && sessionStorage.getItem('isAdmin') === 'true') {
        adminPanel.style.display = 'block';
    }
});