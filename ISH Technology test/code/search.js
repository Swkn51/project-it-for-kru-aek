// ===== Login Check =====
const user = checkAuth();

// ===== Display User Info =====
displayUserInfo('userInfo', 'userAvatar');

// ===== Load Excel Data =====
let assets = [];
let currentMode = 'AZ';

fetch('../data/data center/data.xlsx')
  .then(res => res.arrayBuffer())
  .then(data => {
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    assets = XLSX.utils.sheet_to_json(sheet);
  })
  .catch(err => {
    console.error('Error loading data:', err);
    document.getElementById('result').innerHTML = createEmptyState(
      'ri-error-warning-line',
      'ไม่สามารถโหลดข้อมูลได้',
      'กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง'
    );
  });

// ===== Toggle Sort Mode =====
function toggleSort() {
  const btn = document.getElementById('toggleBtn');
  currentMode = currentMode === 'AZ' ? '09' : 'AZ';

  if (currentMode === 'AZ') {
    btn.innerHTML = '<i class="ri-sort-asc"></i> A - Z';
  } else {
    btn.innerHTML = '<i class="ri-sort-number-asc"></i> 0 - 9';
  }

  showByMode();
}

function showByMode() {
  let filtered = currentMode === 'AZ'
    ? assets.filter(a => /^[A-Za-z]/.test(a.asset_id))
    : assets.filter(a => /^[0-9]/.test(a.asset_id));

  filtered.sort((a, b) => String(a.asset_id).localeCompare(String(b.asset_id)));
  renderCards(filtered);
}

// ===== Live Search with Debounce =====
const liveSearch = debounce(() => {
  const input = document.getElementById('searchInput').value.trim().toLowerCase();

  if (!input) {
    document.getElementById('result').innerHTML = '';
    return;
  }

  const ranked = assets
    .filter(a => {
      const id = String(a.asset_id || '').toLowerCase();
      const name = String(a.item_name || '').toLowerCase();
      const caretaker = String(a.caretaker || '').toLowerCase();
      return id.includes(input) || name.includes(input) || caretaker.includes(input);
    })
    .map(a => {
      const id = String(a.asset_id || '').toLowerCase();
      let score = id === input ? 100 : id.startsWith(input) ? 80 : 50;
      return { ...a, _score: score };
    })
    .sort((a, b) => b._score - a._score);

  if (ranked.length === 0) {
    document.getElementById('result').innerHTML = createEmptyState(
      'ri-file-search-line',
      'ไม่พบข้อมูล',
      `ไม่พบวัสดุที่ตรงกับคำค้นหา "${input}"`
    );
    return;
  }

  renderCards(ranked);
}, 200);

// ===== Render Cards =====
function renderCards(list) {
  const container = document.getElementById('result');
  container.innerHTML = '';

  list.forEach((asset, index) => {
    const card = document.createElement('div');
    card.className = 'card hover-lift';
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
      <div class="row"><div class="label">หมายเลขประจำวัสดุ</div><div><strong>${asset.asset_id || '-'}</strong></div></div>
      <div class="row"><div class="label">รายการ</div><div>${asset.item_name || '-'}</div></div>
      <div class="row"><div class="label">วิธีที่ได้รับมา</div><div>${asset.acquire_method || '-'}</div></div>
      <div class="row"><div class="label">ราคาต่อหน่วย</div><div>${asset.unit_price || '-'}</div></div>
      <div class="row"><div class="label">ห้อง</div><div>${asset.room || '-'}</div></div>
      <div class="row"><div class="label">ผู้ดูแล</div><div>${asset.caretaker || '-'}</div></div>
      <div class="row"><div class="label">อัปเดตล่าสุด</div><div>${asset.last_updated || '-'}</div></div>
      <div class="row">
        <div class="label">สถานะ</div>
        <div><span class="badge ${asset.status || ''}">${asset.status || '-'}</span></div>
      </div>
    `;
    container.appendChild(card);
  });
}
