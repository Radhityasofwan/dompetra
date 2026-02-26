<div id="page-list" class="page-view">
    <div class="page-header">
        <h2 class="ph-title">Riwayat</h2>
        <p class="ph-subtitle" id="list-period-disp">...</p>
    </div>
    <div style="padding:0 24px 12px; display:flex; gap:8px;">
        <button class="btn-pill" onclick="Dompetra.utils.openFilter()" style="flex:1; background:var(--fin-card-bg); color:var(--fin-text-dark); border:1px solid var(--fin-border);"><i class="ph-bold ph-funnel"></i> Filter</button>
        <button class="btn-pill" id="btn-toggle-select" onclick="Dompetra.utils.toggleSelectionMode()" style="background:var(--fin-card-bg); color:var(--fin-primary); border:1px solid var(--fin-primary-soft);"><i class="ph-bold ph-check-square"></i> Pilih</button>
    </div>
    <div class="list-group" id="full-list"></div>
    <div style="height:100px;"></div>
</div>