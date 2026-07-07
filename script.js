document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    if (document.getElementById('menu-items')) {
        loadMenu();
    }
});

// Toggle Hamburger Menu
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

// --- Authentication Logic ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('pass').value;
        if (pass === "Admin123") {
            sessionStorage.setItem('isAdmin', 'true');
            alert('Welcome, Admin! Access Granted.');
            window.location.href = 'menu.html';
        } else {
            alert('Access Denied!');
        }
    });
}

function checkAdminAccess() {
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel) {
        if (sessionStorage.getItem('isAdmin') === 'true') {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
        }
    }
}

// --- Menu Management Logic ---
function getMenu() {
    return JSON.parse(localStorage.getItem('menuItems')) || [];
}

function saveMenu(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
}

function loadMenu() {
    const menuContainer = document.getElementById('menu-items');
    if (!menuContainer) return;
    
    const items = getMenu();
    menuContainer.innerHTML = '';
    
    items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <span>${item.name}</span>
            ${sessionStorage.getItem('isAdmin') === 'true' 
                ? `<button onclick="removeItem(${item.id})">Delete</button>` 
                : ''}
        `;
        menuContainer.appendChild(div);
    });
}

function addItem() {
    const input = document.getElementById('itemInput');
    if (!input.value) return;

    const items = getMenu();
    const newItem = { id: Date.now(), name: input.value };
    items.push(newItem);
    saveMenu(items);
    input.value = '';
    notifyAdmin("Menu Item Added!");
    loadMenu();
}

function removeItem(id) {
    let items = getMenu();
    items = items.filter(item => item.id !== id);
    saveMenu(items);
    notifyAdmin("Menu Item Removed!");
    loadMenu();
}

function notifyAdmin(message) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.style.cssText = "position:fixed; top:20px; right:20px; background:#4CAF50; color:white; padding:15px; border-radius:5px; z-index:1000;";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}