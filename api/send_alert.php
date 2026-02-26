<?php
/**
 * SKRIP BACKEND PUSH NOTIFICATION (AUTOMATIC TRIGGER)
 * Menerima request dari frontend saat budget melebihi threshold (e.g. 80%)
 * dan mengirim notifikasi secara targeted berdasarkan User ID.
 */

// Aktifkan response JSON
header('Content-Type: application/json');

// Menerima Payload
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['userId']) || !isset($data['budgetName'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Data tidak valid']);
    exit;
}

$targetUserId = $data['userId'];
$budgetName = $data['budgetName'];
$percentage = $data['percentage'];

// Wajib meload Composer autoload
require_once __DIR__ . '/../vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$file_path = __DIR__ . '/subscriptions.json';

if (!file_exists($file_path)) {
    http_response_code(404);
    echo json_encode(['error' => 'Tidak ada subscriber terdaftar']);
    exit;
}

$subscriptionsData = json_decode(file_get_contents($file_path), true);

// Cari Langganan berdasarkan User ID
$userSubscriptions = array_filter($subscriptionsData, function($sub) use ($targetUserId) {
    return isset($sub['user_id']) && $sub['user_id'] === $targetUserId;
});

if (empty($userSubscriptions)) {
    echo json_encode(['status' => 'skipped', 'message' => 'User belum mengizinkan notifikasi']);
    exit;
}

// KONFIGURASI VAPID KEYS (Sesuai dengan yang Anda generate)
$auth = [
    'VAPID' => [
        'subject' => 'mailto:admin@dompetra.site', 
        'publicKey' => 'BNeDynkwuccyWiVmmeHzmwZ-aQFu59axaurHQbLaA12rVegs0xN9ShXB6zOIBZwq8sZ0LvHigH_-u56ItoOqOV8',
        'privateKey' => 'yXWn1J45Np_HS2VQna13ddoUmYHglIfUYgpn4SzSqo4',
    ],
];

$webPush = new WebPush($auth);

// Menyesuaikan level peringatan (Warning vs Danger)
$alertEmoji = $percentage >= 100 ? '🚨' : '⚠️';
$alertTitle = "{$alertEmoji} Awas Budget {$budgetName}!";
$alertBody = "Pengeluaran untuk {$budgetName} sudah mencapai {$percentage}%. Yuk mulai rem pengeluaranmu!";

if ($percentage >= 100) {
    $alertBody = "Waduh! Pengeluaran {$budgetName} sudah jebol batas ({$percentage}%). Evaluasi kembali pengeluaranmu.";
}

$payload = json_encode([
    'title' => $alertTitle,
    'body' => $alertBody,
    'url' => '/#budget' // Saat diklik, arahkan ke tab budget
]);

$success = 0;

// Kirim notifikasi HANYA ke perangkat milik target User ID ini
foreach ($userSubscriptions as $subData) {
    $subscription = Subscription::create([
        'endpoint' => $subData['endpoint'],
        'keys' => [
            'p256dh' => $subData['p256dh'],
            'auth' => $subData['auth']
        ],
    ]);

    $webPush->queueNotification($subscription, $payload);
}

// Flush eksekusi
foreach ($webPush->flush() as $report) {
    if ($report->isSuccess()) {
        $success++;
    }
}

echo json_encode(['status' => 'success', 'sent_count' => $success]);
?>