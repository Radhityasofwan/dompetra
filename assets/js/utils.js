// --- GLOBAL SCOPE SETUP ---
window.toggleAuth = (mode) => {
    const l = document.getElementById('login-form');
    const r = document.getElementById('reg-form');
    if (l) l.style.display = mode === 'login' ? 'block' : 'none';
    if (r) r.style.display = mode === 'reg' ? 'block' : 'none';
};

window.Dompetra = window.Dompetra || {};
const D = window.Dompetra;

D.state = D.state || {
    user: null, profile: {}, txs: [], cats: [], budgets: [], goals: [], wallets: [],
    groups: [], members: [], activeGroupId: null, groupOwner: null,
    numBuffer: '0', selectionMode: false, selectedIds: new Set(),
    filter: { mode: 'payday', start: null, end: null, budgetActiveOnly: true },
    listFilter: { search: '', type: 'all', walletId: 'all', catId: 'all' },
    budgetFilter: { status: 'active', search: '' },
    filteredTxs: [], filterLabel: '', pendingBudgetId: null,
    quickActions: [], budgetTemplates: [], currentPage: 'home'
};
const S = D.state;

if (typeof window.supabase !== 'undefined') {
    D.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
const sb = D.sb;

D.utils = D.utils || {};
D.modals = D.modals || {};
D.render = D.render || {};
D.data = D.data || {};
D.group = D.group || {};
D.nav = D.nav || {};
D.tutorial = D.tutorial || {};
D.pwa = D.pwa || {};

const genId = (p) => {
    if (window.crypto && window.crypto.randomUUID) return `${p}-${crypto.randomUUID()}`;
    return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};

const ICON_LIBRARY = {
    "Keuangan": ["money", "wallet", "credit-card", "bank", "coins", "piggy-bank", "currency-dollar"],
    "Makanan": ["fork-knife", "hamburger", "coffee", "pizza", "wine"],
    "Transport": ["car", "bus", "gas-pump", "train", "airplane", "bicycle"],
    "Belanja": ["shopping-cart", "tag", "shopping-bag", "basket", "gift"],
    "Rumah": ["house", "lightning", "wifi", "drop", "lightbulb", "armchair"],
    "Pribadi": ["user", "heart", "first-aid", "barbell", "book", "film-strip"]
};

// Instance NumberFormat untuk performa tinggi
const moneyFormatter = new Intl.NumberFormat('id-ID');

Object.assign(D.utils, {
    id: (id) => document.getElementById(id),
    fmtMoney: (n) => { const num = typeof n === 'string' ? parseInt(n || '0', 10) : (n || 0); return moneyFormatter.format(num); },

    toast: (msg) => {
        const t = document.getElementById('toast');
        const m = document.getElementById('toast-msg');
        if (t && m) {
            m.innerText = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }
    },

    closeAll: () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => {
            el.classList.remove('open');
        });
    },

    openModal: (id, focusElId) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('open');
        if (focusElId) {
            setTimeout(() => {
                const target = document.getElementById(focusElId);
                if (target) {
                    try { target.focus({ preventScroll: false }); } catch (e) { }
                    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 300);
        }
    },

    bind: (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; },

    previewAvatar: (input) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('preview-avatar-img');
                const icon = document.getElementById('preview-avatar-icon');
                if (img && icon) {
                    img.src = e.target.result;
                    img.style.display = 'block';
                    icon.style.display = 'none';
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    getInitials: (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    },

    urlBase64ToUint8Array: (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    checkNotifStatus: () => {
        const el = document.getElementById('chk-notif');
        if (!el) return;
        if (Notification.permission === 'granted') {
            el.style.opacity = '1';
            el.innerHTML = '<i class="ph-bold ph-check"></i>';
            el.parentElement.onclick = null;
        } else if (Notification.permission === 'denied') {
            el.style.opacity = '1';
            el.style.background = 'var(--fin-danger)';
            el.innerHTML = '<i class="ph-bold ph-x"></i>';
        } else {
            el.style.opacity = '0';
        }
    },

    startOfDay: (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; },
    endOfDay: (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; },
    isBetween: (d, s, e) => { const x = new Date(d); return x >= s && x <= e; },

    loadLib: (url) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const s = document.createElement('script'); s.src = url; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
    }),

    confetti: () => {
        const colors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];
        const frag = document.createDocumentFragment();
        const elements = [];

        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.style.position = 'fixed'; el.style.left = '50%'; el.style.top = '50%';
            el.style.width = '8px'; el.style.height = '8px';
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.borderRadius = '50%'; el.style.zIndex = '100002'; el.style.pointerEvents = 'none';
            frag.appendChild(el);
            elements.push(el);
        }

        document.body.appendChild(frag);

        elements.forEach(el => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 10;
            const tx = Math.cos(angle) * velocity * 20; const ty = Math.sin(angle) * velocity * 20;
            if (el.animate) {
                el.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
                ], { duration: 1000 + Math.random() * 1000, easing: 'cubic-bezier(0, .9, .57, 1)' }).onfinish = () => el.remove();
            } else { setTimeout(() => el.remove(), 1000); }
        });
    },

    populateIconSelect: (selectedIcon, targetId = 'cat-icon') => {
        const sel = document.getElementById(targetId); if (!sel) return;
        let html = '';
        Object.keys(ICON_LIBRARY).forEach(k => {
            html += `<optgroup label="${k}">` + ICON_LIBRARY[k].map(i => `<option value="${i}" ${i === selectedIcon ? 'selected' : ''}>${i}</option>`).join('') + `</optgroup>`;
        });
        sel.innerHTML = html;
    },

    renderWalletSelector: (selectedWalletId) => {
        const el = document.getElementById('tx-wallet-selector'); const input = document.getElementById('tx-wallet-id'); if (!el || !input) return;
        const wallets = S.wallets || [];
        if (!wallets.length) { el.innerHTML = '<div style="font-size:11px; color:var(--fin-text-muted);">Belum ada dompet.</div>'; return; }
        if (!selectedWalletId && wallets.length) { const mainW = wallets.find(w => w.is_main); selectedWalletId = mainW ? mainW.id : wallets[0].id; }
        input.value = selectedWalletId;
        el.innerHTML = wallets.map(w => `<div class="ws-item ${w.id === selectedWalletId ? 'active' : ''}" onclick="Dompetra.utils.selectWalletInTx('${w.id}')"><i class="ph-bold ph-${w.icon || 'wallet'}"></i> ${w.name}</div>`).join('');
    },

    selectWalletInTx: (id) => { document.getElementById('tx-wallet-id').value = id; D.utils.renderWalletSelector(id); },

    setWColor: (cls) => {
        document.getElementById('w-color').value = cls;
        document.querySelectorAll('.w-color-opt').forEach(e => e.style.border = '3px solid transparent');
        const t = document.querySelector(`.w-color-opt.${cls}`); if (t) t.style.border = '3px solid var(--fin-text-dark)';
    },

    calcEndDate: () => {
        const s = document.getElementById('budget-start'); const d = document.getElementById('budget-duration'); const l = document.getElementById('budget-end-date');
        if (s && d && l && s.value) { const dt = new Date(s.value); dt.setDate(dt.getDate() + parseInt(d.value || 30) - 1); l.innerText = dt.toLocaleDateString('id-ID'); }
    },

    refreshBudgetDropdown: (selId) => {
        const c = document.getElementById('tx-budget-alloc-container'); const s = document.getElementById('tx-budget-id');
        if (c && s) {
            const bs = (S.budgets || []).filter(b => b.is_active !== false);
            c.style.display = bs.length ? 'block' : 'none';
            s.innerHTML = '<option value="">Tanpa Anggaran</option>' + bs.map(b => `<option value="${b.id}" ${b.id == selId ? 'selected' : ''}>${b.name}</option>`).join('');
        }
    },

    setTheme: (m) => {
        const r = document.documentElement;
        ['chk-auto', 'chk-light', 'chk-dark'].forEach(i => { const el = document.getElementById(i); if (el) el.style.opacity = '0'; });
        if (m === 'auto') {
            r.removeAttribute('data-theme'); localStorage.removeItem('dompetra_theme'); const el = document.getElementById('chk-auto'); if (el) el.style.opacity = '1';
        } else {
            r.setAttribute('data-theme', m); localStorage.setItem('dompetra_theme', m); const el = document.getElementById('chk-' + m); if (el) el.style.opacity = '1';
        }
    },

    // --- KUSTOMISASI WARNA ---
    hexToRgbString: (hex) => {
        let v = hex.replace('#', '');
        if (v.length === 3) v = v.split('').map(c => c + c).join('');
        return `${parseInt(v.substring(0, 2), 16)}, ${parseInt(v.substring(2, 4), 16)}, ${parseInt(v.substring(4, 6), 16)}`;
    },

    adjustHex: (hex, amount) => {
        return '#' + hex.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    },

    setColorTheme: (color) => {
        const r = document.documentElement;

        // Kompatibilitas Tema Lama
        const oldThemeMap = {
            'emerald': 'jade', 'ocean': 'cyan', 'rose': 'crimson', 'ruby': 'crimson',
            'sunset': 'tangerine', 'gold': 'bronze', 'amethyst': 'magenta', 'slate': 'graphite'
        };
        if (oldThemeMap[color]) color = oldThemeMap[color];

        document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));

        // Proses Jika Custom HEX / RGB Input
        if (color && color.startsWith('#')) {
            r.setAttribute('data-color', 'custom');
            localStorage.setItem('dompetra_color', color);

            const rgb = D.utils.hexToRgbString(color);
            const lightColor = D.utils.adjustHex(color, 40);
            const darkColor = D.utils.adjustHex(color, -40);
            const lightRgb = D.utils.hexToRgbString(lightColor);

            let styleTag = document.getElementById('dynamic-custom-theme');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'dynamic-custom-theme';
                document.head.appendChild(styleTag);
            }

            styleTag.innerHTML = `
                :root[data-color="custom"] {
                    --fin-primary: ${color};
                    --fin-primary-dark: ${darkColor};
                    --fin-primary-soft: rgba(${rgb}, 0.15);
                    --fin-grad-main: linear-gradient(135deg, ${color} 0%, ${lightColor} 100%);
                    --blob-1: rgba(${rgb}, 0.4);
                    --blob-2: rgba(${lightRgb}, 0.3);
                }
                :root[data-theme="dark"][data-color="custom"] {
                    --fin-primary-soft: rgba(${rgb}, 0.25);
                    --blob-1: rgba(${rgb}, 0.5);
                    --blob-2: rgba(${lightRgb}, 0.4);
                }
            `;

            const customSwatch = document.getElementById('csw-custom');
            if (customSwatch) customSwatch.classList.add('active');

            // FIX: Tambahkan pengecekan null sebelum set value pada picker
            const picker = document.getElementById('custom-color-picker');
            if (picker) picker.value = color;

        } else {
            const styleTag = document.getElementById('dynamic-custom-theme');
            if (styleTag) styleTag.remove();

            if (color === 'default' || color === 'sapphire' || !color) {
                r.removeAttribute('data-color');
                localStorage.removeItem('dompetra_color');
                const defaultSwatch = document.getElementById('csw-sapphire') || document.getElementById('csw-default');
                if (defaultSwatch) defaultSwatch.classList.add('active');
            } else {
                r.setAttribute('data-color', color);
                localStorage.setItem('dompetra_color', color);
                const activeSwatch = document.getElementById('csw-' + color);
                if (activeSwatch) activeSwatch.classList.add('active');
            }
        }
    },

    setCustomColor: (color) => {
        D.utils.setColorTheme(color);
    },

    openTheme: () => {
        document.getElementById('modalTheme')?.classList.add('open');
        D.utils.checkNotifStatus();
    },

    setFilterMode: (m) => {
        S.filter.mode = m;['opt-payday', 'opt-custom'].forEach(i => { const el = document.getElementById(i); if (el) el.classList.toggle('active', i.includes(m)); });
        ['chk-payday', 'chk-custom'].forEach(i => { const el = document.getElementById(i); if (el) el.style.opacity = i.includes(m) ? '1' : '0'; });
        const di = document.getElementById('date-range-inputs'); if (di) di.style.display = m === 'custom' ? 'block' : 'none';
        D.utils.applyFilter();
    },

    calculateDates: () => {
        const m = S.filter.mode || 'payday'; const t = new Date(); let s, e;
        if (m === 'payday') {
            const pd = S.profile?.payday_date || 1;
            const c = new Date(t.getFullYear(), t.getMonth(), pd);
            if (t < c) { s = new Date(t.getFullYear(), t.getMonth() - 1, pd); e = new Date(c); e.setDate(e.getDate() - 1); }
            else { s = c; e = new Date(t.getFullYear(), t.getMonth() + 1, pd); e.setDate(e.getDate() - 1); }
        } else {
            const sv = document.getElementById('filter-start')?.value; const ev = document.getElementById('filter-end')?.value;
            s = sv ? new Date(sv) : t; e = ev ? new Date(ev) : t;
        }
        S.filter.start = D.utils.startOfDay(s); S.filter.end = D.utils.endOfDay(e);
        S.filterLabel = `${s.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} - ${e.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}`;

        ['cycle-filter-disp', 'list-period-disp', 'list-period-chip', 'budget-period-disp', 'budget-period-chip', 'exp-period-label', 'an-period-disp'].forEach(i => {
            const el = document.getElementById(i); if (el) el.innerText = S.filterLabel;
        });
    },

    applyFilter: () => {
        D.utils.calculateDates();
        const lf = S.listFilter || {};
        const q = (lf.search || '').toLowerCase().trim();
        const fType = lf.type || 'all';
        const fWallet = lf.walletId || 'all';
        const fCat = lf.catId || 'all';

        S.filteredTxs = (S.txs || []).filter(t => {
            if (!t.date || !D.utils.isBetween(t.date, S.filter.start, S.filter.end)) return false;
            if (q && !(t.desc || '').toLowerCase().includes(q)) return false;
            if (fType !== 'all' && t.type !== fType) return false;
            if (fWallet !== 'all' && t.walletId != fWallet) return false;
            if (fCat !== 'all' && t.catId != fCat) return false;
            return true;
        });
        if (D.render && typeof D.render.current === 'function') requestAnimationFrame(D.render.current);
    },

    /* Populate wallet & category dropdowns on the list page */
    initListFilters: () => {
        const wSel = document.getElementById('list-filter-wallet');
        const cSel = document.getElementById('list-filter-cat');
        if (wSel) {
            const cur = wSel.value;
            wSel.innerHTML = '<option value="all">Semua Dompet</option>' +
                (S.wallets || []).map(w => `<option value="${w.id}" ${cur == w.id ? 'selected' : ''}>${w.name}</option>`).join('');
        }
        if (cSel) {
            const cur = cSel.value;
            cSel.innerHTML = '<option value="all">Semua Kategori</option>' +
                (S.cats || []).map(c => `<option value="${c.id}" ${cur == c.id ? 'selected' : ''}>${c.name}</option>`).join('');
        }
        /* Sync period chip label */
        const chip = document.getElementById('list-period-chip');
        if (chip && S.filterLabel) chip.innerText = S.filterLabel;
    },

    /* Called by filter selects onChange */
    applyListFilters: () => {
        const lf = S.listFilter;
        const t = document.getElementById('list-filter-type');
        const w = document.getElementById('list-filter-wallet');
        const c = document.getElementById('list-filter-cat');
        if (t) lf.type = t.value;
        if (w) lf.walletId = w.value;
        if (c) lf.catId = c.value;
        D.utils.applyFilter();
    },

    /* Debounced realtime search on the list page */
    onListSearch: (() => {
        let timer = null;
        return (val) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                S.listFilter.search = val;
                D.utils.applyFilter();
            }, 220);
        };
    })(),

    toggleBudgetFilter: () => { S.filter.budgetActiveOnly = !S.filter.budgetActiveOnly; if (D.render && D.render.budgets) D.render.budgets(); },

    /* --- Budget Filter / Search --- */
    setBudgetStatusFilter: (status) => {
        S.budgetFilter.status = status;
        // Update button states
        ['btn-bfilter-all', 'btn-bfilter-active', 'btn-bfilter-expired'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active-filter');
        });
        const active = document.getElementById('btn-bfilter-' + status);
        if (active) active.classList.add('active-filter');
        if (D.render && D.render.budgets) D.render.budgets();
    },

    onBudgetSearch: (() => {
        let timer = null;
        return (val) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                S.budgetFilter.search = val;
                if (D.render && D.render.budgets) D.render.budgets();
            }, 220);
        };
    })(),

    /* Toggle a budget ID in the selectedBudgetIds set for bulk template action */
    toggleBudgetSelect: (id) => {
        if (!S.selectedBudgetIds) S.selectedBudgetIds = new Set();
        if (S.selectedBudgetIds.has(id)) S.selectedBudgetIds.delete(id);
        else S.selectedBudgetIds.add(id);
        /* Update bulk bar visibility */
        const bar = document.getElementById('budget-bulk-bar');
        const cnt = document.getElementById('budget-sel-count');
        if (bar) bar.classList.toggle('active', S.selectedBudgetIds.size > 0);
        if (cnt) cnt.innerText = S.selectedBudgetIds.size;
        if (D.render && D.render.budgets) D.render.budgets();
    },


    openFilter: () => { const fs = document.getElementById('filter-start'); const fe = document.getElementById('filter-end'); if (fs) fs.value = new Date(S.filter.start).toISOString().slice(0, 10); if (fe) fe.value = new Date(S.filter.end).toISOString().slice(0, 10); document.getElementById('modalFilter')?.classList.add('open'); },
    toggleSelectionMode: () => { S.selectionMode = !S.selectionMode; S.selectedIds = new Set(); const nb = document.getElementById('nav-bar'); const bb = document.getElementById('bulk-bar'); if (nb) nb.classList.toggle('hidden', S.selectionMode); if (bb) bb.classList.toggle('active', S.selectionMode); if (D.render && D.render.list) D.render.list(); },
    toggleItem: (id) => { if (S.selectedIds.has(id)) S.selectedIds.delete(id); else S.selectedIds.add(id); const c = document.getElementById('sel-count'); if (c) c.innerText = S.selectedIds.size; if (D.render && D.render.list) D.render.list(); },
    copyCode: () => { const c = document.getElementById('group-code'); if (c) navigator.clipboard.writeText(c.innerText).then(() => D.utils.toast('Kode disalin')); },

    confirmDialog: (title, text, onConfirm, btnType = 'danger', btnLabel = 'Ya, Hapus') => {
        let el = document.getElementById('custom-confirm-modal');
        if (!el) {
            el = document.createElement('div'); el.id = 'custom-confirm-modal'; el.className = 'modal-backdrop'; el.style.zIndex = '99999';
            el.innerHTML = `<div class="sheet" style="padding-bottom:calc(30px + env(safe-area-inset-bottom));"><div class="sheet-handle"></div><div style="text-align:center; padding:0 10px;"><div class="sheet-title" id="cc-title" style="margin-bottom:10px;"></div><p id="cc-text" style="color:var(--fin-text-muted); font-size:14px; margin:0 0 24px 0; line-height:1.5;"></p><div style="display:flex; gap:12px;"><button class="num-btn" id="cc-btn-cancel" style="flex:1; font-size:14px;">Batal</button><button class="num-btn primary" id="cc-btn-yes" style="flex:1; font-size:14px;"></button></div></div></div>`;
            const root = document.getElementById('finance-app-root') || document.body; root.appendChild(el);
            el.querySelector('#cc-btn-cancel').onclick = () => el.classList.remove('open');
            el.onclick = (e) => { if (e.target === el) el.classList.remove('open'); };
            D.utils.initSwipeToClose(el);
        }
        el.querySelector('#cc-title').innerText = title; el.querySelector('#cc-text').innerText = text;
        const yesBtn = el.querySelector('#cc-btn-yes'); yesBtn.innerText = btnLabel;
        yesBtn.style.background = btnType === 'danger' ? 'var(--fin-danger)' : 'var(--fin-primary)';
        yesBtn.style.borderColor = btnType === 'danger' ? 'var(--fin-danger)' : 'var(--fin-primary)';
        yesBtn.style.color = 'white';
        yesBtn.onclick = () => { el.classList.remove('open'); if (typeof onConfirm === 'function') onConfirm(); };
        setTimeout(() => el.classList.add('open'), 50);
    },

    initSwipeToClose: (context = document) => {
        const sheets = context.querySelectorAll('.sheet');
        sheets.forEach(sheet => {
            if (sheet.dataset.swipeBound) return;
            sheet.dataset.swipeBound = "true";

            let startY = 0; let currentY = 0; let isDragging = false;
            const scrollEl = sheet.querySelector('.sheet-scroll');

            sheet.addEventListener('touchstart', (e) => {
                if (scrollEl && scrollEl.contains(e.target) && scrollEl.scrollTop > 0) return;

                startY = e.touches[0].clientY;
                currentY = startY;
                isDragging = true;
                sheet.style.transition = 'none';
            }, { passive: true });

            sheet.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;

                if (deltaY > 0) {
                    if (e.cancelable && (!scrollEl || scrollEl.scrollTop <= 0)) e.preventDefault();
                    sheet.style.transform = `translateY(${deltaY}px)`;
                }
            }, { passive: false });

            sheet.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;

                sheet.style.transition = '';
                sheet.style.transform = '';

                const deltaY = currentY - startY;
                if (deltaY > 120) {
                    const backdrop = sheet.closest('.modal-backdrop');
                    if (backdrop) backdrop.classList.remove('open');
                }
            });
        });
    }
});

const U = D.utils;

D.pad = {
    tap: (num) => { let b = S.numBuffer; if (b === '0') b = num; else b += num; if (b.length > 13) return; S.numBuffer = b; D.pad.render(); if (navigator.vibrate) navigator.vibrate(5); },
    clear: () => { S.numBuffer = '0'; D.pad.render(); },
    back: () => { let b = S.numBuffer; if (b.length > 1) b = b.slice(0, -1); else b = '0'; S.numBuffer = b; D.pad.render(); },
    set: (val) => { S.numBuffer = val ? val.toString() : '0'; D.pad.render(); },
    val: () => parseInt(S.numBuffer || '0', 10) || 0,
    render: () => { const el = document.getElementById('num-display'); if (el) el.innerText = U.fmtMoney(S.numBuffer); }
};

/* --- ESC Key: close any open modal (desktop support) --- */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const open = document.querySelector('.modal-backdrop.open');
        if (open) { open.classList.remove('open'); }
    }
});