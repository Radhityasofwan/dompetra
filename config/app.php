<?php
// Pengaturan Global Aplikasi
define('APP_NAME', 'Dompetra - Keuangan & Budget');

// Deteksi BASE URL secara dinamis (Mencegah error load aset CSS/JS)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$domainName = $_SERVER['HTTP_HOST'];
$path = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$path = $path === '/' ? '' : $path;
define('BASE_URL', $protocol . $domainName . $path);

// Supabase Configuration
define('SUPABASE_URL', 'https://yoggysltmosuiinowprz.supabase.co');
define('SUPABASE_KEY', 'sb_publishable_5TiJSRjZTdb77zQlf66vhw_qrRt0_dn');