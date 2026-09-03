"use strict";
//Publisher: Wand Digital
//CCGS-gated config editor for app_shell_CDL. Only renders inside the authenticated
//WAND Content Forecaster preview (mirrors the isCF gating already used elsewhere in this app).
//Edits are scoped to MostRecentCCGS.storeKey and always saved through Edge Functions
//(never a direct table write) - see supabase/functions/.
var configEditor = (function () {
    var state = {
        ccgs: null,
        locations: [],
        siteConfig: null,
        workingTheme: {},
        workingBehavior: {},
        cards: [],
        expandedCards: {},
        iconCatalog: [],
        panelOpen: false,
        activeTab: "home",
        $root: null,
        useSeparateWindow: false,
        editorWindow: null,
        previewPanel: null,
        previewPanelOriginalWidth: null
    };

    var TABS = [
        { id: "home", label: "Home" },
        { id: "timeout", label: "Timeout" },
        { id: "idle", label: "Idle" },
        { id: "share", label: "Share" }
    ];

    // Per-card overrides, editable in each card's expanded accordion body.
    var CARD_COLOR_FIELDS = [
        { key: "cardBackground", label: "Card" },
        { key: "cardHoverBackground", label: "Hover" },
        { key: "cardActiveBackground", label: "Active" },
        { key: "labelColor", label: "Label bar" },
        { key: "iconBorderColor", label: "Icon border" }
    ];

    // Timeout-modal colors, shown live on the canvas while the Timeout tab is open.
    var TIMEOUT_COLOR_FIELDS = [
        { key: "inactivityOverlayBg", label: "Overlay backdrop" },
        { key: "inactivityBackground", label: "Modal background" },
        { key: "inactivityHeading", label: "Heading text" },
        { key: "inactivityText", label: "Message text" },
        { key: "inactivityPrimaryButtonBg", label: "Button" },
        { key: "inactivityPrimaryButtonHoverBg", label: "Button hover" }
    ];

    function numberOrNull(value) {
        var num = Number(value);
        return (value === null || value === undefined || value === "" || isNaN(num)) ? null : num;
    }

    function readLocalStorageJSON(key) {
        try {
            var raw = window.localStorage.getItem(key);
            if (raw === null) {
                for (var i = 0; i < window.localStorage.length; i++) {
                    var storedKey = window.localStorage.key(i);
                    if (storedKey && storedKey.toLowerCase() === key.toLowerCase()) {
                        raw = window.localStorage.getItem(storedKey);
                        break;
                    }
                }
            }
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error("configEditor: failed to read localStorage key", key, err);
            return null;
        }
    }

    function normalizeCCGS(raw) {
        if (!raw) {
            return null;
        }
        return {
            conceptKey: numberOrNull(raw.conceptKey),
            companyKey: numberOrNull(raw.companyKey),
            groupKey: numberOrNull(raw.groupKey),
            storeKey: numberOrNull(raw.storeKey),
            conceptName: raw.conceptName || null,
            companyName: raw.companyName || null,
            groupName: raw.groupName || null,
            storeName: raw.storeName || raw.ccgsName || null
        };
    }

    // Shape of ccgsItems isn't defined anywhere in this codebase (populated by the
    // trm.wandcorp.com host page) - tolerate anything CCGS-shaped, ignore the rest.
    function readAccessibleLocations() {
        var raw = readLocalStorageJSON("ccgsItems");
        if (!Array.isArray(raw)) {
            return [];
        }
        return raw
            .map(normalizeCCGS)
            .filter(function (item) { return item && item.storeKey !== null; });
    }

    function isLocalDevContext() {
        var host = (window.location.hostname || "").toLowerCase();
        var isLocalHost = host === "" || host === "localhost" || host === "127.0.0.1" || host.indexOf(".local") > -1;
        var forced = /(?:^|[?&])configEditor=local(?:&|$)/.test(window.location.search || "");
        return isLocalHost || forced;
    }

    function getQueryParam(name) {
        try {
            return new URLSearchParams(window.location.search || "").get(name);
        } catch (err) {
            return null;
        }
    }

    // Synthetic CCGS for local testing (no trm.wandcorp.com host page to provide the real one).
    // Override the test store with ?configStoreKey=NNN.
    function buildLocalTestCCGS() {
        var storeKeyParam = getQueryParam("configStoreKey") || "9999999";
        return {
            conceptKey: 0,
            companyKey: 0,
            groupKey: null,
            storeKey: numberOrNull(storeKeyParam),
            conceptName: "Local Test Concept",
            companyName: "Local Test Company",
            groupName: null,
            storeName: "Local Test Store (" + storeKeyParam + ")"
        };
    }

    function isEditingContext() {
        return !!window.isCF || isLocalDevContext();
    }

    // Reaches the top-level CF page's document when same-origin (mirrors
    // generic_touchscreen-main/hotspot_controller.js) so the panel can render beside the
    // canvas instead of covering it. Falls back to this document if top isn't reachable.
    function getModalDocument() {
        try {
            if (self.top && self.top !== self && self.top.document) {
                return self.top.document;
            }
            if (!state._loggedTopAccess) {
                state._loggedTopAccess = true;
                console.info("configEditor: not inside a cross-document iframe (self.top === self); panel renders in this document.");
            }
        } catch (err) {
            if (!state._loggedTopAccess) {
                state._loggedTopAccess = true;
                console.warn("configEditor: self.top.document is not reachable (cross-origin) - panel renders in this document instead of the CF host page.", err);
            }
            return document;
        }
        return document;
    }

    function getDirectChildByClass(parent, className) {
        if (!parent) {
            return null;
        }
        for (var i = 0; i < parent.children.length; i++) {
            if (parent.children[i].classList.contains(className)) {
                return parent.children[i];
            }
        }
        return null;
    }

    // Widens the CF preview panel (same DOM structure hotspot_controller.js targets) so our
    // panel sits in the extra space beside the asset preview rather than on top of it.
    function getModalHost() {
        var hostDocument = getModalDocument();
        try {
            var previewRoot = hostDocument.getElementById("MainContentPane_Content_pnlPreview");
            var previewPanel = getDirectChildByClass(previewRoot, "preview-container-preview-panel");

            if (previewPanel) {
                var previewContainer = getDirectChildByClass(previewPanel, "preview-container");
                if (previewContainer) {
                    previewContainer.classList.add("config-editor-authoring-host");
                    if (state.previewPanel !== previewPanel) {
                        state.previewPanel = previewPanel;
                        state.previewPanelOriginalWidth = previewPanel.style.width;
                        console.info("configEditor: found CF preview panel structure; mounting beside the canvas.");
                    }
                    if (state.previewPanelOriginalWidth !== null && !previewPanel.classList.contains("config-editor-authoring-expanded")) {
                        var panelWidth = parseFloat(hostDocument.defaultView.getComputedStyle(previewPanel).width) || 432;
                        previewPanel.style.width = (panelWidth + 520) + "px";
                        previewPanel.classList.add("config-editor-authoring-expanded");
                    }
                    return previewContainer;
                }
            }

            if (!state._loggedFallbackHost) {
                state._loggedFallbackHost = true;
                console.warn("configEditor: CF preview panel structure not found (#MainContentPane_Content_pnlPreview/.preview-container-preview-panel/.preview-container) - falling back to " + (previewRoot ? "#MainContentPane_Content_pnlPreview" : "document.body") + ". The panel will still render but won't be positioned beside the canvas.");
            }
            return previewRoot || hostDocument.body;
        } catch (err) {
            return hostDocument.body;
        }
    }

    function restorePreviewPanelWidth() {
        if (!state.previewPanel || !state.previewPanel.classList.contains("config-editor-authoring-expanded")) {
            return;
        }
        state.previewPanel.style.width = state.previewPanelOriginalWidth || "";
        state.previewPanel.classList.remove("config-editor-authoring-expanded");
    }

    // Always (re)writes the CSS text rather than skipping when the tag already exists -
    // window.open("", "sameName") reuses an existing popup without clearing it, so a
    // "skip if present" guard here would freeze the popup on whatever CSS it had at
    // first open, ignoring any later code changes.
    function ensureModalStyles(host) {
        var styles = host.getElementById("config-editor-authoring-styles");
        var isNew = !styles;
        if (isNew) {
            styles = host.createElement("style");
            styles.id = "config-editor-authoring-styles";
        }
        // Every rule below is scoped under #config-editor-root (ID specificity) with
        // !important, so it wins over whatever generic button/select/input styling the
        // host CF page already has. See buildPanel()/renderTabs() for an inline-style
        // fallback in case this whole <style> tag gets blocked by the host page's CSP.
        styles.textContent = [
            ".config-editor-authoring-host{display:flex!important;justify-content:space-around!important;align-items:flex-start!important;gap:16px!important;overflow:visible!important}",
            "#config-editor-root{z-index:2147483000!important;width:520px!important;flex:0 0 520px!important;max-height:100%!important;overflow-y:auto!important;background:#fff!important;border:1px solid #d5dee2!important;border-radius:10px!important;box-shadow:0 18px 48px rgba(9,35,44,.18)!important;font:14px/1.4 'Segoe UI',system-ui,-apple-system,sans-serif!important;color:#17313b!important;box-sizing:border-box!important}",
            "#config-editor-root *{box-sizing:border-box!important;font-family:inherit!important}",
            "#config-editor-root[hidden]{display:none!important}",
            "#config-editor-root .config-editor-header{position:sticky!important;top:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:12px 16px!important;background:#242d37!important;color:#fff!important;font-size:16px!important;font-weight:600!important;z-index:2!important}",
            "#config-editor-root .config-editor-status{font-size:12px!important;color:#8fd8f8!important}",
            "#config-editor-root .config-editor-status.is-error{color:#ff8080!important}",
            "#config-editor-root .config-editor-close{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:30px!important;height:30px!important;background:none!important;border:none!important;border-radius:6px!important;color:#fff!important;font-size:22px!important;line-height:1!important}",
            "#config-editor-root .config-editor-close:hover{background:rgba(255,255,255,.15)!important}",
            "#config-editor-root .config-editor-tabs{position:sticky!important;top:47px!important;display:flex!important;background:#eef2f4!important;border-bottom:1px solid #d5dee2!important;z-index:1!important}",
            "#config-editor-root .config-editor-tabs button{flex:1!important;min-height:auto!important;padding:10px 6px!important;font-size:13px!important;font-weight:600!important;color:#54666d!important;background:none!important;border:none!important;border-radius:0!important;border-bottom:3px solid transparent!important}",
            "#config-editor-root .config-editor-tabs button:hover{background:#e3ebef!important}",
            "#config-editor-root .config-editor-tabs button.is-active{color:#17313b!important;border-bottom-color:#3586bd!important;background:#fff!important}",
            "#config-editor-root .config-editor-body{padding:16px!important}",
            "#config-editor-root .config-editor-section{margin-bottom:22px!important;padding-bottom:18px!important;border-bottom:1px solid #eef2f4!important}",
            "#config-editor-root .config-editor-section:last-child{border-bottom:none!important}",
            "#config-editor-root .config-editor-section h3{margin:0 0 12px 0!important;font-size:13px!important;font-weight:700!important;color:#54666d!important;text-transform:uppercase!important;letter-spacing:.04em!important}",
            "#config-editor-root .config-editor-hint{font-size:12px!important;color:#7a8b90!important;margin:4px 0 10px 0!important}",
            // Base input/select treatment - mirrors hotspot_controller.js's authoring modal look.
            "#config-editor-root input,#config-editor-root select{min-height:34px!important;padding:6px 9px!important;color:#17313b!important;background:#fff!important;border:1px solid #c5d0d4!important;border-radius:6px!important;font-size:13px!important}",
            "#config-editor-root input:focus,#config-editor-root select:focus{outline:2px solid #3586bd!important;outline-offset:0!important;border-color:#3586bd!important}",
            "#config-editor-root input[type='checkbox']{min-height:auto!important;width:auto!important;padding:0!important}",
            "#config-editor-root input[type='file']{min-height:auto!important;border:none!important;padding:2px 0!important;background:none!important;font-size:12px!important}",
            "#config-editor-root input[type='color']{min-height:28px!important;padding:2px!important}",
            "#config-editor-root input[type='number']{width:80px!important}",
            // Base button treatment (ghost) + primary/danger/icon variants.
            "#config-editor-root button{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;min-height:34px!important;padding:0 14px!important;font-size:13px!important;font-weight:600!important;color:#2c5a72!important;background:#e6eef3!important;border:1px solid transparent!important;border-radius:7px!important;cursor:pointer!important}",
            "#config-editor-root button:hover{background:#d6e3ec!important}",
            "#config-editor-root button:disabled{color:#9fb2bc!important;background:#eef2f4!important;cursor:default!important}",
            "#config-editor-root .config-editor-btn-primary{color:#fff!important;background:#3586bd!important}",
            "#config-editor-root .config-editor-btn-primary:hover{background:#2c72a3!important}",
            "#config-editor-root .config-editor-btn-icon{min-height:30px!important;width:30px!important;padding:0!important;color:#5f7078!important;background:transparent!important}",
            "#config-editor-root .config-editor-btn-icon:hover{background:#eef2f4!important;color:#243c45!important}",
            "#config-editor-root .config-editor-remove,#config-editor-root .config-editor-btn-danger{color:#fff!important;background:#c0453f!important}",
            "#config-editor-root .config-editor-remove:hover,#config-editor-root .config-editor-btn-danger:hover{background:#a83a35!important}",
            "#config-editor-root .config-editor-color-label{font-size:12px!important;font-weight:600!important;color:#54666d!important;text-transform:uppercase!important;letter-spacing:.03em!important}",
            // Compact color field: small checkerboard swatch (shows through when transparent) + popover.
            "#config-editor-root .cfg-inline-row{display:flex!important;align-items:center!important;gap:16px!important;flex-wrap:wrap!important;margin-bottom:10px!important}",
            "#config-editor-root .cfg-color-field{display:inline-flex!important;align-items:center!important;gap:6px!important;position:relative!important}",
            "#config-editor-root .cfg-color-field-label{font-size:12px!important;color:#54666d!important;white-space:nowrap!important}",
            "#config-editor-root .cfg-swatch-btn{position:relative!important;width:24px!important;height:24px!important;min-height:24px!important;padding:0!important;border:1px solid #c5d0d4!important;border-radius:6px!important;overflow:hidden!important;background-image:repeating-conic-gradient(#e1e8ea 0% 25%,#fff 0% 50%)!important;background-size:8px 8px!important}",
            "#config-editor-root .cfg-swatch-inner{position:absolute!important;inset:0!important}",
            "#config-editor-root .cfg-color-popover{display:none!important;position:absolute!important;top:calc(100% + 4px)!important;left:0!important;z-index:10!important;flex-direction:column!important;gap:6px!important;padding:10px!important;background:#fff!important;border:1px solid #d5dee2!important;border-radius:8px!important;box-shadow:0 8px 24px rgba(9,35,44,.18)!important;min-width:170px!important}",
            "#config-editor-root .cfg-color-popover.is-open{display:flex!important}",
            "#config-editor-root .cfg-color-popover input[type='color']{width:100%!important}",
            "#config-editor-root .cfg-numeric-row{display:flex!important;align-items:center!important;gap:8px!important;margin-bottom:10px!important;flex-wrap:wrap!important}",
            "#config-editor-root .cfg-numeric-row select{flex:1!important;min-width:140px!important}",
            "#config-editor-root .cfg-numeric-label{font-size:12px!important;font-weight:600!important;color:#54666d!important;text-transform:uppercase!important;letter-spacing:.03em!important;min-width:140px!important}",
            "#config-editor-root .config-editor-branding-block{margin-bottom:18px!important}",
            "#config-editor-root .config-editor-branding-block h4{margin:0 0 8px 0!important;font-size:13px!important;font-weight:700!important;color:#54666d!important;text-transform:uppercase!important;letter-spacing:.03em!important}",
            "#config-editor-root .config-editor-branding-row{display:flex!important;align-items:center!important;gap:10px!important;margin-bottom:8px!important;flex-wrap:wrap!important}",
            "#config-editor-root .config-editor-branding-preview{width:64px!important;height:64px!important;object-fit:cover!important;background:#f5f8f9!important;border:1px solid #e1e8ea!important;border-radius:8px!important}",
            "#config-editor-root .config-editor-history-grid{display:flex!important;flex-wrap:wrap!important;gap:8px!important;padding:8px!important;background:#f5f8f9!important;border:1px dashed #cdd8db!important;border-radius:8px!important;min-height:40px!important}",
            "#config-editor-root .config-editor-history-item{display:flex!important;flex-direction:column!important;align-items:center!important;gap:4px!important;width:76px!important}",
            "#config-editor-root .config-editor-history-item img{width:64px!important;height:64px!important;object-fit:cover!important;border:1px solid #e1e8ea!important;border-radius:6px!important;background:#fff!important}",
            "#config-editor-root .config-editor-history-item button{min-height:auto!important;font-size:10px!important;padding:3px 5px!important;width:100%!important}",
            "#config-editor-root .config-editor-card{border:1px solid #e1e8ea!important;border-radius:8px!important;padding:10px 12px!important;margin-bottom:10px!important;background:#f5f8f9!important}",
            "#config-editor-root .config-editor-card:hover{border-color:#3586bd!important}",
            "#config-editor-root .config-editor-card-row-top{display:flex!important;align-items:center!important;gap:6px!important;flex-wrap:wrap!important}",
            // Boolean pill switch (Active toggle, etc.) - checkbox is visually hidden, track/thumb drawn via siblings.
            "#config-editor-root .cfg-switch{display:inline-flex!important;align-items:center!important;gap:8px!important;cursor:pointer!important;-webkit-user-select:none!important;user-select:none!important}",
            "#config-editor-root .cfg-switch input{position:absolute!important;opacity:0!important;width:1px!important;height:1px!important;min-height:1px!important;padding:0!important}",
            "#config-editor-root .cfg-switch-track{position:relative!important;display:inline-block!important;width:36px!important;height:20px!important;min-width:36px!important;border-radius:10px!important;background:#c5d0d4!important;transition:background-color .15s ease!important}",
            "#config-editor-root .cfg-switch-thumb{position:absolute!important;top:2px!important;left:2px!important;width:16px!important;height:16px!important;border-radius:50%!important;background:#fff!important;box-shadow:0 1px 2px rgba(0,0,0,.3)!important;transition:transform .15s ease!important}",
            "#config-editor-root .cfg-switch input:checked ~ .cfg-switch-track{background:#3586bd!important}",
            "#config-editor-root .cfg-switch input:checked ~ .cfg-switch-track .cfg-switch-thumb{transform:translateX(16px)!important}",
            "#config-editor-root .cfg-switch-label{font-size:12px!important;font-weight:600!important;color:#54666d!important;white-space:nowrap!important}",
            // Primary card fields - name is the most basic thing to edit, so it gets a prominent input.
            "#config-editor-root .cfg-card-name-input{width:100%!important;font-size:15px!important;font-weight:700!important;margin:10px 0!important}",
            "#config-editor-root .cfg-page-row{display:flex!important;flex-direction:column!important;gap:6px!important;margin-bottom:4px!important}",
            "#config-editor-root .cfg-page-row-controls{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}",
            "#config-editor-root .cfg-advanced-heading{font-size:11px!important;font-weight:700!important;color:#8a9aa0!important;text-transform:uppercase!important;letter-spacing:.05em!important;margin:0!important}",
            "#config-editor-root .cfg-card-body{margin-top:10px!important;padding-top:10px!important;border-top:1px solid #e1e8ea!important;display:flex!important;flex-direction:column!important;gap:10px!important}",
            "#config-editor-root .cfg-card-colors{display:flex!important;flex-wrap:wrap!important;gap:14px!important}",
            "#config-editor-root .config-editor-dest-control-wrap select,#config-editor-root .config-editor-dest-control-wrap input{font-size:12px!important}",
            "#config-editor-root .config-editor-card-row-bottom{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important}",
            "#config-editor-root .config-editor-icon-picker{display:none!important;flex-wrap:wrap!important;gap:6px!important;width:100%!important;padding:8px!important;margin-top:6px!important;background:#fff!important;border:1px solid #e1e8ea!important;border-radius:8px!important}",
            "#config-editor-root .config-editor-icon-picker.is-open{display:flex!important}",
            "#config-editor-root .config-editor-icon-thumb{width:36px!important;height:36px!important;object-fit:contain!important;cursor:pointer!important;border:1px solid #e1e8ea!important;border-radius:6px!important}",
            // Live visual template - mirrors the real .feature-card/.card-icon/.card-label markup
            // (scaled down) so clicking/hovering/pressing it previews exactly what the kiosk shows.
            "#config-editor-root .cfg-card-template{position:relative!important;display:flex!important;align-items:center!important;padding:6px!important;border-radius:10px!important;overflow:hidden!important;cursor:pointer!important;background-color:var(--feature-card-bg,#3a4750)!important;transition:background-color .15s ease!important;margin:2px 0 10px 0!important;min-height:64px!important;border:1px solid rgba(0,0,0,.08)!important}",
            "#config-editor-root .cfg-card-template:hover{background-color:var(--feature-card-hover-bg,#8B9AA4)!important}",
            "#config-editor-root .cfg-card-template:active{background-color:var(--feature-card-active-bg,#6B7A84)!important}",
            "#config-editor-root .cfg-card-template-icon{width:48px!important;height:48px!important;min-width:48px!important;border-radius:50%!important;background:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:8px -8px 8px 10px!important;z-index:1!important;cursor:pointer!important}",
            "#config-editor-root .cfg-card-template-icon img{width:32px!important;height:32px!important;object-fit:contain!important;border-radius:100px!important;outline:solid 5px var(--card-icon-outline-color,#242d37)!important;outline-offset:-5px!important}",
            "#config-editor-root .cfg-card-template-label{flex:1!important;border-radius:8px!important;background-color:var(--card-label-bg,#7a746e)!important;color:#fff!important;font-weight:700!important;font-size:12px!important;text-transform:uppercase!important;letter-spacing:.3px!important;text-align:center!important;padding:14px 14px 14px 26px!important;cursor:pointer!important}",
            "#config-editor-root .cfg-idle-list{margin:0 0 10px 0!important;padding-left:18px!important;font-size:13px!important;color:#333!important}",
            "#config-editor-root .cfg-idle-list li{margin-bottom:4px!important}",
            "#config-editor-toggle{position:fixed!important;top:20px!important;left:20px!important;z-index:20000!important;padding:12px 20px!important;font-size:16px!important;font-weight:600!important;background:#242d37!important;color:#fff!important;border:none!important;border-radius:8px!important;cursor:pointer!important;font-family:'Segoe UI',system-ui,-apple-system,sans-serif!important}",
            "#config-editor-toggle:hover{background:#1a212a!important}"
        ].join("");
        if (isNew) {
            (host.head || host.body).appendChild(styles);
        }

        // If the host page's CSP blocks injected <style> elements, styles.sheet stays null/empty
        // and the panel falls back to the inline styles set directly on elements below.
        setTimeout(function () {
            var ruleCount = styles.sheet && styles.sheet.cssRules ? styles.sheet.cssRules.length : 0;
            if (!ruleCount) {
                console.warn("configEditor: injected stylesheet has no effect (likely blocked by the host page's CSP). Falling back to inline styles only - check the browser console/network tab for CSP violation errors.");
            } else {
                console.info("configEditor: injected stylesheet active (" + ruleCount + " rules).");
            }
        }, 0);
    }

    function buildFormData(fields) {
        var form = new FormData();
        Object.keys(fields).forEach(function (key) {
            if (fields[key] !== undefined && fields[key] !== null) {
                form.append(key, fields[key]);
            }
        });
        return form;
    }

    function showStatus($container, message, isError) {
        var $status = $container.find(".config-editor-status");
        $status.text(message || "").toggleClass("is-error", !!isError);
        if (message) {
            setTimeout(function () { $status.text(""); }, 4000);
        }
    }

    // Best-effort conversion to a 6-digit hex for the <input type="color"> swatch only;
    // the paired text field always holds the real (possibly rgba/transparent) value.
    function toHexColor(value) {
        if (!value) {
            return "#000000";
        }
        var probe = document.createElement("span");
        probe.style.color = "";
        probe.style.color = value;
        if (!probe.style.color) {
            return "#000000";
        }
        document.body.appendChild(probe);
        var computed = getComputedStyle(probe).color;
        document.body.removeChild(probe);
        var match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) {
            return "#000000";
        }
        var toHex = function (n) { return ("0" + parseInt(n, 10).toString(16)).slice(-2); };
        return "#" + toHex(match[1]) + toHex(match[2]) + toHex(match[3]);
    }

    function isTransparentValue(value) {
        var v = String(value || "").trim().toLowerCase();
        return v === "" || v === "transparent";
    }

    // Compact color control: small swatch button (checkerboard shows through when transparent)
    // that opens a tiny popover with a native picker, a paste-able text field, and a
    // dedicated "Transparent" option (native <input type="color"> can't represent that).
    function renderColorField(label, getValue, setValue, opts) {
        opts = opts || {};
        var $field = $('<div class="cfg-color-field"></div>');
        var $swatchBtn = $('<button type="button" class="cfg-swatch-btn"></button>').attr("title", label);
        var $swatchInner = $('<span class="cfg-swatch-inner"></span>');
        $swatchBtn.append($swatchInner);
        var $label = $('<span class="cfg-color-field-label"></span>').text(label);

        var $popover = $('<div class="cfg-color-popover"></div>');
        var $colorInput = $('<input type="color" />');
        var $textInput = $('<input type="text" placeholder="#hex, rgba(), transparent" />');
        var $transparentBtn = $('<button type="button">Transparent</button>');

        function refresh() {
            var v = getValue() || "";
            $swatchInner.css("background-color", isTransparentValue(v) ? "transparent" : v);
            $textInput.val(v);
            $colorInput.val(toHexColor(v));
        }
        refresh();

        function commit(v) {
            setValue(v);
            refresh();
            if (opts.onChange) {
                opts.onChange(v);
            }
        }

        $colorInput.on("input", function () { commit($(this).val()); });
        $textInput.on("input", function () { commit($(this).val()); });
        $transparentBtn.on("click", function () { commit("transparent"); $popover.removeClass("is-open"); });

        $popover.append($colorInput, $textInput, $transparentBtn);
        $popover.on("click", function (e) { e.stopPropagation(); });

        $swatchBtn.on("click", function (e) {
            e.stopPropagation();
            var wasOpen = $popover.hasClass("is-open");
            $field.closest("#config-editor-root").find(".cfg-color-popover").removeClass("is-open");
            $popover.toggleClass("is-open", !wasOpen);
        });

        $field.append($swatchBtn, $label, $popover);
        return $field;
    }

    function renderSecondsField(label, getMs, setMs, opts) {
        opts = opts || {};
        var $row = $('<div class="cfg-numeric-row"></div>');
        $row.append($('<span class="cfg-numeric-label"></span>').text(label));
        var currentMs = getMs();
        var $input = $('<input type="number" step="1" />').attr("min", opts.min || 1).attr("max", opts.max || 600);
        $input.val(Math.round((currentMs || opts.defaultMs || 0) / 1000));
        $input.on("input", function () {
            var seconds = parseFloat($(this).val());
            if (!isNaN(seconds) && seconds > 0) {
                setMs(Math.round(seconds * 1000));
            }
        });
        $row.append($input);
        $row.append($('<span class="config-editor-hint"></span>').text("seconds"));
        return $row;
    }

    function renderSelectField(label, getValue, setValue, options) {
        var $row = $('<div class="cfg-numeric-row"></div>');
        $row.append($('<span class="cfg-numeric-label"></span>').text(label));
        var $select = $('<select></select>');
        options.forEach(function (opt) {
            $select.append($('<option></option>').attr("value", opt.value).text(opt.label));
        });
        $select.val(getValue());
        $select.on("change", function () { setValue($(this).val()); });
        $row.append($select);
        return $row;
    }

    // Compact boolean switch (checkbox styled as a pill toggle) for primary on/off settings.
    function renderToggleSwitch(label, getValue, setValue) {
        var $switch = $('<label class="cfg-switch"></label>');
        var $checkbox = $('<input type="checkbox" />').prop("checked", !!getValue());
        $checkbox.on("change", function () { setValue($(this).is(":checked")); });
        $switch.append($checkbox);
        $switch.append('<span class="cfg-switch-track"><span class="cfg-switch-thumb"></span></span>');
        $switch.append($('<span class="cfg-switch-label"></span>').text(label));
        return $switch;
    }

    // Live-apply the current in-memory theme/cards to the actual canvas, without saving.
    function previewThemeLive() {
        if (window.menuLayout && typeof menuLayout.applyThemeFromSiteConfig === "function") {
            menuLayout.applyThemeFromSiteConfig({ theme: state.workingTheme });
        }
    }
    function previewCardsLive() {
        if (window.menuLayout && window.app && typeof menuLayout.renderCategoryCards === "function") {
            menuLayout.renderCategoryCards(state.cards, app.TRMAssetZones);
        }
    }
    // Shows the actual timeout modal / idle overlay on the canvas while their tab is open,
    // so color/behavior edits are visible immediately. Clears both when neither tab is active.
    function syncTabPreview(tabId) {
        if (!window.menuLayout) {
            return;
        }
        // Idle-overlay show/dismiss can internally pause InactivityManager (which hides
        // the inactivity modal as a side effect), so run it BEFORE the modal preview call
        // below, which always has the final say on the modal's visible state.
        if (tabId === "idle") {
            if (typeof menuLayout.showHomeIdleOverlay === "function") {
                menuLayout.showHomeIdleOverlay();
            }
        } else if (typeof menuLayout.dismissHomeIdleOverlay === "function") {
            menuLayout.dismissHomeIdleOverlay(false);
        }
        if (typeof menuLayout.previewInactivityModal === "function") {
            menuLayout.previewInactivityModal(tabId === "timeout");
        }
    }

    function saveSiteConfigNow($root, successMessage) {
        var payload = {
            storeKey: String(state.ccgs.storeKey),
            companyKey: state.ccgs.companyKey,
            conceptKey: state.ccgs.conceptKey,
            companyName: state.ccgs.companyName,
            conceptName: state.ccgs.conceptName,
            storeName: state.ccgs.storeName,
            theme: state.workingTheme,
            backgroundImageUrl: state.siteConfig ? state.siteConfig.background_image_url : null,
            titleImageUrl: state.siteConfig ? state.siteConfig.title_image_url : null,
            behavior: state.workingBehavior,
            updatedBy: state.ccgs.storeName || String(state.ccgs.storeKey)
        };

        return configService.saveSiteConfig(payload).then(function (result) {
            state.siteConfig = result.siteConfig;
            state.workingTheme = Object.assign({}, state.siteConfig.theme || {});
            state.workingBehavior = Object.assign({}, state.siteConfig.behavior || {});
            if (window.menuLayout) {
                if (typeof menuLayout.applyThemeFromSiteConfig === "function") {
                    menuLayout.applyThemeFromSiteConfig(state.siteConfig);
                }
                if (typeof menuLayout.applyBrandingFromSiteConfig === "function") {
                    menuLayout.applyBrandingFromSiteConfig(state.siteConfig);
                }
                if (typeof menuLayout.applyBehaviorFromSiteConfig === "function") {
                    menuLayout.applyBehaviorFromSiteConfig(state.siteConfig);
                }
            }
            showStatus($root, successMessage || "Saved.", false);
        }).catch(function (err) {
            console.error("configEditor: saveSiteConfig failed", err);
            showStatus($root, "Failed to save: " + err.message, true);
            throw err;
        });
    }

    function renderAssetHistory($wrap, purpose, filterPrefix, onUse) {
        var storeKey = String(state.ccgs.storeKey);
        var folder = "branding/" + storeKey + "/";
        var $grid = $wrap.find(".config-editor-history-grid");
        configService.listAssets(folder).then(function (items) {
            $grid.empty();
            var filtered = (items || []).filter(function (item) {
                return item.name && item.name.indexOf(filterPrefix) === 0;
            });
            if (!filtered.length) {
                $grid.append($('<span class="config-editor-hint"></span>').text("No previous uploads."));
                return;
            }
            filtered.forEach(function (item) {
                var path = folder + item.name;
                var url = configService.buildPublicUrl(path);
                var $thumb = $('<div class="config-editor-history-item"></div>');
                $thumb.append($('<img alt="" />').attr("src", url));
                var $useBtn = $('<button type="button">Use</button>').on("click", function () { onUse(url); });
                var $delBtn = $('<button type="button" class="config-editor-remove">Delete</button>').on("click", function () {
                    if (!confirm("Delete this uploaded image? This can't be undone.")) {
                        return;
                    }
                    configService.deleteAsset({ path: path, purpose: purpose, storeKey: storeKey }).then(function () {
                        var currentUrl = purpose === "background"
                            ? (state.siteConfig && state.siteConfig.background_image_url)
                            : (state.siteConfig && state.siteConfig.title_image_url);
                        if (currentUrl === url) {
                            onUse(null);
                        }
                        renderAssetHistory($wrap, purpose, filterPrefix, onUse);
                    }).catch(function (err) {
                        alert("Delete failed: " + err.message);
                    });
                });
                $thumb.append($useBtn, $delBtn);
                $grid.append($thumb);
            });
        });
    }

    function renderBrandingUpload(label, purpose, filterPrefix) {
        var $wrap = $('<div class="config-editor-branding-block"></div>');
        $wrap.append($('<h4></h4>').text(label));

        var $row = $('<div class="config-editor-branding-row"></div>');
        var currentUrl = purpose === "background"
            ? (state.siteConfig && state.siteConfig.background_image_url)
            : (state.siteConfig && state.siteConfig.title_image_url);
        if (!currentUrl) {
            if (purpose === "title") {
                var $liveImg = $(".welcome-header img");
                if ($liveImg.length) { currentUrl = $liveImg.attr("src"); }
            } else {
                var $liveBg = $(".background img");
                if ($liveBg.length) { currentUrl = $liveBg.attr("src"); }
            }
        }
        var $preview = $('<img class="config-editor-branding-preview" alt="" />').attr("src", currentUrl || "");
        $row.append($preview);

        function setActive(url) {
            state.siteConfig = state.siteConfig || {};
            if (purpose === "background") {
                state.siteConfig.background_image_url = url;
            } else {
                state.siteConfig.title_image_url = url;
            }
            $preview.attr("src", url || "");
            if (window.menuLayout && typeof menuLayout.applyBrandingFromSiteConfig === "function") {
                menuLayout.applyBrandingFromSiteConfig(state.siteConfig);
            }
        }

        var $fileInput = $('<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />');
        $fileInput.on("change", function () {
            var file = this.files && this.files[0];
            if (!file) {
                return;
            }
            var form = buildFormData({ purpose: purpose, storeKey: String(state.ccgs.storeKey), file: file });
            configService.uploadAsset(form).then(function (result) {
                setActive(result.url);
                renderAssetHistory($wrap, purpose, filterPrefix, setActive);
            }).catch(function (err) {
                console.error("configEditor: uploadAsset failed", err);
                alert("Upload failed: " + err.message);
            });
        });
        $row.append($fileInput);

        var $removeBtn = $('<button type="button" class="config-editor-remove">Remove current</button>');
        $removeBtn.on("click", function () { setActive(null); });
        $row.append($removeBtn);

        $wrap.append($row);
        $wrap.append($('<div class="config-editor-hint"></div>').text("Previous uploads:"));
        $wrap.append('<div class="config-editor-history-grid"></div>');
        renderAssetHistory($wrap, purpose, filterPrefix, setActive);

        return $wrap;
    }

    // onPick(icon) is called with the chosen catalog icon; caller decides how to reflect it
    // (updates card.icon_url/icon_source and whatever preview element it's showing).
    function renderIconPicker(onPick) {
        var $picker = $('<div class="config-editor-icon-picker"></div>');

        state.iconCatalog.forEach(function (icon) {
            var $thumb = $('<img class="config-editor-icon-thumb" />').attr("src", icon.icon_url).attr("title", icon.label);
            $thumb.on("click", function () {
                onPick(icon);
                $picker.removeClass("is-open");
            });
            $picker.append($thumb);
        });

        if (!state.iconCatalog.length) {
            $picker.append($('<span></span>').text("No catalog icons for this concept yet."));
        }

        return $picker;
    }

    // Pages (regions) actually present in this store's TRM asset zones right now (from the live
    // kiosk app instance), so trm_layer destinations are picked from what's real instead of typed blind.
    function getDiscoveredLayerOptions() {
        try {
            if (window.app && Array.isArray(window.app.TRMAssetZones) && window.menuLayout && typeof menuLayout.getTRMInteractiveGroups === "function") {
                return menuLayout.getTRMInteractiveGroups(window.app.TRMAssetZones).map(function (group) {
                    return {
                        value: String(group.layer),
                        label: group.title || ("Page " + group.layer)
                    };
                });
            }
        } catch (err) {
            console.error("configEditor: failed to discover TRM layers", err);
        }
        return [];
    }

    // Layer-80 asset zone content (read-only here - it's authored in the TRM/CMS tool).
    function getIdleLayerAssets() {
        try {
            if (window.app && Array.isArray(window.app.TRMAssetZones) && window.menuLayout && typeof menuLayout.getTRMAssetsForLayer === "function") {
                return menuLayout.getTRMAssetsForLayer(window.app.TRMAssetZones, 80);
            }
        } catch (err) {
            console.error("configEditor: failed to read idle layer assets", err);
        }
        return [];
    }

    // Real static <div class="page" id="..."> ids present in this document right now.
    function getStaticPageOptions() {
        var options = [];
        $(".page[id]").each(function () {
            var id = this.id;
            if (id.indexOf("dynamic_card_") === 0) {
                return;
            }
            options.push(id);
        });
        return options;
    }

    // Single "Page" control - one flat list of everything a card can point to, named by
    // region rather than asking the user to pick a destination "type" first. Whichever image,
    // video, iframe, or playlist is assigned to a region in TRM asset zones is shown automatically,
    // exactly like it always has been - no separate media-type choice needed here.
    function renderPageControl(card) {
        var $wrap = $('<span class="config-editor-dest-control-wrap"></span>');
        var $select = $('<select></select>');
        var $urlInput = $('<input type="text" placeholder="https://..." />');

        function buildOptions() {
            $select.empty();
            $select.append($('<option></option>').attr("value", "").text("Choose a page..."));
            var matched = card.destination_type === "iframe";

            getDiscoveredLayerOptions().forEach(function (opt) {
                if (card.destination_type === "trm_layer" && String(card.destination_value) === opt.value) {
                    matched = true;
                }
                $select.append($('<option></option>').attr("value", "trm_layer||" + opt.value).text(opt.label));
            });
            getStaticPageOptions().forEach(function (id) {
                if (card.destination_type === "static_page" && card.destination_value === id) {
                    matched = true;
                }
                $select.append($('<option></option>').attr("value", "static_page||" + id).text(id));
            });
            $select.append($('<option></option>').attr("value", "iframe||").text("Custom web link..."));

            if (!matched && card.destination_type && card.destination_value) {
                var label = card.destination_type === "static_page"
                    ? (card.destination_value + " (not found)")
                    : ("Page " + card.destination_value + " (not currently found)");
                $select.append($('<option></option>').attr("value", card.destination_type + "||" + card.destination_value).text(label));
            }

            if (card.destination_type === "iframe") {
                $select.val("iframe||");
            } else if (card.destination_type && card.destination_value) {
                $select.val(card.destination_type + "||" + card.destination_value);
            } else {
                $select.val("");
            }
            $urlInput.toggle(card.destination_type === "iframe").val(card.destination_type === "iframe" ? (card.destination_value || "") : "");
        }
        buildOptions();

        $select.on("change", function () {
            var raw = $(this).val();
            if (!raw) {
                card.destination_type = "trm_layer";
                card.destination_value = "";
                buildOptions();
                previewCardsLive();
                return;
            }
            var sepIndex = raw.indexOf("||");
            card.destination_type = raw.slice(0, sepIndex);
            card.destination_value = card.destination_type === "iframe" ? "" : raw.slice(sepIndex + 2);
            buildOptions();
            previewCardsLive();
        });
        $urlInput.on("input", function () { card.destination_value = $(this).val(); });
        $urlInput.on("change", previewCardsLive);

        $wrap.append($select, $urlInput);
        return $wrap;
    }

    function swapCards(i, j) {
        var tmpCard = state.cards[i];
        state.cards[i] = state.cards[j];
        state.cards[j] = tmpCard;
        var tmpExpanded = state.expandedCards[i];
        state.expandedCards[i] = state.expandedCards[j];
        state.expandedCards[j] = tmpExpanded;
    }

    // Primary surface: name + active switch + page (the essentials every card needs).
    // Icon, colors, and the destructive "remove" action are secondary, behind the expand chevron.
    function renderCardRow(card, index, $list) {
        var $card = $('<div class="config-editor-card"></div>');
        var expanded = !!state.expandedCards[index];
        card.colors = card.colors || {};
        var $templateLabel = null; // only exists once Advanced (with the live preview) is expanded

        var $top = $('<div class="config-editor-card-row-top"></div>');
        var $upBtn = $('<button type="button" class="config-editor-btn-icon" title="Move up">&uarr;</button>').on("click", function () {
            if (index > 0) {
                swapCards(index, index - 1);
                renderCardsList($list.closest(".config-editor-cards-section"));
                previewCardsLive();
            }
        });
        var $downBtn = $('<button type="button" class="config-editor-btn-icon" title="Move down">&darr;</button>').on("click", function () {
            if (index < state.cards.length - 1) {
                swapCards(index, index + 1);
                renderCardsList($list.closest(".config-editor-cards-section"));
                previewCardsLive();
            }
        });
        var $activeSwitch = renderToggleSwitch("Active", function () { return card.active !== false; }, function (v) { card.active = v; previewCardsLive(); });
        $top.append($upBtn, $downBtn, $activeSwitch);
        $top.append($('<span></span>').css({ flex: "1" }));

        var $expandBtn = $('<button type="button" class="config-editor-btn-icon" title="Advanced options">&#9660;</button>');
        if (expanded) {
            $expandBtn.html("&#9650;");
        }
        $expandBtn.on("click", function () {
            state.expandedCards[index] = !expanded;
            renderCardsList($list.closest(".config-editor-cards-section"));
        });
        $top.append($expandBtn);
        $card.append($top);

        var $nameInput = $('<input type="text" class="cfg-card-name-input" placeholder="Card name" />').val(card.name || "");
        $nameInput.on("input", function () {
            card.name = $(this).val();
            if ($templateLabel) {
                $templateLabel.text(card.name || "Untitled");
            }
        });
        $nameInput.on("change", previewCardsLive);
        $card.append($nameInput);

        var $pageRow = $('<div class="cfg-page-row"></div>');
        $pageRow.append($('<span class="config-editor-color-label"></span>').text("Page"));
        var $pageControls = $('<div class="cfg-page-row-controls"></div>');
        $pageControls.append(renderPageControl(card));
        $pageRow.append($pageControls);
        $card.append($pageRow);

        if (expanded) {
            var $body = $('<div class="cfg-card-body"></div>');
            $body.append($('<p class="cfg-advanced-heading"></p>').text("Advanced"));

            // Live visual template - mirrors the real .feature-card markup so clicking/hovering/
            // pressing it previews exactly what the kiosk shows for this card's colors.
            var $template = $('<div class="cfg-card-template"></div>');
            var $templateIcon = $('<div class="cfg-card-template-icon"></div>');
            var $templateIconImg = $('<img alt="" />').attr("src", card.icon_url || "");
            $templateIcon.append($templateIconImg);
            $templateLabel = $('<div class="cfg-card-template-label"></div>').text(card.name || "Untitled");
            $template.append($templateIcon, $templateLabel);
            $body.append($template);
            $body.append($('<p class="config-editor-hint"></p>').text("Tap the preview to change its colors - hover or press it to check the hover/press colors."));

            var CARD_COLOR_VAR_MAP = {
                cardBackground: "--feature-card-bg",
                cardHoverBackground: "--feature-card-hover-bg",
                cardActiveBackground: "--feature-card-active-bg",
                labelColor: "--card-label-bg",
                iconBorderColor: "--card-icon-outline-color"
            };
            function applyTemplateColors() {
                Object.keys(CARD_COLOR_VAR_MAP).forEach(function (key) {
                    if (card.colors[key]) {
                        $template.get(0).style.setProperty(CARD_COLOR_VAR_MAP[key], card.colors[key]);
                    } else {
                        $template.get(0).style.removeProperty(CARD_COLOR_VAR_MAP[key]);
                    }
                });
            }
            applyTemplateColors();

            var $iconRow = $('<div class="config-editor-card-row-bottom"></div>');
            var $chooseIconBtn = $('<button type="button">Choose icon</button>');
            var $picker = renderIconPicker(function (icon) {
                card.icon_url = icon.icon_url;
                card.icon_source = "catalog";
                $templateIconImg.attr("src", icon.icon_url);
                previewCardsLive();
            });
            $chooseIconBtn.on("click", function () { $picker.toggleClass("is-open"); });
            $iconRow.append($chooseIconBtn);

            var $uploadIcon = $('<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" title="Upload custom icon" />');
            $uploadIcon.on("change", function () {
                var file = this.files && this.files[0];
                if (!file) {
                    return;
                }
                var form = buildFormData({ purpose: "custom-icon", storeKey: String(state.ccgs.storeKey), file: file });
                configService.uploadAsset(form).then(function (result) {
                    card.icon_url = result.url;
                    card.icon_source = "custom";
                    $templateIconImg.attr("src", result.url);
                    previewCardsLive();
                }).catch(function (err) {
                    console.error("configEditor: custom icon upload failed", err);
                    alert("Icon upload failed: " + err.message);
                });
            });
            $iconRow.append($uploadIcon);
            $body.append($iconRow, $picker);

            var $colorsRow = $('<div class="cfg-card-colors"></div>');
            var colorFieldEls = {};
            CARD_COLOR_FIELDS.forEach(function (field) {
                var $field = renderColorField(field.label, function () { return card.colors[field.key]; }, function (v) { card.colors[field.key] = v; }, {
                    onChange: function () { applyTemplateColors(); previewCardsLive(); }
                });
                colorFieldEls[field.key] = $field;
                $colorsRow.append($field);
            });
            $body.append($colorsRow);

            // Colors always fall back to the site's standard CSS-defined theme once cleared.
            var $revertBtn = $('<button type="button">Revert to standard colors</button>');
            $revertBtn.on("click", function () {
                card.colors = {};
                renderCardsList($list.closest(".config-editor-cards-section"));
                previewCardsLive();
            });
            $body.append($revertBtn);

            function openColorPopover(key) {
                var $btn = colorFieldEls[key] && colorFieldEls[key].find(".cfg-swatch-btn");
                if ($btn && $btn.length) {
                    $btn.trigger("click");
                }
            }
            $template.on("click", function (e) { e.stopPropagation(); openColorPopover("cardBackground"); });
            $templateLabel.on("click", function (e) { e.stopPropagation(); openColorPopover("labelColor"); });
            $templateIcon.on("click", function (e) { e.stopPropagation(); openColorPopover("iconBorderColor"); });

            var $removeBtn = $('<button type="button" class="config-editor-remove">Remove card</button>').on("click", function () {
                state.cards.splice(index, 1);
                delete state.expandedCards[index];
                renderCardsList($list.closest(".config-editor-cards-section"));
                previewCardsLive();
            });
            $body.append($removeBtn);

            $card.append($body);
        }

        return $card;
    }

    function renderCardsList($section) {
        var $list = $section.find(".config-editor-cards-list");
        $list.empty();
        state.cards.forEach(function (card, index) {
            $list.append(renderCardRow(card, index, $list));
        });
    }

    function saveCardsNow($root) {
        var payload = {
            storeKey: String(state.ccgs.storeKey),
            cards: state.cards.map(function (card, index) {
                return {
                    sortOrder: index,
                    name: card.name,
                    active: card.active !== false,
                    iconUrl: card.icon_url || null,
                    iconSource: card.icon_source || "catalog",
                    destinationType: card.destination_type,
                    destinationValue: card.destination_value,
                    colors: card.colors || {}
                };
            })
        };
        return configService.saveCategoryCards(payload).then(function (result) {
            state.cards = result.categoryCards || [];
            renderCardsList($root.find(".config-editor-cards-section"));
            previewCardsLive();
            showStatus($root, "Categories saved.", false);
        }).catch(function (err) {
            console.error("configEditor: saveCategoryCards failed", err);
            showStatus($root, "Failed to save cards: " + err.message, true);
        });
    }

    function makeNewCard(name) {
        return {
            sort_order: state.cards.length,
            name: name || "New Category",
            active: true,
            icon_url: "",
            icon_source: "catalog",
            destination_type: "trm_layer",
            destination_value: "",
            colors: {}
        };
    }

    // Category Cards leads the Home tab (they're the primary thing a store manager touches);
    // header/background branding is secondary and grouped below as "Home Screen Look".
    function renderHomeTab($root) {
        var $panel = $('<div></div>');

        var $listSection = $('<div class="config-editor-section config-editor-cards-section"></div>');
        $listSection.append($('<h3></h3>').text("Category Cards"));
        $listSection.append($('<p class="config-editor-hint"></p>').text("These are the buttons shown on the home screen."));

        var $list = $('<div class="config-editor-cards-list"></div>');
        $listSection.append($list);
        renderCardsList($listSection);

        var $addBtn = $('<button type="button">+ Add Card</button>');
        $addBtn.on("click", function () {
            state.cards.push(makeNewCard());
            state.expandedCards[state.cards.length - 1] = true;
            renderCardsList($listSection);
        });
        $listSection.append($addBtn);

        var $saveBtn = $('<button type="button" class="config-editor-btn-primary">Save Home</button>');
        $saveBtn.on("click", function () {
            saveSiteConfigNow($root, "Saving...").then(function () {
                return saveCardsNow($root);
            }).catch(function () { /* status already shown by saveSiteConfigNow */ });
        });
        $listSection.append($saveBtn);
        $panel.append($listSection);

        var $lookSection = $('<div class="config-editor-section"></div>');
        $lookSection.append($('<h3></h3>').text("Home Screen Look"));
        $lookSection.append(renderBrandingUpload("Title / logo image", "title", "title-"));
        var $colorRow = $('<div class="cfg-inline-row"></div>');
        $colorRow.append(renderColorField("Header background", function () { return state.workingTheme.headerBackground; }, function (v) { state.workingTheme.headerBackground = v; }, { onChange: previewThemeLive }));
        $colorRow.append(renderColorField("Home background", function () { return state.workingTheme.homeBackgroundColor; }, function (v) { state.workingTheme.homeBackgroundColor = v; }, { onChange: previewThemeLive }));
        $lookSection.append($colorRow);
        $lookSection.append($('<p class="config-editor-hint"></p>').text("A background image (if set below) always shows on top of the home background color."));
        $lookSection.append(renderBrandingUpload("Background image", "background", "background-"));
        $panel.append($lookSection);

        return $panel;
    }

    function renderTimeoutTab($root) {
        var $panel = $('<div></div>');
        var $section = $('<div class="config-editor-section"></div>');
        $section.append($('<h3></h3>').text("Timeout Modal Colors"));
        $section.append($('<p class="config-editor-hint"></p>').text("The modal is shown live on the canvas while this tab is open."));
        var $colorsRow = $('<div class="cfg-inline-row"></div>');
        TIMEOUT_COLOR_FIELDS.forEach(function (field) {
            $colorsRow.append(renderColorField(field.label, function () { return state.workingTheme[field.key]; }, function (v) { state.workingTheme[field.key] = v; }, { onChange: previewThemeLive }));
        });
        $section.append($colorsRow);
        $panel.append($section);

        var $timingSection = $('<div class="config-editor-section"></div>');
        $timingSection.append($('<h3></h3>').text("Timing & Target"));
        $timingSection.append(renderSecondsField("Show warning after", function () { return state.workingBehavior.inactivityWarningDelayMs; }, function (ms) { state.workingBehavior.inactivityWarningDelayMs = ms; }, { defaultMs: 30000, min: 5, max: 600 }));
        $timingSection.append(renderSecondsField("Countdown duration", function () { return state.workingBehavior.inactivityCountdownMs; }, function (ms) { state.workingBehavior.inactivityCountdownMs = ms; }, { defaultMs: 10000, min: 3, max: 120 }));
        $timingSection.append(renderSelectField("When timed out, go to", function () { return state.workingBehavior.inactivityTargetPage || "home"; }, function (v) { state.workingBehavior.inactivityTargetPage = v; }, [
            { value: "home", label: "Home screen" },
            { value: "idle", label: "Home, then idle content" }
        ]));
        var $saveBtn = $('<button type="button" class="config-editor-btn-primary">Save Timeout Settings</button>');
        $saveBtn.on("click", function () { saveSiteConfigNow($root, "Timeout settings saved."); });
        $timingSection.append($saveBtn);
        $panel.append($timingSection);

        return $panel;
    }

    function renderIdleTab($root) {
        var $panel = $('<div></div>');
        var $section = $('<div class="config-editor-section"></div>');
        $section.append($('<h3></h3>').text("Idle Content (Layer 80)"));
        $section.append($('<p class="config-editor-hint"></p>').text("Shown live on the canvas while this tab is open. Managed in the TRM/CMS asset zones tool, not here."));
        var assets = getIdleLayerAssets();
        if (!assets.length) {
            $section.append($('<p class="config-editor-hint"></p>').text("No layer-80 asset zone content found for this store."));
        } else {
            var $list = $('<ul class="cfg-idle-list"></ul>');
            assets.forEach(function (asset) {
                var label = (asset.zoneName || asset.regionName || "Untitled") + " \u2014 " + asset.fileType + ", " + asset.duration + "s";
                $list.append($('<li></li>').text(label));
            });
            $section.append($list);
        }
        $panel.append($section);

        var $timingSection = $('<div class="config-editor-section"></div>');
        $timingSection.append($('<h3></h3>').text("Timing"));
        $timingSection.append(renderSecondsField("Show after sitting on Home", function () { return state.workingBehavior.homeIdleDelayMs; }, function (ms) { state.workingBehavior.homeIdleDelayMs = ms; }, { defaultMs: 30000, min: 5, max: 600 }));
        var $saveBtn = $('<button type="button" class="config-editor-btn-primary">Save Idle Settings</button>');
        $saveBtn.on("click", function () { saveSiteConfigNow($root, "Idle settings saved."); });
        $timingSection.append($saveBtn);
        $panel.append($timingSection);

        return $panel;
    }

    function renderCopyTab($root) {
        var $panel = $('<div></div>');
        var $section = $('<div class="config-editor-section"></div>');
        $section.append($('<h3></h3>').text("Copy From Another Location"));

        var otherLocations = state.locations.filter(function (loc) {
            return String(loc.storeKey) !== String(state.ccgs.storeKey);
        });

        if (!otherLocations.length) {
            $section.append($('<p></p>').text("No other accessible locations found in ccgsItems."));
            $panel.append($section);
            return $panel;
        }

        var $select = $('<select></select>');
        otherLocations.forEach(function (loc) {
            var label = (loc.storeName || ("Store " + loc.storeKey));
            $select.append($('<option></option>').attr("value", loc.storeKey).text(label));
        });
        $section.append($select);

        var $applyBtn = $('<button type="button" class="config-editor-btn-primary">Apply Template To This Location</button>');
        $applyBtn.on("click", function () {
            var sourceStoreKey = $select.val();
            if (!confirm("This will overwrite theme, branding, and category cards for the CURRENT location (" + state.ccgs.storeName + ") with the selected location's config. Continue?")) {
                return;
            }
            configService.copyTemplate({
                sourceStoreKey: String(sourceStoreKey),
                targetStoreKey: String(state.ccgs.storeKey),
                updatedBy: state.ccgs.storeName || String(state.ccgs.storeKey)
            }).then(function () {
                showStatus($root, "Template applied. Reloading config...", false);
                return loadState();
            }).then(function () {
                rebuildPanel($root);
            }).catch(function (err) {
                console.error("configEditor: copyTemplate failed", err);
                showStatus($root, "Failed to apply template: " + err.message, true);
            });
        });
        $section.append($applyBtn);
        $panel.append($section);
        return $panel;
    }

    function renderTabs($root) {
        var $tabs = $('<div class="config-editor-tabs"></div>').css({
            position: "sticky", top: "47px", display: "flex", background: "#eef2f4",
            "border-bottom": "1px solid #d5dee2", "z-index": 1
        });
        var inactiveStyle = { color: "#54666d", "border-bottom-color": "transparent", background: "none" };
        var activeStyle = { color: "#17313b", "border-bottom-color": "#3586bd", background: "#fff" };
        TABS.forEach(function (tab) {
            var $btn = $('<button type="button"></button>').text(tab.label).attr("data-tab-btn", tab.id).css({
                flex: "1", "min-height": "auto", padding: "10px 6px", "font-size": "13px", "font-weight": "600",
                "border-radius": "0", border: "none", "border-bottom": "3px solid transparent"
            });
            if (tab.id === state.activeTab) {
                $btn.addClass("is-active").css(activeStyle);
            } else {
                $btn.css(inactiveStyle);
            }
            $btn.on("click", function () {
                state.activeTab = tab.id;
                $root.find("[data-tab-btn]").removeClass("is-active").css(inactiveStyle);
                $btn.addClass("is-active").css(activeStyle);
                $root.find("[data-tab-panel]").hide();
                $root.find("[data-tab-panel='" + tab.id + "']").show();
                syncTabPreview(tab.id);
                if (tab.id === "home") {
                    refreshHomeCardOptions();
                }
            });
            $tabs.append($btn);
        });
        return $tabs;
    }

    function rebuildPanel($root) {
        var $body = $root.find(".config-editor-body");
        $body.empty();
        $body.append(renderTabs($root));

        var panels = {
            home: renderHomeTab($root),
            timeout: renderTimeoutTab($root),
            idle: renderIdleTab($root),
            share: renderCopyTab($root)
        };

        Object.keys(panels).forEach(function (tabId) {
            var $panel = panels[tabId];
            $panel.attr("data-tab-panel", tabId);
            if (tabId !== state.activeTab) {
                $panel.hide();
            }
            $body.append($panel);
        });

        syncTabPreview(state.activeTab);
    }

    function loadState() {
        return Promise.all([
            configService.fetchSiteConfig(String(state.ccgs.storeKey)),
            configService.fetchCategoryCards(String(state.ccgs.storeKey), true),
            configService.fetchIconCatalog(state.ccgs.conceptKey)
        ]).then(function (results) {
            state.siteConfig = results[0];
            state.cards = results[1];
            state.iconCatalog = results[2];
            state.workingTheme = Object.assign({}, (state.siteConfig && state.siteConfig.theme) || {});
            state.workingBehavior = Object.assign({}, (state.siteConfig && state.siteConfig.behavior) || {});
            state.expandedCards = {};
            // Give a new store a starting point instead of an empty list.
            if (!state.cards.length) {
                state.cards = [makeNewCard("Category 1"), makeNewCard("Category 2"), makeNewCard("Category 3")];
            }
        });
    }

    // TRM asset zone data can finish loading shortly after the editor opens, so the Home tab's
    // destination dropdowns are refreshed automatically instead of needing a manual "refresh" button.
    function refreshHomeCardOptions() {
        if (!state.$root) {
            return;
        }
        var $section = state.$root.find(".config-editor-cards-section");
        if ($section.length) {
            renderCardsList($section);
        }
    }

    // Shared header+root markup, used both for the CF-embedded panel and the local-dev popup window.
    function createPanelSkeleton(hostDocument, onClose) {
        ensureModalStyles(hostDocument);

        var $root = $(hostDocument.createElement("div")).attr("id", "config-editor-root").css({
            "z-index": 2147483000, width: "520px", flex: "0 0 520px", "max-height": "100%",
            "overflow-y": "auto", background: "#fff", border: "1px solid #d5dee2", "border-radius": "10px",
            "box-shadow": "0 18px 48px rgba(9,35,44,.18)", "font-family": "'Segoe UI', system-ui, -apple-system, sans-serif",
            "font-size": "14px", color: "#17313b", "box-sizing": "border-box"
        });
        // Closes any open color popover when clicking elsewhere in the panel.
        $root.on("click", function () {
            $root.find(".cfg-color-popover").removeClass("is-open");
        });
        var $header = $('<div class="config-editor-header"></div>').css({
            position: "sticky", top: "0", display: "flex", "align-items": "center",
            "justify-content": "space-between", gap: "12px", padding: "12px 16px",
            background: "#242d37", color: "#fff", "font-size": "16px", "font-weight": "600", "z-index": 2
        });
        $header.append($('<span></span>').text("Editing: " + (state.ccgs.storeName || state.ccgs.storeKey)));
        $header.append($('<span class="config-editor-status"></span>').css({ "font-size": "12px", color: "#8fd8f8" }));
        var $closeBtn = $('<button type="button" class="config-editor-close">&times;</button>').css({
            display: "inline-flex", "align-items": "center", "justify-content": "center", width: "30px", height: "30px",
            background: "none", border: "none", "border-radius": "6px", color: "#fff", "font-size": "22px", "line-height": "1"
        });
        $closeBtn.on("click", onClose);
        $header.append($closeBtn);
        $root.append($header);
        $root.append('<div class="config-editor-body" style="padding:16px"></div>');
        return $root;
    }

    function buildPanel() {
        var hostDocument = getModalDocument();
        var modalHost = getModalHost();
        var $root = createPanelSkeleton(hostDocument, function () { togglePanel(false); });
        $root.prop("hidden", true);

        if (isLocalDevContext() && modalHost === hostDocument.body) {
            $root.css({
                position: "fixed", top: "0", right: "0", left: "auto",
                height: "100vh", "max-height": "100vh",
                width: "520px", "border-radius": "0",
                "border-left": "1px solid #d5dee2", "border-right": "none",
                "border-top": "none", "border-bottom": "none",
                "box-shadow": "-4px 0 24px rgba(9,35,44,.12)"
            });
            $root.prop("hidden", false).css("display", "none");
            $(hostDocument.documentElement).append($root);
            state._devInline = true;
        } else {
            $(modalHost).prepend($root);
        }

        state.$root = $root;
        return $root;
    }

    // Local-testing path: no trm.wandcorp.com host page to mount beside, so open a real
    // separate window instead (must be called directly from a click - popup blockers allow that).
    function openInSeparateWindow() {
        if (state.editorWindow && !state.editorWindow.closed) {
            state.editorWindow.focus();
            return;
        }
        var win = window.open("", "configEditorWindow", "width=580,height=960,resizable=yes,scrollbars=yes");
        if (!win) {
            alert("Popup blocked - please allow popups for this page to use the config editor.");
            return;
        }
        state.editorWindow = win;
        win.document.title = "app_shell_CDL Config Editor (local test)";
        win.document.body.style.margin = "0";
        win.document.body.textContent = "Loading...";

        win.addEventListener("beforeunload", function () {
            state.editorWindow = null;
            state.$root = null;
            state.panelOpen = false;
            syncTabPreview(null);
        });

        loadState().then(function () {
            win.document.body.textContent = "";
            var $root = createPanelSkeleton(win.document, closeEditor);
            $root.css({ width: "100%", flex: "", "max-height": "100vh" });
            $(win.document.body).append($root);
            state.$root = $root;
            state.panelOpen = true;
            rebuildPanel($root);
            setTimeout(refreshHomeCardOptions, 1500);
        });
    }

    function closeEditor() {
        syncTabPreview(null);
        if (state.useSeparateWindow) {
            if (state.editorWindow && !state.editorWindow.closed) {
                state.editorWindow.close();
            }
            state.editorWindow = null;
            state.$root = null;
            state.panelOpen = false;
        } else {
            togglePanel(false);
        }
    }

    function togglePanel(open) {
        state.panelOpen = open;
        if (!open) {
            syncTabPreview(null);
        }
        if (state.useSeparateWindow) {
            return;
        }
        if (!state.$root) {
            return;
        }
        if (open) {
            getModalHost();
        } else {
            restorePreviewPanelWidth();
        }
        if (state._devInline) {
            state.$root.css("display", open ? "" : "none");
        } else {
            state.$root.prop("hidden", !open);
        }
    }

    function init() {
        if (!isEditingContext()) {
            return;
        }

        state.ccgs = normalizeCCGS(readLocalStorageJSON("MostRecentCCGS"));
        if (!state.ccgs || state.ccgs.storeKey === null) {
            if (isLocalDevContext()) {
                state.ccgs = buildLocalTestCCGS();
                console.info("configEditor: no MostRecentCCGS found; using local test CCGS (storeKey=" + state.ccgs.storeKey + "). Override with ?configStoreKey=NNN.");
            } else {
                console.warn("configEditor: no MostRecentCCGS with a storeKey found; edit mode disabled.");
                return;
            }
        }
        state.locations = readAccessibleLocations();
        // Always render the panel inline in the current page. The separate-window path
        // opened a blank popup that lacked the app's jQuery/DOM context; the inline path
        // falls back to document.body when no CF preview panel structure is found.
        state.useSeparateWindow = false;

        var $toggleBtn = $('<button type="button" id="config-editor-toggle">Edit Config</button>').css({
            position: "fixed", top: "20px", left: "20px", "z-index": 20000, padding: "12px 20px",
            "font-size": "20px", background: "#242d37", color: "#fff", border: "none",
            "border-radius": "8px", cursor: "pointer", "font-family": "Arial, Helvetica, sans-serif"
        });
        $toggleBtn.on("click", function () {
            if (state.useSeparateWindow) {
                openInSeparateWindow();
            } else {
                togglePanel(!state.panelOpen);
            }
        });
        $("body").append($toggleBtn);

        loadState().then(function () {
            if (state.useSeparateWindow) {
                return;
            }
            var $root = buildPanel();
            rebuildPanel($root);
            togglePanel(false);
            setTimeout(refreshHomeCardOptions, 1500);
        });
    }

    $(init);

    return {
        _state: state
    };
})();

