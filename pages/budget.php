<div id="page-budget" class="page-view">
    <div class="page-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div><h2 class="ph-title">Budget & Goals</h2><p class="ph-subtitle">Perencanaan keuangan.</p></div>
            <div style="display:flex; gap:8px;">
                <button id="btn-budget-template" style="background:rgba(255,255,255,0.2); border:none; color:white; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer;" onclick="Dompetra.modals.openTemplateManager()"><i class="ph-bold ph-bookmarks"></i></button>
                <button id="btn-budget-add" style="background:rgba(255,255,255,0.2); border:none; color:white; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer;" onclick="Dompetra.modals.openPicker('budget')"><i class="ph-bold ph-plus"></i></button>
            </div>
        </div>
    </div>
    <div id="budget-summary-area" style="padding:0 24px; margin-bottom:16px;"></div>
    <div style="padding:0 24px 16px; display:flex; gap:8px;">
        <button class="btn-pill" onclick="Dompetra.utils.openFilter()" style="background:var(--fin-card-bg); border:1px solid var(--fin-border); color:var(--fin-text-dark); flex:1; font-size:11px; padding:8px 12px; justify-content: flex-start;"><i class="ph-bold ph-calendar-blank"></i> <span id="budget-period-disp">...</span></button>
        <button class="btn-pill" onclick="Dompetra.utils.toggleBudgetFilter()" id="btn-budget-filter-text" style="background:var(--fin-card-bg); border:1px solid var(--fin-border); color:var(--fin-text-dark); flex:none; font-size:11px; padding:8px 12px; min-width:100px;"><i class="ph-bold ph-eye"></i> Aktif Saja</button>
    </div>
    <div style="padding:0 24px 8px; font-size:13px; font-weight:700; color:var(--fin-text-muted);">Budget Bulanan</div>
    <div class="list-group" id="budget-list" style="margin-bottom:24px;"></div>
    <div style="padding:0 24px 8px; font-size:13px; font-weight:700; color:var(--fin-text-muted); display:flex; justify-content:space-between; align-items:center;"><span>Financial Goals</span><span id="btn-goal-add" style="color:var(--fin-primary); cursor:pointer;" onclick="Dompetra.modals.openPicker('goal')">+ Tambah</span></div>
    <div class="list-group" id="goal-list"></div>
    <div style="height:40px;"></div>
</div>