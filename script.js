document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    if (document.getElementById('menu-items')) loadMenu();
});

// THIS LISTENER: Updates the menu automatically if data changes in another tab/window
window.addEventListener('storage', () => {
    if (document.getElementById('menu-items')) loadMenu();
});

function toggleMenu() { document.getElementById('navLinks').classList.toggle('active'); }

function checkAdminAccess() {
    const adminPanel = document.querySelector('.admin-panel');
    if (adminPanel && sessionStorage.getItem('isAdmin') === 'true') {
        adminPanel.style.display = 'block';
    }
}

function getMenu() {
    const localData = JSON.parse(localStorage.getItem('menuItems'));
    
    // If empty, return these default items so the user isn't looking at a blank screen
    if (!localData || localData.length === 0) {
        return [
            { id: 101, name: "BANKU", price: "10.00", img: "https://via.placeholder.com/150" },
            { id: 102, name: "TILAPIA", price: "25.00", img: "https://via.placeholder.com/150" }
        ];
    }
    return localData;
}

function saveMenu(items) { 
    localStorage.setItem('menuItems', JSON.stringify(items));
    // Manually trigger loadMenu for the current tab
    if (document.getElementById('menu-items')) loadMenu();
}

function loadMenu() {
    const container = document.getElementById('menu-items');
    if (!container) return;
    container.innerHTML = '';
    
    getMenu().forEach((item) => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.style.cssText = "display:flex; align-items:center; gap:15px; margin-bottom:10px; padding:10px; border:1px solid #ddd;";
        div.innerHTML = `
            <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;">
            <div style="flex-grow:1;">
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
    
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemImg').value = '';
}

function removeItem(id) {
    saveMenu(getMenu().filter(i => i.id !== id));
}