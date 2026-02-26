<div id="page-list" class="page-view">
    <div class="page-header">
        <h2 class="ph-title">Riwayat</h2>
        <p class="ph-subtitle" id="list-period-disp">...</p>
    </div>

    <!-- Search Bar -->
    <div style="padding: 0 24px 12px;">
        <div style="position:relative;">
            <i class="ph-bold ph-magnifying-glass" style="position:absolute; left:18px; top:50%; transform:translateY(-50%); color:var(--fin-text-muted); font-size:18px; pointer-events:none;"></i>
            <input
                type="text"
                id="list-search"
                class="inp-std w-100"
                placeholder="Cari catatan transaksi..."
                autocomplete="off"
                oninput="Dompetra.utils.onListSearch(this.value)"
                style="padding-left:48px;"
            >
        </div>
    </div>

    <!-- Filter Row -->
    <div style="padding: 0 24px 16px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <!-- Periode / Filter Tanggal -->
        <button class="btn-pill" onclick="Dompetra.utils.openFilter()" style="background:var(--fin-primary-soft); color:var(--fin-primary); border:none; gap:6px;">
            <i class="ph-bold ph-calendar"></i>
            <span id="list-period-chip">Periode</span>
        </button>

        <!-- Filter Tipe -->
        <select id="list-filter-type" class="inp-std" onchange="Dompetra.utils.applyListFilters()" style="flex:1; min-width:110px; padding:10px 14px; font-size:13px; border-radius:14px; height:42px;">
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
        </select>

        <!-- Filter Dompet -->
        <select id="list-filter-wallet" class="inp-std" onchange="Dompetra.utils.applyListFilters()" style="flex:1; min-width:110px; padding:10px 14px; font-size:13px; border-radius:14px; height:42px;">
            <option value="all">Semua Dompet</option>
        </select>

        <!-- Filter Kategori -->
        <select id="list-filter-cat" class="inp-std" onchange="Dompetra.utils.applyListFilters()" style="flex:1; min-width:120px; padding:10px 14px; font-size:13px; border-radius:14px; height:42px;">
            <option value="all">Semua Kategori</option>
        </select>

        <!-- Tombol Pilih -->
        <button class="btn-pill" id="btn-toggle-select" onclick="Dompetra.utils.toggleSelectionMode()" style="background:var(--fin-primary-soft); color:var(--fin-primary); border:none;">
            <i class="ph-bold ph-check-square"></i>
        </button>
    </div>

    <!-- List Container -->
    <div class="list-group" id="full-list"></div>
    <div style="height:100px;"></div>
</div>