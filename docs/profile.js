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

// ===== Password Modal Functions =====
let pendingSaveData = null;

function openPasswordModal() {
  document.getElementById('passwordModal').classList.add('active');
  document.getElementById('currentPasswordInput').value = '';
  document.getElementById('passwordError').classList.remove('show');
  document.getElementById('currentPasswordInput').focus();
}

function closePasswordModal() {
  document.getElementById('passwordModal').classList.remove('active');
  pendingSaveData = null;
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'ri-eye-off-line';
  } else {
    input.type = 'password';
    icon.className = 'ri-eye-line';
  }
}

function confirmPassword() {
  const enteredPassword = document.getElementById('currentPasswordInput').value;

  if (enteredPassword === user.password) {
    // Password correct, proceed with save
    document.getElementById('passwordError').classList.remove('show');
    closePasswordModal();

    // Apply pending changes
    if (pendingSaveData) {
      user.username = pendingSaveData.username;
      if (pendingSaveData.newPassword) {
        user.password = pendingSaveData.newPassword;
      }
      localStorage.setItem('loginUser', JSON.stringify(user));

      // Clear password fields
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';

      showAlert('บันทึกข้อมูลเรียบร้อย', 'success');
      pendingSaveData = null;
    }
  } else {
    // Password incorrect
    document.getElementById('passwordError').classList.add('show');
    document.getElementById('currentPasswordInput').focus();
  }
}

// ===== Save Profile =====
function saveProfile() {
  const newUsername = document.getElementById('username').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPasswordValue = document.getElementById('confirmPassword').value;

  // Username validation
  if (newUsername.length < 4) {
    showAlert('Username ต้องมีอย่างน้อย 4 ตัวอักษร', 'error');
    document.getElementById('username').focus();
    return;
  }

  // Password validation
  if (newPassword || confirmPasswordValue) {
    if (newPassword !== confirmPasswordValue) {
      showAlert('รหัสผ่านไม่ตรงกัน', 'error');
      document.getElementById('confirmPassword').focus();
      return;
    }
    if (newPassword.length < 4) {
      showAlert('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร', 'error');
      return;
    }
  }

  // Check if password is being changed - require confirmation
  if (newPassword) {
    pendingSaveData = {
      username: newUsername,
      newPassword: newPassword
    };
    openPasswordModal();
  } else {
    // No password change, just update username
    user.username = newUsername;
    localStorage.setItem('loginUser', JSON.stringify(user));
    showAlert('บันทึกข้อมูลเรียบร้อย', 'success');
  }
}

// ===== Close Modal on Escape Key =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePasswordModal();
  }
});

// ===== Close Modal on Outside Click =====
document.getElementById('passwordModal').addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    closePasswordModal();
  }
});
