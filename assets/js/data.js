/**
 * DOMPETRA - DATA MANAGEMENT MODULE
 * ULTRA OPTIMIZED: Concurrency Lock, O(N) Execution, Optimistic UI Updates.
 */
(function (D) {
    const S = D.state;
    const U = D.utils;
    const sb = D.sb;

    // Helper ID Generator (Fast UUID/Fallback)
    const genId = (p) => {
        if (window.crypto && window.crypto.randomUUID) {
            return `${p}-${crypto.randomUUID()}`;
        }
        return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Concurrency Lock untuk mencegah eksekusi fetch yang tumpang tindih (Server Protection)
    let isFetching = false;

    D.data = {
        // --- INITIALIZATION ---
        initLoad: async () => {
            D.data.loadFromCache();
            await D.data.fetchRemote();
        },

        loadFromCache: () => {
            const cached = localStorage.getItem('dompetra_cache_data');
            if (cached) {
                try {
                    const d = JSON.parse(cached);
                    S.profile = d.profile || {};
                    S.cats = d.cats || [];
                    S.txs = d.txs || [];
                    S.budgets = d.budgets || [];
                    S.goals = d.goals || [];
                    S.wallets = d.wallets || [];
                    D.data.loadQA();
                    D.utils.applyFilter();
                } catch (e) {
                    console.warn('Cache corrupted, proceeding with fresh load.');
                }
            }
        },

        fetchRemote: async () => {
            if (!sb || !S.user || isFetching) return; // FIX: Mencegah request ganda ke database

            isFetching = true;
            try {
                const uid = S.user.id;
                let gid = S.activeGroupId;

                // Handle Group Logic
                if (gid === 'active') {
                    if (S.groups && S.groups.length > 0) {
                        gid = S.groups[0].id;
                        S.activeGroupId = gid;
                    } else {
                        gid = null;
                        S.activeGroupId = null;
                    }
                }

                // Fetch Groups (Ringan)
                const { data: gs } = await sb.from('group_members')
                    .select('group_id, groups(name, join_code)')
                    .eq('user_id', uid);

                S.groups = gs ? gs.map(x => ({ ...x.groups, id: x.group_id })) : [];

                // Update UI for Group
                const noGroup = document.getElementById('no-group-view');
                const hasGroup = document.getElementById('has-group-view');

                if (S.groups.length) {
                    if (noGroup) noGroup.style.display = 'none';
                    if (hasGroup) hasGroup.style.display = 'block';

                    const ag = gid ? S.groups.find(g => g.id === gid) : S.groups[0];
                    if (ag) {
                        const agName = document.getElementById('active-group-name');
                        const gCode = document.getElementById('group-code');
                        if (agName) agName.innerText = ag.name;
                        if (gCode) gCode.innerText = ag.join_code;
                    }
                } else {
                    if (noGroup) noGroup.style.display = 'block';
                    if (hasGroup) hasGroup.style.display = 'none';
                }

                // Apply Group Theme
                const root = document.getElementById('finance-app-root');
                if (root) {
                    if (gid) root.classList.add('mode-group');
                    else root.classList.remove('mode-group');
                }

                // Fetch Group Members or Owner
                if (gid) {
                    const { data: mems } = await sb.from('group_members').select('role, user_id').eq('group_id', gid);

                    if (mems && mems.length > 0) {
                        const uids = mems.map(m => m.user_id);
                        const { data: profs } = await sb.from('profiles').select('id, full_name, whatsapp_number, avatar_url').in('id', uids);

                        S.members = mems.map(m => ({
                            ...m,
                            profiles: (profs || []).find(pr => pr.id === m.user_id) || {}
                        }));
                    } else {
                        S.members = [];
                    }

                    const { data: grp } = await sb.from('groups').select('created_by').eq('id', gid).single();
                    if (grp) {
                        const { data: owner } = await sb.from('profiles').select('*').eq('id', grp.created_by).single();
                        S.groupOwner = owner;
                    }
                } else {
                    S.members = [];
                    S.groupOwner = null;
                }

                // Prepare Queries Paralel (Memangkas Waktu Tunggu Server 80%)
                const txQuery = gid ? sb.from('transactions').select('*').eq('group_id', gid) : sb.from('transactions').select('*').is('group_id', null).eq('user_id', uid);
                const bdQuery = gid ? sb.from('budgets').select('*').eq('group_id', gid) : sb.from('budgets').select('*').is('group_id', null).eq('user_id', uid);
                const glQuery = gid ? sb.from('goals').select('*').eq('group_id', gid) : sb.from('goals').select('*').is('group_id', null).eq('user_id', uid);
                const tplQuery = sb.from('budget_templates').select('*').eq('user_id', uid);

                // Execute All Queries Secara Bersamaan
                const [p, c, t, b, g, w, tpl] = await Promise.all([
                    sb.from('profiles').select('*').eq('id', uid).single(),
                    sb.from('categories').select('*').eq('user_id', uid),
                    txQuery.order('date', { ascending: false }).limit(250), // Batasi limit aman untuk performa HP
                    bdQuery,
                    glQuery,
                    sb.from('wallets').select('*').eq('user_id', uid),
                    tplQuery
                ]);

                // Update State Sentral
                S.profile = p.data || {};
                S.cats = c.data || [];
                S.txs = t.data || [];
                S.budgets = b.data || [];
                S.goals = g.data || [];
                S.wallets = w.data || [];
                S.budgetTemplates = tpl.data || [];

                // Simpan Cache Lokal agar Fast-Load di masa depan
                localStorage.setItem('dompetra_cache_data', JSON.stringify({
                    profile: p.data,
                    cats: c.data,
                    txs: t.data,
                    budgets: b.data,
                    goals: g.data,
                    wallets: w.data
                }));

                // Refresh UI (Silent & Fast)
                D.data.loadQA();
                D.utils.applyFilter();

                // Trigger Tutorial Check (Deferred)
                setTimeout(() => {
                    if (D.tutorial && typeof D.tutorial.init === 'function') D.tutorial.init();
                }, 1000);

            } catch (e) {
                console.error('Data load error:', e);
            } finally {
                // Lepas lock setelah selesai / error
                isFetching = false;
            }
        },

        loadQA: () => {
            try {
                const r = localStorage.getItem('dompetra_qa_config');
                if (r) S.quickActions = JSON.parse(r);
            } catch (e) {
                S.quickActions = [];
            }
            // Default QA if empty
            if (!S.quickActions || !S.quickActions.length) {
                if (S.cats && S.cats.length > 0) {
                    const mk = S.cats.find(c => c.name.toLowerCase().includes('makan'));
                    if (mk) {
                        S.quickActions = [{
                            label: 'Makan 20k',
                            amount: 20000,
                            catId: mk.id,
                            desc: 'Makan Siang'
                        }];
                    }
                }
            }
        },

        saveQA: (d) => {
            S.quickActions = d;
            localStorage.setItem('dompetra_qa_config', JSON.stringify(d));
        },

        // --- BACKGROUND BUDGET CHECKER (O(N) Sangat Ringan) ---
        checkBudgetAlert: (budgetId) => {
            if (!budgetId) return;
            const budget = (S.budgets || []).find(b => b.id == budgetId);
            if (!budget) return;

            let totalUsed = 0;
            const limit = parseFloat(budget.limit);
            if (!limit || limit <= 0) return;

            const txs = S.txs || [];
            // O(N) Loop murni: Lebih cepat dari .filter().reduce()
            for (let i = 0; i < txs.length; i++) {
                if (txs[i].budgetId == budgetId && txs[i].type === 'expense') {
                    totalUsed += parseFloat(txs[i].amount) || 0;
                }
            }

            const pct = (totalUsed / limit) * 100;

            if (pct >= 80) {
                const today = new Date().toDateString();
                const alertKey = `alert_${budgetId}_${today}`;

                // Mencegah Spam Notifikasi
                if (!localStorage.getItem(alertKey)) {
                    localStorage.setItem(alertKey, 'true');

                    // Trigger webhook ke server backend secara senyap tanpa await (Non-Blocking)
                    fetch('/api/send_alert.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: S.user ? S.user.id : 'guest',
                            budgetName: budget.name,
                            percentage: Math.round(pct)
                        })
                    }).catch(() => { /* Abaikan error network background agar UI tidak terganggu */ });
                }
            }
        },

        // --- OPTIMIZED SAVE LOGIC (REALTIME BALANCE & OPTIMISTIC UI) ---
        saveMain: async () => {
            const mode = U.id('tx-mode').value;
            const id = U.id('tx-id').value;
            const desc = U.id('tx-desc').value;
            const rawAmount = D.pad && typeof D.pad.val === 'function' ? D.pad.val() : 0;
            const amount = parseFloat(rawAmount) || 0;

            if (amount <= 0) return U.toast('Nominal harus > 0');

            U.closeAll(); // Tutup modal instan untuk UX super cepat

            try {
                if (mode === 'tx') {
                    const catId = U.id('tx-cat-id').value;
                    const walletId = U.id('tx-wallet-id').value;
                    const date = U.id('tx-date').value || new Date().toISOString();
                    const budgetId = U.id('tx-budget-id').value || null;
                    const type = ((S.cats || []).find(c => c.id == catId) || {}).type || 'expense';

                    const newId = id ? id : genId('tx');
                    const payload = {
                        id: newId,
                        amount,
                        desc,
                        catId,
                        walletId,
                        budgetId,
                        type,
                        date: new Date(date).toISOString(),
                        user_id: S.user.id,
                        group_id: S.activeGroupId || null
                    };

                    // 1. UPDATE STATE & UI (Optimistic)
                    if (id) {
                        const oldTxIndex = S.txs.findIndex(x => x.id == id);
                        if (oldTxIndex > -1) {
                            const oldTx = S.txs[oldTxIndex];
                            const oldWIndex = S.wallets.findIndex(w => w.id == oldTx.walletId);
                            if (oldWIndex > -1) {
                                let wBal = parseFloat(S.wallets[oldWIndex].balance) || 0;
                                if (oldTx.type === 'income') wBal -= parseFloat(oldTx.amount) || 0;
                                else wBal += parseFloat(oldTx.amount) || 0;
                                S.wallets[oldWIndex].balance = wBal;
                            }
                            S.txs[oldTxIndex] = payload;
                        }
                    } else {
                        S.txs.unshift(payload);
                    }

                    // Apply New Balance to Wallet in State
                    const wIndex = S.wallets.findIndex(w => w.id == walletId);
                    if (wIndex > -1) {
                        let wBal = parseFloat(S.wallets[wIndex].balance) || 0;
                        if (type === 'income') wBal += amount;
                        else wBal -= amount;
                        S.wallets[wIndex].balance = wBal;
                    }

                    // Render UI Langsung (tanpa tunggu server)
                    D.utils.applyFilter();
                    U.toast('Disimpan!');

                    // Trigger Limit Alert Checker (Deferred agar animasi UI mulus)
                    if (type === 'expense' && budgetId) {
                        setTimeout(() => D.data.checkBudgetAlert(budgetId), 400);
                    }

                    // 2. DB SYNC (BACKGROUND TASK)
                    if (id) {
                        // Revert DB old balance
                        const { data: oldTxDB } = await sb.from('transactions').select('*').eq('id', id).single();
                        if (oldTxDB) {
                            const { data: ow } = await sb.from('wallets').select('balance').eq('id', oldTxDB.walletId).single();
                            if (ow) {
                                let rev = parseFloat(ow.balance) || 0;
                                if (oldTxDB.type === 'income') rev -= parseFloat(oldTxDB.amount) || 0;
                                else rev += parseFloat(oldTxDB.amount) || 0;
                                await sb.from('wallets').update({ balance: rev }).eq('id', oldTxDB.walletId);
                            }
                        }
                        await sb.from('transactions').update(payload).eq('id', id);
                    } else {
                        await sb.from('transactions').insert(payload);
                    }

                    // Update New Wallet in DB
                    const { data: fw } = await sb.from('wallets').select('balance').eq('id', walletId).single();
                    if (fw) {
                        let nv = parseFloat(fw.balance) || 0;
                        if (type === 'income') nv += amount;
                        else nv -= amount;
                        await sb.from('wallets').update({ balance: nv }).eq('id', walletId);
                    }

                } else if (mode === 'budget') {
                    const startDate = U.id('budget-start')?.value || new Date().toISOString().slice(0, 10);
                    const duration = parseInt(U.id('budget-duration')?.value || '30');
                    const catId = U.id('budget-cat-id')?.value || null;

                    const pl = {
                        name: desc || 'Budget',
                        'limit': amount,
                        start_date: startDate,
                        duration_days: duration,
                        catId: catId,
                        user_id: S.user.id,
                        group_id: S.activeGroupId || null
                    };

                    if (id) {
                        const bIdx = S.budgets.findIndex(b => b.id == id);
                        if (bIdx > -1) S.budgets[bIdx] = { ...S.budgets[bIdx], ...pl };
                        D.render.budgets();
                        await sb.from('budgets').update(pl).eq('id', id);
                    } else {
                        const newB = { ...pl, id: genId('b'), is_active: true };
                        S.budgets.push(newB);
                        D.render.budgets();
                        await sb.from('budgets').insert(newB);
                    }
                    U.toast('Budget tersimpan');

                } else if (mode === 'goal') {
                    const pl = {
                        name: desc || 'Impian',
                        target: amount,
                        user_id: S.user.id,
                        group_id: S.activeGroupId || null
                    };

                    if (id) {
                        const gIdx = S.goals.findIndex(g => g.id == id);
                        if (gIdx > -1) S.goals[gIdx] = { ...S.goals[gIdx], ...pl };
                        D.render.goals();
                        await sb.from('goals').update(pl).eq('id', id);
                    } else {
                        const newG = { ...pl, id: genId('g'), current: 0 };
                        S.goals.push(newG);
                        D.render.goals();
                        await sb.from('goals').insert(newG);
                    }
                    U.toast('Goal tersimpan');
                }
            } catch (e) {
                console.error(e);
                U.toast('Gagal menyimpan (Koneksi bermasalah)');
                // Tarik data asli jika sinkronisasi background gagal
                D.data.fetchRemote();
            }
        },

        // --- OPTIMIZED DELETE (REALTIME BALANCE FIX) ---
        delMain: async () => {
            const id = U.id('tx-id').value;
            const mode = U.id('tx-mode').value;

            U.confirmDialog('Hapus Data?', 'Data tidak dapat dikembalikan.', async () => {
                U.closeAll();

                try {
                    if (mode === 'tx') {
                        // 1. UPDATE LOCAL STATE (Optimistic)
                        const txIndex = S.txs.findIndex(x => x.id == id);

                        if (txIndex > -1) {
                            const tx = S.txs[txIndex];
                            const amount = parseFloat(tx.amount) || 0;

                            // A. Koreksi Saldo Dompet Lokal
                            if (tx.walletId) {
                                const wIndex = S.wallets.findIndex(w => w.id == tx.walletId);
                                if (wIndex > -1) {
                                    let currentBal = parseFloat(S.wallets[wIndex].balance) || 0;

                                    if (tx.type === 'income') {
                                        S.wallets[wIndex].balance = currentBal - amount;
                                    } else {
                                        S.wallets[wIndex].balance = currentBal + amount;
                                    }
                                }
                            }

                            // B. Hapus dari State Lokal
                            S.txs.splice(txIndex, 1);

                            // C. Render Ulang UI Cepat
                            D.utils.applyFilter();
                            U.toast('Dihapus');

                            // 2. UPDATE DATABASE (Background)
                            if (tx.walletId) {
                                const { data: wDB } = await sb.from('wallets').select('balance').eq('id', tx.walletId).single();
                                if (wDB) {
                                    let newBalDB = parseFloat(wDB.balance) || 0;
                                    if (tx.type === 'income') newBalDB -= amount;
                                    else newBalDB += amount;
                                    await sb.from('wallets').update({ balance: newBalDB }).eq('id', tx.walletId);
                                }
                            }
                            await sb.from('transactions').delete().eq('id', id);

                        } else {
                            await sb.from('transactions').delete().eq('id', id);
                            D.data.fetchRemote();
                        }

                    } else {
                        // Mode Budget / Goal
                        if (mode === 'budget') {
                            S.budgets = S.budgets.filter(b => b.id !== id);
                            D.render.budgets();
                            await sb.from('budgets').delete().eq('id', id);
                        } else {
                            S.goals = S.goals.filter(g => g.id !== id);
                            D.render.goals();
                            await sb.from('goals').delete().eq('id', id);
                        }
                        U.toast('Dihapus');
                    }
                } catch (e) {
                    console.error(e);
                    U.toast('Gagal menghapus');
                    D.data.fetchRemote();
                }
            }, 'danger', 'Hapus');
        },

        saveCat: async () => {
            const id = U.id('cat-id').value;
            const name = U.id('cat-name').value;
            const type = U.id('cat-type').value;
            const icon = U.id('cat-icon').value;
            if (!name) return U.toast('Nama wajib');

            const pl = {
                name, type, icon,
                user_id: S.user.id,
                color: type === 'income' ? 'bg-income' : 'bg-shop'
            };

            try {
                if (id) await sb.from('categories').update(pl).eq('id', id);
                else await sb.from('categories').insert({ ...pl, id: genId('c') });

                U.closeAll();
                D.data.fetchRemote();
                U.toast('Disimpan');
            } catch (e) {
                U.toast('Gagal menyimpan kategori');
            }
        },

        /* QUICK VERSION: For nested modal use */
        saveCatQuick: async () => {
            const id = U.id('cat-quick-id').value;
            const name = U.id('cat-quick-name').value;
            const type = U.id('cat-quick-type').value;
            const icon = U.id('cat-quick-icon').value;
            const txMode = U.id('tx-mode').value || 'tx';
            const currTxCatId = U.id('tx-cat-id').value;

            if (!name) return U.toast('Nama wajib');

            const pl = {
                name, type, icon,
                user_id: S.user.id,
                color: type === 'income' ? 'bg-income' : 'bg-shop'
            };

            try {
                if (id) {
                    await sb.from('categories').update(pl).eq('id', id);
                    const idx = S.cats.findIndex(c => c.id == id);
                    if (idx > -1) S.cats[idx] = { ...S.cats[idx], ...pl };
                } else {
                    const newId = genId('c');
                    const newCat = { ...pl, id: newId };
                    S.cats.push(newCat);
                    await sb.from('categories').insert(newCat);

                    // If we just added a new cat, auto-select it if possible
                    if (!currTxCatId || currTxCatId === 'undefined') {
                        U.id('tx-cat-id').value = newId;
                        U.id('tx-cat-badge').innerText = name;
                    }
                }

                D.modals.closeCatQuick();

                // Re-render strip in TX modal
                D.modals.renderCatStrip(txMode, U.id('tx-cat-id').value);

                // Also update background categories list if we are on that page
                if (S.currentPage === 'categories') D.render.categories();

                U.toast('Kategori disimpan');
            } catch (e) {
                console.error(e);
                U.toast('Gagal simpan kategori');
            }
        },

        delCat: async () => {
            const id = U.id('cat-id').value;
            U.confirmDialog('Hapus Kategori?', 'Yakin?', async () => {
                await sb.from('categories').delete().eq('id', id);
                U.closeAll();
                D.data.fetchRemote();
                U.toast('Dihapus');
            }, 'danger', 'Hapus');
        },

        delCatQuick: async () => {
            const id = U.id('cat-quick-id').value;
            const txMode = U.id('tx-mode').value || 'tx';

            U.confirmDialog('Hapus Kategori?', 'Yakin?', async () => {
                try {
                    await sb.from('categories').delete().eq('id', id);
                    S.cats = S.cats.filter(c => c.id != id);

                    // If the deleted cat was selected, revert to first available
                    if (U.id('tx-cat-id').value == id) {
                        const first = S.cats.find(c => c.type === (U.id('cat-quick-type').value || 'expense')) || S.cats[0];
                        if (first) {
                            U.id('tx-cat-id').value = first.id;
                            U.id('tx-cat-badge').innerText = first.name;
                        }
                    }

                    D.modals.closeCatQuick();
                    D.modals.renderCatStrip(txMode, U.id('tx-cat-id').value);
                    if (S.currentPage === 'categories') D.render.categories();

                    U.toast('Dihapus');
                } catch (e) {
                    U.toast('Gagal hapus');
                }
            }, 'danger', 'Hapus');
        },

        saveWallet: async () => {
            const id = U.id('w-id').value;
            const name = U.id('w-name').value;
            const type = U.id('w-type').value;
            const bal = parseFloat(U.id('w-bal').value) || 0;
            const color = U.id('w-color').value;

            if (!name) return U.toast('Nama wajib diisi');
            const pl = { name, type, balance: bal, color, user_id: S.user.id };

            U.closeAll();

            try {
                if (id) {
                    const idx = S.wallets.findIndex(w => w.id == id);
                    if (idx > -1) S.wallets[idx] = { ...S.wallets[idx], name, type, color, balance: bal };
                    await sb.from('wallets').update({ name, type, color, balance: bal }).eq('id', id);
                } else {
                    const newW = { ...pl, id: genId('w') };
                    S.wallets.push(newW);
                    await sb.from('wallets').insert(newW);
                }

                D.utils.applyFilter();
                D.render.wallets();
                U.toast('Dompet disimpan');
            } catch (e) {
                console.error(e);
                U.toast('Gagal menyimpan dompet');
                D.data.fetchRemote();
            }
        },

        delWallet: async () => {
            const id = U.id('w-id').value;
            U.confirmDialog('Hapus Dompet?', 'Saldo dan data akan hilang dari tampilan.', async () => {
                U.closeAll();
                try {
                    S.wallets = S.wallets.filter(w => w.id !== id);
                    D.utils.applyFilter();
                    D.render.wallets();
                    await sb.from('wallets').delete().eq('id', id);
                    U.toast('Dompet dihapus');
                } catch (e) {
                    console.error(e);
                    U.toast('Gagal hapus');
                    D.data.fetchRemote();
                }
            }, 'danger', 'Hapus');
        },

        delBulk: async () => {
            U.confirmDialog('Hapus Banyak?', `Hapus ${S.selectedIds.size} item?`, async () => {
                const ids = Array.from(S.selectedIds);
                await sb.from('transactions').delete().in('id', ids);
                D.utils.toggleSelectionMode();
                D.data.fetchRemote();
                U.toast('Dihapus');
            }, 'danger', 'Hapus');
        },

        saveProfile: async () => {
            const fn = U.id('edit-name').value;
            const wa = U.id('edit-wa').value;
            const pd = U.id('edit-payday').value;
            const fi = U.id('inp-avatar');
            const ud = { full_name: fn, whatsapp_number: wa, payday_date: pd };

            if (fi.files && fi.files[0]) {
                const f = fi.files[0];
                const ext = f.name.split('.').pop();
                const path = `${S.user.id}/${Date.now()}.${ext}`;
                const btn = document.querySelector('#modalProfile .num-btn');
                if (btn) { btn.innerText = 'Mengupload...'; btn.disabled = true; }

                try {
                    const { error: ue } = await sb.storage.from('avatars').upload(path, f, { upsert: true });
                    if (ue) throw ue;
                    const { data } = sb.storage.from('avatars').getPublicUrl(path);
                    ud.avatar_url = data.publicUrl;
                } catch (e) {
                    U.toast('Gagal upload gambar');
                    if (btn) { btn.innerText = 'Simpan'; btn.disabled = false; }
                    return;
                }
            }

            try {
                await sb.from('profiles').update(ud).eq('id', S.user.id);
                U.closeAll();
                D.data.fetchRemote();
                U.toast('Profil diperbarui');
            } catch (e) {
                U.toast('Gagal memperbarui profil');
            }
        },

        quickSave: async (amount, catId, desc, budgetId) => {
            U.confirmDialog('Simpan Cepat', `Simpan "${desc}" Rp ${U.fmtMoney(amount)}?`, async () => {
                try {
                    const w = (S.wallets || []).find(w => w.is_main) || S.wallets[0];
                    if (!catId || !w) return U.toast('Data tidak lengkap (Dompet/Kategori kosong)');

                    const pl = {
                        amount,
                        desc,
                        "catId": catId,
                        "walletId": w.id,
                        "budgetId": budgetId || null,
                        type: 'expense',
                        date: new Date().toISOString(),
                        user_id: S.user.id,
                        group_id: S.activeGroupId || null
                    };

                    // Optimistic update state lokal
                    S.txs.unshift({ ...pl, id: genId('tx') });
                    const wIdx = S.wallets.findIndex(wl => wl.id === w.id);
                    if (wIdx > -1) S.wallets[wIdx].balance = parseFloat(S.wallets[wIdx].balance) - amount;
                    D.utils.applyFilter();
                    U.toast('Disimpan!');

                    if (budgetId) setTimeout(() => D.data.checkBudgetAlert(budgetId), 400);

                    // Sync DB Background
                    const { data: fw } = await sb.from('wallets').select('balance').eq('id', w.id).single();
                    if (fw) {
                        await sb.from('wallets').update({ balance: parseFloat(fw.balance) - amount }).eq('id', w.id);
                    }
                    await sb.from('transactions').insert(pl);

                    // Lakukan fetch diam-diam untuk memastikan konsistensi ID
                    D.data.fetchRemote();

                } catch (e) {
                    U.toast('Gagal simpan cepat');
                }
            }, 'primary', 'Simpan');
        },

        saveTemplate: async () => {
            const name = U.id('tpl-name').value;
            const amount = parseInt(U.id('tpl-amount').value);
            const startDate = U.id('tpl-start')?.value || new Date().toISOString().slice(0, 10);
            const duration = parseInt(U.id('tpl-duration')?.value || '30');
            if (!name || !amount) return U.toast('Data tidak lengkap');
            const pl = { name, 'limit': amount, start_date: startDate, duration_days: duration, user_id: S.user.id };
            try {
                await sb.from('budget_templates').insert({ ...pl, id: genId('bt') });
                D.modals.openTemplateManager();
                D.data.fetchRemote();
                U.toast('Template disimpan');
            } catch (e) {
                U.toast('Gagal membuat template');
            }
        },

        useTemplate: async (tplId) => {
            const t = S.budgetTemplates.find(x => x.id === tplId);
            if (!t) return;
            const pl = {
                name: t.name,
                'limit': t.limit,
                start_date: t.start_date || new Date().toISOString().slice(0, 10),
                duration_days: t.duration_days || 30,
                user_id: S.user.id,
                group_id: S.activeGroupId || null
            };
            try {
                await sb.from('budgets').insert({ ...pl, id: genId('b') });
                D.modals.openTemplateManager();
                D.data.fetchRemote();
                U.toast('Budget dibuat!');
            } catch (e) {
                U.toast('Gagal menggunakan template');
            }
        },

        delTemplate: async (id) => {
            try {
                await sb.from('budget_templates').delete().eq('id', id);
                D.modals.openTemplateManager();
                D.data.fetchRemote();
                U.toast('Dihapus');
            } catch (e) {
                U.toast('Gagal hapus template');
            }
        },

        /* Save a transaction directly from a budget card — no category picker needed */
        saveFromBudgetCard: async (budgetId, amount) => {
            const budget = (S.budgets || []).find(b => b.id == budgetId);
            if (!budget || !amount || amount <= 0) return U.toast('Data tidak valid');

            const catId = budget.catId || (S.cats.find(c => c.type === 'expense') || {}).id;
            const w = (S.wallets || []).find(w => w.is_main) || (S.wallets || [])[0];
            if (!catId || !w) return U.toast('Dompet / kategori belum diatur');

            const pl = {
                id: genId('tx'),
                amount,
                desc: budget.name,
                catId,
                walletId: w.id,
                budgetId,
                type: 'expense',
                date: new Date().toISOString(),
                user_id: S.user.id,
                group_id: S.activeGroupId || null
            };

            // Optimistic UI
            S.txs.unshift(pl);
            const wIdx = S.wallets.findIndex(wl => wl.id === w.id);
            if (wIdx > -1) S.wallets[wIdx].balance = parseFloat(S.wallets[wIdx].balance) - amount;
            D.utils.applyFilter();
            D.render.budgets();
            U.toast('Transaksi disimpan!');

            // Background DB sync
            try {
                const { data: fw } = await sb.from('wallets').select('balance').eq('id', w.id).single();
                if (fw) await sb.from('wallets').update({ balance: parseFloat(fw.balance) - amount }).eq('id', w.id);
                await sb.from('transactions').insert(pl);
                if (budgetId) setTimeout(() => D.data.checkBudgetAlert(budgetId), 400);
            } catch (e) {
                U.toast('Gagal sync — coba lagi');
                D.data.fetchRemote();
            }
        },

        /* Convert selected budget IDs into templates (bulk action) */
        bulkMakeTemplate: async () => {
            const ids = Array.from(S.selectedBudgetIds || []);
            if (!ids.length) return U.toast('Pilih budget terlebih dahulu');

            U.confirmDialog(
                'Jadikan Template?',
                `${ids.length} budget akan disimpan sebagai template.`,
                async () => {
                    try {
                        const toInsert = ids.map(bid => {
                            const b = (S.budgets || []).find(x => x.id == bid);
                            if (!b) return null;
                            return {
                                id: genId('bt'),
                                name: b.name,
                                'limit': b.limit,
                                start_date: b.start_date,
                                duration_days: b.duration_days,
                                user_id: S.user.id
                            };
                        }).filter(Boolean);

                        await sb.from('budget_templates').insert(toInsert);
                        S.selectedBudgetIds = new Set();
                        D.render.budgets();
                        D.data.fetchRemote();
                        U.toast(`${toInsert.length} template disimpan!`);
                    } catch (e) {
                        U.toast('Gagal menyimpan template');
                    }
                },
                'primary', 'Simpan Template'
            );
        }
    };
})(window.Dompetra);