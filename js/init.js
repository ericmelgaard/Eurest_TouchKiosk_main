//Publisher: Wand Digital
//Date: 06.22.2026
//Version: 65.0

//asset version
const assetVersion = 65;
//database version
const version = 65;
//settings config
const isUsingSettings = true;
const fullPreview = true;
//leave settingKey blank for co-branded assets
var settingKey = "ZDE0OTNkMjItNGE5My00ZjQ5LWE4ZDMtMzI2NDBhMGZlYjYw";
var settingId_PartnerAPI = ["432"];
var settingsId_Brand = ["433"]; //Sap Code / Business Unit
var settingId_PartnerSite = ["434"]; //Venue / Location
//experimental placeholdder for Centrix
//create
// jeOl2jyXzotZWQa7ROvrIpOM4M473WT5Y1g0wDP1tr7Oq0lXzXUq0yNMAO13FK6jjJ8
//piccola
//allow offline operation if specific data is not required.
const allowMenusOffline = false;
//for legacy brands with rotated content
const assetRotation = 0; //in degrees 0 or 270
//webtrtion config
const staticBusinessUnit = "";
const staticLocation = "";
//menu display options
const mealStation = "";
const mealPeriod = "";
const menuType = "";
const webtritionPageSize = 1000; // page size for paged Webtrition responses
const showPrice = true;
const showProtein = false;
const showDescription = true;
const showPortions = false;
const brandColor = "";
//mealstation name
const staticMealStation = "";
//daypart name
const staticMealPeriod = "";
// full name of station eg Deli 982
const staticLogo = "";
//Avoiding Gluten, avoiding gluten, avoidinggluten
const ignoreIcon = "ageurest";
//end setttings config
const timeZoneOffset = -3; //minus three hours - after midnight support
//development & preview values
const Asset_Zone_ID = "";
const Asset_ID = "";
const Display_ID = "";
const Display_Name = "";
const Daypart_ID = "";
const Daypart_Name = "";
const Store_ID = "";
const Store_Key = "2174";
const Zone_ID = "";
const Duration = "";
const zoneHeight = "";
const zoneWidth = "";
var Partner_API = "webtrition";
var Brand = "31709";
var Establishment = "21332";
var Company_Key = "";
var Concept_Key = "";
const apiKey = "";
//yyyy-mm-dd ex.2026-02-23
const dateToRequest = "";
const devSiteKeys = ["6091", "4873", "4907", "5448", "4756", "6820"];
//icon pack default asset folder IDs
//these are the template defaults; a matching TRM setting overrides them in production
//nutritional: leave blank to keep webtrition icons when no pack/setting is present
//brand: falls back to the brand's text value when blank or the brand is unmatched
//category: shows load errors when blank and no TRM setting is present
var categoryIconPackId = "330406";
var brandLogoIconPackId = "297748";
var nutritionalIconPackId = "302524";
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
var clientDB = null;
var client = window.frameElement ? true : false;
var environment = resolveEnvironmentFromLocationHost(window.location.hostname, client);
var isCF = isContentForecaster();
var cfCurrentTime = CFTime();
var leader = false;
var platform = discoverPlatform();
var menuLayout = null;
var app = null;
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
        var isDevMode = Boolean(development) || Boolean(isPreview) || Boolean(isCF);

        if (isDevMode) {
            console.info("Clarity disabled in development/preview/CF mode.");
            return;
        }

        loadClarity();
    });
})();

(function registerImageServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        console.warn("Service workers are not supported in this runtime.");
        return;
    }

    window.addEventListener("load", function () {
        var isDevMode = Boolean(development) || Boolean(isPreview) || Boolean(isCF);

        if (isDevMode) {
            console.info("servicew workers disabled in development/preview/CF mode.");
            return;
        }

        var assetId = ((typeof AssetConfiguration !== "undefined" && AssetConfiguration && AssetConfiguration.Aid)
            || (typeof Asset_ID !== "undefined" && Asset_ID)
            || "default");
        var swUrl = "./sw.js?assetId=" + encodeURIComponent(assetId);
        navigator.serviceWorker.register(swUrl).then(function (registration) {
            console.info("Image service worker registered with scope:", registration.scope);
        }).catch(function (error) {
            if (!window.isSecureContext) {
                console.warn("Image service worker blocked: this page is not in a secure context (HTTPS or localhost).", error);
                return;
            }
            console.warn("Image service worker registration failed:", error);
        });
    });
})();

//set up Wand environment configuration if not already defined
if (typeof window.getWandEnvironmentConfig !== "function") {
    window.getWandEnvironmentConfig = function () {
        var env = String(environment || "stable").toLowerCase();
        var map = {
            qa: {
                apiHost: "api-qa.wanddigital.com",
                clientHost: "client-qa.wanddigital.com",
                orderStatusHost: "orderstatus-qa.wanddigital.com"
            },
            uat: {
                apiHost: "api-uat.wanddigital.com",
                clientHost: "client-uat.wanddigital.com",
                orderStatusHost: "orderstatus-uat.wanddigital.com"
            },
            stable: {
                apiHost: "api.wanddigital.com",
                clientHost: "client.wanddigital.com",
                orderStatusHost: "orderstatus-prod.wanddigital.com"
            },
            local: {
                apiHost: "api.wanddigital.com",
                clientHost: "client.wanddigital.com",
                orderStatusHost: "orderstatus-prod.wanddigital.com"
            }
        };
        var hosts = map[env] || map.stable;
        return {
            environment: env,
            apiHost: hosts.apiHost,
            clientHost: hosts.clientHost,
            orderStatusHost: hosts.orderStatusHost,
            locationHost: String((window.location && window.location.hostname) || "").toLowerCase(),
            inClient: client
        };
    };
}
//global scope functions
$(document).ready(() => {
    if (client && !development) {
        const trmData = $(window.frameElement.parentElement);
        const trmDataObj = $(trmData).attr("id").split(";");
        const assetNameSpace = $(window.frameElement).attr("src").split("/") || "";
        AssetConfiguration.assetName = assetNameSpace[assetNameSpace.length - 2].replace("%2f", "") || null;
        AssetConfiguration.frameID = $(window.frameElement).attr("id") || "";
        AssetConfiguration.leader = null;
        AssetConfiguration.layer = $(window.frameElement.parentElement).css("z-index") || "";
        AssetConfiguration.height = $(window.frameElement.parentElement).css("height") || "";
        AssetConfiguration.width = $(window.frameElement.parentElement).css("width") || "";
        AssetConfiguration.Daypart = $(trmData).attr("trm-daypartname");
        AssetConfiguration.Display = $(trmData).attr("trm-displayname");
        AssetConfiguration.Duration = $(trmData).attr("trm-duration") * 1000;
        trmDataObj.forEach(each => {
            const property = each.split("=")[0];
            const value = each.split("=")[1];
            AssetConfiguration[property] = value;
        });
        if (devSiteKeys.includes(AssetConfiguration.SKey)) {
            const daypart = Daypart_Name || AssetConfiguration.Daypart;
            const displayName = Display_Name || AssetConfiguration.Display;
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
                "height": zoneHeight || AssetConfiguration.height,
                "width": zoneWidth || AssetConfiguration.width,
                "Zid": Zone_ID || AssetConfiguration.Zid,
                "Duration": Duration || AssetConfiguration.Duration,
            };
            development = true;
        }
    } else {
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
            "height": zoneHeight || null,
            "width": zoneWidth || null,
            "Zid": Zone_ID || null,
            "Duration": Duration || null,
        };
        development = true;
    }
    heartbeatKey = "".concat(AssetConfiguration.SKey, "_leaderHeartbeat(" + version + ")");
    instanceId = AssetConfiguration.AZid;
    //for dev and not while in digital client just assume leader
    if (development && !client) {
        AssetConfiguration.leader = true;
        setupOptionsMenu()
        console.log("🚀 initializing application with configuration 🚀","" ,AssetConfiguration);
        leader = true;
        ready(true);
        return;
    }
    //if asset is clearly observer dont try to be leader
    if (!AssetConfiguration.Duration || !shouldObserve) {
        electLeader()
            .then(isLeader => {
                if (isLeader) {
                    AssetConfiguration.leader = true;
                    console.log(AssetConfiguration);
                    setupOptionsMenu()
                    leader = true;
                    ready(true);
                } else {
                    leader = false;
                    console.log = () => { };
                    ready(false);
                }
            });
        startPeriodicCheck();
    } else {
        AssetConfiguration.leader = false;
        console.log(AssetConfiguration);
        console.log = () => { };
        leader = false;
        ready(false);
        startPeriodicCheck();
    }
});

function resolveEnvironmentFromLocationHost(hostname, inClient) {
    var host = String(hostname || "").toLowerCase();
    if (!inClient) {
        return "local";
    }

    if (host.indexOf("trm-") === 0) {
        var env = host.split(".")[0].substring(4);
        return env || "stable";
    }

    if (host.indexOf("client-") === 0) {
        var clientEnv = host.split(".")[0].substring(7);
        return clientEnv || "stable";
    }

    return "stable";
}

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
        } else {
            $(".loading").remove();
        }
    } else {
        integration = new IMSintegration.Integration(isLeader, isUsingIndexedDB);
    }
    //show cursor in CF
    if (!isCF) {
        $("body").css("cursor", "none");
    }
    //wand lib is ready for trmAnimate now.
    animateObserver();
};

function checkSiblings() {
    if (self.frameElement) {
        const parentEle = $(self.frameElement).parent();
        const siblingEles = $(parentEle).siblings().get();
        let siblingShouldBeLeader = false;
        siblingEles.forEach(each => {
            const siblingData = $(each).attr("id");
            const siblingDuration = $(each).attr("trm-duration");
            if (siblingData.toLowerCase().indexOf("html") > -1 && siblingDuration === "0") {
                siblingShouldBeLeader = true;
            }
        })

        if (siblingShouldBeLeader) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

if (assetRotation) {
    rotateAsset('.asset-wrapper', assetRotation)
}

//check version of chrome to detect webos
function versionTest() {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    const version = raw ? parseInt(raw[2], 10) : false;
    if (version &&
        version > 50) {
        return true;
    } else {
        return false;
    }
}

//get content forecaster time
function CFTime() {
    if (!isCF) {
        return;
    }
    // decode the whole search string first so the fixed-position slice aligns with literal characters
    const t = decodeURIComponent(self.parent.location.search);
    const timeindex = t.indexOf("?currentTime=");
    const cftime = t.slice(timeindex + 13, timeindex + 33);
    // mirror the content forecaster time onto this iframe's own URL
    // (updates the query string in place without reloading the frame)
    try {
        const url = new URL(window.location.href);
        url.searchParams.set("currentTime", cftime);
        window.history.replaceState(null, "", url.toString());
    } catch (err) {
        console.error("Unable to set currentTime on iframe URL:", err);
    }
    const dateCF = new Date(cftime);

    dateCF.setHours(dateCF.getHours() - 3);
    return dateCF.toISOString();
};

//check if in content forecaster
function isContentForecaster() {
    try {
        if (/\bcurrentTime=\b/.test(self.parent.location.search)) {
            return true;
        }
    } catch (err) {
        return false;
    }
    return false;
};

function discoverPlatform() {
    if (!client) {
        return navigator.userAgent;
    }

    // Check for known platforms
    const match = navigator.userAgent.match(/wandjsclient\/([0-9]+)\./);
    if (match) {
        var clientVersion = parseInt(match[1], 10);
    }
    if(isCF){
        return "cf";
    }
    if (/\bWindows\b/.test(navigator.userAgent) && /\bElectron\b/.test(navigator.userAgent) && clientVersion && clientVersion >= 4) {
        return "electron";
    }
    if (/\bWindows\b/.test(navigator.userAgent)) {
        return "windows";
    }
    if (/\bWebOS\b/.test(navigator.userAgent)) {
        return "webos";
    }
    if (/\CrOS\b/.test(navigator.userAgent)) {
        return "chrome";
    }
    return navigator.userAgent;
}


//leader logic
const HEARTBEAT_INTERVAL = 10000; // 10 seconds
const LEADER_TIMEOUT = 30000; // 30 seconds
const MIN_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CHECK_INTERVAL = 60000; // 1 minute
var heartbeatKey;
let heartbeatIntervalId;
var leader = false;
var instanceId; // Unique identifier for this instance
const MAX_RETRIES = 5; // Maximum number of retries for writing to local storage
const BACKOFF_TIME = 100; // Base time (ms) for exponential backoff
let periodicCheckInterval;

function generateUniqueIdea() {
    // Generate a unique idea for this client
    return `${Math.random().toString(36).substring(2)}`;
}

const uniqueIdea = globalThis.__wandUniqueIdea || generateUniqueIdea();
globalThis.__wandUniqueIdea = uniqueIdea;

function sendHeartbeat() {
    const now = Date.now();
    const heartbeatData = {
        timestamp: now,
        leaderId: instanceId,
        idea: uniqueIdea
    };

    localStorage.setItem(heartbeatKey, JSON.stringify(heartbeatData));
}

function isLeaderActive() {
    const heartbeatData = localStorage.getItem(heartbeatKey);
    if (heartbeatData) {
        const parsedData = JSON.parse(heartbeatData);
        const timestamp = parsedData.timestamp;
        return (Date.now() - parseInt(timestamp, 10)) <= LEADER_TIMEOUT;
    }
    return false;
}

function electLeader() {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        const heartbeatData = {
            timestamp: now,
            leaderId: instanceId,
            idea: uniqueIdea
        };

        const attemptElection = retries => {
            if (retries === 0) {
                reject(new Error("Failed to elect leader after maximum retries"));
                return;
            }

            const existingData = localStorage.getItem(heartbeatKey);
            if (!existingData || (Date.now() - parseInt(JSON.parse(existingData).timestamp, 10)) > LEADER_TIMEOUT) {
                try {
                    localStorage.setItem(heartbeatKey, JSON.stringify(heartbeatData));

                    // Verify if the current instance is still the leader
                    setTimeout(() => {
                        const currentData = localStorage.getItem(heartbeatKey);
                        const parsedCurrentData = JSON.parse(currentData);
                        if (parsedCurrentData.idea === uniqueIdea) {
                            leader = true;
                            startHeartbeat();
                            resolve(true);
                        } else {
                            leader = false;
                            clearInterval(heartbeatIntervalId);
                            resolve(false);
                        }
                    }, 60); // A short delay to allow for potential concurrent writes

                } catch (e) {
                    const retryDelay = BACKOFF_TIME * Math.pow(2, MAX_RETRIES - retries);
                    setTimeout(() => { return attemptElection(retries - 1); }, retryDelay);
                }
            } else {
                leader = false;
                clearInterval(heartbeatIntervalId);
                resolve(false);
            }
        };

        attemptElection(MAX_RETRIES);
    });
}

function startHeartbeat() {
    heartbeatIntervalId = setInterval(() => {
        if (leader) {
            sendHeartbeat();
        }
    }, HEARTBEAT_INTERVAL);
}

function getRandomCheckInterval() {
    return Math.floor(Math.random() * (MAX_CHECK_INTERVAL - MIN_CHECK_INTERVAL + 1)) + MIN_CHECK_INTERVAL;
}

function startPeriodicCheck() {
    periodicCheckInterval = setInterval(() => {
        if (!isLeaderActive()) {
            electLeader().then(newLeader => {
                if (newLeader) {
                    console.log = originalConsoleLog;
                    AssetConfiguration.leader = true;
                    console.log(AssetConfiguration);
                    setupOptionsMenu()
                    leader = true;
                    shouldObserve = false; // Reset shouldObserve to false to avoid conflicts
                    integration.new_leader();
                    startHeartbeat();
                } else {
                    console.log = () => { };
                    AssetConfiguration.leader = false;
                    leader = false;
                    clearInterval(heartbeatIntervalId);
                }
            }).catch(error => {
                console.error("Error during periodic leader election:", error);
            });
        }
    }, getRandomCheckInterval());
}
