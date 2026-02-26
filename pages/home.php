<div id="page-home" class="page-view active">
    <div class="home-header-section">
        <div class="home-top-nav">
            <div>
                <div style="font-size:12px; font-weight:500; opacity:0.8;">Halo,</div>
                <div style="font-size:18px; font-weight:800;" id="home-user-name">User</div>
            </div>
            <div style="display:flex; gap:8px;">
                <div class="filter-chip" onclick="Dompetra.utils.openFilter()" id="cycle-filter-disp"><i class="ph-bold ph-calendar-blank"></i> Periode</div>
                <div class="header-avatar" onclick="Dompetra.nav.go('profile')">
                    <img id="home-avatar-img" src="" style="display:none;" alt="Profile">
                    <i class="ph-bold ph-user" id="home-avatar-icon"></i>
                </div>
            </div>
        </div>
        <div class="balance-hero">
            <div class="balance-label" id="bal-label">Total Saldo</div>
            <div class="balance-val skeleton" id="disp-balance" style="min-width: 150px; display: inline-block; border-radius: 8px;">Rp 0</div>
        </div>
        <div class="quick-scroll" id="quick-actions-container"></div>
        <div class="header-actions">
            <button class="h-action-btn in" id="btn-home-in" onclick="Dompetra.modals.openPicker('tx', 'income')"><i class="ph-bold ph-arrow-down-left"></i> Pemasukan</button>
            <button class="h-action-btn out" id="btn-home-out" onclick="Dompetra.modals.openPicker('tx', 'expense')"><i class="ph-bold ph-arrow-up-right"></i> Pengeluaran</button>
        </div>
    </div>
    <div class="home-grid-overlap">
        <div class="home-grid">
            <div class="menu-item" id="btn-menu-anal" onclick="Dompetra.nav.go('analysis')"><div class="menu-icon" style="color:var(--fin-primary); background:var(--fin-primary-soft); border-color:var(--fin-primary);"><i class="ph-fill ph-chart-bar"></i></div><div class="menu-label" style="font-weight:700; color:var(--fin-primary);">Analisis</div></div>
            <div class="menu-item" id="btn-menu-export" onclick="Dompetra.nav.go('export')"><div class="menu-icon" style="color:var(--fin-text-muted);"><i class="ph-fill ph-file-pdf"></i></div><div class="menu-label">Laporan</div></div>
            <div class="menu-item" id="btn-menu-cat" onclick="Dompetra.nav.go('categories')"><div class="menu-icon"><i class="ph-fill ph-tag"></i></div><div class="menu-label">Kategori</div></div>
            <div class="menu-item" id="btn-menu-shared" onclick="Dompetra.nav.go('shared')"><div class="menu-icon" style="color:#8B5CF6; border-color:#8B5CF6; background:rgba(139,92,246,0.1);"><i class="ph-fill ph-users"></i></div><div class="menu-label" style="color:#8B5CF6; font-weight:700;">Bersama</div></div>
        </div>
    </div>
    <div style="padding:0 24px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;"><h3 style="font-size:14px; font-weight:700; margin:0; color:var(--fin-text-muted);">Terakhir</h3><span style="font-size:12px; font-weight:700; color:var(--fin-primary); cursor:pointer;" onclick="Dompetra.nav.go('list')">Lihat Semua</span></div>
    <div class="list-group" id="recent-list"></div>
    <div style="height:100px;"></div>
</div>