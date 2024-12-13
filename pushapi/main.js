// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pushapi/sw.js', { scope: '/pushapi/' });
}