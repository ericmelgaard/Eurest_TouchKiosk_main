"use strict";

const ASSET_ID = new URL(self.location.href).searchParams.get("assetId") || "default";
const ASSET_CACHE_PREFIX = "Asset_Cache_";
const ASSET_CACHE_NAME = ASSET_CACHE_PREFIX + ASSET_ID;

function isCacheableRequest(request) {
    // Cache every static asset (image, script, style, font, document, ...).
    // A raw fetch()/XHR data request has an empty destination, so those are
    // left alone and always go to the network.
    //
    // The Cache API only supports http/https URLs, so requests from browser
    // extensions (chrome-extension:, moz-extension:, ...) or other schemes
    // (data:, blob:) must be excluded to avoid "Request scheme is unsupported"
    // errors on cache.put().
    return (
        request.method === "GET" &&
        request.destination !== "" &&
        request.url.startsWith("http")
    );
}

function updateImageCache(cache, request, response) {
    // The Cache API cannot store partial (HTTP 206) responses, and range
    // requests should always go straight to the network.
    if (
        response &&
        response.status !== 206 &&
        (response.ok || response.type === "opaque") &&
        !request.headers.has("range")
    ) {
        cache.put(request, response.clone());
    }
    return response;
}

// Build a proper HTTP 206 partial response from a full (200) response body so
// that media players receiving a Range request get exactly the bytes they
// asked for. This lets us cache the complete file once and still satisfy the
// browser's range requests (required by iOS/Safari for <video>/<audio>).
function buildRangeResponse(fullResponse, rangeHeader) {
    return fullResponse.clone().arrayBuffer().then(function (buffer) {
        const total = buffer.byteLength;
        const match = /^bytes=(\d*)-(\d*)$/.exec((rangeHeader || "").trim());

        let start = 0;
        let end = total - 1;

        if (match) {
            if (match[1] === "" && match[2] !== "") {
                // Suffix range: last N bytes.
                start = Math.max(0, total - parseInt(match[2], 10));
            } else {
                start = match[1] === "" ? 0 : parseInt(match[1], 10);
                end = match[2] === "" ? total - 1 : parseInt(match[2], 10);
            }
        }

        // Clamp to valid bounds.
        if (isNaN(start) || start < 0) { start = 0; }
        if (isNaN(end) || end >= total) { end = total - 1; }

        if (start > end) {
            return new Response(null, {
                status: 416,
                statusText: "Range Not Satisfiable",
                headers: { "Content-Range": "bytes */" + total }
            });
        }

        const slice = buffer.slice(start, end + 1);
        const headers = new Headers(fullResponse.headers);
        headers.set("Content-Range", "bytes " + start + "-" + end + "/" + total);
        headers.set("Content-Length", String(slice.byteLength));
        headers.set("Accept-Ranges", "bytes");

        return new Response(slice, {
            status: 206,
            statusText: "Partial Content",
            headers: headers
        });
    });
}

// Fetch the complete file (stripping any Range header) and cache the 200
// response so the whole asset is available offline.
function fetchFullAndCache(cache, request) {
    const fullRequest = new Request(request.url, {
        method: "GET",
        headers: (function () {
            const h = new Headers(request.headers);
            h.delete("range");
            return h;
        })(),
        mode: request.mode === "navigate" ? "cors" : request.mode,
        credentials: request.credentials,
        redirect: request.redirect
    });

    return fetch(fullRequest).then(function (fullResponse) {
        if (fullResponse && fullResponse.status === 200) {
            cache.put(request.url, fullResponse.clone());
        }
        return fullResponse;
    });
}

// Conditionally revalidate a cached full file using its ETag / Last-Modified.
// On a 304 the cached copy is kept; on a 200 the cache is refreshed with the
// newly-changed file so future range requests serve the updated content.
function revalidateFull(cache, request, cachedFull) {
    const etag = cachedFull.headers.get("ETag");
    const lastModified = cachedFull.headers.get("Last-Modified");

    // Nothing to validate against — can't do a 304 check, so leave cache as-is.
    if (!etag && !lastModified) {
        return Promise.resolve();
    }

    const headers = new Headers(request.headers);
    headers.delete("range");
    if (etag) { headers.set("If-None-Match", etag); }
    if (lastModified) { headers.set("If-Modified-Since", lastModified); }

    const condRequest = new Request(request.url, {
        method: "GET",
        headers: headers,
        mode: request.mode === "navigate" ? "cors" : request.mode,
        credentials: request.credentials,
        redirect: request.redirect,
        cache: "no-cache"
    });

    return fetch(condRequest).then(function (response) {
        if (response && response.status === 200) {
            // File changed on the server: replace the cached full copy.
            return cache.put(request.url, response.clone());
        }
        // 304 (or any non-200): keep the existing cached copy.
        return undefined;
    }).catch(function () {
        // Offline / network error: keep serving the cached copy.
        return undefined;
    });
}

// Handle a Range request: serve a 206 slice from the cached full file, or
// download + cache the full file first, then slice. When served from cache a
// background conditional revalidation refreshes the copy if it changed.
function handleRangeRequest(event, cache, request) {
    const rangeHeader = request.headers.get("range");

    return cache.match(request.url).then(function (cachedFull) {
        if (cachedFull) {
            // Serve instantly from cache, and revalidate in the background so a
            // changed file is re-downloaded (via 304/200) for next time.
            event.waitUntil(revalidateFull(cache, request, cachedFull));
            return buildRangeResponse(cachedFull, rangeHeader);
        }

        return fetchFullAndCache(cache, request).then(function (fullResponse) {
            if (fullResponse && fullResponse.status === 200) {
                return buildRangeResponse(fullResponse, rangeHeader);
            }
            // Server didn't return a full file; fall back to a plain range fetch.
            return fetch(request);
        }).catch(function () {
            return fetch(request);
        });
    });
}

self.addEventListener("install", function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) {
                    return key.indexOf(ASSET_CACHE_PREFIX) === 0 && key !== ASSET_CACHE_NAME;
                }).map(function (key) {
                    return caches.delete(key);
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (event) {
    const request = event.request;

    if (!isCacheableRequest(request)) {
        return;
    }

    event.respondWith(
        caches.open(ASSET_CACHE_NAME).then(function (cache) {
            if (request.headers.has("range")) {
                return handleRangeRequest(event, cache, request);
            }

            return cache.match(request).then(function (cachedResponse) {
                const networkFetch = fetch(request)
                    .then(function (networkResponse) {
                        return updateImageCache(cache, request, networkResponse);
                    })
                    .catch(function () {
                        return cachedResponse;
                    });

                if (cachedResponse) {
                    return cachedResponse;
                }

                return networkFetch;
            });
        })
    );
});
