<?php
/**
 * SKRIP EKSEKUTOR PUSH NOTIFICATION
 * Jalankan file ini secara manual via browser (domain.com/api/send_push.php) atau jadikan Cron Job.
 * File ini membaca data dari subscriptions.json lalu mengirimkan notifikasi.
 */

// Wajib meload Composer autoload
require_once __DIR__ . '/../vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$file_path = __DIR__ . '/subscriptions.json';

if (!file_exists($file_path)) {
    die("Tidak ada subscriber yang terdaftar.");
}

$subscriptionsData = json_decode(file_get_contents($file_path), true);

if (empty($subscriptionsData)) {
    die("Daftar subscriber kosong.");
}

// KONFIGURASI VAPID KEYS (DARI TERMINAL ANDA)
$auth = [
    'VAPID' => [
        'subject' => 'mailto:ruangdigitalan@gmail.com', // Wajib diisi email Anda
        'publicKey' => 'BNeDynkwuccyWiVmmeHzmwZ-aQFu59axaurHQbLaA12rVegs0xN9ShXB6zOIBZwq8sZ0LvHigH_-u56ItoOqOV8',
        'privateKey' => 'yXWn1J45Np_HS2VQna13ddoUmYHglIfUYgpn4SzSqo4',
    ],
];

// Inisialisasi WebPush
$webPush = new WebPush($auth);

// Isi Notifikasi (Anda bisa membuatnya dinamis menerima $_POST/$_GET di masa depan)
$payload = json_encode([
    'title' => 'Halo dari Dompetra!',
    'body' => 'Ini adalah uji coba Push Notification (PWA) di iOS & Android.',
    'url' => '/'
]);

$successCount = 0;
$failCount = 0;

// Looping untuk mengirim notifikasi ke setiap HP yang terdaftar
foreach ($subscriptionsData as $subData) {
    // Rekonstruksi format subscription
    $subscription = Subscription::create([
        'endpoint' => $subData['endpoint'],
        'keys' => [
            'p256dh' => $subData['p256dh'],
            'auth' => $subData['auth']
        ],
    ]);

    // Antrikan pengiriman
    $webPush->queueNotification($subscription, $payload);
}

// Eksekusi semua antrian
foreach ($webPush->flush() as $report) {
    $endpoint = $report->getRequest()->getUri()->__toString();

    if ($report->isSuccess()) {
        $successCount++;
        echo "✅ Berhasil dikirim ke {$endpoint}<br>";
    } else {
        $failCount++;
        echo "❌ Gagal dikirim ke {$endpoint}: {$report->getReason()}<br>";
        
        // (Opsional) Jika alasannya "Not Found" atau "Gone", artinya user sudah unsubscribe.
        // Anda harusnya menghapus endpoint ini dari subscriptions.json atau database.
    }
}

echo "<hr>";
echo "<h3>Selesai! Berhasil: {$successCount} | Gagal: {$failCount}</h3>";
?>