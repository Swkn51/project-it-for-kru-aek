// ===== Login Check =====
const user = checkAuth();

// ===== Display User Info =====
displayUserInfo('userInfo', 'userAvatar');

// ===== Load Profile =====
const avatar = document.getElementById('avatar');

if (user.avatar) {
  avatar.style.backgroundImage = `url(${user.avatar})`;
  document.getElementById('userAvatar').style.backgroundImage = `url(${user.avatar})`;
}

document.getElementById('username').value = user.username || '';
document.getElementById('fullname').value = user.fullname || '';

// ===== Upload Image =====
function pickImage() {
  document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    avatar.style.backgroundImage = `url(${reader.result})`;
    document.getElementById('userAvatar').style.backgroundImage = `url(${reader.result})`;
    user.avatar = reader.result;
    localStorage.setItem('loginUser', JSON.stringify(user));
    showAlert('อัปโหลดรูปสำเร็จ', 'success');
  };
  reader.readAsDataURL(file);
});

// ===== Save Profile =====
function saveProfile() {
  const newUsername = document.getElementById('username').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Username validation
  if (newUsername.length < 4) {
    showAlert('Username ต้องมีอย่างน้อย 4 ตัวอักษร', 'error');
    document.getElementById('username').focus();
    return;
  }

  // Password validation
  if (newPassword || confirmPassword) {
    if (newPassword !== confirmPassword) {
      showAlert('รหัสผ่านไม่ตรงกัน', 'error');
      document.getElementById('confirmPassword').focus();
      return;
    }
    if (newPassword.length < 4) {
      showAlert('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร', 'error');
      return;
    }
    user.password = newPassword;
  }

  user.username = newUsername;
  localStorage.setItem('loginUser', JSON.stringify(user));

  // Clear password fields
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';

  showAlert('บันทึกข้อมูลเรียบร้อย', 'success');
}
