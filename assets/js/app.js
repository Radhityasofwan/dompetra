/**
 * DOMPETRA - MAIN APPLICATION LOGIC
 * Menyediakan fungsionalitas inti, render UI, navigasi, dan manajemen state.
 * Disinkronisasikan untuk Liquid Glass UI (iOS 27 Style), Swipe to Close, Color Themes, & Push Notifications.
 */
(function (D) {
    const S = D.state;
    const U = D.utils;
    const sb = D.sb;

    // Pastikan seluruh namespace terdefinisi dengan kuat sejak awal
    D.modals = D.modals || {};
    D.render = D.render || {};
    D.group = D.group || {};
    D.nav = D.nav || {};
    D.tutorial = D.tutorial || {};
    D.pwa = D.pwa || {};

    // ========================================================================
    // 1. MODULE: PWA INSTALLATION & PUSH NOTIFICATIONS
    // ========================================================================
    Object.assign(D.pwa, {
        install: async () => {
            const capsule = document.getElementById('ios-install-prompt');

            if (!window.Dompetra.pwa.deferredPrompt) {
                U.toast('Tekan ikon Share lalu pilih "Add to Home Screen"');
                if (capsule) capsule.classList.remove('show');
                return;
            }

            window.Dompetra.pwa.deferredPrompt.prompt();
            const { outcome } = await window.Dompetra.pwa.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                if (capsule) capsule.classList.remove('show');
                localStorage.setItem('dompetra_install_prompt', 'installed');
                console.log('User menerima install PWA');
            }

            window.Dompetra.pwa.deferredPrompt = null;
        },

        dismiss: () => {
            const capsule = document.getElementById('ios-install-prompt');
            if (capsule) {
                capsule.classList.remove('show');
            }
            const today = new Date().toDateString();
            localStorage.setItem('dompetra_install_prompt', today);
        },

        enableNotifications: async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                return U.toast('Notifikasi tidak didukung browser ini.');
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                U.checkNotifStatus();
                return U.toast('Izin notifikasi ditolak.');
            }

            U.toast('Mengaktifkan...');

            try {
                const reg = await navigator.serviceWorker.ready;

                // VAPID Public Key Tersinkronisasi
                const publicVapidKey = 'BNeDynkwuccyWiVmmeHzmwZ-aQFu59axaurHQbLaA12rVegs0xN9ShXB6zOIBZwq8sZ0LvHigH_-u56ItoOqOV8';
                const convertedVapidKey = U.urlBase64ToUint8Array(publicVapidKey);

                const subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });

                const userId = S.user ? S.user.id : 'guest';

                await fetch('/api/subscribe.php', {
                    method: 'POST',
                    body: JSON.stringify({ subscription, userId }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                U.toast('Notifikasi aktif!');
                U.checkNotifStatus();

            } catch (err) {
                console.error('Push Error:', err);
                U.toast('Gagal mengaktifkan notifikasi.');
            }
        }
    });

    // ========================================================================
    // 2. MODULE: MODALS (Form & Popups)
    // ========================================================================
    D.modals = {
        openPicker: (mode, forceType, budgetId) => {
            U.closeAll();
            S.pendingBudgetId = budgetId;
            const grid = document.getElementById('picker-grid');
            const cats = (S.cats || []).filter(c => forceType ? c.type === forceType : true);

            if (grid) {
                if (cats.length > 0) {
                    grid.innerHTML = cats.map(c => `
                        <div class="col-3 d-flex flex-column align-items-center mb-2">
                            <div class="cat-pick-item w-100 text-center" onclick="Dompetra.modals.selectCat('${c.id}','${mode}')" style="cursor:pointer;">
                                <div class="cat-pick-icon mx-auto mb-2" style="width:60px; height:60px; border-radius:22px; background:var(--fin-glass-bg); display:flex; align-items:center; justify-content:center; font-size:28px; color:var(--fin-text-dark); border:1px solid var(--fin-glass-border); box-shadow:var(--fin-shadow-glass); transition:transform 0.1s var(--ios-ease);">
                                    <i class="ph-bold ph-${c.icon || 'coins'}"></i>
                                </div>
                                <div class="cat-pick-label" style="font-size:11px; font-weight:700; color:var(--fin-text-dark); width:100%; line-height:1.2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis;">
                                    ${c.name}
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    grid.innerHTML = '<div class="col-12 text-center text-muted" style="font-size:12px; padding:20px;">Belum ada kategori</div>';
                }
            }

            const pickerModal = document.getElementById('modalPicker');
            if (pickerModal) pickerModal.classList.add('open');
        },

        selectCat: (catId, mode) => {
            U.closeAll();
            U.id('tx-id').value = '';
            U.id('tx-cat-id').value = catId;
            U.id('tx-mode').value = mode;

            if (D.pad && typeof D.pad.clear === 'function') {
                D.pad.clear();
            }

            const cat = S.cats.find(c => c.id == catId) || { name: 'Umum' };
            U.id('tx-title').innerText = mode === 'budget' ? 'Buat Budget' : mode === 'goal' ? 'Buat Goal' : 'Transaksi Baru';
            U.id('tx-cat-badge').innerText = mode === 'budget' ? 'Budget' : mode === 'goal' ? 'Impian' : cat.name;
            U.id('tx-desc').value = '';
            U.id('tx-date').value = new Date().toISOString().slice(0, 10);

            const isBud = mode === 'budget';
            const els = {
                'budget-active-container': isBud,
                'budget-date-container': isBud,
                'budget-end-disp': isBud,
                'tx-desc': true,
                'tx-date': !isBud,
                'btn-del-tx-col': false,
                'tx-wallet-wrapper': mode === 'tx'
            };

            Object.keys(els).forEach(k => {
                const el = document.getElementById(k);
                if (el) {
                    if (k === 'btn-del-tx-col' || k === 'budget-date-container') {
                        el.style.display = els[k] ? 'flex' : 'none';
                    } else {
                        el.style.display = els[k] ? 'block' : 'none';
                    }
                }
            });

            if (isBud) U.calcEndDate();
            if (mode === 'tx') {
                U.renderWalletSelector();
                U.refreshBudgetDropdown(S.pendingBudgetId);
            }

            setTimeout(() => {
                const txModal = document.getElementById('modalTx');
                if (txModal) txModal.classList.add('open');
                // Scroll numpad display into view for immediate input focus
                setTimeout(() => {
                    const nd = document.getElementById('num-display');
                    if (nd) nd.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 320);
            }, 50);
        },

        editItem: (id, type) => {
            U.closeAll();
            U.id('tx-id').value = id;
            U.id('tx-mode').value = type;

            if (D.pad && typeof D.pad.clear === 'function') {
                D.pad.clear();
            }

            const isBud = type === 'budget';
            const els = {
                'budget-active-container': isBud,
                'budget-date-container': isBud,
                'budget-end-disp': isBud,
                'tx-desc': true,
                'tx-date': type === 'tx',
                'btn-del-tx-col': true,
                'tx-wallet-wrapper': type === 'tx'
            };

            Object.keys(els).forEach(k => {
                const el = document.getElementById(k);
                if (el) {
                    if (k === 'btn-del-tx-col' || k === 'budget-date-container') {
                        el.style.display = els[k] ? 'flex' : 'none';
                    } else {
                        el.style.display = els[k] ? 'block' : 'none';
                    }
                }
            });

            if (type === 'tx') {
                const t = S.txs.find(x => x.id == id);
                if (t) {
                    U.id('tx-cat-id').value = t.catId;
                    D.pad.set(t.amount);
                    U.id('tx-desc').value = t.desc;
                    U.id('tx-date').value = t.date.slice(0, 10);
                    U.id('tx-title').innerText = 'Edit Transaksi';
                    U.renderWalletSelector(t.walletId);
                    U.refreshBudgetDropdown(t.budgetId);
                }
            } else if (type === 'budget') {
                const b = S.budgets.find(x => x.id == id);
                if (b) {
                    D.pad.set(b.limit);
                    U.id('tx-desc').value = b.name;
                    U.id('tx-title').innerText = 'Edit Budget';
                    U.id('budget-start').value = new Date().toISOString().slice(0, 10);
                    U.calcEndDate();
                }
            } else if (type === 'goal') {
                const g = S.goals.find(x => x.id == id);
                if (g) {
                    D.pad.set(g.target);
                    U.id('tx-desc').value = g.name;
                    U.id('tx-title').innerText = 'Edit Goal';
                }
            }

            setTimeout(() => {
                const txModal = document.getElementById('modalTx');
                if (txModal) txModal.classList.add('open');
                // Scroll numpad display into view for immediate input focus
                setTimeout(() => {
                    const nd = document.getElementById('num-display');
                    if (nd) nd.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 320);
            }, 50);
        },

        openCat: (id) => {
            U.closeAll();
            const el = U.id('cat-id');
            if (!el) return;

            if (id) {
                const c = S.cats.find(x => x.id == id);
                el.value = id;
                U.id('cat-name').value = c.name;
                U.id('cat-type').value = c.type;
                U.populateIconSelect(c.icon);
                U.id('btn-del-cat').style.display = 'block';
            } else {
                el.value = '';
                U.id('cat-name').value = '';
                U.id('cat-type').value = 'expense';
                U.populateIconSelect('coins');
                U.id('btn-del-cat').style.display = 'none';
            }

            const catModal = document.getElementById('modalCat');
            if (catModal) catModal.classList.add('open');
        },

        openEditProfile: () => {
            U.id('edit-name').value = S.profile?.full_name || '';
            U.id('edit-wa').value = S.profile?.whatsapp_number || '';
            U.id('edit-payday').value = S.profile?.payday_date || 1;

            const img = U.id('preview-avatar-img');
            const icn = U.id('preview-avatar-icon');

            if (S.profile?.avatar_url) {
                img.src = S.profile.avatar_url;
                img.style.display = 'block';
                icn.style.display = 'none';
            } else {
                img.style.display = 'none';
                icn.style.display = 'block';
            }

            const profModal = document.getElementById('modalProfile');
            if (profModal) profModal.classList.add('open');
        },

        openWallet: () => {
            U.closeAll();
            U.id('w-id').value = '';
            U.id('w-name').value = '';
            U.id('w-bal').value = '';
            U.id('w-bal').disabled = false;
            U.id('btn-del-wallet').style.display = 'none';
            U.setWColor('grad-blue');

            const wallModal = document.getElementById('modalWallet');
            if (wallModal) wallModal.classList.add('open');
        },

        editWallet: (id) => {
            U.closeAll();
            const w = S.wallets.find(x => x.id == id);
            if (w) {
                U.id('w-id').value = id;
                U.id('w-name').value = w.name;
                U.id('w-type').value = w.type;
                U.id('w-bal').value = w.balance;
                U.id('w-bal').disabled = false;
                U.setWColor(w.color || 'grad-blue');

                const btnDel = U.id('btn-del-wallet');
                if (btnDel) {
                    btnDel.style.display = 'block';
                }
            }

            const wallModal = document.getElementById('modalWallet');
            if (wallModal) wallModal.classList.add('open');
        },

        openQASettings: () => {
            U.closeAll();
            const list = U.id('qa-list-container');
            const sel = U.id('qa-cat');
            const bud = U.id('qa-budget');

            if (list) {
                if (S.quickActions && S.quickActions.length > 0) {
                    list.innerHTML = S.quickActions.map((q, i) => `
                        <div class="list-card liquid-glass" style="padding:16px; margin-bottom:12px;">
                            <div style="flex:1;">
                                <div style="font-weight:800; font-size:14px; color:var(--fin-text-dark);">${q.label}</div>
                                <div style="font-size:12px; font-weight:600; color:var(--fin-text-muted);">Rp ${U.fmtMoney(q.amount)}</div>
                            </div>
                            <div style="color:white; background:var(--fin-danger); width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="Dompetra.modals.removeQA(${i})">
                                <i class="ph-bold ph-trash"></i>
                            </div>
                        </div>
                    `).join('');
                } else {
                    list.innerHTML = '<div style="text-align:center; color:var(--fin-text-muted); font-size:13px; font-weight:600; padding:20px 0;">Belum ada tombol pintar.</div>';
                }
            }

            if (sel) {
                sel.innerHTML = S.cats.filter(c => c.type === 'expense').map(c => `
                    <option value="${c.id}">${c.name}</option>
                `).join('');
            }

            if (bud) {
                bud.innerHTML = '<option value="">Tanpa Budget</option>' + S.budgets.filter(b => b.is_active !== false).map(b => `
                    <option value="${b.id}">${b.name}</option>
                `).join('');
            }

            U.id('qa-label').value = '';
            U.id('qa-amount').value = '';

            const qaModal = document.getElementById('modalQA');
            if (qaModal) qaModal.classList.add('open');
        },

        addQA: () => {
            const l = U.id('qa-label').value;
            const a = parseInt(U.id('qa-amount').value);
            const c = U.id('qa-cat').value;
            const b = U.id('qa-budget').value;

            if (!l || !a || !c) return U.toast('Lengkapi data untuk tombol');

            S.quickActions.push({ label: l, amount: a, catId: c, desc: l, budgetId: b });
            D.data.saveQA(S.quickActions);
            D.modals.openQASettings();
            D.render.current();
            U.toast('Tombol pintar ditambahkan');
        },

        removeQA: (i) => {
            U.confirmDialog('Hapus Tombol?', 'Tombol pintar ini akan dihapus.', () => {
                S.quickActions.splice(i, 1);
                D.data.saveQA(S.quickActions);
                D.modals.openQASettings();
                D.render.current();
                U.toast('Tombol dihapus');
            }, 'danger', 'Hapus');
        },

        openTemplateManager: () => {
            U.closeAll();
            const list = U.id('budget-tpl-list');
            if (list) {
                if (S.budgetTemplates && S.budgetTemplates.length > 0) {
                    list.innerHTML = S.budgetTemplates.map((t, i) => `
                        <div class="list-card liquid-glass" style="padding:16px; margin-bottom:12px;">
                            <div style="flex:1;">
                                <div style="font-weight:800; font-size:14px; color:var(--fin-text-dark);">${t.name}</div>
                                <div style="font-size:12px; font-weight:600; color:var(--fin-text-muted);">Rp ${U.fmtMoney(t.limit)}</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button style="background:var(--fin-primary); color:white; padding:8px 16px; border-radius:12px; border:none; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 4px 10px var(--fin-primary-soft);" onclick="Dompetra.data.useTemplate('${t.id}')">Pakai</button>
                                <button style="background:var(--fin-danger-soft); color:var(--fin-danger); padding:8px 12px; border-radius:12px; border:none; font-size:14px; cursor:pointer;" onclick="Dompetra.data.delTemplate('${t.id}')"><i class="ph-bold ph-trash"></i></button>
                            </div>
                        </div>
                    `).join('');
                } else {
                    list.innerHTML = '<div style="text-align:center; color:var(--fin-text-muted); font-size:13px; font-weight:600; padding:20px 0;">Belum ada template.</div>';
                }
            }
            U.id('tpl-name').value = '';
            U.id('tpl-amount').value = '';

            const tplModal = document.getElementById('modalBudgetTemplate');
            if (tplModal) tplModal.classList.add('open');
        },

        openCreateGroup: () => {
            U.closeAll();
            const modal = document.getElementById('modalCreateGroup');
            if (modal) modal.classList.add('open');
        },

        openJoinGroup: () => {
            U.closeAll();
            const modal = document.getElementById('modalJoinGroup');
            if (modal) modal.classList.add('open');
        }
    };

    // ========================================================================
    // 3. MODULE: RENDER (UI Injector & Updaters)
    // ========================================================================
    let renderTimer = null;
    D.render = {
        current: () => {
            const p = S.currentPage;
            if (p === 'home') D.render.home();
            else if (p === 'list') D.render.list();
            else if (p === 'budget') { D.render.budgets(); D.render.goals(); }
            else if (p === 'categories') D.render.categories();
            else if (p === 'wallets') D.render.wallets();
            else if (p === 'export') {
                const el = U.id('exp-period-label');
                if (el) el.innerText = S.filterLabel;
            }
            else if (p === 'shared') D.render.shared();
        },

        all: () => {
            if (renderTimer) clearTimeout(renderTimer);
            renderTimer = setTimeout(() => {
                if (D.render.current) requestAnimationFrame(D.render.current);
            }, 10);
        },

        home: () => {
            let bal = 0, inc = 0, exp = 0;
            let lbl = 'Total Saldo (Pribadi)';

            const txs = S.txs || [];
            if (S.activeGroupId) {
                for (let i = 0; i < txs.length; i++) {
                    const amt = parseFloat(txs[i].amount) || 0;
                    if (txs[i].type === 'income') inc += amt;
                    else exp += amt;
                }
                bal = inc - exp;
                lbl = 'Arus Kas Grup';
            } else {
                const wals = S.wallets || [];
                for (let i = 0; i < wals.length; i++) {
                    bal += parseFloat(wals[i].balance) || 0;
                }
            }

            const dispBal = U.id('disp-balance');
            if (dispBal) {
                if ((S.wallets && S.wallets.length > 0) || txs.length > 0) {
                    dispBal.classList.remove('skeleton');
                }
                dispBal.innerText = 'Rp ' + U.fmtMoney(bal);
            }

            const balLbl = U.id('bal-label');
            if (balLbl) balLbl.innerText = lbl;

            const p = S.profile || { full_name: 'User' };
            const pNameStr = p.full_name;
            const hNames = ['header-name', 'home-user-name', 'prof-name'];
            for (let i = 0; i < hNames.length; i++) {
                const el = U.id(hNames[i]);
                if (el) el.innerText = pNameStr;
            }

            const pEmail = U.id('prof-email');
            if (pEmail && S.user) pEmail.innerText = S.user.email;

            const imgAvatars = ['header-avatar-img', 'home-avatar-img', 'prof-img'];
            const iconAvatars = ['header-avatar-icon', 'home-avatar-icon', 'prof-init'];

            for (let i = 0; i < imgAvatars.length; i++) {
                const img = U.id(imgAvatars[i]);
                const icon = U.id(iconAvatars[i]);

                if (img && icon) {
                    if (p.avatar_url) {
                        img.src = p.avatar_url;
                        img.style.display = 'block';
                        icon.style.display = 'none';
                    } else {
                        img.style.display = 'none';
                        icon.style.display = 'block';
                        if (icon.id === 'prof-init') icon.innerText = U.getInitials(pNameStr);
                    }
                }
            }

            const qa = U.id('quick-actions-container');
            if (qa) {
                if (!S.quickActions || !S.quickActions.length) {
                    qa.innerHTML = `<div class="qa-chip liquid-glass" onclick="Dompetra.modals.openQASettings()"><i class="ph-bold ph-plus" style="color:var(--fin-primary);"></i> Atur Tombol Pintas</div>`;
                } else {
                    const qaArr = [];
                    for (let i = 0; i < S.quickActions.length; i++) {
                        const q = S.quickActions[i];
                        const c = (S.cats || []).find(x => x.id == q.catId);
                        const icon = c ? c.icon : 'lightning';
                        const sl = q.label.replace(/'/g, "\\'");
                        qaArr.push(`<div class="qa-chip liquid-glass" onclick="Dompetra.data.quickSave(${q.amount}, '${q.catId}', '${sl}', '${q.budgetId || ''}')"><i class="ph-fill ph-${icon}" style="color:var(--fin-primary); font-size:16px;"></i> ${q.label}</div>`);
                    }
                    qaArr.push(`<div class="qa-chip liquid-glass" onclick="Dompetra.modals.openQASettings()"><i class="ph-bold ph-gear" style="font-size:16px;"></i></div>`);
                    qa.innerHTML = qaArr.join('');
                }
            }

            const el = U.id('recent-list');
            if (el) {
                const rec = txs.slice(0, 3);
                if (!rec.length) {
                    el.innerHTML = `
                    <div class="empty-state-box">
                        <i class="ph-duotone ph-receipt empty-icon"></i>
                        <div class="empty-title">Masih Kosong</div>
                        <div class="empty-desc">Mulai catat transaksi hari ini!</div>
                        <button class="num-btn primary" style="margin:20px auto 0; padding:0 24px; font-size:14px; height:48px;" onclick="Dompetra.modals.openPicker('tx')">Catat Sekarang</button>
                    </div>`;
                } else {
                    const htmlArr = [];
                    for (let i = 0; i < rec.length; i++) {
                        const t = rec[i];
                        const c = (S.cats || []).find(x => x.id == t.catId) || { icon: 'coins', color: 'bg-gray', name: 'Umum' };
                        htmlArr.push(`
                        <div class="list-card liquid-glass" onclick="Dompetra.modals.editItem('${t.id}','tx')">
                            <div class="icon-box ${c.color}"><i class="ph-bold ph-${c.icon}"></i></div>
                            <div style="flex:1;">
                                <div style="font-size:15px; font-weight:800; color:var(--fin-text-dark);">${c.name}</div>
                                <div style="font-size:12px; color:var(--fin-text-muted); font-weight:600; margin-top:2px;">${t.desc || '-'}</div>
                            </div>
                            <div style="font-weight:800; font-size:15px; color:${t.type === 'income' ? 'var(--fin-success)' : 'var(--fin-text-dark)'};">
                                ${t.type === 'income' ? '+' : '-'} ${U.fmtMoney(t.amount)}
                            </div>
                        </div>`);
                    }
                    el.innerHTML = htmlArr.join('');
                }
            }
        },

        list: () => {
            const el = U.id('full-list'); if (!el) return;
            const g = {};
            const fTxs = S.filteredTxs || [];

            for (let i = 0; i < fTxs.length; i++) {
                const t = fTxs[i];
                const d = new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
                if (!g[d]) g[d] = [];
                g[d].push(t);
            }

            const keys = Object.keys(g);
            if (keys.length === 0) {
                el.innerHTML = `
                <div class="empty-state-box" style="margin-top:40px;">
                    <i class="ph-duotone ph-magnifying-glass empty-icon"></i>
                    <div class="empty-title">Tidak Ada Data</div>
                    <div class="empty-desc">Belum ada transaksi di periode ini.</div>
                    <button class="btn-pill primary" style="margin:20px auto 0; padding:0 24px; font-size:14px; height:48px;" onclick="Dompetra.modals.openPicker('tx')">+ Catat Baru</button>
                </div>`;
                return;
            }

            const htmlArr = [];
            for (let i = 0; i < keys.length; i++) {
                const d = keys[i];
                htmlArr.push(`<div style="font-size:13px; font-weight:800; color:var(--fin-text-muted); margin:24px 0 12px; padding-left:4px;">${d}</div>`);
                const items = g[d];
                for (let j = 0; j < items.length; j++) {
                    const t = items[j];
                    const c = (S.cats || []).find(x => x.id == t.catId) || { icon: 'coins', color: 'bg-gray', name: 'Umum' };
                    const w = (S.wallets || []).find(x => x.id == t.walletId);
                    const walletName = w ? w.name : (t.group_id ? 'Dompet Grup' : 'Lainnya');
                    htmlArr.push(`
                    <div class="list-card liquid-glass ${S.selectionMode ? 'selection-mode' : ''} ${S.selectionMode && S.selectedIds.has(t.id) ? 'selected' : ''}" onclick="${S.selectionMode ? `Dompetra.utils.toggleItem('${t.id}')` : `Dompetra.modals.editItem('${t.id}','tx')`}">
                        <div class="check-area"><div class="check-circle"><i class="ph-bold ph-check"></i></div></div>
                        <div class="icon-box ${c.color}"><i class="ph-bold ph-${c.icon}"></i></div>
                        <div style="flex:1;">
                            <div style="font-size:15px; font-weight:800; color:var(--fin-text-dark); margin-bottom:2px;">${c.name}</div>
                            <div style="font-size:12px; color:var(--fin-text-muted); font-weight:600;"><i class="ph-bold ph-wallet" style="font-size:11px; margin-right:4px;"></i>${walletName}</div>
                        </div>
                        <div style="font-weight:800; font-size:15px; color:${t.type === 'income' ? 'var(--fin-success)' : 'var(--fin-text-dark)'};">
                            ${t.type === 'income' ? '+' : '-'} ${U.fmtMoney(t.amount)}
                        </div>
                    </div>`);
                }
            }
            el.innerHTML = htmlArr.join('');
        },

        budgets: () => {
            const el = U.id('budget-list'); if (!el) return;
            const bs = (S.budgets || []).filter(b => S.filter.budgetActiveOnly ? b.is_active !== false : true);
            const summary = U.id('budget-summary-area');

            const expTxs = (S.txs || []).filter(t => t.type === 'expense');

            if (summary) {
                let tLimit = 0, tUsed = 0;
                for (let i = 0; i < bs.length; i++) {
                    const b = bs[i];
                    tLimit += parseFloat(b.limit);
                    for (let j = 0; j < expTxs.length; j++) {
                        if (expTxs[j].budgetId == b.id) tUsed += parseFloat(expTxs[j].amount);
                    }
                }

                const tRem = tLimit - tUsed;
                const pct = tLimit > 0 ? Math.round((tUsed / tLimit) * 100) : 0;

                summary.innerHTML = `
                <div class="card-summary-banner" style="background:var(--fin-grad-main); color:white;">
                    <div style="font-size:12px; font-weight:800; opacity:0.9; margin-bottom:16px; letter-spacing:1px; text-transform:uppercase;">Ringkasan Anggaran</div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; text-align:center;">
                        <div>
                            <div style="font-size:11px; font-weight:600; opacity:0.8;">Batas Total</div>
                            <div style="font-weight:800; font-size:15px; margin-top:6px;">${U.fmtMoney(tLimit)}</div>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:600; opacity:0.8;">Terpakai</div>
                            <div style="font-weight:800; font-size:15px; margin-top:6px; color:#FFD60A;">${U.fmtMoney(tUsed)}</div>
                        </div>
                        <div>
                            <div style="font-size:11px; font-weight:600; opacity:0.8;">Sisa Dana</div>
                            <div style="font-weight:800; font-size:15px; margin-top:6px; color:#30D158;">${U.fmtMoney(tRem)}</div>
                        </div>
                    </div>
                    <div style="margin-top:24px;">
                        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px; font-weight:800;">
                            <span>Penggunaan Global</span><span>${pct}%</span>
                        </div>
                        <div class="sb-bar-bg" style="background:rgba(255,255,255,0.2); height:12px; border-radius:99px; overflow:hidden;">
                            <div class="sb-bar-fill" style="width:${Math.min(100, pct)}%; background:${pct > 100 ? '#FF3B30' : (pct > 80 ? '#FF9500' : '#34C759')}; height:100%; border-radius:99px; transition:width 0.5s var(--ios-spring);"></div>
                        </div>
                    </div>
                </div>`;
            }

            if (!bs.length) {
                el.innerHTML = `
                <div class="empty-state-box">
                    <i class="ph-duotone ph-chart-pie-slice empty-icon"></i>
                    <div class="empty-title">Belum Ada Budget</div>
                    <div class="empty-desc">Mulai batasi pengeluaranmu bulan ini.</div>
                    <button class="num-btn primary" style="margin:20px auto 0; padding:0 24px; font-size:14px; height:48px;" onclick="Dompetra.modals.openPicker('budget')">Buat Anggaran</button>
                </div>`;
                return;
            }

            const htmlArr = [];
            for (let i = 0; i < bs.length; i++) {
                const b = bs[i];
                let used = 0;
                for (let j = 0; j < expTxs.length; j++) {
                    if (expTxs[j].budgetId == b.id) used += parseFloat(expTxs[j].amount);
                }
                const pct = Math.min(100, Math.round((used / b.limit) * 100));
                const clr = pct > 100 ? 'var(--fin-danger)' : pct > 80 ? 'var(--fin-warning)' : 'var(--fin-primary)';

                htmlArr.push(`
                <div class="card-expanded liquid-glass" style="padding:24px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="font-weight:800; font-size:16px; color:var(--fin-text-dark);">${b.name}</div>
                        <div style="font-size:15px; font-weight:800; color:${clr};">${pct}%</div>
                    </div>
                    <div class="sb-bar-bg" style="height:10px; background:var(--fin-border); border-radius:99px; overflow:hidden;">
                        <div class="sb-bar-fill" style="width:${pct}%; background:${clr}; height:100%; border-radius:99px; transition:width 0.5s var(--ios-spring);"></div>
                    </div>
                    <div style="font-size:13px; color:var(--fin-text-muted); font-weight:600; margin-top:12px;">Terpakai Rp ${U.fmtMoney(used)} dari Rp ${U.fmtMoney(b.limit)}</div>
                    <div class="budget-actions" style="display:flex; gap:10px; margin-top:20px; border-top:1px dashed var(--fin-border); padding-top:20px;">
                        <button class="num-btn primary" style="flex:1; height:44px; font-size:13px;" onclick="Dompetra.modals.openPicker('tx','expense','${b.id}')">Catat</button>
                        <button class="num-btn" style="flex:1; height:44px; font-size:13px;" onclick="Dompetra.nav.filterByBudget('${b.id}')">Riwayat</button>
                        <button class="num-btn" style="flex:1; height:44px; font-size:13px;" onclick="Dompetra.modals.editItem('${b.id}','budget')">Edit</button>
                    </div>
                </div>`);
            }
            el.innerHTML = htmlArr.join('');
        },

        goals: () => {
            const el = U.id('goal-list'); if (!el) return;
            if (!S.goals.length) {
                el.innerHTML = '<div style="text-align:center; font-size:13px; font-weight:600; padding:30px; color:var(--fin-text-muted); background:var(--fin-glass-bg); border-radius:24px; border:1px solid var(--fin-glass-border);">Belum ada tabungan impian.</div>';
                return;
            }

            const htmlArr = [];
            for (let i = 0; i < S.goals.length; i++) {
                const g = S.goals[i];
                const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                htmlArr.push(`
                <div class="card-expanded liquid-glass" onclick="Dompetra.modals.editItem('${g.id}','goal')" style="cursor:pointer; padding:20px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="font-weight:800; font-size:15px; color:var(--fin-text-dark);">${g.name}</div>
                        <div style="font-size:14px; font-weight:800; color:var(--fin-primary);">${pct}%</div>
                    </div>
                    <div class="sb-bar-bg" style="height:10px; background:var(--fin-border); border-radius:99px; overflow:hidden;">
                        <div class="sb-bar-fill" style="width:${pct}%; background:var(--fin-primary); height:100%; border-radius:99px; transition:width 0.5s var(--ios-spring);"></div>
                    </div>
                    <div style="font-size:12px; font-weight:600; color:var(--fin-text-muted); margin-top:12px;">Terkumpul Rp ${U.fmtMoney(g.current)} dari Rp ${U.fmtMoney(g.target)}</div>
                </div>`);
            }
            el.innerHTML = htmlArr.join('');
        },

        categories: () => {
            const el = U.id('all-cat-list'); if (!el) return;
            const htmlArr = [];
            const cats = S.cats || [];
            for (let i = 0; i < cats.length; i++) {
                const c = cats[i];
                htmlArr.push(`
                <div class="list-card liquid-glass" onclick="Dompetra.modals.openCat('${c.id}')" style="margin-bottom:12px; padding:16px;">
                    <div class="icon-box ${c.color || 'bg-gray'}" style="width:48px; height:48px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:24px;"><i class="ph-bold ph-${c.icon || 'coins'}"></i></div>
                    <div style="flex:1; font-weight:800; font-size:15px; color:var(--fin-text-dark); margin-left:16px;">${c.name}</div>
                    <div style="font-size:11px; font-weight:800; padding:6px 14px; background:var(--fin-bg-base); color:var(--fin-text-muted); border-radius:99px; border:1px solid var(--fin-border); text-transform:uppercase; letter-spacing:0.5px;">${c.type === 'income' ? 'Masuk' : 'Keluar'}</div>
                </div>`);
            }
            el.innerHTML = htmlArr.join('');
        },

        wallets: () => {
            const el = U.id('wallet-list'); if (!el) return;
            const ws = S.wallets || [];
            const htmlArr = [];
            for (let i = 0; i < ws.length; i++) {
                const w = ws[i];
                htmlArr.push(`
                <div class="card-wallet ${w.color || 'grad-blue'}" onclick="Dompetra.modals.editWallet('${w.id}')" style="margin-bottom:16px;">
                    <div style="font-size:14px; font-weight:700; opacity:0.9; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">${w.name}</div>
                    <div style="font-size:32px; font-weight:800; letter-spacing:-1px;">Rp ${U.fmtMoney(w.balance)}</div>
                </div>`);
            }
            el.innerHTML = htmlArr.join('');
        },

        shared: () => {
            const el = U.id('group-members-list'); if (!el) return;
            let html = '';

            if (S.groupOwner && S.activeGroupId) {
                const op = S.groupOwner;
                html += `
                <div style="margin-bottom:24px;">
                    <div style="font-size:11px; font-weight:800; color:var(--fin-text-muted); margin-bottom:12px; text-transform:uppercase; letter-spacing:1px; padding-left:4px;">Pemilik Grup</div>
                    <div class="list-card liquid-glass">
                        <div class="icon-box avatar-mode" style="background:var(--fin-primary-soft); color:var(--fin-primary); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px;"><span>${U.getInitials(op.full_name)}</span></div>
                        <div style="flex:1; margin-left:16px;"><div style="font-size:15px; font-weight:800; color:var(--fin-text-dark);">${op.full_name || 'Owner'}</div></div>
                        <div style="font-size:24px; color:var(--fin-warning);"><i class="ph-fill ph-crown"></i></div>
                    </div>
                </div>`;
            }

            if (S.activeGroupId && S.members && S.members.length) {
                html += `
                <div>
                    <div style="font-size:11px; font-weight:800; color:var(--fin-text-muted); margin-bottom:12px; text-transform:uppercase; letter-spacing:1px; padding-left:4px;">Anggota Tim (${S.members.length})</div>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                `;
                const membersHtml = S.members.map(m => {
                    const p = m.profiles || {};
                    if (S.groupOwner && m.user_id === S.groupOwner.id) return '';
                    return `
                        <div class="list-card liquid-glass">
                            <div class="icon-box avatar-mode" style="background:var(--fin-bg-base); color:var(--fin-text-muted); border:1px solid var(--fin-border); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px;"><span>${U.getInitials(p.full_name)}</span></div>
                            <div style="flex:1; margin-left:16px;">
                                <div style="font-size:15px; font-weight:800; color:var(--fin-text-dark);">${p.full_name || 'User'}</div>
                                <div style="font-size:12px; font-weight:600; color:var(--fin-text-muted); text-transform:capitalize; margin-top:2px;">Role: ${m.role}</div>
                            </div>
                        </div>`;
                }).join('');
                html += membersHtml + `</div></div>`;
            }
            el.innerHTML = html;
        },

        analysis: async () => {
            if (!window.Chart) await D.utils.loadLib('https://cdn.jsdelivr.net/npm/chart.js');
            const txs = S.filteredTxs || [];
            const daily = {};

            for (let i = 0; i < txs.length; i++) {
                const t = txs[i];
                const d = new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                if (!daily[d]) daily[d] = { inc: 0, exp: 0 };

                const amt = parseFloat(t.amount);
                if (t.type === 'income') daily[d].inc += amt;
                else daily[d].exp += amt;
            }

            const labels = Object.keys(daily).reverse();
            const ctxTrend = document.getElementById('chart-trend');

            if (ctxTrend && window.Chart) {
                if (window.chartTrendInstance) window.chartTrendInstance.destroy();
                window.chartTrendInstance = new Chart(ctxTrend, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            { label: 'Keluar', data: labels.map(l => daily[l].exp), borderColor: '#FF3B30', backgroundColor: 'rgba(255, 59, 48, 0.1)', tension: 0.4, fill: true, borderWidth: 3 },
                            { label: 'Masuk', data: labels.map(l => daily[l].inc), borderColor: '#34C759', backgroundColor: 'rgba(52, 199, 89, 0.1)', tension: 0.4, fill: true, borderWidth: 3 }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { x: { display: false }, y: { display: false } },
                        interaction: { mode: 'index', intersect: false },
                        animation: { duration: 0 }
                    }
                });
            }

            const ctxCat = document.getElementById('chart-cat');
            if (ctxCat && window.Chart) {
                if (window.chartCatInstance) window.chartCatInstance.destroy();
                const catMap = {};
                const expTxs = txs.filter(t => t.type === 'expense');

                for (let i = 0; i < expTxs.length; i++) {
                    const t = expTxs[i];
                    if (!catMap[t.catId]) catMap[t.catId] = 0;
                    catMap[t.catId] += parseFloat(t.amount);
                }

                const cLabels = [], cData = [], cColors = [];
                const catKeys = Object.keys(catMap);
                for (let i = 0; i < catKeys.length; i++) {
                    const cid = catKeys[i];
                    const c = (S.cats || []).find(x => x.id == cid);
                    cLabels.push(c ? c.name : 'Lainnya');
                    cData.push(catMap[cid]);
                    cColors.push(c && c.color === 'bg-food' ? '#FF3B30' : (c && c.color === 'bg-shop' ? '#AF52DE' : '#8E8E93'));
                }

                window.chartCatInstance = new Chart(ctxCat, {
                    type: 'doughnut',
                    data: { labels: cLabels, datasets: [{ data: cData, backgroundColor: cColors, borderWidth: 0 }] },
                    options: { cutout: '75%', animation: { duration: 0 } }
                });
            }
        }
    };

    // ========================================================================
    // 4. MODULE: GROUP (Manajemen Multi-User)
    // ========================================================================
    D.group = {
        create: async () => {
            const name = U.id('new-group-name').value;
            if (!name) return U.toast('Nama grup wajib diisi');
            const code = Math.random().toString(36).substr(2, 6).toUpperCase();

            try {
                const { data, error } = await sb.from('groups').insert({ name, join_code: code, created_by: S.user.id }).select().single();
                if (error) throw error;

                await sb.from('group_members').insert({ group_id: data.id, user_id: S.user.id, role: 'owner' });

                U.closeAll();
                D.data.fetchRemote();
                U.toast('Grup berhasil dibuat!');
            } catch (e) {
                U.toast('Gagal membuat grup');
            }
        },
        join: async () => {
            const code = U.id('join-group-code').value;
            if (!code) return U.toast('Kode wajib diisi');

            try {
                const { data, error } = await sb.rpc('join_group_by_code', { input_code: code });
                if (error) throw error;

                if (data.success) {
                    U.closeAll();
                    D.data.fetchRemote();
                    U.toast(data.message);
                } else {
                    U.toast(data.message);
                }
            } catch (e) {
                U.toast('Gagal bergabung ke grup');
            }
        },
        switch: (gid) => {
            S.activeGroupId = gid;
            D.data.fetchRemote();
            D.nav.go('home');
        },
        exit: async () => {
            if (!S.activeGroupId) return;

            U.confirmDialog('Keluar Grup?', 'Anda akan keluar dari grup ini dan tidak dapat melihat transaksinya lagi.', async () => {
                try {
                    await sb.from('group_members').delete().eq('group_id', S.activeGroupId).eq('user_id', S.user.id);
                    S.activeGroupId = null;
                    D.data.fetchRemote();
                    D.nav.go('home');
                    U.toast('Berhasil keluar dari grup');
                } catch (e) {
                    U.toast('Gagal keluar dari grup');
                }
            }, 'danger', 'Keluar Grup');
        }
    };

    // ========================================================================
    // 5. MODULE: NAVIGATION (Router Sederhana)
    // ========================================================================
    D.nav = {
        init: () => {
            window.onpopstate = (event) => {
                if (event.state && event.state.page) {
                    D.nav.go(event.state.page, false);
                } else {
                    if (document.querySelector('.modal-backdrop.open')) {
                        D.utils.closeAll();
                    } else if (S.currentPage !== 'home') {
                        D.nav.go('home', true);
                    }
                }
            };
            history.replaceState({ page: 'home' }, '', '');
        },
        go: (pageId, push = true) => {
            document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
            const target = document.getElementById('page-' + pageId);
            if (target) {
                target.classList.add('active');
            }

            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(el => el.classList.remove('active'));

            const map = { 'home': 0, 'list': 1, 'budget': 2, 'profile': 3 };
            if (map[pageId] !== undefined && navItems[map[pageId]]) {
                navItems[map[pageId]].classList.add('active');
            }

            S.currentPage = pageId;
            window.scrollTo(0, 0);

            if (push) {
                history.pushState({ page: pageId }, '', '#' + pageId);
            }

            if (D.render && typeof D.render.current === 'function') {
                requestAnimationFrame(D.render.current);
            }
        },
        filterByBudget: (bid) => {
            D.nav.go('list');
            S.filteredTxs = (S.txs || []).filter(t => t.budgetId == bid);
            D.render.list();
            const l = document.getElementById('list-period-disp');
            if (l) {
                l.innerText = "Filter: Spesifik Budget";
            }
        }
    };

    // ========================================================================
    // 6. MODULE: TUTORIAL (Onboarding Interaktif)
    // ========================================================================
    D.tutorial = {
        steps: [
            { target: null, title: 'Selamat Datang!', desc: 'Halo! Mari kita atur keuanganmu agar lebih sehat. Ikuti petunjuk singkat ini ya.', nav: 'home' },
            { target: 'btn-menu-cat', title: 'Atur Kategori', desc: 'Pertama-tama, persiapkan kategori pengeluaran dan pemasukan sesuai kebutuhanmu.', nav: 'home' },
            { target: 'btn-home-in', title: 'Catat Pemasukan', desc: 'Mendapat gaji atau uang saku? Segera masukkan datanya melalui tombol ini.', nav: 'home' },
            { target: 'btn-home-out', title: 'Catat Pengeluaran', desc: 'Setiap melakukan belanja atau pembayaran, catat di sini agar uangmu terlacak.', nav: 'home' },
            { target: 'btn-budget-add', title: 'Buat Anggaran', desc: 'Agar tidak boros, batasi batas maksimal pengeluaranmu per kategori setiap bulan.', nav: 'budget' },
            { target: 'btn-budget-template', title: 'Template Budget', desc: 'Agar cepat, simpan budget rutinmu sebagai template di sini.', nav: 'budget' },
            { target: 'btn-goal-add', title: 'Impian Keuangan', desc: 'Tabung untuk impianmu (HP baru, Liburan) di sini.', nav: 'budget' },
            { target: 'btn-qa-settings', title: 'Transaksi Cepat', desc: 'Sering beli kopi? Buat tombol pintas di sini agar mencatat cuma 1 klik.', nav: 'profile' },
            { target: 'btn-menu-export', title: 'Laporan', desc: 'Download laporan keuanganmu dalam format Excel atau PDF.', nav: 'home' },
            { target: 'btn-menu-shared', title: 'Grup Bersama', desc: 'Kelola uang bersama pasangan atau tim di sini.', nav: 'home' }
        ],
        currentStep: 0,
        active: false,
        init: (force = false) => {
            if (!force && localStorage.getItem('dompetra_tut_done')) return;
            if (!force && S.txs && S.txs.length > 5) {
                localStorage.setItem('dompetra_tut_done', 'true');
                return;
            }

            D.tutorial.active = true;
            D.tutorial.currentStep = 0;
            const overlay = document.getElementById('tut-overlay');
            if (overlay) overlay.classList.add('active');

            D.tutorial.showStep();
        },
        restart: () => {
            localStorage.removeItem('dompetra_tut_done');
            D.tutorial.init(true);
            U.closeAll();
        },
        showStep: () => {
            const step = D.tutorial.steps[D.tutorial.currentStep];
            if (!step) return D.tutorial.end();

            if (step.nav && S.currentPage !== step.nav) {
                D.nav.go(step.nav);
                setTimeout(() => D.tutorial.renderSpotlight(step), 400);
            } else {
                D.tutorial.renderSpotlight(step);
            }
        },
        renderSpotlight: (step) => {
            const spot = document.getElementById('tut-spotlight');
            const tip = document.getElementById('tut-tooltip');
            const title = document.getElementById('tut-title');
            const desc = document.getElementById('tut-desc');

            if (!spot || !tip) return;

            title.innerText = step.title;
            desc.innerText = step.desc;

            if (!step.target) {
                if (D.utils && typeof D.utils.confetti === 'function') {
                    D.utils.confetti();
                }
                spot.style.top = '50%'; spot.style.left = '50%'; spot.style.width = '0'; spot.style.height = '0';
                spot.classList.remove('pulse');
                tip.style.top = '50%'; tip.style.left = '50%'; tip.style.transform = 'translate(-50%, -50%)';
                tip.classList.remove('top', 'bottom'); tip.classList.add('active');
                return;
            }

            const el = document.getElementById(step.target);
            if (el) {
                const rect = el.getBoundingClientRect();
                const pad = 12;
                spot.style.width = (rect.width + pad * 2) + 'px';
                spot.style.height = (rect.height + pad * 2) + 'px';
                spot.style.top = (rect.top - pad) + 'px';
                spot.style.left = (rect.left - pad) + 'px';
                spot.classList.add('pulse');

                const tipH = 150;
                let tipTop = rect.top + rect.height + 24;
                let tipClass = 'top';

                if (tipTop + tipH > window.innerHeight) {
                    tipTop = rect.top - tipH - 24;
                    tipClass = 'bottom';
                }
                tip.style.top = tipTop + 'px';

                let tipLeft = rect.left + (rect.width / 2) - 130;
                if (tipLeft < 10) tipLeft = 10;
                if (tipLeft + 260 > window.innerWidth) tipLeft = window.innerWidth - 270;

                tip.style.left = tipLeft + 'px';
                tip.style.transform = 'translateY(0)';

                tip.classList.remove('top', 'bottom');
                tip.classList.add(tipClass, 'active');
            }
        },
        next: () => {
            D.tutorial.currentStep++;
            if (D.tutorial.currentStep >= D.tutorial.steps.length) {
                D.tutorial.end();
            } else {
                D.tutorial.showStep();
            }
        },
        skip: () => {
            D.tutorial.end();
        },
        end: () => {
            const overlay = document.getElementById('tut-overlay');
            if (overlay) overlay.classList.remove('active');

            localStorage.setItem('dompetra_tut_done', 'true');
            D.tutorial.active = false;

            if (S.currentPage !== 'home') {
                D.nav.go('home');
            }
        }
    };

    // ========================================================================
    // 7. BOOTSTRAPPING & GLOBAL EVENT DELEGATION
    // ========================================================================
    document.addEventListener('DOMContentLoaded', () => {

        document.body.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'btn-login') {
                e.preventDefault();
                if (D.auth && typeof D.auth.login === 'function') {
                    D.auth.login();
                } else {
                    console.error('Auth modul tidak termuat penuh.');
                }
            }
            if (e.target && e.target.id === 'btn-reg') {
                e.preventDefault();
                if (D.auth && typeof D.auth.reg === 'function') {
                    D.auth.reg();
                }
            }
        });

        document.body.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (e.target && e.target.id === 'login-pass') {
                    e.preventDefault();
                    if (D.auth && typeof D.auth.login === 'function') {
                        D.auth.login();
                    }
                }
                if (e.target && e.target.id === 'reg-pass') {
                    e.preventDefault();
                    if (D.auth && typeof D.auth.reg === 'function') {
                        D.auth.reg();
                    }
                }
            }
        });

        try {
            if (U && typeof U.setTheme === 'function') {
                U.setTheme(localStorage.getItem('dompetra_theme') || 'auto');
            }
            if (U && typeof U.setColorTheme === 'function') {
                U.setColorTheme(localStorage.getItem('dompetra_color') || 'default');
            }
        } catch (err) {
            console.warn('Set theme error', err);
        }

        try {
            if (U && typeof U.initSwipeToClose === 'function') {
                U.initSwipeToClose();
            }
        } catch (err) {
            console.error('Gagal memuat Swipe to Close', err);
        }

        try {
            if (D.nav && typeof D.nav.init === 'function') {
                D.nav.init();
            }
        } catch (err) {
            console.error('Navigasi Gagal Diinisiasi:', err);
        }

        try {
            if (D.auth && typeof D.auth.init === 'function') {
                D.auth.init();
            }
        } catch (err) {
            console.error('Autentikasi Gagal Diinisiasi:', err);
        }
    });

})(window.Dompetra);