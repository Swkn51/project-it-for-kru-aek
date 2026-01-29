/* ===================================================
   Equipment Management System - Common Utilities
   Shared JavaScript functions across all pages
   =================================================== */

// ===== Authentication Check =====
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('loginUser'));
  if (!user) {
    window.location.href = 'login/index.html';
    return null;
  }
  return user;
}

// ===== Get Current User =====
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('loginUser'));
}

// ===== Display User Info in Topbar =====
function displayUserInfo(nameElementId, avatarElementId) {
  const user = getCurrentUser();
  if (!user) return;

  const nameEl = document.getElementById(nameElementId);
  const avatarEl = document.getElementById(avatarElementId);

  if (nameEl) {
    nameEl.innerText = `${user.fullname || user.username}`;
  }

  if (avatarEl && user.avatar) {
    avatarEl.style.backgroundImage = `url(${user.avatar})`;
  }
}

// ===== Sidebar Functions =====
function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.add('active');
  if (overlay) overlay.classList.add('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  if (sidebar) sidebar.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

// ===== Navigation =====
function goPage(page) {
  window.location.href = page;
}

// ===== Logout =====
function logout() {
  localStorage.removeItem('loginUser');
  window.location.href = 'login/index.html';
}

// ===== Set Active Menu Item =====
function setActiveMenuItem() {
  const currentPage = window.location.pathname.split('/').pop() || 'search.html';
  const menuItems = document.querySelectorAll('.menu-item');

  menuItems.forEach(item => {
    const onclick = item.getAttribute('onclick');
    if (onclick && onclick.includes(currentPage)) {
      item.classList.add('active');
    }
  });
}

// ===== Load Excel Data =====
async function loadExcelData(path) {
  try {
    const response = await fetch(path);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  } catch (error) {
    console.error('Error loading Excel:', error);
    return [];
  }
}

// ===== Load Users Data =====
async function loadUsers() {
  try {
    const response = await fetch('../data/user/users.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// ===== Format Date =====
function formatDate(dateString) {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
}

// ===== Format Currency =====
function formatCurrency(amount) {
  if (!amount) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount);
}

// ===== Show Alert Message =====
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} animate-fadeInDown`;
  alertDiv.innerHTML = `
    <i class="ri-${type === 'success' ? 'check-line' : type === 'error' ? 'error-warning-line' : 'information-line'}"></i>
    <span>${message}</span>
  `;

  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
      alertDiv.style.opacity = '0';
      alertDiv.style.transform = 'translateY(-10px)';
      setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
  }
}

// ===== Debounce Function =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== Generate Sidebar HTML =====
function generateSidebar() {
  return `
    <div id="overlay" class="overlay" onclick="closeSidebar()"></div>
    <div id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <img src="../img/webicon.png" alt="Logo" class="sidebar-logo">
        <span class="sidebar-title">IT Asset</span>
      </div>
      <div class="menu">
        <div class="menu-item" onclick="goPage('search.html')">
          <i class="ri-search-line"></i>
          <span>ค้นหาวัสดุ</span>
        </div>
        <div class="menu-item" onclick="goPage('my-assets.html')">
          <i class="ri-computer-line"></i>
          <span>อุปกรณ์ที่ดูแล</span>
        </div>
        <div class="menu-item" onclick="goPage('transfer.html')">
          <i class="ri-arrow-left-right-line"></i>
          <span>โอนย้าย</span>
        </div>
        <div class="menu-item" onclick="goPage('profile.html')">
          <i class="ri-user-line"></i>
          <span>โปรไฟล์</span>
        </div>
        <div class="menu-item" onclick="goPage('about.html')">
          <i class="ri-information-line"></i>
          <span>เกี่ยวกับ</span>
        </div>
      </div>
      <div class="logout-btn" onclick="logout()">
        <i class="ri-logout-box-line"></i>
        <span>ออกจากระบบ</span>
      </div>
    </div>
  `;
}

// ===== Generate Topbar HTML =====
function generateTopbar() {
  return `
    <div class="topbar">
      <button class="logo-btn" onclick="openSidebar()">
        <img src="../img/webicon.png" alt="Menu">
      </button>
      <div class="top-right">
        <div id="userInfo" class="user-name"></div>
        <div id="userAvatar" class="profile-placeholder"></div>
      </div>
    </div>
  `;
}

// ===== Initialize Page =====
function initPage() {
  const user = checkAuth();
  if (!user) return;

  displayUserInfo('userInfo', 'userAvatar');
  setActiveMenuItem();
}

// ===== Create Asset Card HTML =====
function createAssetCard(asset) {
  return `
    <div class="card hover-lift">
      <div class="row"><div class="label">หมายเลขประจำวัสดุ</div><div><strong>${asset.asset_id || '-'}</strong></div></div>
      <div class="row"><div class="label">รายการ</div><div>${asset.item_name || '-'}</div></div>
      <div class="row"><div class="label">วิธีที่ได้รับมา</div><div>${asset.acquire_method || '-'}</div></div>
      <div class="row"><div class="label">ราคาต่อหน่วย</div><div>${asset.unit_price || '-'}</div></div>
      <div class="row"><div class="label">ห้อง</div><div>${asset.room || '-'}</div></div>
      <div class="row"><div class="label">ผู้ดูแล</div><div>${asset.caretaker || '-'}</div></div>
      <div class="row"><div class="label">อัปเดตล่าสุด</div><div>${asset.last_updated || '-'}</div></div>
      <div class="row"><div class="label">สถานะ</div><div><span class="badge ${asset.status || ''}">${asset.status || '-'}</span></div></div>
    </div>
  `;
}

// ===== Empty State HTML =====
function createEmptyState(icon, title, message) {
  return `
    <div class="empty-state animate-fadeIn">
      <i class="${icon}"></i>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}
