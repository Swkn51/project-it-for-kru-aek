// ===== Login Check =====
const user = checkAuth();

// ===== Display User Info =====
displayUserInfo('userInfo', 'userAvatar');

// ===== Data =====
let myAssets = [];
let allUsers = [];
let transferHistory = JSON.parse(localStorage.getItem('transferHistory') || '[]');

// ===== Load Data =====
async function loadData() {
    try {
        // Load assets
        const assetRes = await fetch('../data/data center/data.xlsx');
        const assetData = await assetRes.arrayBuffer();
        const wb = XLSX.read(assetData, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const assets = XLSX.utils.sheet_to_json(sheet);

        // Filter my assets
        myAssets = assets.filter(a => {
            const caretaker = String(a.caretaker || '').toLowerCase();
            const userFullname = String(user.fullname || '').toLowerCase();
            return caretaker.includes(userFullname);
        });

        // Load users
        const userRes = await fetch('../data/user/users.json');
        allUsers = await userRes.json();

        // Populate dropdowns
        populateAssetDropdown();
        populateUserDropdown();
        renderTransferHistory();

    } catch (err) {
        console.error('Error loading data:', err);
        showAlert('ไม่สามารถโหลดข้อมูลได้', 'error');
    }
}

loadData();

// ===== Populate Asset Dropdown =====
function populateAssetDropdown() {
    const select = document.getElementById('assetSelect');

    myAssets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset.asset_id;
        option.textContent = `${asset.asset_id} - ${asset.item_name}`;
        select.appendChild(option);
    });
}

// ===== Populate User Dropdown =====
function populateUserDropdown() {
    const select = document.getElementById('userSelect');

    allUsers
        .filter(u => u.username !== user.username)
        .forEach(u => {
            const option = document.createElement('option');
            option.value = u.fullname;
            option.textContent = u.fullname;
            select.appendChild(option);
        });
}

// ===== Update Asset Info =====
function updateAssetInfo() {
    const assetId = document.getElementById('assetSelect').value;
    const infoDiv = document.getElementById('selectedAssetInfo');
    const detailsDiv = document.getElementById('assetDetails');

    if (!assetId) {
        infoDiv.style.display = 'none';
        return;
    }

    const asset = myAssets.find(a => a.asset_id === assetId);
    if (!asset) return;

    infoDiv.style.display = 'block';
    detailsDiv.innerHTML = `
    <div style="display: grid; gap: var(--space-2);">
      <div><strong>รายการ:</strong> ${asset.item_name}</div>
      <div><strong>ห้อง:</strong> ${asset.room || '-'}</div>
      <div><strong>สถานะ:</strong> <span class="badge ${asset.status}">${asset.status}</span></div>
    </div>
  `;
}

// ===== Submit Transfer =====
function submitTransfer() {
    const assetId = document.getElementById('assetSelect').value;
    const recipient = document.getElementById('userSelect').value;
    const note = document.getElementById('transferNote').value.trim();

    if (!assetId) {
        showAlert('กรุณาเลือกอุปกรณ์ที่ต้องการโอน', 'error');
        return;
    }

    if (!recipient) {
        showAlert('กรุณาเลือกผู้รับโอน', 'error');
        return;
    }

    const asset = myAssets.find(a => a.asset_id === assetId);

    // Create transfer record
    const transfer = {
        id: Date.now(),
        assetId: assetId,
        assetName: asset.item_name,
        from: user.fullname,
        to: recipient,
        note: note,
        date: new Date().toLocaleString('th-TH'),
        status: 'รอดำเนินการ'
    };

    // Save to history
    transferHistory.unshift(transfer);
    localStorage.setItem('transferHistory', JSON.stringify(transferHistory));

    // Reset form
    document.getElementById('assetSelect').value = '';
    document.getElementById('userSelect').value = '';
    document.getElementById('transferNote').value = '';
    document.getElementById('selectedAssetInfo').style.display = 'none';

    // Show success
    showAlert('สร้างรายการโอนย้ายสำเร็จ', 'success');
    renderTransferHistory();
}

// ===== Render Transfer History =====
function renderTransferHistory() {
    const container = document.getElementById('transferHistory');

    // Filter to show only current user's transfers
    const myTransfers = transferHistory.filter(t =>
        t.from === user.fullname || t.to === user.fullname
    );

    if (myTransfers.length === 0) {
        container.innerHTML = createEmptyState(
            'ri-history-line',
            'ไม่มีประวัติ',
            'ยังไม่มีรายการโอนย้าย'
        );
        return;
    }

    container.innerHTML = myTransfers.slice(0, 10).map(t => `
    <div class="contact-item" style="margin-bottom: var(--space-3);">
      <div class="contact-icon" style="background: ${t.status === 'รอดำเนินการ' ? 'var(--warning-bg)' : 'var(--success-bg)'}; color: ${t.status === 'รอดำเนินการ' ? 'var(--warning)' : 'var(--success)'};">
        <i class="ri-${t.status === 'รอดำเนินการ' ? 'time' : 'check'}-line"></i>
      </div>
      <div class="contact-info" style="flex: 1;">
        <h4 style="font-size: var(--font-size-sm);">${t.assetId}</h4>
        <p style="font-size: var(--font-size-xs);">${t.from} → ${t.to}</p>
        <p style="font-size: var(--font-size-xs); color: var(--gray-400);">${t.date}</p>
      </div>
      <span class="badge" style="background: ${t.status === 'รอดำเนินการ' ? 'var(--warning-bg)' : 'var(--success-bg)'}; color: ${t.status === 'รอดำเนินการ' ? 'var(--warning)' : 'var(--success)'};">
        ${t.status}
      </span>
    </div>
  `).join('');
}
