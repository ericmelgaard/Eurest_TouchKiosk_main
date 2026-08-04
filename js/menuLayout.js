"use strict";
//Publisher: Wand Digital
//Date: 05.30.2025
//Version: 61.0
var IMSintegration;
(function (wandDigital) {
    var MenuLayout = (function () {
        function MenuLayout() {
            this.timeOuts = [];
            this.playlist = false;
            this.isRotating = false;
            this.navigationHistory = [];
            this._coreInitialized = false;
            this.homeIdleDelayMs = 30000;
            this.homeIdleLayer = 80;
            this.homeIdleTimer = null;
            this.isHomeIdleOverlayActive = false;
            this.homeIdleAssets = [];
            this._environmentConfig = null;
            this._homeIdleDismissEventsBound = false;
            this._menuItemSettingKeyMap = {
                categoryIconPack: ["catagory_icon_pak", "category_icon_pak", "catagoryiconpak", "categoryiconpak"]
            };
        }
        MenuLayout.prototype.init = function (IMSItems, IMSProducts, IMSSettings, integrationItems, API, TRMAssetZones, TRMMenuItems) {
            if (!API) {
                return;
            }
            try {
                this.applyThemeFromTRMMenuItems(TRMMenuItems);
            } catch (e) {
                console.error("Error in MenuLayout applyThemeFromTRMMenuItems: ", e);
            }
            try {
                this.applyCategoryIconPackFromTRMMenuItems(TRMMenuItems);
            } catch (e) {
                console.error("Error in MenuLayout applyCategoryIconPackFromTRMMenuItems: ", e);
            }
            try {
                this.updateTRMContent(TRMAssetZones);
            } catch (e) {
                console.error("Error in MenuLayout updateTRMContent: ", e);
            }
            try {
                this.injectPricing(IMSProducts);
            } catch (e) {
                console.error("Error in MenuLayout injectPricing: ", e);
                IMSintegration.Integration.prototype.showConnect(true, "Red", "injectPricing", e, "error");
            }
            try {
                this.handleProducts(IMSProducts);
            } catch (e) {
                console.error("Error in MenuLayout handleProducts: ", e);
                IMSintegration.Integration.prototype.showConnect(true, "Red", "handleProducts", e, "error");
            }
            try {
                this.handleLayout(IMSSettings);
            } catch (e) {
                console.error("Error in MenuLayout handleLayout: ", e);
                IMSintegration.Integration.prototype.showConnect(true, "Red", "handleLayout", e, "error");
            }
            if (this._coreInitialized) {
                return;
            }

            //optional starts
            // try {
            //     this.rotateEles();
            // } catch (e) {
            //     console.error("Error in MenuLayout rotateEles: ", e);
            //     IMSintegration.Integration.prototype.showConnect(true, "Red", "rotateEles", e, "error");
            // }

            try {
                this.initInactivityManager();
            } catch (e) {
                console.error("Error initializing InactivityManager: ", e);
            }

            this._coreInitialized = true;
        };
        MenuLayout.prototype.updateTRMContent = function (TRMAssetZones) {
            try {
                this.buildTRMInteractiveLayout(TRMAssetZones);
            } catch (e) {
                console.error("Error building TRM interactive layout: ", e);
            }
        };
        MenuLayout.prototype.applyThemeFromTRMMenuItems = function (TRMMenuItems) {
            var themeVars = {
                "--welcome-header-bg": true,
                "--header-text-color": true,
                "--sub-header-text-color": true,
                "--feature-card-bg": true,
                "--feature-card-hover-bg": true,
                "--feature-card-active-bg": true,
                "--card-label-bg": true,
                "--card-icon-outline-color": true,
                "--inactivity-overlay-bg": true,
                "--inactivity-modal-bg": true,
                "--inactivity-modal-heading-color": true,
                "--inactivity-modal-text-color": true,
                "--inactivity-primary-btn-bg": true,
                "--inactivity-primary-btn-hover-bg": true
            };

            var keyMap = {
                "welcomeheaderbg": "--welcome-header-bg",
                "headerbg": "--welcome-header-bg",
                "headerbackground": "--welcome-header-bg",
                "headertext": "--header-text-color",
                "headertextcolor": "--header-text-color",
                "subheadertext": "--sub-header-text-color",
                "subheadertextcolor": "--sub-header-text-color",
                "cardbackground": "--feature-card-bg",
                "cardbg": "--feature-card-bg",
                "cardhoverbackground": "--feature-card-hover-bg",
                "cardhoverbg": "--feature-card-hover-bg",
                "cardactivebackground": "--feature-card-active-bg",
                "cardactivebg": "--feature-card-active-bg",
                "cardlabelbackground": "--card-label-bg",
                "cardlabelbg": "--card-label-bg",
                "cardiconborder": "--card-icon-outline-color",
                "cardiconoutline": "--card-icon-outline-color",
                "cardiconoutlinecolor": "--card-icon-outline-color",
                "inactivityoverlay": "--inactivity-overlay-bg",
                "inactivityoverlaybg": "--inactivity-overlay-bg",
                "inactivitybackground": "--inactivity-modal-bg",
                "inactivitymodalbg": "--inactivity-modal-bg",
                "inactivityheading": "--inactivity-modal-heading-color",
                "inactivityheadingcolor": "--inactivity-modal-heading-color",
                "inactivitytext": "--inactivity-modal-text-color",
                "inactivitytextcolor": "--inactivity-modal-text-color",
                "inactivityprimarybutton": "--inactivity-primary-btn-bg",
                "inactivityprimarybuttonbg": "--inactivity-primary-btn-bg",
                "inactivityprimarybuttonhover": "--inactivity-primary-btn-hover-bg",
                "inactivityprimarybuttonhoverbg": "--inactivity-primary-btn-hover-bg"
            };

            var normalizeKey = function (value) {
                return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            };

            var isValidCssColor = function (value) {
                if (!value || typeof value !== "string") {
                    return false;
                }
                var probe = new Option().style;
                probe.color = "";
                probe.color = value.trim();
                return probe.color !== "";
            };

            var normalizeValue = function (value) {
                if (value === null || value === undefined) {
                    return "";
                }
                return String(value).trim();
            };

            var selected = {};

            (Array.isArray(TRMMenuItems) ? TRMMenuItems : []).forEach(function (item) {
                if (!item) {
                    return;
                }

                var rawKey = item.name || item.key || item.id || "";
                var rawValue = item.value;
                var normalizedItemKey = normalizeKey(rawKey);

                if (normalizedItemKey === "themecolors" || normalizedItemKey === "theme" || normalizedItemKey === "appcolors") {
                    try {
                        var parsed = JSON.parse(normalizeValue(rawValue));
                        Object.keys(parsed || {}).forEach(function (jsonKey) {
                            var mappedVar = keyMap[normalizeKey(jsonKey)] || (String(jsonKey).indexOf("--") === 0 ? String(jsonKey) : "");
                            var mappedValue = normalizeValue(parsed[jsonKey]);
                            if (!mappedVar || !mappedValue) {
                                return;
                            }
                            if (mappedVar.indexOf("--") === 0 && themeVars[mappedVar] && isValidCssColor(mappedValue)) {
                                selected[mappedVar] = mappedValue;
                            }
                        });
                    } catch (err) {
                        // Ignore malformed JSON and continue processing single entries.
                    }
                    return;
                }

                var cssVar = keyMap[normalizedItemKey] || "";
                var value = normalizeValue(rawValue);
                if (!cssVar || !value) {
                    return;
                }
                if (isValidCssColor(value)) {
                    selected[cssVar] = value;
                }
            });

            var root = document.documentElement;
            Object.keys(selected).forEach(function (cssVar) {
                root.style.setProperty(cssVar, selected[cssVar]);
            });
        };
        MenuLayout.prototype.normalizeTRMMenuItemKey = function (value) {
            return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        };
        MenuLayout.prototype.normalizeTRMMenuItemValue = function (value) {
            if (value === null || value === undefined) {
                return "";
            }
            return String(value).trim();
        };
        MenuLayout.prototype.getTRMMenuItemSettingValue = function (TRMMenuItems, keyAliases) {
            var _this = this;
            var allowed = {};
            (Array.isArray(keyAliases) ? keyAliases : []).forEach(function (key) {
                allowed[_this.normalizeTRMMenuItemKey(key)] = true;
            });

            var items = Array.isArray(TRMMenuItems) ? TRMMenuItems : [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (!item) {
                    continue;
                }
                var rawKey = item.name || item.key || item.id || "";
                var normalizedKey = this.normalizeTRMMenuItemKey(rawKey);
                if (!allowed[normalizedKey]) {
                    continue;
                }
                var value = this.normalizeTRMMenuItemValue(item.value);
                if (value) {
                    return value;
                }
            }

            return "";
        };
        MenuLayout.prototype.getEnvironmentConfig = function () {
            if (this._environmentConfig) {
                return this._environmentConfig;
            }

            if (typeof environment !== "undefined" && environment) {
                var env = String(environment).toLowerCase();
                this._environmentConfig = {
                    environment: env,
                    apiHost: env === "qa" ? "api-qa.wanddigital.com" : (env === "uat" ? "api-uat.wanddigital.com" : "api.wanddigital.com"),
                    clientHost: env === "qa" ? "client-qa.wanddigital.com" : (env === "uat" ? "client-uat.wanddigital.com" : "client.wanddigital.com"),
                    orderStatusHost: env === "qa" ? "orderstatus-qa.wanddigital.com" : (env === "uat" ? "orderstatus-uat.wanddigital.com" : "orderstatus-prod.wanddigital.com")
                };
                return this._environmentConfig;
            }

            if (typeof window.getWandEnvironmentConfig === "function") {
                this._environmentConfig = window.getWandEnvironmentConfig();
                return this._environmentConfig;
            }

            var locationHost = String((window.location && window.location.hostname) || "").toLowerCase();
            var inClient = !!window.frameElement;
            var isLocal = !locationHost
                || locationHost === "localhost"
                || locationHost === "127.0.0.1"
                || locationHost.indexOf(".local") > -1;
            var trmMatch = locationHost.match(/(?:^|[.-])trm(?:-([a-z0-9]+))?(?:[.-]|$)/i);
            var envFromTrm = trmMatch ? String(trmMatch[1] || "prod").toLowerCase() : "";
            var environment = "prod";

            if (isLocal && !inClient) {
                environment = "local";
            } else if (envFromTrm === "qa" || /(^|[.-])qa([.-]|$)/.test(locationHost)) {
                environment = "qa";
            } else if (envFromTrm === "uat" || /(^|[.-])uat([.-]|$)/.test(locationHost)) {
                environment = "uat";
            }

            this._environmentConfig = {
                environment: environment,
                apiHost: environment === "qa" ? "api-qa.wanddigital.com" : (environment === "uat" ? "api-uat.wanddigital.com" : "api.wanddigital.com"),
                clientHost: environment === "qa" ? "client-qa.wanddigital.com" : (environment === "uat" ? "client-uat.wanddigital.com" : "client.wanddigital.com"),
                orderStatusHost: environment === "qa" ? "orderstatus-qa.wanddigital.com" : (environment === "uat" ? "orderstatus-uat.wanddigital.com" : "orderstatus-prod.wanddigital.com")
            };

            return this._environmentConfig;
        };
        MenuLayout.prototype.getCmsClientHostByEnvironment = function () {
            return this.getEnvironmentConfig().clientHost;
        };
        MenuLayout.prototype.buildCmsIconPackBaseUrl = function (assetId) {
            var id = this.normalizeTRMMenuItemValue(assetId).replace(/[^0-9]/g, "");
            if (!id) {
                return "";
            }
            return "https://" + this.getCmsClientHostByEnvironment() + "/cms_mediafiles/DIGITAL_ASSETS_NX01/" + id + "/";
        };
        MenuLayout.prototype.applyCategoryIconPackFromTRMMenuItems = function (TRMMenuItems) {
            var _this = this;
            // Category pack: the TRM setting overrides the template default (categoryIconPackId).
            var assetId = this.getTRMMenuItemSettingValue(TRMMenuItems, this._menuItemSettingKeyMap.categoryIconPack)
                || this.normalizeTRMMenuItemValue((typeof categoryIconPackId !== "undefined" && categoryIconPackId) || "");

            var iconBaseUrl = this.buildCmsIconPackBaseUrl(assetId);
            if (!iconBaseUrl) {
                // Category is strict: no default and no TRM setting is a misconfiguration.
                console.error("MenuLayout: no category icon pack configured. Set categoryIconPackId in init.js or provide a catagory_icon_pak TRM setting.");
                return;
            }

            $(".feature-card[data-overlay-layer]").each(function () {
                var $card = $(this);
                var layer = parseInt($card.attr("data-overlay-layer"), 10);
                if (isNaN(layer)) {
                    return;
                }

                var $img = $card.find(".card-icon img").first();
                if (!$img.length) {
                    return;
                }

                var iconSrc = iconBaseUrl + "zLayer_" + layer + ".png";
                $img.attr("src", iconSrc);
                $img.attr("data-icon-pack-src", iconSrc);
                // Category is strict: surface load failures instead of silently reverting to a static icon.
                $img.off("error.menu-icon-pack").on("error.menu-icon-pack", function () {
                    console.error("MenuLayout: category icon failed to load:", $(this).attr("src"));
                });
            });

            this._activeCategoryIconPackBaseUrl = iconBaseUrl;
        };
        MenuLayout.prototype.handleMissingTRMAssetZones = function () {
            console.warn("No TRMAssetZones were passed to menuLayout. Dynamic overlays are disabled.");
        };
        MenuLayout.prototype.normalizeTRMAsset = function (asset) {
            var layer = parseInt(asset.layerZOrder, 10);
            var sequence = parseInt(asset.sequence, 10);
            var duration = parseInt(asset.duration, 10);
            var fileType = (asset.fileType || "").toLowerCase();

            return {
                raw: asset,
                layer: isNaN(layer) ? 0 : layer,
                sequence: isNaN(sequence) ? 0 : sequence,
                duration: isNaN(duration) ? 0 : duration,
                fileType: fileType,
                fullPath: asset.fullPath || "",
                elementId: asset.elementId || "",
                cardTitle: asset.zoneName || asset.regionName || "",
                zoneName: asset.zoneName || "",
                regionName: asset.regionName || ""
            };
        };
        MenuLayout.prototype.getGenericSlotLabel = function (slotIndex) {
            return "Category " + (slotIndex + 1);
        };
        MenuLayout.prototype.getLayerLabel = function (layer) {
            return "Layer " + layer;
        };
        MenuLayout.prototype.getTRMInteractiveGroups = function (TRMAssetZones) {
            var _this = this;
            var groupedByLayer = {};

            (Array.isArray(TRMAssetZones) ? TRMAssetZones : [])
                .map(function (asset) { return _this.normalizeTRMAsset(asset); })
                .filter(function (asset) {
                    return asset.layer >= 10 && asset.layer <= 70 && asset.fullPath && (asset.fileType === "image" || asset.fileType === "video" || asset.fileType === "html");
                })
                .forEach(function (asset) {
                    if (!groupedByLayer[asset.layer]) {
                        groupedByLayer[asset.layer] = [];
                    }
                    groupedByLayer[asset.layer].push(asset);
                });

            return Object.keys(groupedByLayer)
                .sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); })
                .map(function (layerKey) {
                    var assets = groupedByLayer[layerKey].sort(function (a, b) {
                        return a.sequence - b.sequence;
                    });

                    return {
                        layer: parseInt(layerKey, 10),
                        title: assets[0].cardTitle || assets[0].zoneName || assets[0].regionName || ("Layer " + layerKey),
                        assets: assets
                    };
                });
        };
        MenuLayout.prototype.getTRMAssetsForLayer = function (TRMAssetZones, layer) {
            var _this = this;
            return (Array.isArray(TRMAssetZones) ? TRMAssetZones : [])
                .map(function (asset) { return _this.normalizeTRMAsset(asset); })
                .filter(function (asset) {
                    return asset.layer === layer && asset.fullPath && (asset.fileType === "image" || asset.fileType === "video" || asset.fileType === "html");
                })
                .sort(function (a, b) { return a.sequence - b.sequence; });
        };
        MenuLayout.prototype.ensureHomeIdleOverlay = function () {
            var $wrapper = $('#target.asset-wrapper');
            if (!$wrapper.length) {
                $wrapper = $('.asset-wrapper').first();
            }
            if (!$wrapper.length) {
                return;
            }

            if ($('#home_idle_overlay').length) {
                return;
            }

            $wrapper.append(
                '<div id="home_idle_overlay" class="home-idle-overlay" data-layer-z-order="80" aria-hidden="true">' +
                    '<div id="home_idle_media" class="cms-media home-idle-media"></div>' +
                '</div>'
            );

            this.bindHomeIdleDismissEvents();
        };
        MenuLayout.prototype.bindHomeIdleDismissEvents = function () {
            var _this = this;
            if (this._homeIdleDismissEventsBound) {
                return;
            }
            this._homeIdleDismissEventsBound = true;

            var dismiss = function (e) {
                if (!_this.isHomeIdleOverlayActive) {
                    return;
                }
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                _this.dismissHomeIdleOverlay(true);
            };

            $(document).off('click.menu-home-idle touchstart.menu-home-idle touchmove.menu-home-idle mousemove.menu-home-idle', '#home_idle_overlay');
            $(document).on('click.menu-home-idle touchstart.menu-home-idle touchmove.menu-home-idle mousemove.menu-home-idle', '#home_idle_overlay', dismiss);
        };
        MenuLayout.prototype.configureHomeIdleContent = function (TRMAssetZones) {
            this.ensureHomeIdleOverlay();

            var idleAssets = this.getTRMAssetsForLayer(TRMAssetZones, this.homeIdleLayer);
            this.homeIdleAssets = idleAssets;

            this.injectTRMAssetsIntoContainer('#home_idle_media', idleAssets);
            if (idleAssets && idleAssets.length) {
                $('#home_idle_media').attr('data-playlist-transition', 'crossFade');
                $('#home_idle_media').attr('data-playlist-transition-ms', '360');
            }

            if (this.isHomeIdleOverlayActive && idleAssets && idleAssets.length) {
                this.startMediaPlaylist($('#home_idle_media'));
            }

            if (!idleAssets || !idleAssets.length) {
                this.dismissHomeIdleOverlay(false);
                this.clearHomeIdleTimer();
                return;
            }

            if ($('.home:visible').length > 0 && $('.page:visible').length === 0) {
                this.startHomeIdleTimer();
            }
        };
        MenuLayout.prototype.clearHomeIdleTimer = function () {
            if (this.homeIdleTimer) {
                clearTimeout(this.homeIdleTimer);
                this.homeIdleTimer = null;
            }
        };
        MenuLayout.prototype.startHomeIdleTimer = function () {
            var _this = this;
            this.clearHomeIdleTimer();

            if (typeof InactivityManager !== 'undefined' && typeof InactivityManager.pause === 'function') {
                // Home idle uses a separate timer/overlay and should never show warning modal.
                InactivityManager.pause();
            }

            if (this.isHomeIdleOverlayActive) {
                return;
            }
            if (!$('.home:visible').length || $('.page:visible').length > 0) {
                return;
            }
            if (!this.homeIdleAssets || !this.homeIdleAssets.length) {
                return;
            }

            this.homeIdleTimer = setTimeout(function () {
                _this.showHomeIdleOverlay();
            }, this.homeIdleDelayMs);
        };
        MenuLayout.prototype.showHomeIdleOverlay = function () {
            if (this.isHomeIdleOverlayActive) {
                return;
            }
            if (!$('.home:visible').length || $('.page:visible').length > 0) {
                return;
            }
            if (!this.homeIdleAssets || !this.homeIdleAssets.length) {
                return;
            }

            this.clearHomeIdleTimer();

            var $overlay = $('#home_idle_overlay');
            var $media = $('#home_idle_media');
            if (!$overlay.length || !$media.length) {
                return;
            }

            if (typeof InactivityManager !== 'undefined' && typeof InactivityManager.pause === 'function') {
                InactivityManager.pause();
            }

            $overlay.addClass('active').attr('aria-hidden', 'false');
            this.isHomeIdleOverlayActive = true;
            this.startMediaPlaylist($media);
        };
        MenuLayout.prototype.dismissHomeIdleOverlay = function (restartTimer) {
            if (restartTimer === void 0) { restartTimer = false; }

            var $overlay = $('#home_idle_overlay');
            var $media = $('#home_idle_media');
            if ($media.length) {
                this.stopMediaPlaylist($media);
            }
            if ($overlay.length) {
                $overlay.removeClass('active').attr('aria-hidden', 'true');
            }

            this.isHomeIdleOverlayActive = false;

            if ($('.home:visible').length > 0 && typeof InactivityManager !== 'undefined' && typeof InactivityManager.pause === 'function') {
                InactivityManager.pause();
            }

            if (restartTimer && $('.home:visible').length > 0 && $('.page:visible').length === 0) {
                this.startHomeIdleTimer();
            }
        };
        MenuLayout.prototype.getOverlaySlotsFromMarkup = function () {
            return $('.feature-card[data-overlay-layer]').get().map(function (card) {
                var $card = $(card);
                return {
                    layer: parseInt($card.attr('data-overlay-layer'), 10),
                    cardElement: card,
                    pageId: $card.attr('data-target-page') || '',
                    mediaSelector: $card.attr('data-media-selector') || ''
                };
            }).filter(function (slot) {
                return !isNaN(slot.layer) && !!slot.cardElement && slot.pageId && slot.mediaSelector;
            }).sort(function (a, b) {
                return a.layer - b.layer;
            });
        };
        MenuLayout.prototype.createTRMMediaElement = function (asset, index) {
            var $media;
            if (asset.fileType === "video") {
                $media = $("<video>");
                $media.attr("src", asset.fullPath);
                $media.attr("muted", "muted");
                $media.attr("playsinline", "playsinline");
                $media.attr("preload", "auto");
            } else if (asset.fileType === "html") {
                $media = $("<div>");
                if (asset.elementId) {
                    $media.attr("id", asset.elementId);
                }
                var $frame = $("<iframe>");
                $frame.attr("src", asset.fullPath);
                $frame.attr("frameborder", "0");
                $frame.attr("scrolling", "no");
                $frame.attr("allowfullscreen", "allowfullscreen");
                $media.append($frame);
            } else {
                $media = $("<img>");
                $media.attr("src", asset.fullPath);
            }

            $media.attr({
                "data-media-item": "true",
                "data-playlist-item": "true",
                "data-order": asset.sequence,
                "data-duration": asset.duration,
                "data-media-index": index,
                "data-media-type": asset.fileType,
                "data-playing": "false"
            });

            return $media;
        };
        MenuLayout.prototype.getPlaylistMediaElements = function ($container) {
            var $items = $container.children("[data-media-item='true']");
            if ($items.length) {
                return $items;
            }
            return $container.children("img, video");
        };
        MenuLayout.prototype.getPlaylistManager = function ($container, createIfMissing) {
            if (typeof window.getPlaylistManager !== "function") {
                return $container.data("playlistManager") || null;
            }

            return window.getPlaylistManager($container, {
                createIfMissing: !!createIfMissing
            });
        };
        MenuLayout.prototype.stopMediaPlaylist = function ($container) {
            if (typeof window.endPlaylist === "function") {
                window.endPlaylist($container, { keepFirstVisible: false });
                return;
            }

            this.getPlaylistMediaElements($container).each(function () {
                $(this).attr("data-playing", "false").removeClass("is-active").hide().css("opacity", 0);
            });
        };
        MenuLayout.prototype.startMediaPlaylist = function ($container) {
            if (!$container.attr("data-playlist-transition")) {
                $container.attr("data-playlist-transition", "crossFade");
            }
            if (!$container.attr("data-playlist-transition-ms")) {
                $container.attr("data-playlist-transition-ms", "360");
            }

            if (typeof window.startPlaylist === "function") {
                window.startPlaylist($container, {
                    duration: 6000,
                    transition: $container.attr("data-playlist-transition") || "crossFade",
                    transitionDurationMs: parseInt($container.attr("data-playlist-transition-ms"), 10) || 360,
                    preloadDelayMs: 500
                });
                return;
            }

            var manager = this.getPlaylistManager($container, true);
            if (manager) {
                manager.refresh();
                manager.start({ reset: true });
            }
        };
        MenuLayout.prototype.injectTRMAssetsIntoContainer = function (containerSelector, assets) {
            var _this = this;
            var $container = $(containerSelector);
            if (!$container.length) {
                return;
            }

            this.stopMediaPlaylist($container);
            $container.empty();

            if (!assets || !assets.length) {
                $container.removeAttr("data-media-injected data-playlist-item-count data-playlist-total-ms data-playlist-playing");
                return;
            }

            $container.attr("data-media-injected", "true");
            assets.forEach(function (asset, index) {
                $container.append(_this.createTRMMediaElement(asset, index));
            });
            this.getPlaylistMediaElements($container).each(function (index) {
                var $item = $(this);
                if (index === 0) {
                    $item.addClass("is-active").show().css("opacity", 1);
                    return;
                }
                $item.removeClass("is-active").hide().css("opacity", 0);
            });
        };
        MenuLayout.prototype.resetOverlaySlot = function (slot) {
            var $card = $(slot.cardElement);
            var $label = $card.find(".card-label");
            var genericLabel = this.getLayerLabel(slot.layer);

            $card.hide();
            $card.removeAttr("data-target-page data-layer-z-order data-overlay-enabled");
            if ($label.length) {
                $label.html(genericLabel);
            }
            this.injectTRMAssetsIntoContainer(slot.mediaSelector, []);
        };
        MenuLayout.prototype.applyOverlayGroupToSlot = function (slot, group) {
            var $card = $(slot.cardElement);
            var $label = $card.find(".card-label");
            var title = (group && group.title ? String(group.title) : "").trim();
            var resolvedTitle = title || this.getLayerLabel(slot.layer);

            if (!$card.length) {
                return;
            }

            if ($label.length) {
                $label.html(resolvedTitle);
            }

            $card.attr("data-target-page", slot.pageId);
            $card.attr("data-layer-z-order", group.layer);
            $card.attr("data-overlay-enabled", "true");
            $card.show();

            this.injectTRMAssetsIntoContainer(slot.mediaSelector, group.assets);
        };
        MenuLayout.prototype.buildTRMInteractiveLayout = function (TRMAssetZones) {
            var _this = this;
            this.configureHomeIdleContent(TRMAssetZones);

            if(!TRMAssetZones || !TRMAssetZones.length) {
                console.warn("No TRM asset zones provided.");
                return;
            }
            var interactiveGroups = this.getTRMInteractiveGroups(TRMAssetZones);
            var slots = this.getOverlaySlotsFromMarkup().slice(0, 6);
            var groupsByLayer = {};

            interactiveGroups.forEach(function (group) {
                groupsByLayer[group.layer] = group;
            });

            if (!slots.length) {
                console.warn("No overlay slot markup found. Add data-overlay-layer, data-target-page, and data-media-selector to feature cards.");
                return;
            }

            slots.forEach(function (slot) {
                var group = groupsByLayer[slot.layer];
                if (!group) {
                    _this.resetOverlaySlot(slot);
                    return;
                }
                _this.applyOverlayGroupToSlot(slot, group);
            });

            if (!interactiveGroups.length) {
                this.handleMissingTRMAssetZones();
            }
        };
        MenuLayout.prototype.startMediaPlaylistsForPage = function (pageId) {
            var $page = pageId ? $('#' + pageId) : $('.page:visible');
            if (!$page.length) {
                return;
            }

            var _this = this;
            $page.find("[data-media-injected='true']").each(function () {
                _this.startMediaPlaylist($(this));
            });

            if (typeof InactivityManager === 'undefined') {
                return;
            }

            var totalPlaylistDurationMs = 0;
            $page.find("[data-media-injected='true']").each(function () {
                var durationValue = parseInt($(this).attr("data-playlist-total-ms"), 10);
                if (!isNaN(durationValue) && durationValue > 0) {
                    totalPlaylistDurationMs += durationValue;
                }
            });

            if (totalPlaylistDurationMs > 0) {
                var extensionMs = totalPlaylistDurationMs + 2000;
                if (typeof InactivityManager.extend === 'function') {
                    InactivityManager.extend(extensionMs);
                } else if (typeof InactivityManager.reset === 'function') {
                    InactivityManager.reset();
                }
            }
        };
        MenuLayout.prototype.stopAllMediaPlaylists = function () {
            var _this = this;
            $("[data-media-injected='true']").each(function () {
                _this.stopMediaPlaylist($(this));
            });
        };
        MenuLayout.prototype.handleLayout = function (IMSSettings) {
            var _this = this;
            // Set up navigation buttons
            this.setupNavigationButtons();

            $(document).off('click.dynamic-overlay', '.feature-card[data-overlay-enabled="true"]');
            $(document).on('click.dynamic-overlay', '.feature-card[data-overlay-enabled="true"]', function (e) {
                e.stopPropagation();
                var targetPage = $(this).attr('data-target-page');
                if (!targetPage) {
                    return;
                }
                _this.navigateToPage(targetPage);
            });

            return true;
        };
        MenuLayout.prototype.handleProducts = function (IMSProducts) {
            var _this = this;
            if (!IMSProducts || IMSProducts.length === 0) {
                return;
            }
        };
        MenuLayout.prototype.fillDynamic = function (IMSItems, integrationItems) {
            console.log("fillDynamic: Ready for static promotional content");
        };
        MenuLayout.prototype.clearMenuItems = function (zone) {
            var containers = $(zone).get();
            containers.forEach(function (container) {
                while (container.hasChildNodes()) {
                    container.removeChild(container.lastChild);
                }
            });
        };

        MenuLayout.prototype.initInactivityManager = function () {
            var _this = this;

            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.init({
                    warningDelay: 30000,
                    countdownDuration: 10000,
                    nutritionExtension: 30000,
                    activityEvents: ['click', 'touchstart', 'touchmove', 'mousemove'],
                    shouldTrackActivity: function () {
                        return $('.home:visible').length === 0;
                    },
                    onTimeout: function () {
                        _this.returnHome();
                    },
                    onReset: function () {
                        // Timer reset silently
                    },
                    onWarning: function () {
                        // Warning shown silently
                    }
                });

                // Pause immediately since we start on the home screen
                InactivityManager.pause();
                this.startHomeIdleTimer();
            } else {
                console.error('InactivityManager not found');
            }

            // Listen for activity forwarded from embedded assets (e.g. brandManager iframe).
            this.bindFrameActivityBridge();
        };

        // Receives activity/extend messages from child iframes so the single
        // parent InactivityManager stays alive while a user interacts inside an asset.
        MenuLayout.prototype.bindFrameActivityBridge = function () {
            var _this = this;
            if (this._frameBridgeBound) {
                return;
            }
            this._frameBridgeBound = true;

            window.addEventListener('message', function (event) {
                var data = event && event.data;
                if (!data || typeof data !== 'object' || data.source !== 'brandManager') {
                    return;
                }
                if (typeof InactivityManager === 'undefined') {
                    return;
                }

                if (_this.isHomeIdleOverlayActive && (data.type === 'trm:activity' || data.type === 'trm:extend')) {
                    _this.dismissHomeIdleOverlay(true);
                    return;
                }

                // Mirror the manager's own shouldTrackActivity gate: ignore while on home.
                if ($('.home:visible').length > 0) {
                    return;
                }
                if (data.type === 'trm:activity') {
                    if (typeof InactivityManager.reset === 'function') {
                        InactivityManager.reset();
                    }
                } else if (data.type === 'trm:extend') {
                    if (typeof InactivityManager.extend === 'function') {
                        InactivityManager.extend(data.ms);
                    } else if (typeof InactivityManager.reset === 'function') {
                        InactivityManager.reset();
                    }
                }
            });
        };

        // Tell embedded assets to reset their internal views (close modals, go home).
        // Pass a jQuery scope to target only frames within specific pages; omit to reset all.
        MenuLayout.prototype.resetChildFrames = function ($scope) {
            var $frames = ($scope && $scope.length) ? $scope.find('iframe') : $('iframe');
            $frames.each(function () {
                try {
                    this.contentWindow.postMessage({ source: 'eurestParent', type: 'trm:reset' }, '*');
                } catch (e) {
                    /* cross-origin or not ready: ignore */
                }
            });
        };

        MenuLayout.prototype.returnHome = function () {
            var _this = this;

            this.stopAllMediaPlaylists();
            this.dismissHomeIdleOverlay(false);

            // Tell embedded assets to reset before we hide everything.
            this.resetChildFrames();

            $('.page').hide();
            $('.home').show();

            this.navigationHistory = [];

            this.updateNavigationButtons();

            window.scrollTo(0, 0);
            
            // Pause inactivity timer when on home screen
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.pause();
            }

            this.startHomeIdleTimer();
        };

        MenuLayout.prototype.setupNavigationButtons = function () {
            var _this = this;

            // Home button - returns to welcome screen from weekly menu
            $(document).off('click.menu-layout-home', '.floating-nav-home');
            $(document).on('click.menu-layout-home', '.floating-nav-home', function (e) {
                e.stopPropagation();
                _this.navigateToWelcome();
            });

            // Edge back button - returns to menu selection from brand pages
            $(document).off('click.menu-layout-back', '.edge-nav-back');
            $(document).on('click.menu-layout-back', '.edge-nav-back', function (e) {
                e.stopPropagation();
                _this.navigateBack();
            });

        };

        MenuLayout.prototype.navigateToPage = function (pageId) {
            var currentPage = $('.page:visible').attr('id');

            this.dismissHomeIdleOverlay(false);
            this.clearHomeIdleTimer();

            // Add current page to history if there's one visible
            if (currentPage) {
                this.navigationHistory.push(currentPage);
            } else {
                // Coming from welcome screen
                this.navigationHistory = [];
            }

            // Reset embedded assets on the page(s) we're leaving (not the target).
            this.resetChildFrames($('.page:visible'));

            // Hide all pages and welcome screen
            this.stopAllMediaPlaylists();
            $('.page').hide();
            $('.home').hide();

            // Show the target page
            $('#' + pageId).show();

            this.startMediaPlaylistsForPage(pageId);

            // Reset scroll position of the page we're navigating TO
            $('#' + pageId + ' .section-wrapper').scrollTop(0);
            $('#' + pageId + ' .brand-list').scrollTop(0);
            window.scrollTo(0, 0);

            // Update navigation buttons
            this.updateNavigationButtons();

            // Resume inactivity timer when navigating away from home
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.resume();
            }
        };

        MenuLayout.prototype.navigateBack = function () {
            if (this.navigationHistory.length > 0) {
                // Get previous page
                var previousPage = this.navigationHistory.pop();

                // Reset embedded assets on the page we're leaving.
                this.resetChildFrames($('.page:visible'));

                // Hide current page
                this.stopAllMediaPlaylists();
                $('.page').hide();

                // Show previous page
                $('#' + previousPage).show();

                this.startMediaPlaylistsForPage(previousPage);

                // Update navigation buttons
                this.updateNavigationButtons();

                // Scroll to top
                window.scrollTo(0, 0);

                this.clearHomeIdleTimer();
            }
        };

        MenuLayout.prototype.navigateToWelcome = function () {
            // Reset embedded assets before leaving the brand experience.
            this.resetChildFrames();

            // Hide all pages
            this.stopAllMediaPlaylists();
            $('.page').hide();

            this.dismissHomeIdleOverlay(false);

            // Show welcome screen
            $('.home').show();

            // Clear navigation history
            this.navigationHistory = [];

            // Update navigation buttons
            this.updateNavigationButtons();

            // Pause inactivity timer when on home screen
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.pause();
            }

            this.startHomeIdleTimer();

            // Scroll to top
            window.scrollTo(0, 0);
        };

        MenuLayout.prototype.updateNavigationButtons = function () {
            var currentPage = $('.page:visible').attr('id');
            var isOnWelcome = $('.home:visible').length > 0;

            // Hide all floating nav buttons first
            $('.floating-nav-back, .floating-nav-home').hide();

            if (isOnWelcome) {
                // On welcome screen - no navigation buttons
                return;
            }

            if (currentPage) {
                // On any non-home page - show home button
                $('.floating-nav-home').show();
            }
        };

        MenuLayout.prototype.rotateEles = function () {
            if (this.isRotating) { return; }

            //**rotate menu zones*/
            // rotateZones($("#zone_one"), {
            //     delay: 1,
            //     cycle: 8,
            //     fill: 'packed',
            //     transition: 'fade'
            // });

            //**rotate entire menu section - full screen */
            // rotateMenus("#zone_one", {
            //     delay: 1,
            //     cycle: 8,
            //     transition: 'fade'
            // });

            this.isRotating = true;
            return;
        };
        //Date: 02.01.2025 adjusted for new trm playing logic
        MenuLayout.prototype.trmAnimate = function (playing, firstRun) {
            //called with playing each time asset plays in digital client. _this is accessible
            var _this = this;
            //handle first run tasks and non-playlist observer actions
            if (firstRun) {
                //setup observer
                animate();
                $("video").on("ended", animate);
                if (isCF || platform === "windows") {
                    document.reloadAsset = function () { animate(); };
                }
                return;
            }
            //handle playing messages

            if (playing && _this.playlist) {
                //add observer back if removed so video can loop if duration is > video length
                $("video").on("ended", animate)
                animate();
            }
            if (!playing) {
                //clear any observers if asset in a playlist
                $("video").off("ended")
                _this.playlist = true;

                //exiting actions
            }
            //set up aniumation functions
            function clearAllTimeouts() {
                _this.timeOuts.forEach(function (timeout) {
                    clearTimeout(timeout);
                });
            }

            function animate() {
                //simulate video loop
                $('video').each(function () {
                    this.play();
                });

                //playing actions
            }
        };
        MenuLayout.prototype.injectPricing = function (IMSProducts, IMSSettings) {
            var _this = this;
            if (!IMSProducts || IMSProducts.length === 0) {
                return;
            }
            IMSProducts.forEach(function (each) {
                if (each.productId && each.price && each.active) {
                    $(".Cost-" + each.productId).html(each.price);
                    $(".Cost-" + each.productId).attr("title", "PID: " + each.productId);
                    $(".Cost-" + each.productId).addClass(each.ApiSource);
                } else {
                    var error = Mustache.to_html(MenuLayout.error, each);
                    $(".Cost-" + each.productId).html(error);
                    $(".Cost-" + each.productId + " .material-icons").attr("title", "PID: " + each.productId).css("cursor", "wait");
                }
                if (each.productId && each.calorie) {
                    $(".Calories-" + each.productId).html(each.calorie);
                    $(".Calories-" + each.productId).addClass("ims");
                    $(".Calories-" + each.productId).attr("title", "PID: " + each.productId);
                } else {
                    var error = Mustache.to_html(MenuLayout.error, each);
                    $(".Calories-" + each.productId).html(error);
                    $(".Calories-" + each.productId + " .material-icons").attr("title", "PID: " + each.productId).css("cursor", "wait");
                }
                if (each.productId && each.displayName) {
                    $(".Name-" + each.productId).html(each.displayName);
                } else {
                    var error = Mustache.to_html(MenuLayout.error, each);
                    $(".Name-" + each.productId).html(error);
                }
                if (each.productId && each.menuDescription) {
                    $(".Desc-" + each.productId).html(each.menuDescription);
                } else {
                    //do nothing
                }
                if (each.productId && !each.enabled && each.ApiSource) {
                    $(".Cost-" + each.productId).attr("active", "false");
                    $(".Item-" + each.productId).hide();
                } else {
                    $(".Cost-" + each.productId).attr("active", "true");
                    $(".Item-" + each.productId).show();
                }
                if (each.productId && each.outOfStock) {
                    $(".ItemOOS-" + each.productId).css("opacity", "0");
                } else {
                    $(".ItemOOS-" + each.productId).css("opacity", "");
                }
            });
        };
        MenuLayout.COST = '{{dollars}}<span class="cents ">{{cents}}</span>';
        MenuLayout.error = '<span class="material-icons ">error</span>';
        MenuLayout.zoneError = `
        <div title="{{station}} {{message}}" class="menu-item-wrapper inline error-wrapper">
            <div class="item-wrapper">
                <span class="desc"><span class="material-icons" style="margin-right: 5px; vertical-align: top;">error</span>No menu found for {{station}}</span>
            </div>
        </div>`;
        return MenuLayout;
    })();
    IMSintegration.MenuLayout = MenuLayout;
})(IMSintegration || (IMSintegration = {}));
