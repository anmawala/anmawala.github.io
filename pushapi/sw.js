self.addEventListener('push', function (event) {
    self.ServiceWorkerRegistration.showNotification('Push Notification');
});