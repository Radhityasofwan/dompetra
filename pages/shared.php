<div id="page-shared" class="page-view">
    <div class="page-header"><h2 class="ph-title">Akun Bersama</h2><p class="ph-subtitle">Kelola keuangan keluarga atau tim.</p></div>
    <div id="no-group-view" style="padding:0 24px; text-align:center; display:none;">
        <div style="background:var(--fin-card-bg); padding:32px 24px; border-radius:24px; border:1px solid var(--fin-border);">
            <i class="ph-duotone ph-users-three" style="font-size:48px; color:var(--fin-primary); margin-bottom:16px;"></i>
            <h3 style="font-size:16px; font-weight:700; margin-bottom:8px;">Belum ada Grup</h3>
            <p style="font-size:13px; color:var(--fin-text-muted); margin-bottom:24px;">Buat grup baru atau gabung dengan kode undangan.</p>
            <button class="num-btn primary" id="btn-create-group" onclick="Dompetra.modals.openCreateGroup()">Buat Grup Baru</button>
            <button class="num-btn" style="margin-top:12px;" onclick="Dompetra.modals.openJoinGroup()">Gabung Grup</button>
        </div>
    </div>
    <div id="has-group-view" style="display:none;">
        <div class="shared-banner">
            <div><div style="font-size:12px; opacity:0.8;">Grup Aktif</div><div style="font-size:20px; font-weight:800;" id="active-group-name">Keluarga</div></div>
            <button onclick="Dompetra.group.exit()" style="background:rgba(255,255,255,0.2); border:none; color:white; padding:8px 12px; border-radius:12px; font-weight:600; cursor:pointer;">Keluar</button>
        </div>
        <div style="padding:0 24px;">
            <div class="list-card" onclick="Dompetra.group.switch('active')"><div class="icon-box" style="background:#F3E8FF; color:#8B5CF6;"><i class="ph-bold ph-check-circle"></i></div><div style="flex:1;"><div style="font-size:14px; font-weight:700;">Gunakan Akun Ini</div><div style="font-size:12px; color:var(--fin-text-muted);">Klik untuk beralih ke mode grup</div></div></div>
            <div style="margin-top:24px; font-size:13px; font-weight:700; color:var(--fin-text-muted); margin-bottom:12px;">Kode Undangan</div>
            <div style="background:var(--fin-bg-gray); padding:16px; border-radius:16px; display:flex; justify-content:space-between; align-items:center; border:1px dashed var(--fin-border);"><span style="font-size:18px; font-weight:800; letter-spacing:2px; color:var(--fin-text-dark);" id="group-code">...</span><i class="ph-bold ph-copy" style="color:var(--fin-primary); cursor:pointer;" onclick="Dompetra.utils.copyCode()"></i></div>
            <div style="margin-top:24px; font-size:13px; font-weight:700; color:var(--fin-text-muted); margin-bottom:12px;">Anggota</div>
            <div class="list-group" id="group-members-list" style="padding:0;"></div>
        </div>
    </div>
</div>