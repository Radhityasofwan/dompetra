<?php
/**
 * CRON JOB: PENGINGAT HARIAN (DAILY REMINDER)
 * Script ini bisa dijalankan oleh Cron Job di cPanel (cth: setiap jam 20:00).
 * Command cPanel: /usr/local/bin/php /home/user/public_html/api/cron_daily.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$file_path = __DIR__ . '/subscriptions.json';
if (!file_exists($file_path)) {
    exit('Tidak ada data langganan.');
}

$subscriptionsData = json_decode(file_get_contents($file_path), true) ?: [];

if (empty($subscriptionsData)) {
    exit('Subscriber kosong.');
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

// Pesan yang akan dikirim secara berantai
$messages = [
    [
        'title' => '📝 Waktunya Catat Keuangan',
        'body' => 'Udah jajan apa aja hari ini?',
        'url' => '/#tx-modal'
    ],
    [
        'title' => '⏳ Jangan Ditunda',
        'body' => 'Segera catat sebelum lupa!',
        'url' => '/#tx-modal'
    ]
];

// Loop setiap pesan untuk membangun chain push
foreach ($messages as $msg) {
    $payload = json_encode([
        'title' => $msg['title'],
        'body' => $msg['body'],
        'url' => $msg['url']
    ]);

    foreach ($subscriptionsData as $subData) {
        $subscription = Subscription::create([
            'endpoint' => $subData['endpoint'],
            'keys' => [
                'p256dh' => $subData['p256dh'],
                'auth' => $subData['auth']
            ],
        ]);
        $webPush->queueNotification($subscription, $payload);
    }

    foreach ($webPush->flush() as $report) {
        if ($report->isSuccess()) {
            $successCount++;
        }
    }

    // Beri jeda 300ms antar notif berantai supaya getaran HP terpisah
    usleep(300000);
}

echo "Cron berhasil dijalankan. Mengirim {$successCount} push notifikasi berantai.";
?>