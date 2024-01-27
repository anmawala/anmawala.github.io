var isUpdateAvailable = false;

getIsUpdateAvailable = function () {
    return isUpdateAvailable;
}

forceUpdateServiceWorker = function () {
    if ('serviceWorker' in navigator) {
        reg = navigator.serviceWorker.getRegistration();
        if (reg) {
            reg.update();
        }
    }
}
startAppUpdateFlow = async function () {
    reg = await navigator.serviceWorker.getRegistration();
    var userResponse = confirm("Premi Ok per rendere effettivo l'aggiornamento dell'applicazione. L'applicazione verrà riavviata. Se l'applicazione viene chiusa definitivamente, alla riapertura essa sarà comunque aggiornata.");

    if (userResponse) {
        if (reg.waiting) {
            // let waiting Service Worker know it should became active
            reg.waiting.postMessage('SKIP_WAITING')
        }
    }
    isUpdateAvailable = false;
}

checkGeolocationPermission = function () {
    return navigator.permissions.query({ name: "geolocation" }).then((result) => {
        return result.state;
    });
}

testGeolocation = function () {
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

startWatchingPosition = function (minAccuracy) {
    return new Promise((resolve, reject) => {
        const id = navigator.geolocation.watchPosition(function (position) {

            newPosition = {
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                },
                timestamp: position.timestamp
            }

            if (position.coords.accuracy <= minAccuracy) {
                resolve(newPosition);
                navigator.geolocation.clearWatch(id);
            }
        }, function (error) {
            reject(error.code);
        }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });

        // Reject the promise after 10 seconds
        setTimeout(() => {
            navigator.geolocation.clearWatch(id);
            reject('Overall timeout exceeded');
        }, 10000);
    });
}

saveToLocalStorage = function (key, value) {
    localStorage.setItem(key, value);
}
readFromLocalStorage = function (key) {
    return localStorage.getItem(key);
}

showModal = function (modalId) {
    var myModal = new bootstrap.Modal(document.getElementById(modalId), {});
    myModal.show();
}

checkConnection = async function () {
    try {
        const response = await fetch("https://www.google.com", { mode: 'no-cors' });
        // Se la richiesta non lancia un'eccezione, restituisci true
        return true;
    } catch (error) {
        // Se c'è un errore nella richiesta, restituisci false
        return false;
    }
}

hideElement = function (elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.style.display = "none";
    }
}

showElement = function (elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.style.display = "block";
    }
}

showToast = function (toastId) {
    var toastEl = document.getElementById(toastId);
    if (toastEl) {
        var toast = new bootstrap.Toast(toastEl, { delay: 2000 });
        toast.show();
    }
}


function onupgradeneeded(event) {
    const db = event.target.result;
            const objectStore = db.createObjectStore("Stampings", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("userId", "userId", { unique: false });
            objectStore.createIndex("clockingIn", "clockingIn", { unique: false });
            objectStore.createIndex("clockingOut", "clockingOut", { unique: false });
            objectStore.createIndex("userEnablementId", "userEnablementId", { unique: false });
            objectStore.createIndex("structureId", "structureId", { unique: false });
            objectStore.createIndex("StructureName", "StructureName", { unique: false });
            objectStore.createIndex("enablementId", "enablementId", { unique: false });
            objectStore.createIndex("enablementName", "enablementName", { unique: false });
            objectStore.createIndex("enablementStartTime", "oraInizioPrestazione", { unique: false });
            objectStore.createIndex("enablementEndTime", "enablementEndTime", { unique: false });
        };


clockingIn = function ($p) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("Stampings");

        request.onupgradeneeded = onupgradeneeded;

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["Stampings"], "readwrite");
            const objectStore = transaction.objectStore("Stampings");

            const stamp = {
                userId : $p.userId,
                clockingIn: $p.clockingIn,
                clockingOut: null,
                userEnablementId: $p.userEnablementId,
                structureId: $p.structureId,
                structureName: $p.structureName,
                enablementId: $p.enablementId,
                enablementName: $p.enablementName,
                enablementStartTime: $p.enablementStartTime,
                enablementEndTime: $p.enablementEndTime
            };

            const requestAdd = objectStore.add(stamp);

            requestAdd.onsuccess = function (event) {
                resolve(true);
            };

            requestAdd.onerror = function (event) {
                reject(false);
            };
        };

        request.onerror = function (event) {
            reject(false);
        };
    });
}

getStamps = function (userId, inOnly = false) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("Stampings");

        request.onupgradeneeded = onupgradeneeded;

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["Stampings"], "readonly");
            const objectStore = transaction.objectStore("Stampings");

            const index = objectStore.index("userId");
            const requestGet = index.openCursor(IDBKeyRange.only(userId));
            const results = [];

            requestGet.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const record = cursor.value;
                    if(inOnly) {
                        if (record && record.userId === userId && record.clockingOut === null) {
                            results.push(record);
                        }
                    }else{
                        if (record && record.userId === userId) {
                            results.push(record);
                        }
                    }
                    
                    cursor.continue();
                } else {
                    // Sort the results by ClockingIn from the most recent to the oldest
                    results.sort((a, b) => new Date(b.clockingIn) - new Date(a.clockingIn));
                    resolve(results);
                }
            };

            requestGet.onerror = function (event) {
                reject(false); // Error retrieving records
            }
        };

        request.onerror = function (event) {
            reject(false); // Error opening the database
        };
    });
}

deleteStamp = function (id) {
    const request = indexedDB.open("Stampings");

    request.onupgradeneeded = onupgradeneeded;

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["Stampings"], "readwrite");
        const objectStore = transaction.objectStore("Stampings");

        const requestDelete = objectStore.delete(id);
        requestDelete.onsuccess = function (event) {
            console.log("Record deleted successfully");
        };
        requestDelete.onerror = function (event) {
            console.error("Error deleting record");
        };
    };

    request.onerror = function (event) {
        console.error("Error opening database");
    };
}


clockingOut = function (id, clockingOut) {
    const request = indexedDB.open("Stampings");

    request.onupgradeneeded = onupgradeneeded;

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["Stampings"], "readwrite");
        const objectStore = transaction.objectStore("Stampings");

        const requestGet = objectStore.get(id);
        requestGet.onsuccess = function (event) {
            const record = event.target.result;
            if (record) {
                record.clockingOut = clockingOut;
                const requestUpdate = objectStore.put(record);
                requestUpdate.onsuccess = function (event) {
                    console.log("Record updated successfully");
                };
                requestUpdate.onerror = function (event) {
                    console.error("Error updating record");
                };
            } else {
                console.error("Record not found");
            }
        };
        requestGet.onerror = function (event) {
            console.error("Error retrieving record");
        };
    };

    request.onerror = function (event) {
        console.error("Error opening database");
    };
}

deleteStamp = function (id) {
    const request = indexedDB.open("Stampings");

    request.onupgradeneeded = onupgradeneeded;

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["Stampings"], "readwrite");
        const objectStore = transaction.objectStore("Stampings");

        const requestDelete = objectStore.delete(id);
        requestDelete.onsuccess = function (event) {
            console.log("Record deleted successfully");
        };
        requestDelete.onerror = function (event) {
            console.error("Error deleting record");
        };
    };

    request.onerror = function (event) {
        console.error("Error opening database");
    };
}
