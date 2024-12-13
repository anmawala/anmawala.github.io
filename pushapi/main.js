// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pushapi/sw.js', { scope: '/pushapi/' });
}

// Ask for permission to send notifications
Notification.requestPermission(function (status) {
    console.log('Notification permission status:', status);
});