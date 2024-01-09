// GEOLOCALIZZAZIONE
window.checkGeolocationPermission = function () {
    return navigator.permissions.query({ name: "geolocation" }).then((result) => {
        return result.state;
    });
}

window.testGeolocation = function () {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(function (position) {
            resolve("granted");
        }, function (error) {
            reject(error.code);
        });

        // Reject the promise after 10 seconds
        setTimeout(() => {
            reject('Overall timeout exceeded');
        }, 10000);
    });
}

window.startWatchingPosition = function (timestamp, maxAccuratezza) {
    return new Promise((resolve, reject) => {
        const id = navigator.geolocation.watchPosition(function (position) {

            newPosition = {
                coords: {
                    latitudine: position.coords.latitude,
                    longitudine: position.coords.longitude,
                    accuratezza: position.coords.accuracy
                },
                timestamp: position.timestamp
            }

            if (position.coords.accuracy <= maxAccuratezza) {
                console.log(newPosition);
                resolve(newPosition);
                navigator.geolocation.clearWatch(id);
            }
        }, function(error){
            reject(error.code);
        }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });

        // Reject the promise after 10 seconds
        setTimeout(() => {
            navigator.geolocation.clearWatch(id);
            reject('Overall timeout exceeded');
        }, 10000);
    });
}

window.saveToLocalStorage = function (key, value) {
    localStorage.setItem(key, value);
}
window.readFromLocalStorage = function (key) {
    return localStorage.getItem(key);
}

window.showModal = function (modalId) {
    var myModal = new bootstrap.Modal(document.getElementById(modalId), {});
    myModal.show();
}