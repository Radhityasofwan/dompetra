<div id="page-profile" class="page-view">
    <div class="page-header" style="text-align:center; align-items:center; padding-bottom:40px;">
        <div class="profile-avatar-large" id="prof-display-area">
            <img id="prof-img" src="" style="display:none;" alt="Profile Picture">
            <span id="prof-init" style="font-size:32px; font-weight:700; color:white;">U</span>
        </div>
        <h2 class="ph-title" id="prof-name">User Name</h2>
        <p class="ph-subtitle" id="prof-email" style="opacity:0.8;">...</p>
    </div>
    <div style="padding:0 24px; margin-top:-30px; position:relative; z-index:20;">
        <div class="card-expanded" style="gap:0; padding:0; overflow:hidden;">
            <div class="list-card" id="btn-qa-settings" onclick="Dompetra.modals.openQASettings()" style="border:none; border-bottom:1px solid var(--fin-border); border-radius:0;"><div class="icon-box bg-gray"><i class="ph-bold ph-lightning"></i></div><div style="font-size:14px; font-weight:600;">Atur Transaksi Cepat</div></div>
            <div class="list-card" onclick="Dompetra.nav.go('wallets')" style="border:none; border-bottom:1px solid var(--fin-border); border-radius:0;"><div class="icon-box bg-gray"><i class="ph-bold ph-wallet"></i></div><div style="font-size:14px; font-weight:600;">Dompet Saya</div></div>
            <div class="list-card" onclick="Dompetra.modals.openEditProfile()" style="border:none; border-bottom:1px solid var(--fin-border); border-radius:0;"><div class="icon-box bg-gray"><i class="ph-bold ph-pencil-simple"></i></div><div style="font-size:14px; font-weight:600;">Edit Profil</div></div>
            <div class="list-card" onclick="Dompetra.utils.openTheme()" style="border:none; border-bottom:1px solid var(--fin-border); border-radius:0;"><div class="icon-box bg-gray"><i class="ph-bold ph-moon"></i></div><div style="font-size:14px; font-weight:600;">Tampilan Aplikasi</div></div>
            <div class="list-card" onclick="Dompetra.tutorial.restart()" style="border:none; border-bottom:1px solid var(--fin-border); border-radius:0;"><div class="icon-box bg-gray"><i class="ph-bold ph-graduation-cap"></i></div><div style="font-size:14px; font-weight:600;">Tutorial Aplikasi</div></div>
            <div class="list-card" onclick="Dompetra.nav.go('categories')" style="border:none; border-bottom:1px solid var(--fin-border); border-radius:0;"><div class="icon-box bg-gray"><i class="ph-bold ph-tag"></i></div><div style="font-size:14px; font-weight:600;">Kelola Kategori</div></div>
            <div class="list-card" onclick="Dompetra.auth.logout()" style="border:none; border-radius:0;"><div class="icon-box" style="background:var(--fin-danger-soft); color:var(--fin-danger);"><i class="ph-bold ph-sign-out"></i></div><div style="font-size:14px; font-weight:600; color:var(--fin-danger);">Keluar Akun</div></div>
        </div>
    </div>
    <div style="height:100px;"></div>
</div>

<div id="page-export" class="page-view">
    <div class="page-header"><h2 class="ph-title">Laporan</h2><p class="ph-subtitle">Unduh data keuangan.</p></div>
    <div style="padding:0 24px;">
        <div class="export-card">
            <div style="font-size:11px; font-weight:700; color:var(--fin-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Periode Laporan</div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;"><div style="font-size:16px; font-weight:700; color:var(--fin-text-dark);" id="exp-period-label">...</div><button onclick="Dompetra.utils.openFilter()" style="border:1px solid var(--fin-border); background:var(--fin-bg-gray); color:var(--fin-text-dark); padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">Ubah</button></div>
            <div class="export-preview-row"><span style="color:var(--fin-text-muted);">Total Pemasukan</span><span style="font-weight:700; color:var(--fin-success);" id="exp-in">...</span></div>
            <div class="export-preview-row"><span style="color:var(--fin-text-muted);">Total Pengeluaran</span><span style="font-weight:700; color:var(--fin-text-dark);" id="exp-out">...</span></div>
            <div class="export-preview-row" style="border-top:1px solid var(--fin-border); margin-top:4px; padding-top:12px; border-bottom:none;"><span style="font-weight:700; color:var(--fin-text-dark);">Arus Kas Bersih</span><span style="font-weight:800; color:var(--fin-primary);" id="exp-net">...</span></div>
        </div>
        <button class="btn-export btn-excel" onclick="Dompetra.export.excel()"><i class="ph-bold ph-file-xls" style="font-size:20px;"></i> Download Excel (.xlsx)</button>
        <button class="btn-export btn-pdf" onclick="Dompetra.export.pdf()"><i class="ph-bold ph-file-pdf" style="font-size:20px;"></i> Download PDF (.pdf)</button>
    </div>
</div>

<div id="page-wallets" class="page-view">
    <div class="page-header"><div style="display:flex; justify-content:space-between; align-items:center;"><div><h2 class="ph-title">Dompet</h2><p class="ph-subtitle">Kelola sumber dana.</p></div><button style="background:rgba(255,255,255,0.2); border:none; color:white; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer;" onclick="Dompetra.modals.openWallet()"><i class="ph-bold ph-plus"></i></button></div></div>
    <div class="wallet-grid" id="wallet-list"></div><div style="height:40px;"></div>
</div>

<div id="page-categories" class="page-view">
    <div class="sub-header"><i class="ph-bold ph-arrow-left" onclick="Dompetra.nav.go('profile')" style="font-size: 22px; cursor: pointer; color: var(--fin-text-dark);"></i><span style="font-weight: 800; font-size: 16px; color: var(--fin-text-dark);">Semua Kategori</span><span style="margin-left: auto; font-weight: 700; color: var(--fin-primary); font-size: 13px; cursor: pointer;" onclick="Dompetra.modals.openCat(null)">+ Tambah</span></div>
    <div class="list-group" id="all-cat-list" style="padding-top: 16px;"></div><div style="height:20px;"></div>
</div>