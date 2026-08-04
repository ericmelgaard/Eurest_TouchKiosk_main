# Service Worker (Asset Caching)

This project uses a service worker (`sw.js`) to cache static assets (images, video,
audio, scripts, styles, fonts) so the app loads fast and keeps working when the
network is slow or offline.

The worker is registered from `js/init.js` in `registerImageServiceWorker()`.

## Mental Model

- The service worker sits between the app and the network.
- Every static asset request is served from a cache first, then quietly
  refreshed from the network in the background.
- Live data requests (raw `fetch()` / XHR) are never cached — they always go
  straight to the network.

## How It Works

1. On page `load`, `js/init.js` registers the worker with an `assetId` query
   parameter:

   ```javascript
   var swUrl = "./sw.js?assetId=" + encodeURIComponent(assetId);
   navigator.serviceWorker.register(swUrl);
   ```

   The `assetId` comes from `AssetConfiguration.Aid`, then `Asset_ID`, then
   falls back to `"default"`.

2. `sw.js` reads that `assetId` and builds a per-asset cache name:

   ```javascript
   const ASSET_ID = new URL(self.location.href).searchParams.get("assetId") || "default";
   const ASSET_CACHE_NAME = "Asset_Cache_" + ASSET_ID;
   ```

   Each `assetId` gets its own isolated cache bucket. Different assets never
   share cached files.

3. On `activate`, the worker deletes any old `Asset_Cache_*` caches that don't
   match the current `assetId`, then claims all open pages.

4. On every `fetch` for a cacheable request, the worker uses a
   **stale-while-revalidate** strategy:
   - Return the cached copy instantly if one exists.
   - In parallel, fetch a fresh copy from the network and update the cache.
   - If there's no cached copy yet, wait for the network and cache the result.

## What Gets Cached

A request is cached only when both are true:

- `request.method === "GET"`
- `request.destination !== ""` (i.e. it's a real asset: image, script, style,
  font, document, video, audio…)

This means:

| Request type | Cached? |
|---|---|
| Images (`<img>`, CSS backgrounds) | Yes |
| Video / audio (`<video>`, `<audio>`) | Yes (see Range handling) |
| Scripts, styles, fonts | Yes |
| HTML documents | Yes |
| Raw `fetch()` / XHR data calls (empty destination) | No — always network |
| Non-GET requests (POST, etc.) | No — always network |
| Partial `206` responses | Not stored as-is (see below) |

## Video And Audio (Range Requests)

Media players (especially iOS/Safari) request files in byte ranges using a
`Range` header. The Cache API cannot store partial `206` responses, so the
worker handles this specially:

1. It downloads and caches the **complete** file once (a normal `200`
   response), stripping the `Range` header.
2. For each range request, it slices the cached full file and returns a proper
   `206 Partial Content` response with the correct `Content-Range` bytes.
3. When served from cache, it revalidates the file in the background using its
   `ETag` / `Last-Modified` (a conditional `304`/`200` check). If the file
   changed on the server, the cached full copy is refreshed for next time.

This lets a video play offline and still satisfy the browser's range requests.

## What To Expect When An Image Or File Updates

Because of stale-while-revalidate, an updated file usually appears on the
**second** view, not the first:

1. **First load after a change:** the app shows the previously cached (old)
   copy immediately, while the new copy downloads in the background.
2. **Next load / navigation:** the freshly cached (new) copy is served.

So a content update generally takes **one extra refresh** to become visible.
This is by design — it keeps the UI fast and avoids blank/loading states.

For range-based media, the background revalidation uses `ETag` /
`Last-Modified`. If the server doesn't send those headers, the cached media
copy is kept until the cache is cleared or the `assetId` changes.

### Ways To Force The Newest Content Immediately

- **Change the `assetId`** — a new `assetId` uses a brand-new cache, and the
  old cache is deleted on activation.
- **Use a unique file name / cache-busting URL** for the new asset (e.g. a new
  file path or version suffix).
- **Clear the caches** (see below).

## Cache Lifecycle And Cleanup

- Caches are named `Asset_Cache_<assetId>`.
- On `activate`, only caches for other `assetId` values are removed; the
  current one is kept.
- `js/init.js` includes helpers (`clearImageCaches`, `unregisterServiceWorkers`)
  that can wipe all `Asset_Cache_*` caches and unregister workers when needed.

Manual cleanup during development (browser DevTools console):

```javascript
// Delete all asset caches
caches.keys().then(function (keys) {
    keys.filter(function (k) { return k.indexOf("Asset_Cache_") === 0; })
        .forEach(function (k) { caches.delete(k); });
});

// Unregister the worker
navigator.serviceWorker.getRegistrations().then(function (regs) {
    regs.forEach(function (r) { r.unregister(); });
});
```

Or in DevTools: **Application → Service Workers → Unregister**, and
**Application → Cache Storage → delete** the `Asset_Cache_*` entries.

## Requirements And Gotchas

- **Secure context required.** Service workers only run over HTTPS or on
  `localhost`. If the page isn't secure, registration is blocked and
  `js/init.js` logs a warning — the app still works, just without caching.
- **Browser support.** If `serviceWorker` isn't in `navigator`, registration is
  skipped with a console warning.
- **`install` / `activate` behavior.** The worker calls `skipWaiting()` on
  install and `clients.claim()` on activate, so a new worker takes control as
  soon as possible instead of waiting for all tabs to close.
- **Scope.** The worker is registered from `./sw.js`, so its scope is the app
  root and it controls all assets under it.

## Basic Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Updated image/file still shows old version | Stale-while-revalidate served the cached copy | Refresh once more, or change `assetId` / clear caches |
| No caching at all | Not a secure context (HTTP) or unsupported browser | Serve over HTTPS/localhost; check console warnings |
| Video won't play offline | Full file never fully downloaded/cached yet | Play once fully while online to populate the cache |
| Old content persists after `assetId` change | Page still controlled by previous worker | Reload the page so the new worker activates |
| Registration failed in console | Wrong path/scope or blocked context | Confirm `./sw.js` path and HTTPS/localhost |

## Quick Reference

- Worker file: `sw.js`
- Registration: `js/init.js` → `registerImageServiceWorker()`
- Cache name pattern: `Asset_Cache_<assetId>`
- Strategy: stale-while-revalidate (assets), full-file cache + `206` slicing (media)
- Data requests: never cached
