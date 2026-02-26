<?php
require 'vendor/autoload.php';
use Minishlink\WebPush\VAPID;

$keys = VAPID::createVapidKeys();

echo "====================================\n";
echo "VAPID PUBLIC KEY:\n";
echo $keys['publicKey'] . "\n\n";
echo "VAPID PRIVATE KEY:\n";
echo $keys['privateKey'] . "\n";
echo "====================================\n";
echo "Simpan kunci ini baik-baik. Jangan bagikan Private Key!\n";
