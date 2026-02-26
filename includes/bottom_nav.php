<div class="bulk-bar" id="bulk-bar">
    <div style="font-weight:700; font-size:14px;"><span id="sel-count">0</span> Terpilih</div>
    <div style="display:flex; gap:16px;">
        <button onclick="Dompetra.utils.toggleSelectionMode()" style="background:none; border:none; color:white; font-weight:700; cursor:pointer;">Batal</button>
        <button onclick="Dompetra.data.delBulk()" style="background:white; color:var(--fin-danger); border:none; padding:8px 16px; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;"><i class="ph-bold ph-trash"></i> Hapus</button>
    </div>
</div>
<nav class="nav-float" id="nav-bar">
    <div class="nav-item active" id="nav-home" onclick="Dompetra.nav.go('home')"><i class="ph-fill ph-house"></i><span style="font-size:10px; font-weight:700;">Home</span></div>
    <div class="nav-item" id="nav-list" onclick="Dompetra.nav.go('list')"><i class="ph-fill ph-list-dashes"></i><span style="font-size:10px; font-weight:700;">List</span></div>
    <div class="nav-fab" id="btn-fab-add" onclick="Dompetra.modals.openPicker('tx')"><i class="ph-bold ph-plus"></i></div>
    <div class="nav-item" id="nav-budget" onclick="Dompetra.nav.go('budget')"><i class="ph-fill ph-chart-pie-slice"></i><span style="font-size:10px; font-weight:700;">Budget</span></div>
    <div class="nav-item" id="nav-profile" onclick="Dompetra.nav.go('profile')"><i class="ph-fill ph-user"></i><span style="font-size:10px; font-weight:700;">Saya</span></div>
</nav>