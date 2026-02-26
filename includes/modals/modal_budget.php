<!-- MODAL BUDGET TEMPLATE -->
<div class="modal-backdrop" id="modalBudgetTemplate" onclick="if(event.target === this) Dompetra.utils.closeAll()">
    <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Template Budget</div>
        <div class="sheet-scroll">
            <p style="font-size:13px; color:var(--fin-text-muted); margin-bottom:16px; text-align:center;">Buat budget
                rutin sekali klik dengan template.</p>
            <div id="budget-tpl-list" style="margin-bottom:24px;"></div>
            <hr style="border:none; border-top:1px dashed var(--fin-border); margin-bottom:20px;">
            <h4 style="margin:0 0 12px; font-size:14px;">Buat Template Baru</h4>
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px;">Nama Template</label>
            <input type="text" id="tpl-name" class="inp-std w-100" placeholder="Misal: Belanja Bulanan"
                style="margin-bottom:16px;">
            <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px;">Nominal (Rp)</label>
            <input type="number" id="tpl-amount" class="inp-std w-100" placeholder="0" style="margin-bottom:24px;">
            <button class="num-btn primary w-100" onclick="Dompetra.data.saveTemplate()">Simpan Template</button>
            <div style="height: 24px;"></div> <!-- Extra Spacing -->
        </div>
    </div>
</div>