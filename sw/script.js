const swStatus = document.getElementById("sw-status");
const swUpdate = document.getElementById("sw-update");

// SERVICE WORKER
const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("sw.js", {
                scope: "/sw/",
            });

            const trackInstalling = (worker) => {
                worker.addEventListener('statechange', () => {
                    switch (worker.state) {
                        case 'installed':
                            swStatus.innerHTML = "Service worker installed";
                            if (navigator.serviceWorker.controller) {
                                // New update found
                                if (confirm("New update available. Do you want to update?")) {
                                    worker.postMessage({ type: "SKIP_WAITING" });
                                } else {
                                    swStatus.innerHTML = "Update postponed";
                                }
                            }
                            break;
                        case 'activating':
                            swStatus.innerHTML = "Service worker activating";
                            break;
                        case 'activated':
                            swStatus.innerHTML = "Service worker activated";
                            break;
                        case 'redundant':
                            swStatus.innerHTML = "Service worker redundant";
                            break;
                    }
                });
            };

            if (registration.installing) {
                const worker = registration.installing;
                swStatus.innerHTML = "Service worker installing";
                console.log("Service worker installing");
                trackInstalling(worker);
            } else if (registration.waiting) {
                const worker = registration.waiting;
                console.log("Service worker installed");
                swStatus.innerHTML = "Service worker installed";
                if (confirm("New update available. Do you want to update?")) {
                    worker.postMessage({ type: "SKIP_WAITING" });
                } else {
                    swStatus.innerHTML = "Update postponed";
                }
                trackInstalling(worker);
            } else if (registration.active) {
                console.log("Service worker active");
                swStatus.innerHTML = "Service worker active";
            }

            registration.addEventListener('updatefound', () => {
                console.log("Service worker update found");
                trackInstalling(registration.installing);
            });

            let refreshing;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (refreshing) return;
                window.location.reload();
                refreshing = true;
            });

        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

registerServiceWorker();