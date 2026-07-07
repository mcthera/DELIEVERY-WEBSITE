document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    if (document.getElementById('menu-items')) loadMenu();
});

function toggleMenu() { document.getElementById('navLinks').classList.toggle('active'); }

function checkAdminAccess() {
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel && sessionStorage.getItem('isAdmin') === 'true') {
        adminPanel.style.display = 'block';
    }
}

function getMenu() { return JSON.parse(localStorage.getItem('menuItems')) || []; }
function saveMenu(items) { localStorage.setItem('menuItems', JSON.stringify(items)); }

function loadMenu() {
    const container = document.getElementById('menu-items');
    if (!container) return;
    container.innerHTML = '';
    
    getMenu().forEach((item) => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <img src="${item.img}" style="width:50px; height:50px; object-fit:cover;">
            <div>
                <strong>${item.name}</strong><br>
                <span>${item.price}</span>
            </div>
            ${sessionStorage.getItem('isAdmin') === 'true' ? `<button onclick="removeItem(${item.id})">Delete</button>` : ''}
        `;
        container.appendChild(div);
    });
}

function addItem() {
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const img = document.getElementById('itemImg').value;

    if (!name || !price || !img) return alert("Fill all fields!");

    const items = getMenu();
    items.push({ id: Date.now(), name, price, img });
    saveMenu(items);
    
    // Clear inputs
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemImg').value = '';
    
    loadMenu();
}

function removeItem(id) {
    saveMenu(getMenu().filter(i => i.id !== id));
    loadMenu();
}