<!-- Header Halaman -->
<div class="page-header">
    <h2>Riwayat Transaksi</h2>
</div>

<!-- Mulai Area Search & Filter -->
<div class="search-filter-container">
    <!-- 1.1 Search Bar -->
    <div class="search-box">
        <input type="text" id="searchInput" placeholder="Cari catatan transaksi..." autocomplete="off">
        <span class="search-icon">🔍</span>
    </div>

    <!-- 1.3 Multi-Filter -->
    <div class="filter-scroll-wrapper">
        <select id="filterType" class="filter-select">
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
        </select>

        <select id="filterWallet" class="filter-select">
            <option value="all">Semua Dompet</option>
            <!-- Option dompet akan di-generate via JS -->
        </select>

        <select id="filterCategory" class="filter-select">
            <option value="all">Semua Kategori</option>
            <!-- Option kategori akan di-generate via JS -->
        </select>
    </div>
</div>
<!-- Akhir Area Search & Filter -->

<!-- Container List Transaksi -->
<div id="transactionListContainer" class="transaction-list">
    <!-- Card transaksi akan dirender di sini oleh JavaScript -->
</div>

<!-- Pastikan memanggil script data handler di bawah -->
<script src="assets/js/list-handler.js"></script>