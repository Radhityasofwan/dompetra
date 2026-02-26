<div id="page-analysis" class="page-view">
    <div class="page-header"><h2 class="ph-title">Analisis</h2><p class="ph-subtitle">Kesehatan keuangan Anda.</p></div>
    <div class="score-wrap">
        <div style="font-size:12px; opacity:0.7; text-transform:uppercase; letter-spacing:1px; font-weight:600;">Skor Keuangan</div>
        <div class="score-big" id="an-score">0</div>
        <div id="an-grade" style="display:inline-block; padding:4px 12px; background:rgba(255,255,255,0.2); border-radius:99px; font-size:12px; font-weight:700;">Belum Cukup Data</div>
    </div>
    <div class="score-breakdown">
        <div class="sb-item"><div class="sb-head"><span>Rasio Tabungan</span><span id="sb-sav-val">0%</span></div><div class="sb-bar-bg"><div class="sb-bar-fill" id="sb-sav-bar" style="width:0%; background:#10B981;"></div></div></div>
        <div class="sb-item"><div class="sb-head"><span>Disiplin Anggaran</span><span id="sb-bud-val">0/0</span></div><div class="sb-bar-bg"><div class="sb-bar-fill" id="sb-bud-bar" style="width:0%; background:#3B82F6;"></div></div></div>
        <div class="sb-item"><div class="sb-head"><span>Arus Kas</span><span id="sb-flo-val">-</span></div><div class="sb-bar-bg"><div class="sb-bar-fill" id="sb-flo-bar" style="width:0%; background:#F59E0B;"></div></div></div>
    </div>
    <div class="an-grid">
        <div class="an-card"><div class="an-lbl">Rata-rata Harian</div><div class="an-val" id="an-avg-daily">Rp 0</div></div>
        <div class="an-card"><div class="an-lbl">Sisa Uang</div><div class="an-val" id="an-proj-save">Rp 0</div></div>
    </div>
    <div class="chart-cont"><div class="chart-head">Tren Pemasukan vs Pengeluaran</div><canvas id="chart-trend" height="200"></canvas></div>
    <div class="chart-cont"><div class="chart-head">Proporsi Pengeluaran</div><div style="position:relative; height:200px;"><canvas id="chart-cat"></canvas></div></div>
    <div style="height:40px;"></div>
</div>