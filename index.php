<?php
require_once __DIR__ . '/config/app.php';
include __DIR__ . '/includes/header.php';
?>

<!-- PWA CORE REGISTRATION (EARLY EXECUTION) -->
<script>
    window.Dompetra = window.Dompetra || {};
    window.Dompetra.pwa = window.Dompetra.pwa || { deferredPrompt: null };

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW Terdaftar:', reg.scope))
                .catch(err => console.error('SW Gagal:', err));
        });
    }

    function showInstallCapsule() {
        const today = new Date().toDateString();
        const lastPrompt = localStorage.getItem('dompetra_install_prompt');

        if (lastPrompt !== today && lastPrompt !== 'installed') {
            setTimeout(() => {
                const capsule = document.getElementById('ios-install-prompt');
                if (capsule) capsule.classList.add('show');
            }, 2000);
        }
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.Dompetra.pwa.deferredPrompt = e;
        showInstallCapsule();
    });

    window.addEventListener('load', () => {
        const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        const isStandalone = ('standalone' in window.navigator) && (window.navigator.standalone);

        if (isIos && !isStandalone) {
            setTimeout(() => {
                const btn = document.querySelector('#ios-install-prompt .capsule-btn');
                if (btn) btn.innerText = 'Info';
                showInstallCapsule();
            }, 1000);
        }
    });

    window.Dompetra.pwa.install = async () => {
        const capsule = document.getElementById('ios-install-prompt');
        const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

        if (isIos) {
            alert('Untuk Install di iPhone: Ketuk ikon Share (Kotak dengan panah ke atas) di bawah layar Safari, lalu geser dan pilih "Add to Home Screen".');
            if (capsule) capsule.classList.remove('show');
            localStorage.setItem('dompetra_install_prompt', new Date().toDateString());
            return;
        }

        if (!window.Dompetra.pwa.deferredPrompt) return;

        window.Dompetra.pwa.deferredPrompt.prompt();
        const { outcome } = await window.Dompetra.pwa.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            if (capsule) capsule.classList.remove('show');
            localStorage.setItem('dompetra_install_prompt', 'installed');
        }
        window.Dompetra.pwa.deferredPrompt = null;
    };

    window.Dompetra.pwa.dismiss = () => {
        const capsule = document.getElementById('ios-install-prompt');
        if (capsule) capsule.classList.remove('show');
        localStorage.setItem('dompetra_install_prompt', new Date().toDateString());
    };

    window.addEventListener('appinstalled', () => {
        localStorage.setItem('dompetra_install_prompt', 'installed');
        const capsule = document.getElementById('ios-install-prompt');
        if (capsule) capsule.classList.remove('show');
    });
</script>

<div id="finance-app-root">

    <!-- iOS 27 Liquid Mesh Background (New) -->
    <div class="mesh-bg">
        <div class="mesh-blob b1"></div>
        <div class="mesh-blob b2"></div>
        <div class="mesh-blob b3"></div>
    </div>

    <!-- APP LOADER (Splash Screen) -->
    <div id="app-loader">
        <div class="loader-spinner"></div>
    </div>

    <!-- IOS LIQUID GLASS INSTALL PROMPT -->
    <div id="ios-install-prompt" class="ios-install-capsule">
        <div class="capsule-icon">
            <i class="ph-fill ph-download-simple" style="color: white; font-size: 20px;"></i>
        </div>
        <div class="capsule-text">
            <strong>Install Dompetra</strong>
            <span>Akses cepat & offline mode</span>
        </div>
        <button class="capsule-btn" onclick="window.Dompetra.pwa.install()">Install</button>
        <button class="capsule-close" onclick="window.Dompetra.pwa.dismiss()"><i class="ph-bold ph-x"></i></button>
    </div>

    <!-- TUTORIAL LAYER -->
    <div id="tut-overlay">
        <div class="tut-spotlight" id="tut-spotlight"></div>
        <div class="tut-tooltip" id="tut-tooltip">
            <div class="tut-progress" id="tut-progress">1 / 13</div>
            <div class="tut-title" id="tut-title">Judul</div>
            <div class="tut-desc" id="tut-desc">Deskripsi</div>
            <div class="tut-actions">
                <button class="tut-btn skip" onclick="Dompetra.tutorial.skip()">Lewati</button>
                <div class="tut-actions-right">
                    <button class="tut-btn back" id="tut-btn-back" onclick="Dompetra.tutorial.back()"
                        style="display:none;">← Kembali</button>
                    <button class="tut-btn next" onclick="Dompetra.tutorial.next()">Lanjut →</button>
                </div>
            </div>
        </div>
    </div>

    <!-- TOAST -->
    <div class="toast" id="toast">
        <i class="ph-fill ph-check-circle" style="color:#4ADE80; font-size:18px;"></i>
        <span id="toast-msg">Sukses!</span>
    </div>

    <!-- AUTH SCREEN (Modal/View) -->
    <?php include __DIR__ . '/includes/modals/modal_auth.php'; ?>

    <!-- MAIN APP FRAME -->
    <div class="app-frame">

        <!-- HEADER DYNAMIC (Home) -->
        <div class="header-dynamic" id="main-header">
            <div>
                <div
                    style="font-size:11px; font-weight:700; color:var(--fin-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">
                    Selamat Datang</div>
                <div style="font-size:20px; font-weight:800; color:var(--fin-text-dark);" id="header-name">User</div>
            </div>
            <div class="header-avatar" onclick="Dompetra.nav.go('profile')">
                <img id="header-avatar-img" src="" style="display:none;" alt="Profile">
                <i class="ph-bold ph-user" id="header-avatar-icon"></i>
            </div>
        </div>

        <!-- CONTENT / PAGES -->
        <div class="app-content">
            <!-- GROUP SWITCHER -->
            <div id="global-group-switcher" style="display:none;">
                <div class="group-switcher">
                    <div class="gs-item active" id="gs-personal" onclick="Dompetra.group.switch(null)">Pribadi</div>
                    <div class="gs-item" id="gs-shared" onclick="Dompetra.nav.go('shared')">Bersama</div>
                </div>
            </div>

            <?php
            include __DIR__ . '/pages/home.php';
            include __DIR__ . '/pages/shared.php';
            include __DIR__ . '/pages/analysis.php';
            include __DIR__ . '/pages/list.php';
            include __DIR__ . '/pages/budget.php';
            include __DIR__ . '/pages/profile.php';
            ?>
        </div>

        <!-- BOTTOM NAV & BULK BAR -->
        <?php include __DIR__ . '/includes/bottom_nav.php'; ?>

        <!-- ALL FLOATING MODALS -->
        <?php include __DIR__ . '/includes/modals/modal_tx.php'; ?>
        <?php include __DIR__ . '/includes/modals/modal_budget.php'; ?>

    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>