<div id="page-export" class="page-view">
    <div class="page-header">
        <h2 class="ph-title">Laporan</h2>
        <p class="ph-subtitle">Unduh data keuangan.</p>
    </div>
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