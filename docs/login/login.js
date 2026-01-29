async function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const msg = document.getElementById("msg");
  const form = document.getElementById("loginForm");
  const btn = document.getElementById("loginBtn");

  msg.innerText = "";
  form.classList.remove("error");

  btn.classList.add("loading");
  btn.innerText = "Logging in...";

  try {
    const res = await fetch("../../data/user/users.json");
    const users = await res.json();

    setTimeout(() => {
      const user = users.find(
        x => x.username === u && x.password === p
      );

      if (user) {
        localStorage.setItem("loginUser", JSON.stringify(user));
        form.classList.add("success");

        setTimeout(() => {
          window.location.href = "../search.html";
        }, 600);

      } else {
        // ❌ Login ผิด
        btn.classList.remove("loading");
        btn.innerText = "Login";
        msg.innerText = "Username หรือ Password ไม่ถูกต้อง";

        // 🔥 สั่น + ขอบแดง (ทุกครั้ง)
        form.classList.remove("error");
        void form.offsetWidth; // force reflow
        form.classList.add("error");

        // ลบขอบแดงหลัง 1 วินาที (optional)
        setTimeout(() => {
          form.classList.remove("error");
        }, 1000);
      }
    }, 600);

  } catch (err) {
    btn.classList.remove("loading");
    btn.innerText = "Login";
    msg.innerText = "ไม่สามารถโหลดข้อมูลผู้ใช้ได้";
    console.error(err);
  }
}
