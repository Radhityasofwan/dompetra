<!-- MODAL FILTER -->
<div class="modal-backdrop" id="modalFilter" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Filter & Periode</div>
        <div class="sheet-scroll">
            <div class="list-card" onclick="Dompetra.utils.setFilterMode('payday')" id="opt-payday" style="margin-bottom:12px;">
                <div class="icon-box" style="background:var(--fin-primary-soft); color:var(--fin-primary);"><i class="ph-bold ph-calendar-check"></i></div>
                <div style="flex:1;"><div style="font-weight:700;">Ikuti Periode Gaji</div><div style="font-size:12px; color:var(--fin-text-muted);">Otomatis reset tiap tanggal gajian</div></div>
                <div class="check-circle" id="chk-payday" style="opacity:1; border:none; background:var(--fin-primary); color:white;"><i class="ph-bold ph-check"></i></div>
            </div>
            <div class="list-card" onclick="Dompetra.utils.setFilterMode('custom')" id="opt-custom">
                <div class="icon-box" style="background:var(--fin-bg-gray); color:var(--fin-text-muted);"><i class="ph-bold ph-faders"></i></div>
                <div style="flex:1;"><div style="font-weight:700;">Kustom</div><div style="font-size:12px; color:var(--fin-text-muted);">Pilih tanggal sendiri</div></div>
                <div class="check-circle" id="chk-custom" style="opacity:0; border:none; background:var(--fin-primary); color:white;"><i class="ph-bold ph-check"></i></div>
            </div>
            <div id="date-range-inputs" style="display:none; margin-top:16px; padding-top:16px; border-top:1px dashed var(--fin-border);">
                 <div style="display:flex; gap:12px; margin-bottom:16px;">
                     <div style="flex:1;"><label style="font-size:11px; font-weight:700; margin-bottom:6px; display:block;">Dari</label><input type="date" id="filter-start" class="inp-std"></div>
                     <div style="flex:1;"><label style="font-size:11px; font-weight:700; margin-bottom:6px; display:block;">Sampai</label><input type="date" id="filter-end" class="inp-std"></div>
                 </div>
                 <button class="num-btn primary w-100" style="height:56px; font-size:16px;" onclick="Dompetra.utils.applyFilter(); Dompetra.utils.closeAll();">Terapkan Filter</button>
            </div>
        </div>
    </div>
</div>

<!-- MODAL QA MANAGER -->
<div class="modal-backdrop" id="modalQA" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Atur Transaksi Cepat</div>
        <div class="sheet-scroll">
            <div id="qa-list-container" style="margin-bottom:24px;"></div>
            <hr style="border:none; border-top:1px dashed var(--fin-border); margin-bottom:20px;">
            <h4 style="margin:0 0 16px; font-size:15px; font-weight:800;">Tambah Baru</h4>
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:8px;">Label Tombol</label>
            <input type="text" id="qa-label" class="inp-std" placeholder="Misal: Makan Siang 20k" style="margin-bottom:16px;">
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:8px;">Nominal (Rp)</label>
            <input type="number" id="qa-amount" class="inp-std" placeholder="20000" style="margin-bottom:16px;">
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:8px;">Kategori</label>
            <select id="qa-cat" class="inp-std" style="margin-bottom:16px;"></select>
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:8px;">Budget (Opsional)</label>
            <select id="qa-budget" class="inp-std" style="margin-bottom:24px;"></select>
            <button class="num-btn primary w-100" onclick="Dompetra.modals.addQA()">Simpan Tombol</button>
        </div>
    </div>
</div>

<!-- MODAL CATEGORY (MANAGE) -->
<div class="modal-backdrop" id="modalCat" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Kelola Kategori</div>
        <div class="sheet-scroll">
            <input type="hidden" id="cat-id">
            <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Nama Kategori</label>
            <input type="text" id="cat-name" class="inp-std" placeholder="Nama Kategori" style="margin-bottom:16px;">
            <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Tipe</label>
            <select id="cat-type" class="inp-std" style="margin-bottom:16px;"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select>
            <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Ikon</label>
            <select id="cat-icon" class="inp-std" style="margin-bottom:24px;"></select>
            <div style="display:flex; gap:12px;">
                <button class="num-btn" id="btn-del-cat" style="flex:1; color:var(--fin-danger); border-color:var(--fin-danger);" onclick="Dompetra.data.delCat()">Hapus</button>
                <button class="num-btn primary" style="flex:2;" onclick="Dompetra.data.saveCat()">Simpan</button>
            </div>
        </div>
    </div>
</div>

<!-- MODAL PROFILE EDIT -->
<div class="modal-backdrop" id="modalProfile" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Edit Profil</div>
        <div class="sheet-scroll">
            <div class="avatar-uploader" onclick="document.getElementById('inp-avatar').click()">
                <div class="avatar-preview" id="preview-avatar">
                    <img id="preview-avatar-img" src="" style="display:none; width:100%; height:100%; object-fit:cover;">
                    <i class="ph-bold ph-camera" id="preview-avatar-icon"></i>
                </div>
                <div class="avatar-edit-badge"><i class="ph-bold ph-pencil-simple"></i></div>
            </div>
            <input type="file" id="inp-avatar" hidden accept="image/*" onchange="Dompetra.utils.previewAvatar(this)">

            <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Nama Lengkap</label>
            <input type="text" id="edit-name" class="inp-std" style="margin-bottom:16px;">
            <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">WhatsApp</label>
            <input type="text" id="edit-wa" class="inp-std" style="margin-bottom:16px;">
            <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Tanggal Gajian (1-31)</label>
            <input type="number" id="edit-payday" class="inp-std" min="1" max="31" style="margin-bottom:24px;">
            <button class="num-btn primary w-100" onclick="Dompetra.data.saveProfile()">Simpan Perubahan</button>
        </div>
    </div>
</div>

<!-- MODAL THEME & COLOR -->
<div class="modal-backdrop" id="modalTheme" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Tampilan Aplikasi</div>
        <div class="sheet-scroll">
            
            <div style="font-size:12px; font-weight:700; color:var(--fin-text-muted); margin-bottom:12px; text-transform:uppercase; letter-spacing:1px;">Mode Layar</div>
            <div class="list-card liquid-glass" onclick="Dompetra.utils.setTheme('auto')" style="margin-bottom:10px;">
                <div class="icon-box bg-gray"><i class="ph-bold ph-monitor"></i></div>
                <div style="flex:1;"><div style="font-weight:700;">Otomatis (Sistem)</div></div>
                <div class="check-circle" id="chk-auto" style="opacity:0; background:var(--fin-primary); color:white; border:none;"><i class="ph-bold ph-check"></i></div>
            </div>
            <div class="list-card liquid-glass" onclick="Dompetra.utils.setTheme('light')" style="margin-bottom:10px;">
                <div class="icon-box bg-gray"><i class="ph-bold ph-sun"></i></div>
                <div style="flex:1;"><div style="font-weight:700;">Terang</div></div>
                <div class="check-circle" id="chk-light" style="opacity:0; background:var(--fin-primary); color:white; border:none;"><i class="ph-bold ph-check"></i></div>
            </div>
            <div class="list-card liquid-glass" onclick="Dompetra.utils.setTheme('dark')">
                <div class="icon-box bg-gray"><i class="ph-bold ph-moon"></i></div>
                <div style="flex:1;"><div style="font-weight:700;">Gelap</div></div>
                <div class="check-circle" id="chk-dark" style="opacity:0; background:var(--fin-primary); color:white; border:none;"><i class="ph-bold ph-check"></i></div>
            </div>

            <!-- UI Pemilih Warna (Fitur Baru) -->
            <hr style="border:none; border-top:1px dashed var(--fin-border); margin:24px 0;">
            <div style="font-size:12px; font-weight:700; color:var(--fin-text-muted); margin-bottom:16px; text-transform:uppercase; letter-spacing:1px; text-align:center;">Warna Aksen</div>
            <div style="display:flex; gap:16px; justify-content:center; margin-bottom:16px;">
                <div class="color-swatch active" style="background:#5E5CE6;" onclick="Dompetra.utils.setColorTheme('default')" id="csw-default"></div>
                <div class="color-swatch" style="background:#10B981;" onclick="Dompetra.utils.setColorTheme('emerald')" id="csw-emerald"></div>
                <div class="color-swatch" style="background:#0EA5E9;" onclick="Dompetra.utils.setColorTheme('ocean')" id="csw-ocean"></div>
                <div class="color-swatch" style="background:#F43F5E;" onclick="Dompetra.utils.setColorTheme('rose')" id="csw-rose"></div>
                <div class="color-swatch" style="background:#F97316;" onclick="Dompetra.utils.setColorTheme('sunset')" id="csw-sunset"></div>
            </div>

        </div>
    </div>
</div>

<!-- MODAL CREATE GROUP -->
<div class="modal-backdrop" id="modalCreateGroup" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Buat Grup Baru</div>
        <div class="sheet-scroll">
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:8px;">Nama Grup</label>
            <input type="text" id="new-group-name" class="inp-std" placeholder="Keluarga Cemara" style="margin-bottom:24px;">
            <button class="num-btn primary w-100" onclick="Dompetra.group.create()">Buat Grup</button>
        </div>
    </div>
</div>

<!-- MODAL JOIN GROUP -->
<div class="modal-backdrop" id="modalJoinGroup" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Gabung Grup</div>
        <div class="sheet-scroll">
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:8px;">Kode Undangan</label>
            <input type="text" id="join-group-code" class="inp-std" placeholder="Contoh: AB1234" style="margin-bottom:24px;">
            <button class="num-btn primary w-100" onclick="Dompetra.group.join()">Gabung</button>
        </div>
    </div>
</div>