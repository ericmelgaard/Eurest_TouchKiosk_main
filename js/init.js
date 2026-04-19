"use strict";
//Publisher: Wand Digital
//Date: 09.09.2025
//asset version
var assetVersion = 63.0;
//database version
var version = 60;
//settings config
var isUsingSettings = true;
var fullPreview = true;
//leave settingKey blank for co-branded assets
var settingKey = "ZDE0OTNkMjItNGE5My00ZjQ5LWE4ZDMtMzI2NDBhMGZlYjYw";
var settingId_PartnerAPI = ["432"];
var settingsId_Brand = ["433"]; //Sap Code / Business Unit
var settingId_PartnerSite = ["434"]; //Venue / Location
//allow offline operation if specific data is not required.
var allowMenusOffline = false;
//for legacy brands with rotated content
var assetRotation = 0; //in degrees 0 or 270
//webtrtion config
var mealStation = "";
var mealPeriod = "";
var menuType = "";
var includeRecipes = false;
var webtritionPageSize = 1000; // page size for paged Webtrition responses
var showPrice = true;
var showProtein = false;
var showDescription = true;
var showPortions = false;
var brandColor = "";
//mealstation name
var staticMealStation = "";
//daypart name
var staticMealPeriod = "";
// full name of station eg Deli 982
var staticLogo = "";
//Avoiding Gluten, avoiding gluten, avoidinggluten
var ignoreIcon = "";
//end setttings config
var timeZoneOffset = -3; //minus three hours - after midnight support
//development & preview values
var Asset_Zone_ID = "";
var Asset_ID = "";
var Display_ID = "";
var Display_Name = "";
var Daypart_ID = "";
var Daypart_Name = "";
var Store_ID = "";
var Store_Key = "7842";
var Zone_ID = "";
var Duration = "";
var Partner_API = "webtrition";
var Brand = "71985";
var Establishment = "72099";
var apiKey = "";
//yyyy-mm-dd ex.2026-04-20
var dateToRequest = "";
var devSiteKeys = ["6091", "4873", "4907", "5448", "4756", "6820"];
//end development & preview values
//global scope variables
var integration = null;
var AssetConfiguration = {};
var originalConsoleLog = console.log;
var development = false;
var isPreview = (window.location.href).indexOf("prod-trmdigitalassets01") > -1;
var isUsingIndexedDB = versionTest();
var trmConfigs = null;
var trmAnchors = null;
var isCF = isContentForecaster();
var CFTime = CFTime();
var leader = false;
var client = window.frameElement ? true : false;
var platform = discoverPlatform();
var menuLayout = null;
var app = null;
var imageStore = [];
var shouldObserve = checkSiblings(); //exclude from leader election process if better sibling exists.

//enable Microsoft Clarity tracking when not in development/preview mode
//grab Microsoft Clarity script from https://www.clarity.ms
(function registerClarityWhenNotDev() {
    function loadClarity() {
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r);
            t.async = 1;
            t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", "w82br31nme");
    }

    window.addEventListener("load", function () {
        var isDevMode = Boolean(window.development) || Boolean(window.isPreview) || Boolean(window.isCF);

        if (isDevMode) {
            console.info("🛑 Clarity disabled in development/preview/CF mode.");
            return;
        }

        loadClarity();
    });
})();

(function registerImageServiceWorker() {
    var cachePrefix = "wand-asset-cache";

    function clearImageCaches() {
        if (typeof caches === "undefined") {
            return Promise.resolve();
        }

        return caches.keys().then(function (keys) {
            var deletions = keys.filter(function (key) {
                return key.indexOf(cachePrefix) === 0;
            }).map(function (key) {
                return caches.delete(key);
            });

            return Promise.all(deletions);
        });
    }

    function unregisterServiceWorkers() {
        return navigator.serviceWorker.getRegistrations().then(function (registrations) {
            var removals = registrations.map(function (registration) {
                return registration.unregister();
            });

            return Promise.all(removals);
        });
    }

    if (!("serviceWorker" in navigator)) {
        console.warn("🛑 Service workers are not supported in this runtime.");
        return;
    }

    var isDevMode = Boolean(window.isPreview) || Boolean(window.isCF);

    if (isDevMode) {
        console.info("🛑 Service workers disabled in preview/CF mode.");
        return;
    }

    window.addEventListener("load", function () {
        navigator.serviceWorker.register("./sw-images.js").then(function (registration) {
            console.info("✅ Image service worker registered with scope:", registration.scope);
        }).catch(function (error) {
            if (!window.isSecureContext) {
                console.warn("🛑 Image service worker blocked: this page is not in a secure context (HTTPS or localhost).", error);
                return;
            }
            console.warn("🛑 Image service worker registration failed:", error);
        });
    });
})();
//global scope functions
$(document).ready(function () {
    if (client && !development) {
        var trmData = $(window.frameElement.parentElement);
        var trmDataObj = $(trmData).attr("id").split(";");
        var assetNameSpace = $(window.frameElement).attr("src").split("/") || "";
        AssetConfiguration.assetName = assetNameSpace[assetNameSpace.length - 2].replace("%2f", "") || null;
        AssetConfiguration.frameID = $(window.frameElement).attr("id") || "";
        AssetConfiguration.leader = null;
        AssetConfiguration.layer = $(window.frameElement.parentElement).css("z-index") || "";
        AssetConfiguration.Daypart = $(trmData).attr("trm-daypartname");
        AssetConfiguration.Display = $(trmData).attr("trm-displayname");
        AssetConfiguration.Duration = $(trmData).attr("trm-duration") * 1000;
        trmDataObj.forEach(function (each) {
            var property = each.split("=")[0];
            var value = each.split("=")[1];
            AssetConfiguration[property] = value;
        });
        if (devSiteKeys.includes(AssetConfiguration.SKey)) {
            var daypart = Daypart_Name || AssetConfiguration.Daypart;
            var displayName = Display_Name || AssetConfiguration.Display;
            AssetConfiguration = {
                "assetName": AssetConfiguration.assetName,
                "frameID": AssetConfiguration.frameID + " in development mode",
                "leader": null,
                "layer": AssetConfiguration.layer,
                "AZid": Asset_Zone_ID || AssetConfiguration.AZid,
                "Daypart": daypart || AssetConfiguration.Daypart,
                "DISid": Display_ID || AssetConfiguration.DISid,
                "Display": displayName || AssetConfiguration.Display,
                "Aid": Asset_ID || AssetConfiguration.Aid,
                "DAYid": Daypart_ID || AssetConfiguration.DAYid,
                "SId": Store_ID || AssetConfiguration.SId,
                "SKey": Store_Key || AssetConfiguration.SKey,
                "Zid": Zone_ID || AssetConfiguration.Zid,
                "Duration": Duration || AssetConfiguration.Duration,
            };
            development = true;
        }
    }
    else {
        AssetConfiguration = {
            "assetName": $("title").text(),
            "frameID": "Local Server",
            "leader": null,
            "layer": null,
            "AZid": Asset_Zone_ID || null,
            "Daypart": Daypart_Name || null,
            "DISid": Display_ID || null,
            "Display": Display_Name || null,
            "Aid": Asset_ID || null,
            "DAYid": Daypart_ID || null,
            "SId": Store_ID || null,
            "SKey": Store_Key || null,
            "Zid": Zone_ID || null,
            "Duration": Duration || null,
        };
        development = true;
    }
    "";
    heartbeatKey = "".concat(AssetConfiguration.SKey, "_leaderHeartbeat(" + version + ")");
    instanceId = AssetConfiguration.AZid;
    //for dev and not while in digital client just assume leader
    if (development && !client) {
        AssetConfiguration.leader = true;
        setupOptionsMenu();
        console.log("🚀 Initializing application with configuration 🚀", "", AssetConfiguration);
        leader = true;
        ready(true);
        return;
    }
    //if asset is clearly observer dont try to be leader
    if (!AssetConfiguration.Duration || !shouldObserve) {
        electLeader()
            .then(function (isLeader) {
            if (isLeader) {
                AssetConfiguration.leader = true;
                console.log(AssetConfiguration);
                setupOptionsMenu();
                leader = true;
                ready(true);
            }
            else {
                leader = false;
                console.log = function () { };
                ready(false);
            }
        });
        startPeriodicCheck();
    }
    else {
        AssetConfiguration.leader = false;
        console.log(AssetConfiguration);
        console.log = function () { };
        leader = false;
        ready(false);
        startPeriodicCheck();
    }
});
function ready(isLeader) {
    if (!menuLayout) {
        try {
            menuLayout = new IMSintegration.MenuLayout();
        } catch (err) {
            console.error("Error initializing MenuLayout:", err);
            IMSintegration.Integration.prototype.showConnect(true, "grey", "menulayout", err, "error");
        }
    }
    if (!app) {
        try {
            app = new IMSintegration.App();
        } catch (err) {
            console.error("Error initializing App:", err);
            IMSintegration.Integration.prototype.showConnect(true, "grey", "app", err, "error");
        }
    }
    if (isPreview) {
        if (fullPreview) {
            $(".loading").remove();
            integration = new IMSintegration.Integration(isLeader, isUsingIndexedDB);
        }
        else {
            $(".loading").remove();
        }
    }
    else {
        integration = new IMSintegration.Integration(isLeader, isUsingIndexedDB);
    }
    //show cursor in CF
    if (!isCF) {
        $("body").css("cursor", "none");
    }
    //wand lib is ready for trmAnimate now.
    animateObserver();

    if (typeof SwipeGestureManager !== 'undefined') {
        SwipeGestureManager.init();
    }
}
;
function checkSiblings() {
    if (self.frameElement) {
        var parentEle = $(self.frameElement).parent();
        var siblingEles = $(parentEle).siblings().get();
        var siblingShouldBeLeader = false;
        siblingEles.forEach(function (each) {
            var siblingData = $(each).attr("id");
            var siblingDuration = $(each).attr("trm-duration");
            if (siblingData.toLowerCase().indexOf("html") > -1 && siblingDuration === "0") {
                siblingShouldBeLeader = true;
            }
        });
        if (siblingShouldBeLeader) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}
if (assetRotation) {
    rotateAsset('.asset-wrapper', assetRotation);
}
//check version of chrome to detect webos
function versionTest() {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    var version = raw ? parseInt(raw[2], 10) : false;
    if (version &&
        version > 90) {
        return true;
    }
    else {
        return false;
    }
}
//get content forecaster time
function CFTime() {
    if (!isCF) {
        return;
    }
    var t = self.parent.location.search;
    var timeindex = t.indexOf("?currentTime=");
    var cftime = t.slice(timeindex + 13, timeindex + 33);
    var dateCF = new Date(cftime);
    dateCF.setHours(dateCF.getHours() - 3);
    return dateCF.toISOString();
}
;
//check if in content forecaster
function isContentForecaster() {
    try {
        if (/\bcurrentTime=\b/.test(self.parent.location.search)) {
            return true;
        }
    }
    catch (err) {
        return false;
    }
    return false;
}
;
function discoverPlatform() {
    if(!client) {
        return navigator.userAgent; 
    }
    
    // Check for known platforms
    var match = navigator.userAgent.match(/wandjsclient\/([0-9]+)\./);
    if (match) {
        var clientVersion = parseInt(match[1], 10);
    }
    if (/\bWindows\b/.test(navigator.userAgent) && /\bElectron\b/.test(navigator.userAgent) && clientVersion && clientVersion >= 4) {
        return "electron";
    }
    if (/\bWindows\b/.test(navigator.userAgent)) {
        return "windows";
    }
    if (/\bWeb0S\b/.test(navigator.userAgent)) {
        return "webos";
    }
    if (/\CrOS\b/.test(navigator.userAgent)) {
        return "chrome";
    }
    return navigator.userAgent;
};
//leader logic
var HEARTBEAT_INTERVAL = 10000; // 10 seconds
var LEADER_TIMEOUT = 30000; // 30 seconds
var MIN_CHECK_INTERVAL = 30000; // 30 seconds
var MAX_CHECK_INTERVAL = 60000; // 1 minute
var heartbeatKey;
var heartbeatIntervalId;
var leader = false;
var instanceId; // Unique identifier for this instance
var MAX_RETRIES = 5; // Maximum number of retries for writing to local storage
var BACKOFF_TIME = 100; // Base time (ms) for exponential backoff
var periodicCheckInterval;
function generateUniqueIdea() {
    // Generate a unique idea for this client
    return "".concat(Math.random().toString(36).substring(2));
}
var uniqueIdea = uniqueIdea ? uniqueIdea : generateUniqueIdea();
function sendHeartbeat() {
    var now = Date.now();
    var heartbeatData = {
        timestamp: now,
        leaderId: instanceId,
        idea: uniqueIdea
    };
    localStorage.setItem(heartbeatKey, JSON.stringify(heartbeatData));
}
function isLeaderActive() {
    var heartbeatData = localStorage.getItem(heartbeatKey);
    if (heartbeatData) {
        var parsedData = JSON.parse(heartbeatData);
        var timestamp = parsedData.timestamp;
        return (Date.now() - parseInt(timestamp, 10)) <= LEADER_TIMEOUT;
    }
    return false;
}
function electLeader() {
    return new Promise(function (resolve, reject) {
        var now = Date.now();
        var heartbeatData = {
            timestamp: now,
            leaderId: instanceId,
            idea: uniqueIdea
        };
        var attemptElection = function (retries) {
            if (retries === 0) {
                reject(new Error("Failed to elect leader after maximum retries"));
                return;
            }
            var existingData = localStorage.getItem(heartbeatKey);
            if (!existingData || (Date.now() - parseInt(JSON.parse(existingData).timestamp, 10)) > LEADER_TIMEOUT) {
                try {
                    localStorage.setItem(heartbeatKey, JSON.stringify(heartbeatData));
                    // Verify if the current instance is still the leader
                    setTimeout(function () {
                        var currentData = localStorage.getItem(heartbeatKey);
                        var parsedCurrentData = JSON.parse(currentData);
                        if (parsedCurrentData.idea === uniqueIdea) {
                            leader = true;
                            startHeartbeat();
                            resolve(true);
                        }
                        else {
                            leader = false;
                            clearInterval(heartbeatIntervalId);
                            resolve(false);
                        }
                    }, 60); // A short delay to allow for potential concurrent writes
                }
                catch (e) {
                    var retryDelay = BACKOFF_TIME * Math.pow(2, MAX_RETRIES - retries);
                    setTimeout(function () { return attemptElection(retries - 1); }, retryDelay);
                }
            }
            else {
                leader = false;
                clearInterval(heartbeatIntervalId);
                resolve(false);
            }
        };
        attemptElection(MAX_RETRIES);
    });
}
function startHeartbeat() {
    heartbeatIntervalId = setInterval(function () {
        if (leader) {
            sendHeartbeat();
        }
    }, HEARTBEAT_INTERVAL);
}
function getRandomCheckInterval() {
    return Math.floor(Math.random() * (MAX_CHECK_INTERVAL - MIN_CHECK_INTERVAL + 1)) + MIN_CHECK_INTERVAL;
}
function goHome(event) {
    event.stopPropagation();
    console.log('Home button clicked');
    $('.page').hide();
    $('.home').show();
    if (typeof InactivityManager !== 'undefined') {
        InactivityManager.pause();
    }
}
function startPeriodicCheck() {
    periodicCheckInterval = setInterval(function () {
        if (!isLeaderActive()) {
            electLeader().then(function (newLeader) {
                if (newLeader) {
                    console.log = originalConsoleLog;
                    AssetConfiguration.leader = true;
                    console.log(AssetConfiguration);
                    setupOptionsMenu();
                    leader = true;
                    shouldObserve = false; // Reset shouldObserve to false to avoid conflicts
                    integration.new_leader();
                    startHeartbeat();
                }
                else {
                    console.log = function () { };
                    AssetConfiguration.leader = false;
                    leader = false;
                    clearInterval(heartbeatIntervalId);
                }
            }).catch(function (error) {
                console.error("Error during periodic leader election:", error);
            });
        }
    }, getRandomCheckInterval());
}
