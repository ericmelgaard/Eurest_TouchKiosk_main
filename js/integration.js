//Publisher: Wand Digital
//Date: 06.22.2026
//Version: 65.0
var IMSintegration;
(wandDigital => {
    var Integration = (() => {
        class Integration {
            constructor(isLeader, isUsingIndexedDB) {
                this.TABLE_NAME = "";
                this.apiKey = "";
                this.lastSync;
                this.minUpdate = 600000; //10 min
                this.maxUpdate = 1800000; //30 min
                this.integrationUpdateInterval = this.maxUpdate;
                this.settingsMinUpdate = 900000; //15 min
                this.settingsMaxUpdate = 3600000; //60 min
                this.IMSminUpdate = 3600000; //60 min
                this.IMSmaxUpdate = 7200000; //120 min
                this.fallbackInterval = 2000;
                this.IMS_TimeOuts = [];
                this.Integration_TimeOuts = [];
                this.setting_TimeOuts = [];
                this.IMSUpdateCount = 0; //update que counter
                this.app = app;
                this.websocket = null;
                this.updateQueue = null;
                this.settings = [];
                this.brand = "";
                this.establishment = "";
                this.trmStoreId = "";
                this.store = "";
                this.API = "";
                this.business_unit = "";
                this.location = "";
                this.webtritionRequestQueue = Promise.resolve();
                this.webtritionPageSize = typeof webtritionPageSize !== "undefined" && parseInt(webtritionPageSize, 10) > 0
                    ? parseInt(webtritionPageSize, 10)
                    : 1000;
                this.imsItemsUpdateInterval =
                    Math.floor(Math.random() * (this.IMSmaxUpdate - this.IMSminUpdate + 1)) + this.IMSminUpdate;
                this.trmUpdateInterval =
                    Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000; // 5–10 min
                this.imsSettingsUpdateInterval =
                    Math.floor(Math.random() * (this.settingsMaxUpdate - this.settingsMinUpdate + 1)) + this.settingsMinUpdate;
                this.db = null;
                this.attempts = 0; // exponential retries limit since expectin 204s
                this.settingsRetries = 2; // hard limit
                this.imsRetries = 3; // hard limit

                var environmentConfig = typeof window.getWandEnvironmentConfig === "function"
                    ? window.getWandEnvironmentConfig()
                    : {
                        apiHost: "api.wanddigital.com",
                        orderStatusHost: "orderstatus-prod.wanddigital.com"
                    };

                this.orderStatus = environmentConfig.orderStatusHost;
                this.IMSwand = "https://" + environmentConfig.apiHost;
                this.wand = environmentConfig.apiHost;


                this.init(isLeader, isUsingIndexedDB);
            }

            init(isLeader, isUsingIndexedDB) {
                const _this = this;

                if ($(".loading").length === 0) {
                    var loading = Mustache.to_html(Integration.loading);
                    $("body").append(loading);
                } else {
                    $(".loading").remove()
                    var loading = Mustache.to_html(Integration.loading);
                    $("body").append(loading);
                }

                //inform.. no action
                if (development && !isPreview) {
                    _this.showConnect(true, "black", "devmode", "Development Mode", "error_outline");
                }
                //future action with dummy data
                if (isPreview) { }

                //confirm whitelisting in place
                if (isLeader) {
                    this.checkConnections();
                    //future action to warn offline and menus not up to date    
                }

                //store key must exist
                _this.getKeys().then(() => {
                    _this.TABLE_NAME = "IMS_" + _this.store + "(" + version + ")"
                    _this.getStartMethod(isLeader, isUsingIndexedDB);
                });

                ///populate TRM data for use in assets
                _this.getTrmData();
            }

            getKeys() {
                const _this = this;
                let attempts = 0;
                //windows forces complexity and promise use..
                return new Promise((resolve, reject) => {
                    function queryKeys() {
                        if (!development && !isPreview) {
                            _this.store = AssetConfiguration.SKey || $("#storeKey").text().trim().toLowerCase();
                            _this.apiKey = $("#apiKey").text().trim().toLowerCase() || settingKey;
                            //remove after windows dies
                            if (platform === "windows" && _this.store.length && _this.apiKey.length) {
                                //dev mode
                                if (devSiteKeys.includes(_this.store)) {
                                    AssetConfiguration.Daypart = Daypart_Name || AssetConfiguration.Daypart || $(window.frameElement.parentElement).parent().attr("trm-daypart");
                                    _this.store = Store_Key || AssetConfiguration.SKey;
                                    _this.showConnect(true, "black", "devmode", "Development Mode", "error_outline");
                                    _this.apiKey = apiKey || settingKey || $("#apiKey").text().trim().toLowerCase();
                                    development = true;
                                } else {
                                    const trmEle = $(window.frameElement.parentElement).parent();
                                    const trmDaypart = $(trmEle).attr("trm-daypart");
                                    AssetConfiguration.Daypart = AssetConfiguration.Daypart || trmDaypart;
                                    _this.showConnect(false, "black", "devmode", "Development Mode", "error_outline");
                                }
                            }
                        } else {
                            _this.store = Store_Key || AssetConfiguration.SKey || $("#storeKey").text().trim().toLowerCase();
                            _this.apiKey = apiKey || settingKey || $("#apiKey").text().trim().toLowerCase();
                        }
                        if ((_this.apiKey.length === 0 && isUsingSettings) || !_this.store) {
                            if (!_this.store) {
                                if (!attempts) {
                                    console.warn("Looking for store key...");
                                    _this.showConnect(true, "darkgrey", "initStore", "Store key is missing", "error");
                                }
                            } else {
                                _this.showConnect(false, "darkgrey", "initStore");
                            }
                            if (_this.apiKey.length === 0 && isUsingSettings) {
                                if (!attempts) {
                                    console.warn("Looking for API key...");
                                    _this.showConnect(true, "grey", "initAPI", "API key is missing", "error");
                                }
                            } else {
                                _this.showConnect(false, "grey", "initAPI");
                            }
                            attempts++;
                            setTimeout(queryKeys, 250);
                        } else {
                            _this.showConnect(false, "darkgrey", "initStore");
                            _this.showConnect(false, "grey", "initAPI");
                            resolve();
                        }
                    }
                    queryKeys();
                });
            }

            getStartMethod(isLeader, isUsingIndexedDB) {
                const _this = this;
                let trmAnchors = JSON.parse(self.localStorage.getItem(_this.store + "_" + "anchors" + "(" + version + ")")) || null;
                let trmConfigs = JSON.parse(self.localStorage.getItem(_this.store + "_" + "store_context" + "(" + version + ")")) || null;

                if (trmConfigs && trmConfigs.indexedDB !== isUsingIndexedDB) {
                    //off chance a device upgrades version past threshold of v70
                    trmConfigs = null;
                }

                if (trmConfigs) {
                    //make cached values avialable for cached start
                    this.setconfigs(trmConfigs);
                }

                if (trmAnchors && Object.keys(trmAnchors).length > 1) {
                    if (trmAnchors.IMS) {
                        //IMS and Settings: should load menu - cached start
                        $(".loading").remove();
                        $(".asset-wrapper").removeClass("blur");
                        trmAnchors = true;
                    } else {
                        //Settings and API: should not load - but still cached start since API update isn't enough alone for full start
                        trmAnchors = true;
                    }
                } else if (trmAnchors && Object.keys(trmAnchors).length === 1) {
                    //Settings only: should not load and go full start
                    trmAnchors = null;
                }

                if (isUsingIndexedDB) {
                    _this.openDatabase().then(() => {
                        if (trmAnchors && trmConfigs) {
                            if (isLeader) {
                                _this.cached_start(isUsingIndexedDB);
                            } else {
                                _this.observer_cachedStart(isUsingIndexedDB);
                            }
                        } else {
                            if (isLeader) {
                                _this.full_start(isUsingIndexedDB);
                            } else {
                                _this.observer_fullstart(isUsingIndexedDB);
                            }
                        }
                        //dont stack instances on each other!
                        if (!_this.websocket) {
                            _this.websocket = _this.connectWebsocket();
                        }
                        if (!_this.updateQueue) {
                            _this.updateQueue = _this.IMSUpdateQueue();
                        }
                    }).catch(error => {
                        console.error("Failed to open database:", error);
                    });
                } else {
                    if (isLeader) {
                        if (trmAnchors && trmConfigs) {
                            _this.cached_start(isUsingIndexedDB);
                        } else {
                            _this.full_start(isUsingIndexedDB);
                        }
                        if (!_this.websocket) {
                            _this.websocket = _this.connectWebsocket();
                        }
                        if (!_this.updateQueue) {
                            _this.updateQueue = _this.IMSUpdateQueue();
                        }
                    } else {
                        if (trmAnchors && trmConfigs) {
                            _this.observer_cachedStart(isUsingIndexedDB);
                        } else {
                            _this.observer_fullstart(isUsingIndexedDB);
                        }
                    }
                }
            }



            checkConnections() {
                const _this = this;
                //Status Checks
                function checkConnection(url, source, color) {
                    fetch(url)
                        .then(response => {
                            if (response.ok) {
                                // Connection restored - remove error if present
                                if ($(".full-screen-error-wrapper." + source).length > 0) {
                                    const obj = {
                                        "issue": "Connection Restored",
                                        "source": source,
                                        "detail": "Connectivity to " + "https://" + source + ".com" + " has been restored."
                                    };
                                    const connect = Mustache.to_html(FULLSCREENERROR, obj);
                                    $(".full-screen-error-wrapper." + source).replaceWith(connect);
                                    if (leader) {
                                        setTimeout(() => {
                                            self.localStorage.removeItem(heartbeatKey);
                                            location.reload();
                                        }, 5000);
                                    }
                                }
                                _this.showConnect(false, "black", source);
                            } else {
                                handleConnectionError(url, source, color);
                            }
                        })
                        .catch(error => {
                            handleConnectionError(url, source, color);
                        });
                }

                function handleConnectionError(url, source, color) {
                    // Check if error already displayed to avoid duplicates
                    if ($(".full-screen-error-wrapper." + source).length > 0) {
                        // Already showing error, just retry
                        setTimeout(() => {
                            checkConnection(url, source, color);
                        }, 30000);
                        return;
                    }

                    const obj = {
                        "issue": "Connection Issue",
                        "source": source,
                        "detail": "https://" + source + ".com" + " is not responding"
                    };
                    _this.showConnect(true, color, source, url.split(".com/")[0] + ".com/ is not accessible", "warning");
                    const connect = Mustache.to_html(FULLSCREENERROR, obj);
                    $(".loading").replaceWith(connect);

                    // Retry after 30 seconds
                    setTimeout(() => {
                        checkConnection(url, source, color);
                    }, 30000);
                }

                checkConnection('https://trm-client01.wandcorp.com/Trm.Api.Webservices.1412/json/reply/DefaultRequest', "wandcorp", "#f8b02d");
                checkConnection('https://api.wanddigital.com/defaultrequest', "wanddigital", "#b12228");
            }

            removeDuplicates(originalArray, objKey) {
                //for Qu basically.. would like to address API side.
                let trimmedArray = [];
                const values = {};

                for (let i = 0; i < originalArray.length; i++) {
                    const value = originalArray[i][objKey];
                    const price = originalArray[i].price;

                    if (values[value] !== undefined) {
                        // Remove the previously seen item
                        trimmedArray = trimmedArray.filter(item => item[objKey] !== value);

                        // If the current item has a price of 0, skip adding it
                        if (price === 0) {
                            continue;
                        }
                    }

                    // If the current item does not have a price of 0, remove the previously added item with price 0
                    if (price !== 0 && values[value] === 0) {
                        trimmedArray = trimmedArray.filter(item => item[objKey] !== value || item.price !== 0);
                    }

                    trimmedArray.push(originalArray[i]);
                    values[value] = price;
                }
                return trimmedArray;
            }

            updateConfigs(settings) {
                const _this = this;

                return new Promise((resolve, reject) => {
                    try {
                        const configsObj = {};
                        settings.forEach(each => {
                            if (typeof settingId_PartnerAPI === "string") {
                                // If it's a string, use it directly as the API value
                                configsObj.API = settingId_PartnerAPI.trim().toLowerCase();
                            } else if (Array.isArray(settingId_PartnerAPI) && settingId_PartnerAPI.indexOf(each.settingID) > -1) {
                                // If it's an array (object), match to setting value
                                configsObj.API = each.value.trim().toLowerCase();
                            }
                            if (settingId_PartnerSite.indexOf(each.settingID) > -1) {
                                configsObj.siteId = each.value.trim().toLowerCase();
                            }
                            if (settingsId_Brand.indexOf(each.settingID) > -1) {
                                configsObj.brand = each.value.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
                            }
                        });

                        if (development || isPreview) {
                            configsObj.API = Partner_API ? Partner_API.toLowerCase() : configsObj.API;
                            configsObj.siteId = Establishment ? Establishment.toLowerCase() : configsObj.siteId;
                            configsObj.brand = Brand ? Brand.toLowerCase() : configsObj.brand;
                        }

                        //catch no settings values and set defaults
                        if (!configsObj.API) { configsObj.API = "ims"; }
                        //allow webt business_unit and location override if no settings exist.
                        if (!configsObj.brand && configsObj.API) { configsObj.brand = staticBusinessUnit; }
                        if (!configsObj.siteId && configsObj.API) { configsObj.siteId = staticLocation; }

                        // watch for webos versions upgrades and changing of database use
                        configsObj.indexedDB = isUsingIndexedDB ? true : false;

                        _this.setconfigs(configsObj);
                        // Check for integration updates
                        const previous = self.localStorage.getItem(_this.store + "_" + "store_context" + "(" + version + ")") || null;
                        if (previous !== JSON.stringify(configsObj)) {
                            // Important
                            if (previous) {
                                console.log("Integration change detected...");
                                _this.deleteAnchors();
                                _this.getIntegrationData("update");
                            } else {
                                //first run
                            }
                        }

                        self.localStorage.setItem(_this.store + "_" + "store_context" + "(" + version + ")", JSON.stringify(configsObj));

                        resolve(configsObj);
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            setconfigs(configsObj) {
                const _this = this;
                if (!configsObj) {
                    return;
                }
                this.brand = configsObj.brand;
                this.establishment = configsObj.siteId;
                this.API = configsObj.API;

                //webt support 04.04.2025
                _this.business_unit = _this.business_unit ? _this.business_unit : this.brand;
                _this.location = _this.location ? _this.location : this.establishment;

                // No change for dev
                this.trmStoreId = AssetConfiguration.SId;
            }

            cached_start() {
                const _this = this;
                if (isUsingIndexedDB) {
                    _this.app.db = _this.db;
                }
                _this.app.store = _this.store;
                _this.app.init(_this.API, false);
                _this.getSettings();
                _this.getIMSData(false);
                if (_this.API != "ims" || _this.API != "trm") {
                    _this.getIntegrationData("patch");
                }
            }

            observer_fullstart() {
                const _this = this;
                //start but do not get data
                if (isUsingIndexedDB) {
                    _this.app.db = _this.db;
                }
                _this.app.store = _this.store;

                _this.app.init(_this.API, true);
            }

            observer_cachedStart() {
                const _this = this;
                //start but do not get data

                if (isUsingIndexedDB) {
                    _this.app.db = _this.db;
                }
                _this.app.store = _this.store;
                _this.app.init(_this.API, false);
            }

            full_start() {
                const _this = this;
                // Start with empty or changed databases
                _this.getSettings().then(() => {
                    if (isUsingIndexedDB) {
                        _this.app.db = _this.db;
                    }
                    _this.app.store = _this.store;
                    _this.app.init(_this.API, true);
                    _this.getIMSData(true);
                    if (_this.API != "ims" && _this.API != "trm") {
                        _this.getIntegrationData("update");
                    }
                }).catch(error => {
                    console.error("Failed to sync settings:", error);
                    setTimeout(() => {
                        _this.full_start();
                    }, _this.imsSettingsUpdateInterval);
                });
            }

            new_leader() {
                const _this = this;
                //new leader established, assume fresh calls are needed
                _this.getSettings();
                _this.getIMSData(true);
                if (_this.API != "ims" && _this.API != "trm") {
                    _this.getIntegrationData("patch");
                }
                if (!_this.websocket) {
                    _this.websocket = _this.connectWebsocket();
                }
                if (!_this.updateQueue) {
                    _this.updateQueue = _this.IMSUpdateQueue();
                }
            }

            openDatabase() {
                const _this = this;

                if (!_this.db) {
                    _this.db = new Dexie(_this.TABLE_NAME);
                }

                // Function to initialize database.. 
                function initializeDatabase() {
                    const db = _this.db;

                    // Define schema and versions as per your control
                    _this.db.version(version).stores({
                        IMS_settings: "settingID, setting, value",
                        IMS_products: "productId, productName, externalId, categoryId, subCategoryId, price",
                        IMS_menuItems: "menuItemId, menuZoneName, imsDaypartName, day",
                        TRM_assetZones: "azId, assetId, layerZOrder, zoneName",
                        TRM_menuItems: "id, name, value",
                        integration_products: "mappingId, name, category, price",
                        integration_modifiers: "mappingId, name, category, price",
                        integration_discounts: "mappingId, name, price",
                    });

                    return db.open().then(() => {
                        //no message
                    }).catch(error => {
                        if (error.name === 'NotFoundError' || error.name === 'VersionError') {
                            console.warn('Upgrade error detected. Needs upgrade.');
                            throw error; // Rethrow to handle in the outer Promise
                        } else {
                            console.error('Error opening database:', error.message);
                            throw error; // Rethrow to handle in the outer Promise
                        }
                    });
                }

                //handle a close.. not sure where it come from
                _this.db.on("close", () => {
                    _this.openDatabase().then(() => {
                        _this.app.db = _this.db;
                    })
                })

                return initializeDatabase().then(() => {
                    //no action
                }).catch(error => {
                    console.error('Failed to initialize and upgrade database:', error);
                    isUsingIndexedDB = false;
                    _this.init(true, false)
                    console.warn("IndexedDB is not available, switching to localStorage.");
                });
            }

            getSettings() {
                const _this = this;
                if (!leader) {
                    return;
                }

                _this.setting_TimeOuts.forEach(each => {
                    clearTimeout(each);
                });

                // Return a promise
                return new Promise((resolve, reject) => {
                    if (!isUsingSettings) {
                        resolve();
                        return;
                    }

                    function fetchSettings(retries) {
                        const url = `https://trm-client01.wandcorp.com/trmws.digitalproxyws/json/reply/StoreSettingsRequest?apiKey=${_this.apiKey}&deviceNumber=&storeKey=${_this.store}`;

                        $.get(url)
                            .done(data => {
                                _this.addSettings(data).then(() => {
                                    resolve();
                                    _this.setSync("settings");
                                    _this.showConnect(false, "steelblue", "settings");
                                    _this.setting_TimeOuts.push(setTimeout(() => {
                                        _this.getSettings();
                                    }, _this.imsSettingsUpdateInterval));
                                }).catch(error => {
                                    console.error("Error in addSettings:", error);
                                    reject(error);
                                });
                            })
                            .fail(() => {
                                console.warn("Could not load settings data!");
                                if (retries > 0) {
                                    console.log("Retrying... Remaining retries:", retries);
                                    setTimeout(() => {
                                        fetchSettings(retries - 1);
                                    }, 30000);
                                } else {
                                    _this.setting_TimeOuts.push(setTimeout(() => {
                                        _this.getSettings();
                                    }, _this.imsSettingsUpdateInterval));
                                    _this.showConnect(true, "steelblue", "settings", "Failed to sync settings", "error");
                                    reject(new Error("Failed to load settings data after retries."));
                                }
                            });
                    }

                    fetchSettings(_this.settingsRetries);
                });

            }

            forceIMSUpdate(table, item, action) {
                const _this = this;
                window.dispatchEvent(new CustomEvent('dbChangeEvent', {
                    detail: {
                        table: table,
                        item: item,
                        action: action
                    }
                }));
                localStorage.setItem(_this.store + '_dbChangeEvent' + "(" + version + ")", JSON.stringify({
                    table: table,
                    item: item,
                    action: action
                }));
            }

            async getPagedWebtritionData(requestOptions) {
                const pageSize = this.webtritionPageSize;
                const endpoint = requestOptions && requestOptions.url ? requestOptions.url : "";
                const baseBody = requestOptions && requestOptions.body ? requestOptions.body : {};

                const getPage = offset => {
                    return new Promise((resolve, reject) => {
                        const payload = {
                            sapCode: baseBody.sapCode,
                            venue: baseBody.venue,
                            menuDate: baseBody.menuDate,
                            days: baseBody.days,
                            includeNutrients: baseBody.includeNutrients,
                            channel: baseBody.channel,
                            offset: offset,
                            limit: pageSize
                        };

                        Object.keys(payload).forEach(key => {
                            if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
                                delete payload[key];
                            }
                        });

                        $.ajax({
                            url: endpoint,
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            data: JSON.stringify(payload)
                        }).done((data, status, xhr) => {
                            resolve({
                                data: data,
                                statusCode: xhr.status
                            });
                        }).fail((xhr, status, error) => {
                            reject({
                                xhr: xhr,
                                status: status,
                                error: error
                            });
                        });
                    });
                };

                const firstPage = await getPage(1);
                const firstData = firstPage.data || {};
                let allItems = firstData.menuItems ? firstData.menuItems.slice() : [];
                const totalItems = parseInt(firstData.totalItems, 10) || allItems.length;

                if (firstPage.statusCode !== 200 || totalItems <= allItems.length) {
                    return {
                        data: firstData,
                        statusCode: firstPage.statusCode
                    };
                }

                const requests = [];
                const nextPage = (parseInt(firstData.offset, 10) || 1) + 1;
                const totalPages = Math.ceil(totalItems / pageSize);

                for (let page = nextPage; page <= totalPages; page++) {
                    requests.push(getPage(page));
                }

                const pages = await Promise.all(requests);
                pages.forEach(page => {
                    const pageItems = page.data && page.data.menuItems ? page.data.menuItems : [];
                    allItems = allItems.concat(pageItems);
                });

                firstData.menuItems = allItems;
                firstData.count = allItems.length;
                firstData.limit = pageSize;
                firstData.offset = 1;
                firstData.totalItems = totalItems;

                return {
                    data: firstData,
                    statusCode: firstPage.statusCode
                };
            };

            getTrmData() {
                const _this = this;
                if (client && leader) {
                    const normalizeTrmPayload = payload => {
                        const nowEpoch = Math.floor(new Date(currentTime()).getTime() / 1000);

                        const toNumber = value => {
                            const n = Number(value);
                            return Number.isFinite(n) ? n : 0;
                        };

                        const getEffectiveEpoch = item => {
                            return toNumber(item && item.effectiveEpoch);
                        };

                        const getModifiedEpoch = item => {
                            if (!item) {
                                return 0;
                            }
                            if (item.modifiedEpoch !== undefined && item.modifiedEpoch !== null) {
                                return toNumber(item.modifiedEpoch);
                            }
                            if (item.aggregatedModifiedEpoch !== undefined && item.aggregatedModifiedEpoch !== null) {
                                return toNumber(item.aggregatedModifiedEpoch);
                            }
                            if (item.modified && item.modified.EpochSeconds !== undefined && item.modified.EpochSeconds !== null) {
                                return toNumber(item.modified.EpochSeconds);
                            }
                            if (item.modified && item.modified.epochSeconds !== undefined && item.modified.epochSeconds !== null) {
                                return toNumber(item.modified.epochSeconds);
                            }
                            return 0;
                        };

                        const isEffectiveNow = item => {
                            const eff = getEffectiveEpoch(item);
                            return eff === 0 || eff <= nowEpoch;
                        };

                        const chooseNewestEffective = (currentItem, nextItem) => {
                            if (!currentItem) {
                                return nextItem;
                            }

                            const currentEffective = isEffectiveNow(currentItem);
                            const nextEffective = isEffectiveNow(nextItem);

                            if (currentEffective !== nextEffective) {
                                return nextEffective ? nextItem : currentItem;
                            }

                            const currentEffEpoch = getEffectiveEpoch(currentItem);
                            const nextEffEpoch = getEffectiveEpoch(nextItem);
                            if (nextEffEpoch !== currentEffEpoch) {
                                return nextEffEpoch > currentEffEpoch ? nextItem : currentItem;
                            }

                            const currentModEpoch = getModifiedEpoch(currentItem);
                            const nextModEpoch = getModifiedEpoch(nextItem);
                            if (nextModEpoch !== currentModEpoch) {
                                return nextModEpoch > currentModEpoch ? nextItem : currentItem;
                            }

                            const currentDetailId = toNumber(currentItem.menuItemDetailId || currentItem.key);
                            const nextDetailId = toNumber(nextItem.menuItemDetailId || nextItem.key);
                            return nextDetailId > currentDetailId ? nextItem : currentItem;
                        };

                        const toCamelCaseKey = key => {
                            const raw = String(key || "");
                            if (raw === "") {
                                return raw;
                            }
                            const normalized = raw
                                .replace(/[_\-\s]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : "")
                                .replace(/[^a-zA-Z0-9]/g, "");
                            if (normalized === "") {
                                return "";
                            }
                            return normalized.charAt(0).toLowerCase() + normalized.slice(1);
                        };

                        const toCamelCaseObject = obj => {
                            const output = {};
                            Object.keys(obj || {}).forEach(key => {
                                const camelKey = toCamelCaseKey(key);
                                if (camelKey) {
                                    output[camelKey] = obj[key];
                                }
                            });
                            return output;
                        };

                        const source = payload || {};
                        const normalizedAssetDetail = (Array.isArray(source.assetDetail) ? source.assetDetail : [])
                            .filter(each => each && each.azId !== undefined && each.azId !== null && String(each.azId).trim() !== "")
                            .map(each => Object.assign({}, each));

                        const normalizedMenuItems = (Array.isArray(source.menuItems) ? source.menuItems : [])
                            .map(each => {
                                const item = toCamelCaseObject(Object.assign({}, each));
                                // id may already be set from CF "Id" field via camelCase; only derive from other fields if missing
                                item.id = String(item.id || item.menuItemId || item.menuItemDetailId || item.itemId || "").trim();
                                return item;
                            })
                            .filter(item => item.id !== "");

                        const dedupedMenuItems = [];
                        const dedupedMenuIndex = {};
                        normalizedMenuItems.forEach(item => {
                            const key = item.id;
                            const existingIndex = dedupedMenuIndex[key];
                            if (existingIndex === undefined) {
                                dedupedMenuIndex[key] = dedupedMenuItems.length;
                                dedupedMenuItems.push(item);
                                return;
                            }
                            dedupedMenuItems[existingIndex] = chooseNewestEffective(dedupedMenuItems[existingIndex], item);
                        });

                        normalizedAssetDetail.sort((a, b) => String(a.azId).localeCompare(String(b.azId), undefined, { numeric: true }));
                        dedupedMenuItems.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

                        return {
                            assetZones: normalizedAssetDetail,
                            menuItems: dedupedMenuItems
                        };
                    };
                    readClientDB({
                        platform: platform,
                        daypartId: AssetConfiguration.DAYid,
                        storeKey: AssetConfiguration.SKey,
                        displayId: AssetConfiguration.DISid
                    }).then(data => {
                        _this.showConnect(false, "darkorange", "TRM");
                        const normalizedData = normalizeTrmPayload(data);
                        if (clientDB && _.isEqual(clientDB, normalizedData)) {
                            // do nothing
                        } else {
                            clientDB = normalizedData;
                            _this.addItems(normalizedData.assetZones, "update", "TRM_assetZones", "azId");
                            _this.addItems(normalizedData.menuItems, "update", "TRM_menuItems", "id");
                        }
                    }).catch(error => {
                        var detail = "Failed to sync TRM data";
                        if (error && error.message) {
                            detail = detail + ": " + error.message;
                        }
                        _this.showConnect(true, "darkorange", "TRM", detail, "error");
                        console.error("Failed to read TRM data (IndexedDB/CF):", error);
                    });
                    setTimeout(() => {
                        _this.getTrmData();
                    }, _this.trmUpdateInterval);
                } else {
                    if (!client) {
                        console.warn("TRM client is not available.");
                    }
                }
            }

            getIMSData(fullStart) {
                const _this = this;
                if (!leader) {
                    return;
                }
                _this.IMS_TimeOuts.forEach(each => {
                    clearTimeout(each);
                });
                const url = _this.IMSwand + "/services/ims/client/V3/menusystem?" + "StoreKey=" + _this.store + "&Date=" + currentTime().split("T")[0];
                $.get(url, data => {
                    if (fullStart && data && !data.error.code && data.value.response.products.length === 0) {
                        _this.forceIMSUpdate("IMS_menuItems", "forceUpdate", "update");
                        console.warn("IMS not in use for this location");
                        return;
                    }
                    _this.addIMSData(data);
                })
                    .done(() => {
                        _this.showConnect(false, "blueviolet", "IMS")
                        _this.setSync("IMS")
                        _this.IMS_TimeOuts.push(setTimeout(() => {
                            _this.getIMSData();
                        }, _this.imsItemsUpdateInterval));
                    })
                    .fail(() => {
                        console.warn("Could not load ims data!");
                        _this.showConnect(true, "blueviolet", "IMS", "Failed to sync IMS data", "error");
                        if (_this.imsRetries > 0) {
                            _this.imsRetries = _this.imsRetries - 1;
                            _this.IMS_TimeOuts.push(setTimeout(() => {
                                _this.getIMSData();
                            }, 30000));
                        } else {
                            _this.IMS_TimeOuts.push(setTimeout(() => {
                                _this.imsRetries = 1;
                                _this.getIMSData();
                            }, _this.imsItemsUpdateInterval));
                        }
                    });
            }

            addIMSData(data) {
                //format to store in indexedDB
                const _this = this;

                const menuItems = data.value.response.menuItems ? data.value.response.menuItems : [];
                const products = data.value.response.products ? data.value.response.products : [];

                products.forEach(each => {
                    //rich text editor support
                    each.menuDescription = each.menuDescription ? each.menuDescription.replace("<span>", "").replace("</span>", "") : "";
                    each.displayName = each.displayName ? each.displayName.replace("<span>", "").replace("</span>", "") : "";
                    each.menuDescription = each.menuDescription.replace("<p><br></p>", "").replace(/<\/p><p>/g, '<br>').replace(/<p>/, "").replace(/<\/p>/, "");
                    each.displayName = each.displayName.replace("<p><br></p>", "").replace(/<\/p><p>/g, '<br>').replace(/<p>/, "").replace(/<\/p>/, "");
                })


                if (data.isSuccess) {
                    if (menuItems.length > 0) {
                        _this.addItems(menuItems, "update", "IMS_menuItems", "menuItemId");
                    }

                    if (products.length > 0) {
                        _this.addItems(products, "patch", "IMS_products", "productId");
                    } else {
                        console.warn("IMS products not found or empty!");
                        this.app.IMSUpdate = true;
                    }
                }

                try {

                } catch (err) {
                    console.error("this.app does not exist yet...")
                }

            }

            addSettings(data) {
                //format to store in indexedDB
                const _this = this;

                return new Promise((resolve, reject) => {
                    try {
                        const settings = data.settings;
                        var setting;
                        var setting;
                        let value;
                        let settingID;
                        let groupID;

                        settings.forEach((each, idx) => {
                            setting = each[0];
                            value = each[1];
                            settingID = each[2];
                            groupID = each[3];
                            settings[idx] = {
                                setting: setting,
                                value: value,
                                settingID: settingID,
                                groupID: groupID,
                            };
                            // Add an id so the template works
                            settings[idx].id = settingID;
                        });

                        _this.updateConfigs(settings).then(
                            resolve()
                        );

                        if (settings.length > 0) {
                            _this.addItems(settings, "update", "IMS_settings", "settingID");
                        } else {
                            console.warn("No settings found in the response.");
                            this.app.settingsUpdate = true;
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            getIntegrationData(action) {
                const _this = this;

                if (!_this.API || !leader) {
                    return;
                }

                _this.Integration_TimeOuts.forEach(each => {
                    clearTimeout(each);
                });

                const key = _this.store + "_" + "anchors" + "(" + version + ")";
                const anchors = JSON.parse(self.localStorage.getItem(key)) || {};
                const modifiedDate = anchors[_this.API] ? anchors[_this.API].date.split("T")[0] : "";
                const currentDateLocal = currentTime().split("T")[0];
                _this.integrationUpdateInterval = Math.floor(Math.random() * (_this.maxUpdate - _this.minUpdate + 1)) + _this.minUpdate;

                _this.fallbackInterval = _this.attempts === 0 ? 30000 : _this.fallbackInterval + 30000;

                _this.attempts++;

                if (_this.fallbackInterval > _this.integrationUpdateInterval) {
                    _this.fallbackInterval = _this.integrationUpdateInterval;
                }

                var url = "";

                if (_this.API === "revel") {
                    _this.maxUpdate = 9000000;
                    _this.minUpdate = 18000000;
                    _this.integrationUpdateInterval = Math.floor(Math.random() * (_this.maxUpdate - _this.minUpdate + 1)) + _this.minUpdate;
                    url = "https://revel-" + _this.wand + "/integration?client=" + _this.brand + "&id=" + _this.establishment + "&date=" + modifiedDate + "&storeId=" + _this.store;
                }
                if (_this.API === "qu") {
                    const timeOfDay = new Date().toTimeString().split(" ")[0];
                    //Qu should use current day instead of date modified so scheudled pricing works correctly
                    url = "https://qubeyond-" + _this.wand + "/integration?id=" + _this.establishment + "&concept=" + _this.brand + "&date=" + currentDateLocal + "&time=" + timeOfDay;
                }
                if (_this.API === "par") {
                    url = "https://" + _this.wand + "/integrations/parbrink/v1" + "?concept=" + _this.brand + "&id=" + _this.establishment;
                }
                if (_this.API === "toast") {
                    const apiEndpoint = "https://" + _this.wand + "/services/toast/client/menu/";

                    url = {
                        url: apiEndpoint,
                        headers: {
                            Authorization: _this.trmStoreId,
                        },
                    };
                }
                if (_this.API === "shift4") {
                    url = "https://shift4-" + _this.wand + "/integration" + "?id=" + _this.establishment;
                }
                if (_this.API === "simphony") {
                    url = "https://simphony-" + _this.wand + "/integration" + "?concept=" + _this.brand + "&id=" + _this.establishment;
                }
                if (_this.API === "transact") {
                    url = "https://transact-" + _this.wand + "/integration" + "?concept=" + _this.brand;
                }
                if (_this.API === "clover") {
                    url = "https://" + _this.wand + "/integrations/" + _this.API + "/v1/" + _this.brand + "?merchantId=" + _this.establishment;
                }
                if (_this.API === "mealtracker") {
                    const startDate = currentTime().split("T")[0];
                    url = "https://appjel-" + _this.wand + "/integration" + "?id=" + _this.establishment + "&startDate=" + startDate;
                }
                if (_this.API === "venuenext") {
                    url = "https://venuenext-" + _this.wand + "/integration" + "?id=" + _this.establishment + "&org=" + _this.brand
                }
                if (_this.API === "bepoz") {
                    url = "https://bepoz-" + _this.wand + "/integration" + "?concept=" + _this.brand;
                }
                if (_this.API === "centricos") {
                    url = "https://centric-" + _this.wand + "/integration" + "?id=" + _this.establishment;
                }

                if (_this.API === "webtrition") {
                    url = {
                        url: "https://" + _this.wand + "/services/webtrition/client/wds",
                        body: {
                            sapCode: _this.brand,
                            venue: _this.establishment,
                            menuDate: currentTime(),
                            days: 3,
                            includeNutrients: true,
                            channel: "stable"
                        }
                    };
                }

                if (_this.API === "bonappetit") {
                    url = "https://" + _this.wand + "/integrations/" + _this.API + "?campus=" + _this.brand + "&cafe=" + _this.establishment + "&menuDate=" + currentTime();
                }

                if (url === "") {
                    console.warn("No integration API configured for " + _this.API);
                    return;
                }

                var scheduleNextSync = function () {
                    _this.Integration_TimeOuts.forEach(function (each) {
                        clearTimeout(each);
                    });
                    _this.Integration_TimeOuts = [];
                    _this.Integration_TimeOuts.push(setTimeout(function () {
                        _this.getIntegrationData();
                    }, _this.integrationUpdateInterval));
                };
                var handleSuccess = function (statusCode, message) {
                    var hasError = !!(message && message.hasError);

                    if (statusCode === 200 && !hasError) {
                        integration.showConnect(false, "forestgreen", _this.API);
                        _this.setSync(_this.API);
                        _this.addIntegrationData(message, action);
                        _this.attempts = 0;
                        scheduleNextSync();
                        return;
                    }

                    if (statusCode === 204) {
                        _this.integrationUpdateInterval = _this.fallbackInterval;
                    }

                    handleFailure();
                };
                var handleFailure = function () {
                    console.warn("Could not load integration data!");
                    _this.integrationUpdateInterval = _this.attempts > 1 ? _this.integrationUpdateInterval : _this.fallbackInterval;
                    integration.showConnect(true, "forestgreen", _this.API, "Failed to sync Integration data", "error");
                    if (_this.attempts === 2) {
                        try {
                            _this.app.readDatabase();
                        }
                        catch (err) {
                            console.error("configuration for " + _this.API + " is incorrect");
                            _this.attempts = 0;
                        }
                    }
                    scheduleNextSync();
                };
                if (_this.API === "webtrition") {
                    _this.webtritionRequestQueue = (_this.webtritionRequestQueue || Promise.resolve())
                        .catch(() => null)
                        .then(() => {
                            return _this.getPagedWebtritionData(url);
                        })
                        .then(response => {
                            handleSuccess(response.statusCode, response.data);
                            return response;
                        })
                        .catch(() => {
                            handleFailure();
                            return null;
                        });
                    return;
                }
                $.get(url, function (data, status, xhr) {
                    handleSuccess(xhr.status, data);
                })
                    .fail(function () {
                        handleFailure();
                    });
            }

            addIntegrationData(data, action) {
                //format to store in indexedDB
                const _this = this;
                if (!data) {
                    return;
                }

                let products;
                let modifiers;
                let discounts;

                if (_this.API === "qu") {
                    action = "update";
                    products = data.menuItems ? _this.formatQu(data.menuItems) : {};
                    modifiers = data.modifiers ? _this.formatQu(data.modifiers) : {};
                    discounts = data.discounts ? _this.formatQu(data.discounts) : {};
                }

                if (_this.API === "revel") {
                    products = data.products ? _this.formatRevel(data.products) : {};
                    modifiers = data.modifiers ? _this.formatRevel(data.modifiers) : {};
                }

                if (_this.API === "toast") {
                    //gets full return, delete items not present
                    action = "update";
                    products = data ? _this.formatToast(data) : {};
                    modifiers = data ? _this.formatToast(data, true) : {};
                }

                if (_this.API === "par") {
                    //gets full return, delete items not present
                    action = "update";
                    products = data.items ? _this.formatPar(data.items, false) : {};
                    modifiers = data.modifier_groups ? _this.formatPar(data.modifier_groups, true) : {};
                }

                if (_this.API === "shift4") {
                    //gets full return, delete items not present
                    action = "update";
                    let shiftData = data.items ? _this.formatShift(data) : {};
                    products = shiftData.items ? shiftData.items : {};
                    modifiers = shiftData.modifiers ? shiftData.modifiers : {};
                }

                if (_this.API === "simphony") {
                    let simphonyData = data.data ? _this.formatSimphony(data.data) : {};
                    products = simphonyData.items ? simphonyData.items : {};
                    modifiers = simphonyData.modifiers ? simphonyData.modifiers : {};
                }

                if (_this.API === "transact") {
                    products = data.data ? _this.formatTransact(data.data) : {};
                }

                if (_this.API === "clover") {
                    products = data.menu ? _this.formatClover(data, "products") : {};
                    modifiers = data.mods ? _this.formatClover(data, "modifiers") : {};
                }

                if (_this.API === "mealtracker") {
                    action = "update";
                    products = data.data ? _this.formatMealtracker(data.data, "products") : {};
                }

                if (_this.API === "webtrition") {
                    action = "update";
                    products = data.menuItems ? _this.formatWebtrition(data.menuItems) : {};
                }

                if (_this.API === "venuenext") {
                    action = "update";
                    products = data ? _this.formatVenueNext(data) : {};
                }

                if (_this.API === "bonappetit") {
                    action = "update";
                    products = data.menuItems ? _this.formatBonappetit(data.menuItems) : {};
                }

                if (_this.API === "bepoz") {
                    action = "update";
                    products = data.data ? _this.formatBepoz(data.data) : {};
                }

                if (_this.API === "centricos") {
                    action = "update";
                    let centricData = data.data ? _this.formatcentric(data.data) : {};
                    products = centricData.products ? centricData.products : {};
                    modifiers = centricData.modifiers ? centricData.modifiers : {};
                }

                if (products && products.length > 0) {
                    _this.addItems(products, action, "integration_products", "mappingId");
                }

                if (modifiers && modifiers.length > 0) {
                    _this.addItems(modifiers, action, "integration_modifiers", "mappingId");
                }

                if (discounts && discounts.length > 0) {
                    discounts.forEach((item, idx) => {
                        if (_this.API === "qu") {
                            discounts[idx].mappingId = item.id.toString();
                            discounts[idx].price = item.discountAmount;
                        }
                    });
                    _this.addItems(discounts, action, "integration_discounts", "mappingId");
                }
            }

            async addItems(items, action = "patch", table, id) {
                //update / patch / delete handler
                const _this = this;

                const handleDatabaseChangeEvent = (table, item, action) => {
                    window.dispatchEvent(new CustomEvent('dbChangeEvent', {
                        detail: {
                            table,
                            item,
                            action
                        }
                    }));
                    localStorage.setItem(_this.store + '_dbChangeEvent' + "(" + version + ")", JSON.stringify({
                        table,
                        item,
                        action
                    }));
                };

                const handleIndexedDB = async () => {
                    await _this.db.transaction('rw', _this.db[table], async () => {
                        const allItems = await _this.db[table].toArray();
                        const newIds = items.map(item => item[id]);

                        if (action === 'patch' || action === 'update') {
                            for (const item of items) {
                                const existingItem = await _this.db[table].get(item[id]);
                                if (existingItem) {
                                    if (!_.isEqual(existingItem, item)) {
                                        await _this.db[table].put(item);
                                        handleDatabaseChangeEvent(table, item, 'updated');
                                    }
                                } else {
                                    await _this.db[table].add(item);
                                    handleDatabaseChangeEvent(table, item, 'added');
                                }
                            }

                            if (action === 'update') {
                                for (const item of allItems) {
                                    if (!newIds.includes(item[id])) {
                                        await _this.db[table].delete(item[id]);
                                        handleDatabaseChangeEvent(table, item, 'deleted');
                                    }
                                }
                            }
                        } else if (action === 'delete') {
                            for (const item of items) {
                                const existingItem = await _this.db[table].get(item[id]);
                                if (existingItem) {
                                    await _this.db[table].delete(item[id]);
                                    handleDatabaseChangeEvent(table, item, 'deleted');
                                }
                            }
                        }
                    });
                };

                const handleLocalStorage = () => {
                    let oldValue = JSON.parse(localStorage.getItem(_this.store + "_" + table + "(" + version + ")")) || [];
                    const newProductMap = new Map(items.map(product => [product[id], product]));

                    if (action === 'patch' || action === 'update') {
                        oldValue = oldValue.filter(existingProduct => {
                            if (!Array.from(newProductMap.keys()).includes(existingProduct[id]) && action === 'update') {
                                handleDatabaseChangeEvent(table, existingProduct, 'delete');
                                return false;
                            }
                            return true;
                        });

                        items.forEach(newProduct => {
                            const existingProduct = oldValue.find(product => product[id] === newProduct[id]);
                            if (existingProduct) {
                                if (!_.isEqual(existingProduct, newProduct)) {
                                    oldValue = oldValue.map(product => product[id] === newProduct[id] ? newProduct : product);
                                    handleDatabaseChangeEvent(table, newProduct, 'updated');
                                }
                            } else {
                                oldValue.push(newProduct);
                                handleDatabaseChangeEvent(table, newProduct, 'added');
                            }
                        });

                        if (action === 'update') {
                            const currentIds = Array.from(newProductMap.keys());
                            oldValue = oldValue.filter(existingProduct => {
                                if (!currentIds.includes(existingProduct[id])) {
                                    handleDatabaseChangeEvent(table, existingProduct, 'delete');
                                    return false;
                                }
                                return true;
                            });
                        }
                    } else if (action === 'delete') {
                        oldValue = oldValue.filter(product => {
                            if (items.find(newProduct => newProduct[id] === product[id])) {
                                handleDatabaseChangeEvent(table, product, 'delete');
                                return false;
                            }
                            return true;
                        });
                    }

                    localStorage.setItem(_this.store + "_" + table + "(" + version + ")", JSON.stringify(oldValue));
                };

                if (isUsingIndexedDB) {
                    try {
                        await handleIndexedDB();
                    } catch (error) {
                        if (error.name === "DatabaseClosedError") {
                            _this.openDatabase().then(() => {
                                _this.app.db = _this.db;
                                _this.app.fullStart = true;
                                _this.full_start()
                            });
                        }
                    }

                } else {
                    handleLocalStorage();
                }
            }

            setUpdatedDate(anchor) {
                const _this = this;
                const key = _this.store + "_" + "anchors" + "(" + version + ")";

                // Retrieve existing anchors from local storage
                const anchors = JSON.parse(self.localStorage.getItem(key)) || {};

                // Update the specific anchor with new data
                anchors[anchor] = {
                    date: currentTime(),
                    lastSync: Date.now(),
                };

                // Save the updated anchors back to local storage
                self.localStorage.setItem(key, JSON.stringify(anchors));
            }

            deleteAnchors() {
                const _this = this;
                const key = _this.store + "_" + "anchors" + "(" + version + ")";
                // Remove the anchors key from local storage
                self.localStorage.removeItem(key);
            }

            setSync(anchor) {
                const _this = this;
                const key = _this.store + "_" + "anchors" + "(" + version + ")";

                // Retrieve existing anchors from local storage
                const anchors = JSON.parse(self.localStorage.getItem(key)) || {};

                // Retrieve the modifiedTime of the specific anchor
                const modifiedTime = anchors[anchor] ? anchors[anchor].date : "";

                // Update the specific anchor's lastSync value
                anchors[anchor] = {
                    date: modifiedTime,
                    lastSync: Date.now(),
                };

                // Save the updated anchors back to local storage
                self.localStorage.setItem(key, JSON.stringify(anchors));
            }

            showConnect(toggle, color, source, issue, error, lineNumber, errorDetails) {
                //added full screen error alert for development mode
                //set up errors and display with centered alert for errors
                if (toggle && $(".status-wrapper").length === 0) {
                    const statusWrapper = document.createElement("div");
                    $(statusWrapper).addClass("status-wrapper");
                    $("body").append(statusWrapper);
                }

                // Show centered alert for errors, otherwise show status icon
                if (toggle && typeof issue === "object" && development) {
                    // Extract line number from stack trace if not provided
                    if (!lineNumber && errorDetails && errorDetails.stack) {
                        // Try to match various patterns: integration.js:123, at integration.js:123, (integration.js:123:45)
                        // Also handle query parameters like integration.js?v=1:123
                        let stackMatch = errorDetails.stack.match(/integration\.js.*?:(\d+)/i);

                        // Fallback 1: Look for any .js file match if integration.js wasn't found
                        if (!stackMatch) {
                            stackMatch = errorDetails.stack.match(/\.js.*?:(\d+)/i);
                        }

                        // Fallback 2: Look for generic :line:column pattern (e.g. :123:45)
                        if (!stackMatch) {
                            stackMatch = errorDetails.stack.match(/:(\d+):\d+/);
                        }

                        if (stackMatch && stackMatch[1]) {
                            lineNumber = stackMatch[1];
                        } else {
                            // Try to match from Error().stack pattern
                            const currentStack = new Error().stack;
                            if (currentStack) {
                                const currentMatch = currentStack.match(/integration\.js.*?:(\d+)/i);
                                if (currentMatch && currentMatch[1]) {
                                    lineNumber = currentMatch[1];
                                }
                            }
                        }
                    }

                    // Create centered error alert
                    if ($(".error-alert-overlay").length === 0) {
                        let issueMessage = issue;
                        let issueStack = null;
                        if (typeof issue === "object") {
                            issueMessage = issue.message || issue.toString();
                            if (issue.stack) {
                                issueStack = issue.stack.replace(/\n/g, "<br>");
                            }
                        }

                        var obj = {
                            color: color,
                            source: source,
                            issue: issueMessage || "Connection Error",
                            issueStack: issueStack,
                            error: error,
                            lineNumber: lineNumber || "N/A",
                            errorMessage: errorDetails && errorDetails.message ? errorDetails.message : "No error message available",
                            errorStack: errorDetails && errorDetails.stack ? errorDetails.stack.replace(/\n/g, "<br>") : "No stack trace available",
                        };
                        const alert = Mustache.to_html(Integration.errorAlert, obj);
                        $("body").append(alert);

                        // Add click handler to dismiss
                        $(".error-alert-overlay, .error-alert-close").on("click", () => {
                            $(".error-alert-overlay").remove();
                        });

                        // Prevent click on alert content from closing
                        $(".error-alert-content").on("click", e => {
                            e.stopPropagation();
                        });
                    }
                } else {
                    // Show status icon for non-error states
                    var obj = {
                        color: color,
                        source: source,
                        issue: issue,
                        error: error,
                    };
                    if ($(".connect" + "." + source).length === 0 && toggle) {
                        const connect = Mustache.to_html(Integration.connect, obj);
                        $(".status-wrapper").append(connect);
                    }
                    if (!toggle) {
                        $(".connect" + "." + source).remove();
                        $(".error-alert-overlay." + source).remove();
                    }
                }
            }

            connectWebsocket() {
                const _this = this;

                // Base delay for throttling (in milliseconds)
                const baseDelay = 1000; // 1 second
                const maxDelay = 30000; // 30 seconds
                let delay = baseDelay;


                function connect(reload) {
                    try {
                        const url =
                            "wss://" +
                            _this.orderStatus +
                            "/?device=IMS_MENUUPDATE_" +
                            _this.store;
                        const ws = new WebSocket(url);

                        ws.onopen = () => {
                            _this.showConnect(false, "yellow", "websocket");
                            delay = baseDelay; // Reset the delay on successful connection
                        };

                        ws.onmessage = e => {
                            const data = JSON.parse(e.data);

                            if (data.eventType === "heartbeat") {
                                return;
                            }

                            if (data.eventType === "PRODUCT_UPDATE" || data.eventType === "IMS_BRANDMENU_UPDATE") {
                                if (_this.IMSUpdateCount === 0) {
                                    _this.getIMSData();
                                    _this.IMSUpdateCount++;
                                } else {
                                    _this.IMSUpdateCount++;
                                }
                            }

                            if (data.eventType === "INTEGRATION_UPDATE") {
                                _this.getIntegrationData("patch");
                            }
                        };

                        ws.onclose = e => {
                            if (!leader) {
                                return;
                            }
                            setTimeout(() => {
                                // Increase the delay with exponential backoff, but cap it at maxDelay
                                delay = Math.min(delay * 2, maxDelay);
                                connect(true);
                            }, delay);
                        };

                        ws.onerror = err => {
                            console.error(
                                "Message:",
                                "Socket encountered error: ",
                                err.message,
                                "Closing socket"
                            );
                            _this.showConnect(true, "yellow", "websocket", "Instant updated failed to connect", "warning");
                            ws.close();
                        };
                    } catch (error) {
                        console.error(error);
                    }
                }

                connect(); // Initial connection attempt
                return true;
            }

            IMSUpdateQueue() {
                const _this = this;
                //clear queue
                setTimeout(() => {
                    //needs to process 
                    if (_this.IMSUpdateCount > 1) {
                        _this.getIMSData()
                        _this.IMSUpdateCount = 0;
                    }
                    //already processed
                    if (_this.IMSUpdateCount === 1) {
                        _this.IMSUpdateCount = 0;
                    }
                    _this.IMSUpdateQueue();
                }, 60000);
                return true;
            }

            formatPar(data, modifier) {
                const products = [];
                if (modifier) {
                    data.forEach((each, idx) => {
                        each.items.forEach(item => {
                            item.category = each.displayName;
                            item.subCategory = each.description;
                            item.mappingId = each.id + "-" + item.itemId;

                            if (item.category.toLowerCase().indexOf("olo") > -1 || item.price === "0") {
                                return;
                            }
                            products.push(item);
                        })
                    });
                }

                if (!modifier) {
                    data.forEach((each, idx) => {
                        try {
                            each.mappingId = each.id ? each.id.toString() : null;
                        } catch (err) { }

                        if (each.price === "0") {
                            return;
                        }

                        products.push(each);
                    });
                }

                return products;
            }

            formatQu(data) {
                const _this = this;
                let products = [];

                data.forEach(eachItem => {
                    if (eachItem.menuCategory) {
                        eachItem.category = eachItem.menuCategory.name;
                        eachItem.categoryId = eachItem.menuCategory.id;
                    }
                    if (eachItem.modifierGroup) {
                        eachItem.category = eachItem.modifierGroup.name;
                        eachItem.categoryId = eachItem.modifierGroup.id;
                    }
                    // Ignore 3rd party delivery items
                    if (typeof eachItem.category === "string") {
                        if (eachItem.category.includes("OLO") || eachItem.category.includes("3PD") || eachItem.category.includes("3PO") || eachItem.category.includes("All Items")) {
                            return;
                        }
                    }
                    try {
                        eachItem.price = eachItem.discountAmount ? eachItem.discountAmount : eachItem.prices.prices[0].price;
                    } catch (err) {
                        eachItem.price = "";
                    }
                    //line 1140 * allow focus brands to use ID since pathID is not in use there.
                    try {
                        //here to make choice of API mapping id - could use automation
                        eachItem.mappingId = eachItem.pathId || eachItem.id || "";
                        eachItem.mappingId = eachItem.mappingId.toString();
                    } catch (err) {
                        eachItem.mappingId = null;
                    }
                    //is the below even necessary..should move to larger mapping IDs I think.
                    delete eachItem.prices;
                    delete eachItem.displayAttribute;
                    products.push(eachItem);
                });

                //required and in a beta state.. removes duplicates with same pathID, and attempts to keep the ones that price is not 0. Qu is a pita and we attempt somethign API side.
                products = _this.removeDuplicates(products, "mappingId");
                return products;
            }

            formatToast(data) {
                // Build O(1) lookup maps — avoids O(n²/n³) nested linear scans across 438 MGRs × 3177 MORs × 2348 items
                if (modifier) {
                    var modifiers = [];
                    Object.values(data.modifierOptionReferences).forEach(function (mod) {
                        mod.mappingId = mod.multiLocationId ? mod.multiLocationId.toString() : "";
                        modifiers.push(mod);
                    });
                    return modifiers;
                }
                var mgrMap = {};
                Object.values(data.modifierGroupReferences).forEach(function (mgr) {
                    mgrMap[mgr.referenceId] = mgr;
                });
                var morMap = {};
                Object.values(data.modifierOptionReferences).forEach(function (mor) {
                    morMap[mor.referenceId] = mor;
                });
                var menuItems = [];
                var menuItemByMappingId = {};
                var menuItemOrder = [];
                function is3POMenu(name) {
                    return typeof name === "string" && name.toLowerCase().indexOf("3po") > -1;
                }
                function hasKioskVisibility(item) {
                    return item && Array.isArray(item.visibility) && item.visibility.indexOf("KIOSK") > -1;
                }
                function shouldReplaceExistingItem(existingItem, nextItem) {
                    var existingIs3PO = is3POMenu(existingItem.menu);
                    var nextIs3PO = is3POMenu(nextItem.menu);
                    if (existingIs3PO && !nextIs3PO) {
                        return true;
                    }
                    if (!existingIs3PO && nextIs3PO) {
                        return false;
                    }
                    if (!hasKioskVisibility(existingItem) && hasKioskVisibility(nextItem)) {
                        return true;
                    }
                    return false;
                }
                function flat(array) {
                    var result = [];
                    array.forEach(function (a) {
                        if (Array.isArray(a.menuGroups)) {
                            a.menuGroups.forEach(function (each) {
                                // Propagate original menu name/id through nested group levels
                                each.menu = a.menu || a.name;
                                each.menuId = a.menuId || a.masterId;
                            });
                            result = result.concat(flat(a.menuGroups));
                        }
                        result.push(a);
                    });
                    return result;
                }
                var filteredMenus = Array.isArray(data.menus) ? data.menus.filter(function (menu) {
                    return !is3POMenu(menu && menu.name);
                }) : [];
                var groups = flat(filteredMenus);
                groups.forEach(function (group) {
                    if (!group.menuItems) {
                        return;
                    }
                    group.menuItems.forEach(function (item) {
                        var itemMappingId = item.multiLocationId ? item.multiLocationId.toString() : "";
                        item.category = group.name;
                        item.menu = group.menu;
                        item.menuId = group.menuId;
                        item.groupId = group.multiLocationId;
                        item.mappingId = itemMappingId;
                        item.active = true;
                        item.modifiers = [];
                        item.price = item.price ? parseFloat(item.price).toFixed(2) : "";
                        try {
                            if (Array.isArray(item.modifierGroupReferences)) {
                                item.modifierGroupReferences.forEach(function (modGroupId) {
                                    var modRef = mgrMap[modGroupId];
                                    if (!modRef) {
                                        return;
                                    }
                                    var modifier = {
                                        modifierType: modRef.name,
                                        masterId: modRef.masterId,
                                        options: [],
                                    };
                                    if (Array.isArray(modRef.modifierOptionReferences)) {
                                        modRef.modifierOptionReferences.forEach(function (modOptId) {
                                            var modRefOpt = morMap[modOptId];
                                            if (!modRefOpt) {
                                                return;
                                            }
                                            modifier.options.push({
                                                name: modRefOpt.name,
                                                price: parseFloat(modRefOpt.price).toFixed(2),
                                                masterId: modRefOpt.masterId,
                                                calories: modRefOpt.calories,
                                                description: modRefOpt.description,
                                            });
                                        });
                                    }
                                    item.modifiers.push(modifier);
                                });
                            }
                        }
                        catch (err) {
                            // Modifier build error — item still added below
                        }
                        if (!menuItemByMappingId[itemMappingId]) {
                            menuItemByMappingId[itemMappingId] = item;
                            menuItemOrder.push(itemMappingId);
                        }
                        else if (shouldReplaceExistingItem(menuItemByMappingId[itemMappingId], item)) {
                            menuItemByMappingId[itemMappingId] = item;
                        }
                    });
                });
                menuItemOrder.forEach(function (mappingId) {
                    menuItems.push(menuItemByMappingId[mappingId]);
                });
                return menuItems;
            }

            formatRevel(data) {
                const products = [];
                data.forEach((each, idx) => {
                    if (!each.barcode) {
                        return;
                    }
                    try {
                        each.mappingId = each.barcode;
                    } catch (err) { }

                    try {
                        each.category = each.category ? each.category.name : each.modifierClass.name;
                    } catch (err) { }

                    if (typeof each.category === "string") {
                        if (each.category.includes("OLO") || each.category.includes("3PD") || each.category.includes("3PO")) {
                            return
                        }
                    }
                    products.push(each);
                });
                return products;
            }

            formatClover(data, type) {
                const products = [];
                const modifiers = [];
                if (type && type === "products") {
                    data.menu.forEach(menu => {
                        if (menu.items && Array.isArray(menu.items)) {
                            menu.items.forEach(item => {
                                products.push({
                                    mappingId: menu.id + "-" + item.id,
                                    name: item.name,
                                    category: menu.name,
                                    price: typeof item.price === "number" ? (item.price / 100).toFixed(2) : "",
                                    available: item.available,
                                    alternateName: item.alternateName || "",
                                    hidden: item.hidden,
                                    priceType: item.priceType,
                                    sku: item.sku
                                });
                            });
                        }
                    });
                    return products;
                }
                if (type && type === "modifiers") {
                    data.mods.forEach(modGroup => {
                        if (modGroup.modifiers && Array.isArray(modGroup.modifiers)) {
                            modGroup.modifiers.forEach(mod => {
                                modifiers.push({
                                    mappingId: modGroup.id + "-" + mod.id,
                                    name: mod.name,
                                    category: modGroup.name,
                                    price: typeof mod.price === "number" ? (mod.price / 100).toFixed(2) : "",
                                    available: mod.available
                                });
                            });
                        }
                    });
                    return modifiers;
                }
            }

            formatTransact(data) {
                const products = [];
                if (!data.length) { return products; }
                data.forEach((each, idx) => {
                    const item = {};
                    try {
                        item.mappingId = each["Item Number"];
                    } catch (err) { }

                    try {
                        item.category = each["Class"];
                        item.name = each["Label"];
                        if (each["Price"] !== undefined && each["Price"] !== null && each["Price"] !== "") {
                            let priceVal = each["Price"];
                            if (typeof priceVal === "number") {
                                item.price = priceVal.toFixed(2);
                            } else if (typeof priceVal === "string") {
                                // Remove all non-numeric except . and -
                                let cleaned = priceVal.replace(/[^0-9.-]+/g, "");
                                if (cleaned !== "" && !isNaN(cleaned)) {
                                    item.price = parseFloat(cleaned).toFixed(2);
                                } else {
                                    item.price = priceVal;
                                }
                            } else {
                                item.price = priceVal;
                            }
                        } else {
                            item.price = "";
                        }
                    } catch (err) { }

                    products.push(item);
                });
                return products;
            }

            formatShift(data) {
                const shiftData = {};
                // Attach modifiers to groups
                data.items.forEach(each => {
                    each.mappingId = each.id.split("-")[0];
                    each.category = each.categoryName;
                    if (each.modifierCategories && each.modifierCategories.length > 0 && data.modifiers) {
                        each.modifiers = [];
                        data.modifiers.forEach(eachMod => {
                            if (each.modifierCategories.includes(eachMod.modifierCategoryId)) {
                                each.modifiers.push({
                                    name: eachMod.name,
                                    price: eachMod.price,
                                    active: each.active,
                                    description: eachMod.description,
                                    defaultPrice: eachMod.defaultPrice,
                                });
                            }
                        });
                    }
                });
                if (data.modifiers) {
                    data.modifiers.forEach(eachMod => {
                        eachMod.mappingId = eachMod.modifierCategoryId.split("-")[0] + "-" + eachMod.id.split("-")[0];
                    });
                }

                shiftData.modifiers = data.modifiers || [];
                shiftData.items = data.items;
                return shiftData;
            }

            formatMealtracker(data) {
                const products = [];
                if (!data.length) { return products; }
                data.forEach(eachDay => {
                    eachDay.menu.forEach(eachMenu => {
                        eachMenu.meals.forEach(eachMeals => {
                            eachMeals.menu.forEach(eachProduct => {
                                eachProduct.mappingId = eachProduct.id.toString();
                                eachProduct.day = eachDay.day;
                                eachProduct.date = eachDay.date + "T00:00:00";
                                eachProduct.menuName = eachMenu.name;
                                eachProduct.type = eachMenu.menu_category;
                                eachProduct.period = eachMeals.name;
                                eachProduct.category = eachProduct.category_name.replace(/\s+/g, ' ').replace(/\s*BLD$/, '').trim();
                                products.push(eachProduct);
                            });
                        });
                    });
                });
                return products;
            }

            formatSimphony(data) {
                try {
                    const menuItems = data.menuItems || [];
                    const condimentGroups = data.condimentGroups || [];

                    const products = {
                        items: [],
                        modifiers: []
                    };
                    menuItems.forEach(each => {
                        try {
                            const item = {
                                mappingId: each.menuItemId ? each.menuItemId.toString() : null,
                                category: (each.familyGroup && each.familyGroup.name && each.familyGroup.name["en-US"]) || null,
                                name: (each.name && each.name["en-US"]) || null,
                                price: (each.price && each.price.price) || null,
                                modifiers: []
                            };

                            if (Array.isArray(each.condiments)) {
                                const modifiers = [];
                                each.condiments.forEach(condiment => {
                                    try {
                                        const modifier = {
                                            name: (condiment.name && condiment.name["en-US"]) || null,
                                            price: (() => {
                                                // Find the first non-zero price
                                                const def = condiment.definitions.find(def =>
                                                    def.prices && def.prices[0] && def.prices[0].price && def.prices[0].price > 0
                                                );
                                                return def ? def.prices[0].price : null;
                                            })(),
                                            category: item.name || null,
                                            group: condiment.familyGroupRef || null
                                        };
                                        modifiers.push(modifier);
                                    } catch (modErr) {
                                        // Optionally log or handle modifier errors
                                    }
                                });
                                // Sort modifiers by name, placing null names at the end
                                modifiers.sort((a, b) => {
                                    if (a.name === b.name) return 0;
                                    if (a.name === null) return 1;
                                    if (b.name === null) return -1;
                                    return a.name.localeCompare(b.name);
                                });
                                item.modifiers = modifiers;
                            }

                            products.items.push(item);
                        } catch (itemErr) {
                            // Optionally log or handle item errors
                        }
                    });

                    // Group condimentItems by condimentId and collect all categories for each
                    const condimentMap = {};
                    condimentGroups.forEach(each => {
                        if (Array.isArray(each.condimentItems)) {
                            each.condimentItems.forEach(condimentItem => {
                                try {
                                    const condimentId = condimentItem.condimentId;
                                    if (!condimentId) return;

                                    const category = (each.name && each.name["en-US"]) || null;
                                    if (!condimentMap[condimentId]) {
                                        condimentMap[condimentId] = {
                                            mappingId: condimentId.toString(),
                                            categories: [], // collect all categories here
                                            name: (condimentItem.name && condimentItem.name["en-US"]) || null,
                                            price: (() => {
                                                // Find the first non-zero price
                                                const def = condimentItem.definitions.find(def => {
                                                    return def.prices && def.prices[0] && def.prices[0].price && def.prices[0].price > 0;
                                                });
                                                return def ? def.prices[0].price : null;
                                            })()
                                        };
                                    }
                                    // Add the category if not already present
                                    if (category && !condimentMap[condimentId].categories.includes(category)) {
                                        condimentMap[condimentId].categories.push(category);
                                    }
                                }
                                catch (condErr) {
                                    // Optionally log or handle condiment errors
                                }
                            });
                        }
                    });
                    // Push all grouped modifiers to products.modifiers
                    Object.values(condimentMap).forEach(modifier => {
                        // Sort categories alphabetically, nulls last
                        modifier.categories.sort((a, b) => {
                            if (a === b) return 0;
                            if (a === null) return 1;
                            if (b === null) return -1;
                            return a.localeCompare(b);
                        });
                        // Concatenate categories into a comma-delimited string (excluding nulls)
                        modifier.category = modifier.categories.filter(c => { return c !== null; }).join(", ");
                        products.modifiers.push(modifier);
                    });

                    return products;
                } catch (err) {
                    // Optionally log or handle top-level errors
                    return { items: [], modifiers: [] };
                }
            }

            formatVenueNext(venueNext) {
                //align to DB
                //needs review..
                venueNext.forEach(each => {
                    each.category = each.category_name;
                    each.mappingId = each.product_sku.toString();
                    each.type = each.stand_display_name || "";
                    each.price = each.price_in_cents / 100 || "0.00";
                    each.enabled = each.available;
                })
                return venueNext;
            }

            formatWebtrition(webtrition) {
                const _this = this;

                //align to DB
                webtrition.forEach(each => {
                    each.category = each.mealStation;
                    each.mappingId = each.id.toString();
                })

                function handleComboItems(items) {
                    let comboItems = {};
                    let nonComboItems = [];
                    items.forEach(each => {
                        let stop = false;
                        if (each.comboOrder > 0) {
                            if (!comboItems[each.id]) {
                                comboItems[each.id] = {
                                    id: "0",
                                    stringId: "0",
                                    mappingId: each.id.toString(),
                                    mrn: 0,
                                    combo: true,
                                    calories: "0",
                                    description: "",
                                    date: each.date,
                                    comboItemNames: "",
                                    comboName: each.comboName,
                                    icons: each.icons,
                                    mealPeriod: each.mealPeriod,
                                    category: each.mealStation,
                                    mealStation: each.mealStation,
                                    price: each.price,
                                    items: []
                                };
                            }
                            comboItems[each.id].items.forEach(item => {
                                if (item.comboOrder === each.comboOrder) { stop = true }
                            });
                            if (stop) { return; }
                            comboItems[each.id].id = each.comboOrder === 1 ? each.id : comboItems[each.id].id
                            comboItems[each.id].stringId = comboItems[each.id].id.toString()
                            comboItems[each.id].mrn = parseFloat(each.mrn) + parseFloat(comboItems[each.id].mrn)
                            comboItems[each.id].comboItemNames = comboItems[each.id].comboItemNames ? comboItems[each.id].comboItemNames + ", " + each.name : each.name;
                            comboItems[each.id].calories = parseFloat(each.calories) + parseFloat(comboItems[each.id].calories);
                            comboItems[each.id].items.push(each);
                        } else {
                            nonComboItems.push(each);
                        }
                    });

                    // Add newly created combo items to nonComboItems
                    for (let combo of Object.values(comboItems)) {
                        nonComboItems.push(combo);
                    }

                    return nonComboItems;
                }

                webtrition = handleComboItems(webtrition);

                //return formatted items
                return webtrition;
            }

            formatBonappetit(data) {
                const products = [];


                //align to DB
                data.forEach(each => {
                    each.category = each.station;
                    each.mappingId = each.id.toString() + "-" + each.daypart_id.toString() + "-" + each.station_id.toString();
                    each.name = each.label;
                    each.date = currentTime();
                    products.push(each);
                });
                return products;
            }

            formatBepoz(data) {
                const products = [];

                // Helper to normalize id-like values to a non-empty string; preserves 0, avoids null/undefined
                const toIdString = v => {
                    if (v === null || v === undefined) return "0";
                    const s = String(v);
                    return s.trim() === "" ? "0" : s;
                };

                //align to DB
                data.forEach(each => {
                    each.category = each.categoryName;
                    each.name = each.menuItemName;
                    each.sortOrder = each.ItemOrder || 0;

                    each.mappingId = toIdString(each.menuItemid);
                    each.categoryId = toIdString(each.categoryID);
                    each.subCategoryId = toIdString(each.subCategoryID);
                    each.brandId = toIdString(each.Brandid);
                    each.calories = (each.Calorie !== null && each.Calorie !== undefined && String(each.Calorie).trim() !== "")
                        ? String(each.Calorie)
                        : "0";

                    if (typeof each.Allergens === "string") {
                        // Split on newlines, commas, semicolons, pipes, or slashes and trim
                        each.allergens = each.Allergens.split(/[\r\n;,/|]+/).map(item => { return item.trim(); }).filter(Boolean);
                    } else {
                        each.allergens = each.Allergens;
                    }

                    if (typeof each.Active === "string") {
                        const vA = each.Active.trim().toLowerCase();
                        each.active = (vA === "true" || vA === "1" || vA === "yes");
                    } else {
                        each.active = Boolean(each.Active);
                    }

                    if (typeof each.outOfStock === "string") {
                        const vO = each.outOfStock.trim().toLowerCase();
                        each.outOfStock = (vO === "true" || vO === "1" || vO === "yes");
                    } else {
                        each.outOfStock = Boolean(each.outOfStock);
                    }

                    // Normalize modifiers
                    if (Array.isArray(each.modifiers)) {
                        // keep as-is
                    } else if (typeof each.modifiers === "string") {
                        let parsed = [];
                        try {
                            const tmp = JSON.parse(each.modifiers);
                            if (Array.isArray(tmp)) parsed = tmp;
                        } catch (e) {
                            parsed = each.modifiers.split(/[\r\n;,/|]+/).map(s => { return s.trim(); }).filter(Boolean);
                        }
                        each.modifiers = parsed;
                    } else {
                        each.modifiers = [];
                    }

                    //remove old values
                    delete each.Active;
                    delete each.Allergens;
                    delete each.Calorie;
                    delete each.productid;
                    delete each.categoryID;
                    delete each.subCategoryID;
                    delete each.menuItemName;
                    delete each.menuItemid;
                    delete each.categoryName;
                    delete each.ItemOrder;
                    delete each.Brandid;

                    products.push(each);
                });
                return products;
            }

            formatcentric(data) {
                const products = [];
                const modifiers = [];

                //align to DB
                const groups = (data.data && data.data.groups) ? data.data.groups : (data.groups || []);
                groups.forEach(group => {
                    group.items.forEach(each => {
                        each.category = group.name;
                        each.mappingId = each.meta.unique_id.toString();
                        each.name = each.name;
                        each.description = each.description.en || "";
                        each.price = each.price.amount ? parseFloat(each.price.amount).toFixed(2) : "";
                        each.calories = each.nutrition.calories ? each.nutrition.calories.amount : "";
                        each.sortOrder = each.meta.menu_sort_number || 0;
                        each.out_of_stock = each.is.out_of_stock || false;
                        each.featured = each.is.featured || false;
                        each.hidden = each.is.hidden || false;
                        each.tags = each.reporting.category || [];
                        //clean up products
                        delete each.id;
                        delete each.meta;
                        delete each.is;
                        delete each.nutrition;
                        delete each.reporting;
                        delete each.weight;
                        delete each.label;
                        delete each.menu_labels;

                        products.push(each);

                        let productOptions = [];
                        each.options.forEach(eachOpt => {
                            eachOpt.items.forEach(eachOptItem => {
                                eachOptItem.mappingId = eachOptItem.meta.unique_id.toString();
                                eachOptItem.name = eachOptItem.name;
                                eachOptItem.description = eachOptItem.description.en || "";
                                eachOptItem.price = eachOptItem.price.amount ? parseFloat(eachOptItem.price.amount).toFixed(2) : "";
                                eachOptItem.calories = eachOptItem.nutrition.calories ? eachOptItem.nutrition.calories.amount : "";
                                eachOptItem.out_of_stock = eachOptItem.is.out_of_stock || false;
                                eachOptItem.featured = eachOptItem.is.featured || false;
                                eachOptItem.hidden = eachOptItem.is.hidden || false;
                                //clean up products
                                delete eachOptItem.id;
                                delete eachOptItem.meta;
                                delete eachOptItem.is;
                                delete eachOptItem.nutrition;
                                delete eachOptItem.reporting;
                                delete eachOptItem.weight;
                                delete eachOptItem.label;
                                delete eachOptItem.menu_labels;
                                delete eachOptItem.parent_id;

                                modifiers.push(eachOptItem);
                                if (eachOptItem.price) {
                                    // eachOptItem.sortOrder = eachOptItem.meta.menu_sort_number || 0;
                                    productOptions.push(eachOptItem);
                                }
                            });
                        });
                        each.options = productOptions || [];
                    });
                });
                return { products: products, modifiers: modifiers };
            }
        }
        Integration.pingError = "\n     <div class=\"connectError {{source}}\">\n        <div class=\"message\">\n            <span class=\"material-icons\">error</span>\n            <span class=\"error-desc\">{{response}}</span>\n            <span class=\"url\">{{url}}</span>\n        </div>\n    </div>\n        ";
        Integration.pingSuccess = "\n     <div class=\"connectError success {{source}}\">\n        <div class=\"message\">\n            <span class=\"material-icons\">check_circle</span>\n            <span class=\"error-desc\">{{response}}</span>\n            <span class=\"url\">{{url}}</span>\n        </div>\n    </div>\n        ";
        Integration.FULLSCREENERROR = "\n     <div class=\"connectError {{source}}\">\n        <div class=\"message\">\n            <span class=\"material-icons\" style=\"margin-right: 5px; color:{{color}};\">{{type}}</span>\n            <span class=\"error-desc\">{{issue}}</span>\n            <span class=\"url\">{{detail}}</span>\n        </div>\n    </div>\n        ";
        Integration.loading = "\n    <div class=\"loading\">\n        <div class=\"spin\"></div>\n        <img src=\"resources/icon.png\">\n        <div class=\"loading-wrapper\">\n            <div class=\"spinner\">\n                <span class=\"loading-message\">Loading menu data</span> \n                <div class=\"bounce1\">.</div>\n                <div class=\"bounce2\">.</div>\n                <div class=\"bounce3\">.</div>\n            </div>\n        </div>\n    </div>\n";
        Integration.connect = "\n    <div title=\"{{issue}}\" data-tooltip=\"{{source}} Connectivity\" class=\"material-icons connect {{source}}\" style=\"color: {{color}}\">{{error}}</div>\n";
        return Integration;
    })();
    IMSintegration.Integration = Integration;
})(IMSintegration || (IMSintegration = {}));
