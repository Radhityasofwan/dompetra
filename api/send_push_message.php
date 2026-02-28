<?php
/**
 * GENERIC MULTI-MESSAGE PUSH NOTIFICATION API
 * Menerima request JSON berupa daftar User ID dan Array Pesan.
 * Mengirim pesan secara berturut-turut untuk meminimalisir teks potong.
 */

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || empty($data['targetUserIds']) || empty($data['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Data tidak komplit']);
    exit;
}

$targetUserIds = is_array($data['targetUserIds']) ? $data['targetUserIds'] : [$data['targetUserIds']];
$messages = $data['messages'];

require_once __DIR__ . '/../vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$file_path = __DIR__ . '/subscriptions.json';
if (!file_exists($file_path)) {
    echo json_encode(['status' => 'skipped', 'message' => 'No subs']);
    exit;
}

$subscriptionsData = json_decode(file_get_contents($file_path), true) ?: [];

// Filter subs matching target User IDs
$validSubs = array_filter($subscriptionsData, function ($sub) use ($targetUserIds) {
    return isset($sub['user_id']) && in_array($sub['user_id'], $targetUserIds);
});

if (empty($validSubs)) {
    echo json_encode(['status' => 'skipped', 'message' => 'Target offline/not subscribed']);
    exit;
}

$auth = [
    'VAPID' => [
        'subject' => 'mailto:admin@dompetra.site',
        'publicKey' => 'BNeDynkwuccyWiVmmeHzmwZ-aQFu59axaurHQbLaA12rVegs0xN9ShXB6zOIBZwq8sZ0LvHigH_-u56ItoOqOV8',
        'privateKey' => 'yXWn1J45Np_HS2VQna13ddoUmYHglIfUYgpn4SzSqo4',
    ],
];

$webPush = new WebPush($auth);
$successCount = 0;

// Loop setiap pesan untuk dikirim bertahap
foreach ($messages as $msg) {
    $payload = json_encode([
        'title' => $msg['title'] ?? 'Dompetra',
        'body' => $msg['body'] ?? '',
        'url' => $msg['url'] ?? '/'
    ]);

    foreach ($validSubs as $subData) {
        $subscription = Subscription::create([
            'endpoint' => $subData['endpoint'],
            'keys' => [
                'p256dh' => $subData['p256dh'],
                'auth' => $subData['auth']
            ],
        ]);
        $webPush->queueNotification($subscription, $payload);
    }

    // Flush batch pesan ini agar terkirim sekarang juga sebelum lanjut pesan ke-2
    foreach ($webPush->flush() as $report) {
        if ($report->isSuccess()) {
            $successCount++;
        }
    }

    // Memberikan jeda sangat sedikit agar HP bergetar 2x terpisah dengan rapi
    usleep(300000); // 300ms
}

echo json_encode(['status' => 'success', 'sent_count' => $successCount]);
?>