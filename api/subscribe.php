<?php
/**
 * Menyimpan data Subscription Push Notification
 * File ini dieksekusi oleh frontend (JS) saat user mengizinkan notifikasi.
 */

// Aktifkan header JSON
header('Content-Type: application/json');

// Menerima data JSON dari Frontend
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validasi struktur JSON minimal
if (!$data || !isset($data['subscription']) || !isset($data['subscription']['endpoint'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Data tidak valid']);
    exit;
}

// Ambil isi objek
$userId = $data['userId'] ?? 'guest';
$sub = $data['subscription'];
$endpoint = $sub['endpoint'];
$p256dh = $sub['keys']['p256dh'] ?? '';
$auth = $sub['keys']['auth'] ?? '';

// --- CARA PENYIMPANAN KE FILE JSON SEDERHANA (HANYA UNTUK SHARED HOSTING TANPA DATABASE) ---
// Note: Di sistem produksi nyata, Anda harus memasukkan ini ke database MySQL/Supabase Anda.
$file_path = __DIR__ . '/subscriptions.json';
$subscriptions = [];

if (file_exists($file_path)) {
    $existing = file_get_contents($file_path);
    $subscriptions = json_decode($existing, true) ?: [];
}

// Format data yang akan disimpan
$new_sub = [
    'user_id' => $userId,
    'endpoint' => $endpoint,
    'p256dh' => $p256dh,
    'auth' => $auth,
    'created_at' => date('Y-m-d H:i:s')
];

// Cek apakah endpoint sudah ada (mencegah duplikat)
$is_duplicate = false;
foreach ($subscriptions as $key => $existing_sub) {
    if ($existing_sub['endpoint'] === $endpoint) {
        $subscriptions[$key] = $new_sub; // Update jika sudah ada
        $is_duplicate = true;
        break;
    }
}

if (!$is_duplicate) {
    $subscriptions[] = $new_sub;
}

// Simpan kembali ke file (atau query UPDATE/INSERT ke DB)
file_put_contents($file_path, json_encode($subscriptions, JSON_PRETTY_PRINT));

echo json_encode(['status' => 'success', 'message' => 'Langganan berhasil disimpan di server']);
?>