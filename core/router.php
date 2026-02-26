<?php 
require_once 'config/app.php'; 
include 'includes/header.php'; 
?>

<div id="finance-app-root">
    
    <!-- APP LOADER (Splash Screen) -->
    <div id="app-loader"><div class="loader-spinner"></div></div>

    <!-- TUTORIAL LAYER -->
    <div id="tut-overlay">
        <div class="tut-spotlight" id="tut-spotlight"></div>
        <div class="tut-tooltip" id="tut-tooltip">
            <div class="tut-title" id="tut-title">Judul</div>
            <div class="tut-desc" id="tut-desc">Deskripsi</div>
            <div class="tut-actions">
                <button class="tut-btn skip" onclick="Dompetra.tutorial.skip()">Lewati</button>
                <button class="tut-btn next" onclick="Dompetra.tutorial.next()">Lanjut</button>
            </div>
        </div>
    </div>

    <!-- TOAST -->
    <div class="toast" id="toast">
        <i class="ph-fill ph-check-circle" style="color:#4ADE80; font-size:18px;"></i>
        <span id="toast-msg">Sukses!</span>
    </div>

    <!-- AUTH SCREEN (Modal/View) -->
    <?php include 'includes/modals/modal_auth.php'; ?>

    <!-- MAIN APP FRAME -->
    <div class="app-frame">
        
        <!-- HEADER DYNAMIC (Home) -->
        <div class="header-dynamic" id="main-header">
            <div>
                <div style="font-size:11px; font-weight:700; color:var(--fin-text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px;">Selamat Datang</div>
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
                include 'pages/home.php';
                include 'pages/shared.php';
                include 'pages/analysis.php';
                include 'pages/list.php';
                include 'pages/budget.php';
                include 'pages/profile.php'; // Termasuk Export, Wallets, Categories
            ?>
        </div>

        <!-- BOTTOM NAV & BULK BAR -->
        <?php include 'includes/bottom_nav.php'; ?>

        <!-- ALL FLOATING MODALS -->
        <?php include 'includes/modals/modal_tx.php'; ?>
        <?php include 'includes/modals/modal_budget.php'; ?>
        
    </div>
</div>

<?php include 'includes/footer.php'; ?>