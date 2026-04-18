"use strict";

const IMAGE_CACHE_NAME = "wand-asset-cache";

function isImageRequest(request) {
    return request.method === "GET" && request.destination === "image";
}

self.addEventListener("install", function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) {
                    return key.indexOf(IMAGE_CACHE_NAME) === 0 && key !== IMAGE_CACHE_NAME;
                }).map(function (key) {
                    return caches.delete(key);
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

//stale with refresh strategy for images - serve from cache immediately.
//let browser handle the request and update the cache in the background for next time.
//this most effient and quickly updates the cache without blocking the user with a network request.
self.addEventListener("fetch", event => {
    const request = event.request;

    if (!isImageRequest(request)) return;

    event.respondWith(
        caches.open(IMAGE_CACHE_NAME).then(cache => {
            return cache.match(request).then(cachedResponse => {
                const networkFetch = fetch(request)
                    .then(networkResponse => {
                        // Only cache valid responses
                        if (networkResponse && networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse || networkFetch;
            });
        })
    );
});
