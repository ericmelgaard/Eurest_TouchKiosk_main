"use strict";
//Publisher: Wand Digital
//Reads/writes site configuration (theme, branding, category cards) from Supabase.
//Reads use the publishable key directly against PostgREST; writes are proxied through
//Edge Functions so the service/secret key never reaches this client.
var configService = (function () {
    function restHeaders() {
        return {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": "Bearer " + SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        };
    }

    function restUrl(path) {
        return SUPABASE_URL + "/rest/v1/" + path;
    }

    function functionUrl(name) {
        return SUPABASE_URL + "/functions/v1/" + name;
    }

    function storageUrl(path) {
        return SUPABASE_URL + "/storage/v1/" + path;
    }

    function buildPublicUrl(path) {
        return storageUrl("object/public/kiosk-assets/" + path);
    }

    // Lists previously uploaded files under a folder prefix (e.g. "branding/123/") so the
    // editor can show upload history. Read-only, allowed by the public storage.objects RLS policy.
    function listAssets(prefix) {
        return fetch(storageUrl("object/list/kiosk-assets"), {
            method: "POST",
            headers: restHeaders(),
            body: JSON.stringify({ prefix: prefix, limit: 100, offset: 0, sortBy: { column: "created_at", order: "desc" } })
        })
            .then(function (res) { return res.ok ? res.json() : []; })
            .then(function (rows) { return Array.isArray(rows) ? rows : []; })
            .catch(function (err) {
                console.error("configService: listAssets failed", err);
                return [];
            });
    }

    function fetchSiteConfig(storeKey) {
        if (!storeKey) {
            return Promise.resolve(null);
        }
        var url = restUrl("site_config?store_key=eq." + encodeURIComponent(storeKey) + "&select=*");
        return fetch(url, { headers: restHeaders() })
            .then(function (res) { return res.ok ? res.json() : []; })
            .then(function (rows) { return (Array.isArray(rows) && rows.length) ? rows[0] : null; })
            .catch(function (err) {
                console.error("configService: fetchSiteConfig failed", err);
                return null;
            });
    }

    // includeInactive: the kiosk runtime only wants active cards; the editor needs all of them.
    function fetchCategoryCards(storeKey, includeInactive) {
        if (!storeKey) {
            return Promise.resolve([]);
        }
        var url = restUrl("category_cards?store_key=eq." + encodeURIComponent(storeKey) + "&select=*&order=sort_order.asc");
        if (!includeInactive) {
            url += "&active=eq.true";
        }
        return fetch(url, { headers: restHeaders() })
            .then(function (res) { return res.ok ? res.json() : []; })
            .then(function (rows) { return Array.isArray(rows) ? rows : []; })
            .catch(function (err) {
                console.error("configService: fetchCategoryCards failed", err);
                return [];
            });
    }

    function fetchIconCatalog(conceptKey) {
        if (conceptKey === null || conceptKey === undefined || conceptKey === "") {
            return Promise.resolve([]);
        }
        var url = restUrl("icon_catalog?concept_key=eq." + encodeURIComponent(conceptKey) + "&select=*&order=sort_order.asc");
        return fetch(url, { headers: restHeaders() })
            .then(function (res) { return res.ok ? res.json() : []; })
            .then(function (rows) { return Array.isArray(rows) ? rows : []; })
            .catch(function (err) {
                console.error("configService: fetchIconCatalog failed", err);
                return [];
            });
    }

    function callFunction(name, payload) {
        return fetch(functionUrl(name), {
            method: "POST",
            headers: restHeaders(),
            body: JSON.stringify(payload || {})
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    throw new Error((data && data.error) || (name + " failed with status " + res.status));
                }
                return data;
            });
        });
    }

    function saveSiteConfig(payload) {
        return callFunction("save-site-config", payload);
    }

    function saveCategoryCards(payload) {
        return callFunction("save-category-cards", payload);
    }

    function copyTemplate(payload) {
        return callFunction("copy-template", payload);
    }

    function deleteAsset(payload) {
        return callFunction("delete-asset", payload);
    }

    function uploadAsset(formData) {
        return fetch(functionUrl("upload-asset"), {
            method: "POST",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": "Bearer " + SUPABASE_ANON_KEY
            },
            body: formData
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    throw new Error((data && data.error) || "upload-asset failed with status " + res.status);
                }
                return data;
            });
        });
    }

    return {
        fetchSiteConfig: fetchSiteConfig,
        fetchCategoryCards: fetchCategoryCards,
        fetchIconCatalog: fetchIconCatalog,
        saveSiteConfig: saveSiteConfig,
        saveCategoryCards: saveCategoryCards,
        copyTemplate: copyTemplate,
        uploadAsset: uploadAsset,
        listAssets: listAssets,
        deleteAsset: deleteAsset,
        buildPublicUrl: buildPublicUrl
    };
})();
