<div id="page-budget" class="page-view">
    <div class="page-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h2 class="ph-title">Budget</h2>
                <p class="ph-subtitle" id="budget-period-disp">...</p>
            </div>
            <div style="display:flex; gap:8px;">
                <button
                    style="background:rgba(255,255,255,0.2); border:none; color:white; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer;"
                    onclick="Dompetra.modals.openTemplateManager()"><i class="ph-bold ph-bookmarks"></i></button>
                <button
                    style="background:rgba(255,255,255,0.2); border:none; color:white; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer;"
                    onclick="Dompetra.modals.openPicker('budget')"><i class="ph-bold ph-plus"></i></button>
            </div>
        </div>
    </div>

    <div id="budget-summary-area" style="padding:0 24px; margin-bottom:16px;"></div>

    <!-- Search Bar -->
    <div style="padding:0 24px 12px;">
        <div style="position:relative;">
            <i class="ph-bold ph-magnifying-glass"
                style="position:absolute; left:18px; top:50%; transform:translateY(-50%); color:var(--fin-text-muted); font-size:18px; pointer-events:none;"></i>
            <input type="text" id="budget-search" class="inp-std w-100" placeholder="Cari budget..." autocomplete="off"
                oninput="Dompetra.utils.onBudgetSearch(this.value)"
                style="padding-left:48px; padding-top:14px; padding-bottom:14px; border-radius:18px; font-size:15px;">
        </div>
    </div>

    <!-- Status Filter + Period Row -->
    <div style="padding:0 24px 16px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <!-- Period chip -->
        <button class="btn-pill" onclick="Dompetra.utils.openFilter()"
            style="background:var(--fin-primary-soft); color:var(--fin-primary); border:none; gap:6px;">
            <i class="ph-bold ph-calendar"></i>
            <span id="budget-period-chip">Periode</span>
        </button>

        <!-- Status filter: 3-state -->
        <div
            style="display:flex; gap:4px; background:var(--fin-bg-base); border-radius:14px; padding:4px; border:1px solid var(--fin-border);">
            <button id="btn-bfilter-active" class="btn-pill active-filter"
                onclick="Dompetra.utils.setBudgetStatusFilter('active')"
                style="padding:7px 14px; font-size:12px; border-radius:10px; border:none; font-weight:700;">Aktif</button>
            <button id="btn-bfilter-expired" class="btn-pill" onclick="Dompetra.utils.setBudgetStatusFilter('expired')"
                style="padding:7px 14px; font-size:12px; border-radius:10px; border:none; font-weight:700;">Kadaluarsa</button>
            <button id="btn-bfilter-all" class="btn-pill" onclick="Dompetra.utils.setBudgetStatusFilter('all')"
                style="padding:7px 14px; font-size:12px; border-radius:10px; border:none; font-weight:700;">Semua</button>
        </div>
    </div>

    <!-- Budget List -->
    <div class="list-group" id="budget-list" style="margin-bottom:24px;"></div>

    <!-- Bulk Action Bar (appears when budgets are selected) -->
    <div id="budget-bulk-bar"
        style="position:fixed; bottom:calc(var(--nav-height, 80px) + 12px); left:50%; transform:translateX(-50%); background:var(--fin-text-dark); color:var(--fin-bg-base); border-radius:20px; padding:14px 24px; display:flex; align-items:center; gap:16px; z-index:500; box-shadow:0 8px 30px rgba(0,0,0,0.3); transition:opacity 0.25s, transform 0.25s; opacity:0; pointer-events:none;">
        <span style="font-size:13px; font-weight:700;"><span id="budget-sel-count">0</span> dipilih</span>
        <button onclick="Dompetra.data.bulkMakeTemplate()"
            style="background:var(--fin-primary); color:white; border:none; border-radius:12px; padding:8px 18px; font-size:13px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px;"><i
                class="ph-bold ph-bookmarks"></i> Jadikan Template</button>
        <button
            onclick="S=Dompetra.state; S.selectedBudgetIds=new Set(); document.getElementById('budget-bulk-bar').classList.remove('active'); Dompetra.render.budgets();"
            style="background:transparent; border:none; color:rgba(255,255,255,0.6); font-size:18px; padding:4px 8px; cursor:pointer;"><i
                class="ph-bold ph-x"></i></button>
    </div>

    <!-- Goals Section -->
    <div
        style="padding:0 24px 8px; font-size:13px; font-weight:700; color:var(--fin-text-muted); display:flex; justify-content:space-between; align-items:center;">
        <span>Financial Goals</span>
        <span style="color:var(--fin-primary); cursor:pointer;" onclick="Dompetra.modals.openPicker('goal')">+
            Tambah</span>
    </div>
    <div class="list-group" id="goal-list"></div>
    <div style="height:60px;"></div>
</div>