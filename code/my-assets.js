// ===== Login Check =====
const user = checkAuth();

// ===== Display User Info =====
displayUserInfo('userInfo', 'userAvatar');

// ===== Load My Assets =====
let myAssets = [];
let allMyAssets = [];

fetch('../data/data center/data.xlsx')
    .then(res => res.arrayBuffer())
    .then(data => {
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const assets = XLSX.utils.sheet_to_json(sheet);

        // Filter assets by current user's fullname
        allMyAssets = assets.filter(a => {
            const caretaker = String(a.caretaker || '').toLowerCase();
            const userFullname = String(user.fullname || '').toLowerCase();
            const username = String(user.username || '').toLowerCase();
            return caretaker.includes(userFullname) || caretaker.includes(username);
        });

        myAssets = [...allMyAssets];
        updateStats();
        renderAssets(myAssets);
    })
    .catch(err => {
        console.error('Error loading data:', err);
        document.getElementById('assetList').innerHTML = createEmptyState(
            'ri-error-warning-line',
            'ไม่สามารถโหลดข้อมูลได้',
            'กรุณาลองใหม่อีกครั้ง'
        );
    });

// ===== Update Statistics =====
function updateStats() {
    const active = allMyAssets.filter(a => a.status === 'ใช้งาน').length;
    const pending = allMyAssets.filter(a => a.status === 'รอจำหน่าย').length;
    const broken = allMyAssets.filter(a => a.status === 'ชำรุด').length;

    document.getElementById('statActive').textContent = active;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statBroken').textContent = broken;
}

// ===== Filter Assets =====
function filterMyAssets() {
    const searchText = document.getElementById('filterInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    myAssets = allMyAssets.filter(a => {
        const matchSearch =
            String(a.asset_id || '').toLowerCase().includes(searchText) ||
            String(a.item_name || '').toLowerCase().includes(searchText) ||
            String(a.room || '').toLowerCase().includes(searchText);

        const matchStatus = !statusFilter || a.status === statusFilter;

        return matchSearch && matchStatus;
    });

    renderAssets(myAssets);
}

// ===== Render Assets =====
function renderAssets(list) {
    const container = document.getElementById('assetList');

    if (list.length === 0) {
        container.innerHTML = createEmptyState(
            'ri-computer-line',
            'ไม่พบอุปกรณ์',
            'ไม่มีอุปกรณ์ที่อยู่ในความดูแลของคุณ'
        );
        return;
    }

    container.innerHTML = list.map((asset, index) => `
    <div class="card hover-lift" style="animation-delay: ${index * 0.05}s; margin-bottom: var(--space-4);">
      <div class="row"><div class="label">หมายเลขประจำวัสดุ</div><div><strong>${asset.asset_id || '-'}</strong></div></div>
      <div class="row"><div class="label">รายการ</div><div>${asset.item_name || '-'}</div></div>
      <div class="row"><div class="label">ห้อง</div><div>${asset.room || '-'}</div></div>
      <div class="row"><div class="label">ราคาต่อหน่วย</div><div>${asset.unit_price || '-'}</div></div>
      <div class="row"><div class="label">อัปเดตล่าสุด</div><div>${asset.last_updated || '-'}</div></div>
      <div class="row">
        <div class="label">สถานะ</div>
        <div><span class="badge ${asset.status || ''}">${asset.status || '-'}</span></div>
      </div>
    </div>
  `).join('');
}
