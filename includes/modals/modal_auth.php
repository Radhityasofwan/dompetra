<div id="auth-screen">
    <img src="https://matiklaundry.site/wp-content/uploads/2025/12/ChatGPT_Image_Dec_23__2025__01_01_38_PM-removebg-preview.png" class="auth-logo" alt="Dompetra">
    <h1 style="font-size:26px; font-weight:800; margin-bottom:8px; color:var(--fin-text-dark); letter-spacing:-0.5px;">Dompetra</h1>
    <p style="color:var(--fin-text-muted); margin-bottom:48px; font-size:15px;">Kelola uang, wujudkan impian.</p>

    <div id="login-form" style="width:100%; max-width:320px;">
        <input type="email" id="login-email" class="inp-std" placeholder="Email Anda">
        <input type="password" id="login-pass" class="inp-std" placeholder="Password">
        <button class="auth-btn" id="btn-login">Masuk Aplikasi</button>
        <div style="margin-top:24px; font-size:14px; color:var(--fin-text-muted); text-align:center; cursor:pointer;" onclick="window.toggleAuth('reg')">
            Belum punya akun? <span style="color:var(--fin-primary); font-weight:700;">Daftar</span>
        </div>
    </div>

    <div id="reg-form" style="width:100%; max-width:320px; display:none;">
        <input type="text" id="reg-name" class="inp-std" placeholder="Nama Lengkap">
        <input type="tel" id="reg-wa" class="inp-std" placeholder="WhatsApp (08...)" inputmode="numeric">
        <input type="email" id="reg-email" class="inp-std" placeholder="Email Aktif">
        <input type="password" id="reg-pass" class="inp-std" placeholder="Buat Password">
        <button class="auth-btn" id="btn-reg">Buat Akun Baru</button>
        <div style="margin-top:24px; font-size:14px; color:var(--fin-text-muted); text-align:center; cursor:pointer;" onclick="window.toggleAuth('login')">
            Sudah punya akun? <span style="color:var(--fin-primary); font-weight:700;">Masuk</span>
        </div>
    </div>
</div>