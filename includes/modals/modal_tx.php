<!-- MODAL TRANSACTION (CRUD) -->
<div class="modal-backdrop" id="modalTx" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
            <div style="font-size:22px; font-weight:800; letter-spacing:-0.5px;" id="tx-title">Transaksi Baru</div>
            <div id="tx-cat-badge"
                style="background:var(--fin-primary-soft); color:var(--fin-primary); padding:6px 16px; border-radius:14px; font-size:13px; font-weight:800;">
                Umum</div>
        </div>

        <input type="hidden" id="tx-id">
        <input type="hidden" id="tx-cat-id">
        <input type="hidden" id="tx-mode">
        <input type="hidden" id="budget-cat-id">

        <div class="sheet-scroll">
            <div class="numpad-display" style="text-align:center; margin-bottom:32px;">
                <div class="numpad-val" id="num-display"
                    style="font-size: 56px; font-weight: 800; color: var(--fin-primary); letter-spacing: -2px;">0</div>
            </div>

            <!-- Numpad Grid: Bootstrap 3 Columns (Sangat Stabil) -->
            <div class="row g-3 mb-4">
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('1')">1</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('2')">2</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('3')">3</button></div>

                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('4')">4</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('5')">5</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('6')">6</button></div>

                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('7')">7</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('8')">8</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('9')">9</button></div>

                <div class="col-4"><button class="num-btn w-100 text-danger" style="color:var(--fin-danger);"
                        onclick="Dompetra.pad.clear()">C</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.tap('0')">0</button></div>
                <div class="col-4"><button class="num-btn w-100" onclick="Dompetra.pad.back()"><i
                            class="ph-bold ph-backspace"></i></button></div>
            </div>

            <div style="margin-bottom:20px;">
                <input type="text" id="tx-desc" class="inp-std w-100" placeholder="Catatan (Opsional)">
            </div>

            <div style="margin-bottom:20px;">
                <input type="date" id="tx-date" class="inp-std w-100">
            </div>

            <div id="tx-wallet-wrapper" style="margin-bottom:24px;">
                <label
                    style="font-size:13px; font-weight:800; color:var(--fin-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; display:block;">Sumber
                    Dana</label>
                <input type="hidden" id="tx-wallet-id">
                <div class="wallet-selector" id="tx-wallet-selector"></div>
            </div>

            <div id="tx-budget-alloc-container" style="display:none; margin-bottom:24px;">
                <label
                    style="font-size:13px; font-weight:800; color:var(--fin-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; display:block;">Alokasi
                    Budget</label>
                <select id="tx-budget-id" class="inp-std w-100">
                    <option value="">Tanpa Anggaran</option>
                </select>
            </div>

            <!-- Budget Specific Inputs -->
            <div id="budget-active-container" style="display:none; gap:16px; margin-bottom:20px; align-items:center;">
                <input type="checkbox" id="budget-active" checked style="width:24px; height:24px;">
                <label for="budget-active" style="font-weight:700; font-size:16px;">Budget Aktif</label>
            </div>

            <div id="budget-date-container" style="display:none; gap:16px; margin-bottom:20px;">
                <div style="flex:1;">
                    <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Mulai</label>
                    <input type="date" id="budget-start" class="inp-std w-100" onchange="Dompetra.utils.calcEndDate()">
                </div>
                <div style="flex:1;">
                    <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Durasi
                        (Hari)</label>
                    <input type="number" id="budget-duration" class="inp-std w-100" value="30"
                        onkeyup="Dompetra.utils.calcEndDate()">
                </div>
            </div>
            <div id="budget-end-disp"
                style="display:none; font-size:14px; color:var(--fin-text-muted); margin-bottom:28px;">
                Berakhir pada: <span id="budget-end-date"
                    style="font-weight:800; color:var(--fin-text-dark);">...</span>
            </div>

            <div class="row g-3 mt-2">
                <div class="col-4" id="btn-del-tx-col" style="display:none;">
                    <button class="num-btn w-100" style="color:var(--fin-danger); border-color:var(--fin-danger);"
                        onclick="Dompetra.data.delMain()">Hapus</button>
                </div>
                <div class="col">
                    <button class="num-btn primary w-100" onclick="Dompetra.data.saveMain()">Simpan Data</button>
                </div>
            </div>

            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>

<!-- MODAL CATEGORY PICKER -->
<div class="modal-backdrop" id="modalPicker" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title" style="margin-bottom:32px;">Pilih Kategori</div>
        <div class="sheet-scroll">
            <div class="row g-4" id="picker-grid"></div>
            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>

<!-- MODAL WALLET -->
<div class="modal-backdrop" id="modalWallet" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Kelola Dompet</div>
        <div class="sheet-scroll">
            <input type="hidden" id="w-id">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Nama Dompet</label>
            <input type="text" id="w-name" class="inp-std w-100" placeholder="Contoh: BCA, Dompet Saku"
                style="margin-bottom:20px;">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Tipe</label>
            <select id="w-type" class="inp-std w-100" style="margin-bottom:20px;">
                <option value="cash">Tunai</option>
                <option value="bank">Bank</option>
                <option value="ewallet">E-Wallet</option>
            </select>

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Saldo Awal (Rp)</label>
            <input type="number" id="w-bal" class="inp-std w-100" placeholder="0" style="margin-bottom:24px;">

            <label
                style="font-size:13px; font-weight:800; color:var(--fin-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:16px; text-align:center; display:block;">Warna
                Kartu</label>
            <input type="hidden" id="w-color" value="grad-blue">
            <div style="display:flex; gap:16px; margin-bottom:40px; justify-content: center;">
                <div class="w-color-opt grad-blue" onclick="Dompetra.utils.setWColor('grad-blue')"
                    style="width:48px; height:48px; border-radius:50%; border:3px solid var(--fin-text-dark); cursor:pointer; transition:border-color 0.2s;">
                </div>
                <div class="w-color-opt grad-green" onclick="Dompetra.utils.setWColor('grad-green')"
                    style="width:48px; height:48px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:border-color 0.2s;">
                </div>
                <div class="w-color-opt grad-purple" onclick="Dompetra.utils.setWColor('grad-purple')"
                    style="width:48px; height:48px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:border-color 0.2s;">
                </div>
                <div class="w-color-opt grad-orange" onclick="Dompetra.utils.setWColor('grad-orange')"
                    style="width:48px; height:48px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:border-color 0.2s;">
                </div>
                <div class="w-color-opt grad-dark" onclick="Dompetra.utils.setWColor('grad-dark')"
                    style="width:48px; height:48px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:border-color 0.2s;">
                </div>
            </div>

            <div style="display:flex; gap:16px;">
                <button class="num-btn w-100" id="btn-del-wallet"
                    style="flex:1; color:var(--fin-danger); border-color:var(--fin-danger); display:none;"
                    onclick="Dompetra.data.delWallet()">Hapus</button>
                <button class="num-btn primary w-100" style="flex:2;"
                    onclick="Dompetra.data.saveWallet()">Simpan</button>
            </div>

            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>

<!-- MODAL FILTER -->
<div class="modal-backdrop" id="modalFilter" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Filter & Periode</div>
        <div class="sheet-scroll">
            <div class="list-card liquid-glass" onclick="Dompetra.utils.setFilterMode('payday')" id="opt-payday"
                style="margin-bottom:16px;">
                <div class="icon-box" style="background:var(--fin-primary-soft); color:var(--fin-primary);"><i
                        class="ph-bold ph-calendar-check"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:15px;">Ikuti Periode Gaji</div>
                    <div style="font-size:13px; color:var(--fin-text-muted); margin-top:4px;">Otomatis reset tiap gajian
                    </div>
                </div>
                <div class="check-circle" id="chk-payday"
                    style="opacity:1; border:none; background:var(--fin-primary); color:white;"><i
                        class="ph-bold ph-check"></i></div>
            </div>

            <div class="list-card liquid-glass" onclick="Dompetra.utils.setFilterMode('custom')" id="opt-custom">
                <div class="icon-box" style="background:var(--fin-bg-base); color:var(--fin-text-muted);"><i
                        class="ph-bold ph-faders"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:15px;">Kustomisasi</div>
                    <div style="font-size:13px; color:var(--fin-text-muted); margin-top:4px;">Pilih tanggal sendiri
                    </div>
                </div>
                <div class="check-circle" id="chk-custom"
                    style="opacity:0; border:none; background:var(--fin-primary); color:white;"><i
                        class="ph-bold ph-check"></i></div>
            </div>

            <div id="date-range-inputs"
                style="display:none; margin-top:24px; padding-top:24px; border-top:1px dashed var(--fin-border);">
                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Dari
                            Tanggal</label>
                        <input type="date" id="filter-start" class="inp-std w-100">
                    </div>
                    <div class="col-6">
                        <label style="font-size:12px; font-weight:700; margin-bottom:8px; display:block;">Sampai
                            Tanggal</label>
                        <input type="date" id="filter-end" class="inp-std w-100">
                    </div>
                </div>
                <button class="num-btn primary w-100"
                    onclick="Dompetra.utils.applyFilter(); Dompetra.utils.closeAll();">Terapkan Filter</button>
            </div>

            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>

<!-- MODAL QA MANAGER -->
<div class="modal-backdrop" id="modalQA" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Atur Transaksi Cepat</div>
        <div class="sheet-scroll">
            <div id="qa-list-container" style="margin-bottom:32px;"></div>

            <hr style="border:none; border-top:1px dashed var(--fin-border); margin-bottom:24px;">
            <h4 style="margin:0 0 20px; font-size:16px; font-weight:800;">Tambah Tombol Baru</h4>

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Label Tombol</label>
            <input type="text" id="qa-label" class="inp-std w-100" placeholder="Misal: Makan Siang 20k"
                style="margin-bottom:20px;">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Nominal (Rp)</label>
            <input type="number" id="qa-amount" class="inp-std w-100" placeholder="20000" style="margin-bottom:20px;">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Kategori</label>
            <select id="qa-cat" class="inp-std w-100" style="margin-bottom:20px;"></select>

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Budget (Opsional)</label>
            <select id="qa-budget" class="inp-std w-100" style="margin-bottom:32px;"></select>

            <button class="num-btn primary w-100" onclick="Dompetra.modals.addQA()">Simpan Tombol</button>
            <div style="height: 24px;"></div> <!-- Extra Spacing -->
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

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Nama Kategori</label>
            <input type="text" id="cat-name" class="inp-std w-100" placeholder="Nama Kategori"
                style="margin-bottom:20px;">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Tipe</label>
            <select id="cat-type" class="inp-std w-100" style="margin-bottom:20px;">
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
            </select>

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Pilih Ikon</label>
            <select id="cat-icon" class="inp-std w-100" style="margin-bottom:32px;"></select>

            <div style="display:flex; gap:16px;">
                <button class="num-btn w-100" id="btn-del-cat"
                    style="flex:1; color:var(--fin-danger); border-color:var(--fin-danger);"
                    onclick="Dompetra.data.delCat()">Hapus</button>
                <button class="num-btn primary w-100" style="flex:2;" onclick="Dompetra.data.saveCat()">Simpan</button>
            </div>
            <div style="height: 24px;"></div> <!-- Extra Spacing -->
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
                    <img id="preview-avatar-img" src=""
                        style="display:none; width:100%; height:100%; object-fit:cover;">
                    <i class="ph-bold ph-camera" id="preview-avatar-icon"></i>
                </div>
                <div class="avatar-edit-badge"><i class="ph-bold ph-pencil-simple"></i></div>
            </div>
            <input type="file" id="inp-avatar" hidden accept="image/*" onchange="Dompetra.utils.previewAvatar(this)">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Nama Lengkap</label>
            <input type="text" id="edit-name" class="inp-std w-100" style="margin-bottom:20px;">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">WhatsApp</label>
            <input type="text" id="edit-wa" class="inp-std w-100" style="margin-bottom:20px;">

            <label style="font-size:13px; font-weight:700; margin-bottom:10px; display:block;">Tanggal Gajian
                (1-31)</label>
            <input type="number" id="edit-payday" class="inp-std w-100" min="1" max="31" style="margin-bottom:32px;">

            <button class="num-btn primary w-100" onclick="Dompetra.data.saveProfile()">Simpan Perubahan</button>
            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>

<!-- MODAL THEME & COLOR SETTINGS -->
<div class="modal-backdrop" id="modalTheme" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Pengaturan</div>
        <div class="sheet-scroll">

            <!-- NOTIFIKASI TOGGLE -->
            <div
                style="font-size:12px; font-weight:800; color:var(--fin-text-muted); margin-bottom:16px; text-transform:uppercase; letter-spacing:1px;">
                Push Notifikasi</div>
            <div class="list-card liquid-glass" onclick="Dompetra.pwa.enableNotifications()"
                style="margin-bottom:32px;">
                <div class="icon-box bg-gray"><i class="ph-bold ph-bell"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:15px;">Izinkan Notifikasi</div>
                    <div style="font-size:13px; color:var(--fin-text-muted); margin-top:4px;">Pengingat budget otomatis
                    </div>
                </div>
                <div class="check-circle" id="chk-notif"
                    style="opacity:0; background:var(--fin-primary); color:white; border:none; transition:opacity 0.3s;">
                    <i class="ph-bold ph-check"></i></div>
            </div>

            <!-- Pengaturan Tema Terang / Gelap -->
            <div
                style="font-size:12px; font-weight:800; color:var(--fin-text-muted); margin-bottom:16px; text-transform:uppercase; letter-spacing:1px;">
                Mode Layar</div>
            <div class="list-card liquid-glass" onclick="Dompetra.utils.setTheme('auto')" style="margin-bottom:12px;">
                <div class="icon-box bg-gray"><i class="ph-bold ph-monitor"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:15px;">Otomatis (Sistem)</div>
                </div>
                <div class="check-circle" id="chk-auto"
                    style="opacity:0; background:var(--fin-primary); color:white; border:none;"><i
                        class="ph-bold ph-check"></i></div>
            </div>
            <div class="list-card liquid-glass" onclick="Dompetra.utils.setTheme('light')" style="margin-bottom:12px;">
                <div class="icon-box bg-gray"><i class="ph-bold ph-sun"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:15px;">Terang</div>
                </div>
                <div class="check-circle" id="chk-light"
                    style="opacity:0; background:var(--fin-primary); color:white; border:none;"><i
                        class="ph-bold ph-check"></i></div>
            </div>
            <div class="list-card liquid-glass" onclick="Dompetra.utils.setTheme('dark')">
                <div class="icon-box bg-gray"><i class="ph-bold ph-moon"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:15px;">Gelap</div>
                </div>
                <div class="check-circle" id="chk-dark"
                    style="opacity:0; background:var(--fin-primary); color:white; border:none;"><i
                        class="ph-bold ph-check"></i></div>
            </div>

            <!-- UI Pemilih Warna (10 Opsi Baru + Custom RGB) -->
            <hr style="border:none; border-top:1px dashed var(--fin-border); margin:32px 0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
                <div
                    style="font-size:12px; font-weight:800; color:var(--fin-text-muted); text-transform:uppercase; letter-spacing:1px;">
                    Warna Aksen Dominan</div>
                <div style="font-size:11px; font-weight:600; color:var(--fin-primary);">Geser <i
                        class="ph-bold ph-arrow-right"></i></div>
            </div>

            <div class="color-swatch-container" style="padding-bottom: 24px;">
                <!-- 10 Preset Tema Populer -->
                <div class="color-swatch active" style="background:linear-gradient(135deg, #1D4ED8, #60A5FA);"
                    onclick="Dompetra.utils.setColorTheme('sapphire')" id="csw-sapphire"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #0F766E, #2DD4BF);"
                    onclick="Dompetra.utils.setColorTheme('jade')" id="csw-jade"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #B91C1C, #F87171);"
                    onclick="Dompetra.utils.setColorTheme('crimson')" id="csw-crimson"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #A21CAF, #F472B6);"
                    onclick="Dompetra.utils.setColorTheme('magenta')" id="csw-magenta"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #C2410C, #FBBF24);"
                    onclick="Dompetra.utils.setColorTheme('tangerine')" id="csw-tangerine"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #374151, #94A3B8);"
                    onclick="Dompetra.utils.setColorTheme('graphite')" id="csw-graphite"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #0891B2, #67E8F9);"
                    onclick="Dompetra.utils.setColorTheme('cyan')" id="csw-cyan"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #6D28D9, #A78BFA);"
                    onclick="Dompetra.utils.setColorTheme('lavender')" id="csw-lavender"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #9A3412, #FDBA74);"
                    onclick="Dompetra.utils.setColorTheme('bronze')" id="csw-bronze"></div>
                <div class="color-swatch" style="background:linear-gradient(135deg, #4D7C0F, #A3E635);"
                    onclick="Dompetra.utils.setColorTheme('olive')" id="csw-olive"></div>

                <!-- Custom RGB Color Picker -->
                <div class="color-swatch"
                    style="background:conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;"
                    id="csw-custom">
                    <i class="ph-bold ph-palette"
                        style="color:white; font-size: 24px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6)); pointer-events:none;"></i>
                    <input type="color" id="custom-color-input"
                        style="position:absolute; inset:-10px; width:200%; height:200%; opacity:0; cursor:pointer;"
                        onchange="Dompetra.utils.setCustomColor(this.value)">
                </div>
            </div>

            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>

<!-- MODAL CREATE GROUP -->
<div class="modal-backdrop" id="modalCreateGroup" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Buat Grup Baru</div>
        <div class="sheet-scroll">
            <label style="font-size:13px; font-weight:700; display:block; margin-bottom:10px;">Nama Grup</label>
            <input type="text" id="new-group-name" class="inp-std w-100" placeholder="Keluarga Cemara"
                style="margin-bottom:32px;">
            <button class="num-btn primary w-100" onclick="Dompetra.group.create()">Buat Grup</button>
            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>

<!-- MODAL JOIN GROUP -->
<div class="modal-backdrop" id="modalJoinGroup" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Gabung Grup</div>
        <div class="sheet-scroll">
            <label style="font-size:13px; font-weight:700; display:block; margin-bottom:10px;">Kode Undangan</label>
            <input type="text" id="join-group-code" class="inp-std w-100" placeholder="Contoh: AB1234"
                style="margin-bottom:32px;">
            <button class="num-btn primary w-100" onclick="Dompetra.group.join()">Gabung</button>
            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>