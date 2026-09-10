//Publisher: Wand Digital
//Date: 09.02.2026
//Version: 65.0

//asset version
const assetVersion = 65;
//database version
const version = 65;
//settings config
const isUsingSettings = true;
const fullPreview = true;
//experimental placeholdder for Centrix
//create
// jeOl2jyXzotZWQa7ROvrIpOM4M473WT5Y1g0wDP1tr7Oq0lXzXUq0yNMAO13FK6jjJ8
//piccola
//allow offline operation if specific data is not required.
const allowMenusOffline = true;
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
const Store_Key = "4873";
const Zone_ID = "";
const Duration = "";
const zoneHeight = "";
const zoneWidth = "";
const Partner_API = ""; 
const Brand = ""; //business unit or sap code
const Establishment = ""; //location or venue
//yyyy-mm-dd ex.2026-02-23
const dateToRequest = "";
const devSiteKeys = ["6091", "4873", "4907", "5448", "4756", "6820"];
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
var isCF = isContentForecaster();
var cfCurrentTime = CFTime();
var leader = false;
var client = window.frameElement ? true : false;
var platform = discoverPlatform();
var menuLayout = null;
var app = null;
var shouldObserve = checkSiblings(); //exclude from leader election process if better sibling exists.
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
    const t = self.parent.location.search;
    const timeindex = t.indexOf("?currentTime=");
    const cftime = t.slice(timeindex + 13, timeindex + 33);
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
    if (/\bWeb0S\b/.test(navigator.userAgent)) {
        return "webos"
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

var uniqueIdea = window.__wandUniqueIdea || generateUniqueIdea();
window.__wandUniqueIdea = uniqueIdea;

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
