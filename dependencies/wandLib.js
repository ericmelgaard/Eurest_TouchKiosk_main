"use strict";
//***wandLib.js***
//Date: 06.22.2026
//Version: 65.0

$(document).ready(function () {
    let cursorIdleTimeout;
    const cursorIdleDelay = 2000; // ms
    function showCursor() {
        document.body.style.cursor = '';
        clearTimeout(cursorIdleTimeout);
        cursorIdleTimeout = setTimeout(() => {
            document.body.style.cursor = 'none';
        }, cursorIdleDelay);
    }
    window.addEventListener('mousemove', showCursor);
    showCursor();
});

function setupOptionsMenu() {

    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'options-dropdown';
    dropdownMenu.style.position = 'relative';
    if (!client) {
        dropdownMenu.innerHTML = `
    <div class="dropdown-item" data-action="refresh">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Refresh</span>
    </div>
    <div class="dropdown-item" data-action="reset">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Reset</span>
    </div>
    <div class="dropdown-item" data-action="rotate">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
      <span>Rotate</span>
    </div>
    <div class="dropdown-item" data-action="expand">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
      </svg>
      <span>Expand</span>
    </div>
  `;
    } else {
        dropdownMenu.innerHTML = `
    <div class="dropdown-item" data-action="refresh">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Refresh</span>
    </div>
    <div class="dropdown-item" data-action="reset">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Reset</span>
    </div>
  `;
    }


    // Create container for the options menu
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container options-hidden';
    optionsContainer.appendChild(dropdownMenu);


    // Add to document
    document.body.appendChild(optionsContainer);

    // Track if custom menu is open
    let customMenuOpen = false;

    // Show custom menu at mouse position (viewport coordinates, unaffected by scale)
    function showCustomMenu(x, y) {
        // Get current scale from body transform
        let scale = 1;
        const transform = document.body.style.transform;
        if (transform && transform.startsWith('scale(')) {
            scale = parseFloat(transform.replace('scale(', '').replace(')', '')) || 1;
        }

        // Adjust coordinates for scale
        let left = x / scale;
        let top = y / scale;

        const menuWidth = optionsContainer.offsetWidth;
        const menuHeight = optionsContainer.offsetHeight;
        const viewportWidth = window.innerWidth / scale;
        const viewportHeight = window.innerHeight / scale;

        if (left + menuWidth > viewportWidth) {
            left = Math.max(viewportWidth - menuWidth, 0);
        }
        if (top + menuHeight > viewportHeight) {
            top = Math.max(viewportHeight - menuHeight, 0);
        }

        optionsContainer.style.position = 'fixed';
        optionsContainer.classList.remove('options-hidden');
        dropdownMenu.classList.add('show');
        optionsContainer.style.left = left + 'px';
        optionsContainer.style.top = top + 'px';
        customMenuOpen = true;
        document.body.style.cursor = '';
    }
    // Hide custom menu
    function hideCustomMenu() {
        optionsContainer.classList.add('options-hidden');
        dropdownMenu.classList.remove('show');
        customMenuOpen = false;
        document.body.style.cursor = '';
    }

    // Listen for right-click (contextmenu)
    document.addEventListener('contextmenu', function (e) {
        if (!customMenuOpen) {
            e.preventDefault();
            showCustomMenu(e.clientX, e.clientY);
        } else {
            // Hide custom menu and allow default context menu
            hideCustomMenu();
            // Let browser show default menu
        }
    });

    // Hide custom menu on click elsewhere
    document.addEventListener('click', function (e) {
        if (customMenuOpen && !optionsContainer.contains(e.target)) {
            hideCustomMenu();
        }
    });

    // Handle dropdown item clicks
    dropdownMenu.addEventListener('click', function (e) {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        const windowToggleScale = new CustomEvent('windowToggleScale');
        switch (action) {
            case 'refresh':
                document.refreshAsset();
                break;
            case 'reset':
                document.clearAssetStorage();
                break;
            case 'rotate':
                assetRotation = assetRotation === 270 ? 0 : 270;
                rotateAsset('.asset-wrapper', assetRotation)
                break;
            case 'expand':
                window.dispatchEvent(windowToggleScale);
                break;
        }
        hideCustomMenu();
    });

    return {
        optionsContainer,
        dropdownMenu
    };
}

function animateObserver() {
    if (!menuLayout.trmAnimate) {
        return;
    }
    if (!client) {
        //exit it not in client
        menuLayout.trmAnimate(true, true);
        document.isPlaying = function (playing) {
            menuLayout.trmAnimate(playing);
            return "Simulate playing(" + playing + ") event..";
        };
        return;
    }
    //allow client to start animations
    if (platform === "windows" || isCF) {
        var trmConfig = {
            attributes: true
        };
        var trmPlaying = "";
        var trmCallBack = function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === "attributes" && mutation.attributeName === "trm-playing") {
                    if (trmPlaying.getAttribute("trm-playing") === "false") {
                        menuLayout.trmAnimate(false);
                    }
                    if (trmPlaying.getAttribute("trm-playing") === "true") {
                        menuLayout.trmAnimate(true);
                    }
                }
            });
        };
        if (window.frameElement) {
            trmPlaying = (".zone-wrapper", self.frameElement.parentElement);
            //setup observer
            try {
                var trmObserver = new MutationObserver(trmCallBack);
                trmObserver.observe(trmPlaying, trmConfig);
            } catch (err) {
                console.log(err);
            }
        }
        //start initial animation
        menuLayout.trmAnimate(true, true);
        return;
    }
    if (platform === "webos" || platform === "chrome" || platform === "electron") {
        document.isPlaying = function (playing) {
            menuLayout.trmAnimate(playing);
        };
        //start initial animation
        menuLayout.trmAnimate(true, true);
    }
}
//scale to window size
var scale = 1; // Initial scale
var isScaled = true;
$(document).ready(function () {
    var outer = $("body");
    var wrapper = $("html");
    var maxWidth = $("body").width();
    var maxHeight = $("body").height();
    window.addEventListener("resize", resize);
    window.addEventListener("windowToggleScale", toggleScale);
    resize();
    function toggleScale(event) {
        if (isScaled) {
            window.removeEventListener("resize", resize);
            $("body").css("transform", "");
            scale = 1;
            isScaled = false;
            $("body").css("overflow", "visible");
        }
        else {
            window.addEventListener("resize", resize);
            resize();
            isScaled = true;
            $("body").css("overflow", "hidden");
        }
    }
    function resize() {
        outer = $("body");
        wrapper = $("html");
        maxWidth = $("body").width();
        maxHeight = $("body").height();
        var width = window.innerWidth;
        var height = window.innerHeight;
        scale = Math.min(width / maxWidth, height / maxHeight); // Update scale
        $(outer)[0].style.transform = 'scale(' + scale + ')';
    }
});
function rotateAsset(elm, deg) {
    // Get the computed style of the body
    const forceResize = new CustomEvent('resize');
    const bodyStyle = window.getComputedStyle(document.body);
    const bodyWidth = bodyStyle.width;
    const bodyHeight = bodyStyle.height;

    // Swap body height and width
    document.body.style.width = bodyHeight;
    document.body.style.height = bodyWidth;

    $(elm).css('margin-left', 0).css('margin-top', 0);
    $(".fallback-wrapper").css('margin-left', 0).css('margin-top', 0);
    //
    if (deg === 0 && isScaled) {
        $(elm).css('transform', 'rotate(' + deg + 'deg)');
        $(".fallback-wrapper").css('transform', 'rotate(' + deg + 'deg)');
        window.dispatchEvent(forceResize);
        return;
    }
    //    $(elm).css('transform', 'rotate('+ deg +'deg)');
    var offsetContLeft, offsetContTop, offsetLeft, offsetTop, newLeft, newTop;
    $(elm).css('transform', 'rotate(' + deg + 'deg)');
    $(".fallback-wrapper").css('transform', 'rotate(' + deg + 'deg)');
    // Get the container offset
    offsetContLeft = $(elm).parent().offset().left;
    offsetContTop = $(elm).parent().offset().top;
    // get the new rotated offset
    offsetLeft = $(elm).offset().left;
    offsetTop = $(elm).offset().top;
    // Subtract the two offsets.
    newLeft = (offsetContLeft - offsetLeft) / scale;
    newTop = (offsetContTop - offsetTop) / scale;
    // Apply the new offsets to the margin of the element.
    $(elm).css('margin-left', newLeft).css('margin-top', newTop);
    $(".fallback-wrapper").css('margin-left', newLeft).css('margin-top', newTop);

    window.dispatchEvent(forceResize);
}
//get Current Time
function currentTime() {
    if (isCF) {
        return cfCurrentTime.split("T")[0] + "T00:00:00";
    } else {
        if (!development || dateToRequest === "") {
            var tzoffset = new Date().getTimezoneOffset() * 60000;
            var localISOTime = new Date(Date.now() - tzoffset + (timeZoneOffset * 60000))
                .toISOString()
                .slice(0, -1);
            localISOTime = localISOTime.split("T")[0] + "T00:00:00";
        } else {
            localISOTime = dateToRequest + "T00:00:00";
        }
        return localISOTime;
    }
};

function resetSync() {
    return new Promise((resolve, reject) => {
        try {
            if (leader) {
                // clear syncs
                var anchors = JSON.parse(self.localStorage.getItem(AssetConfiguration.SKey + "_anchors(" + version + ")"));
                for (let key in anchors) {
                    if (anchors[key].hasOwnProperty('lastSync')) {
                        delete anchors[key].lastSync; // or set it to null: parsedData[key].lastSync = null;
                    }
                }
                localStorage.setItem(AssetConfiguration.SKey + "_anchors(" + version + ")", JSON.stringify(anchors));
                resolve("Anchors cleared and reloaded.");
            }
        } catch (error) {
            reject("An error occurred: " + error);
        }
    });
}

function releaseVideos() {
    $('video').each(function () {
        $(this).attr('src', '');
        $(this).find('source').attr('src', ''); //catch nested sources
        this.load(); // Reload the video element to apply the changes
    });
}
document.refreshAsset = function () {
    if (leader) {
        $("body").toggleClass("blink")
        integration.cached_start();
        setTimeout(function () {
            $("body").toggleClass("blink")
        }, 1000)
    } else {
        $("body").toggleClass("blink")
        setTimeout(function () {
            $("body").toggleClass("blink")
        }, 1000)
    }
    return "Simualte refreshAsset() event";
};
//future add to digital to clear remotely
//switched to synthetic reload
document.clearAssetStorage = function () {
    //full display refresh: drop every cache except the client's own (WAND_APP), then reinit
    clearAssetCaches().then(function () {
        if (leader) {
            return new Promise(function (resolve, reject) {
                clearDatabases()
                    .then(resolve)
                    .catch(reject);
            }).then(function () {
                integration.init(leader, isUsingIndexedDB)
            });
        }
        integration.init(leader, isUsingIndexedDB)
    });
    return "Simulate clearAssetStorage() event";
};
//clearAssetStorage is a whole-display refresh, so drop every cache on this
//origin EXCEPT the client's own caches (identified by the "WAND_APP" marker).
//Deleted caches are transparently refetched on the next request.
function clearAssetCaches() {
    if (typeof caches === "undefined") {
        return Promise.resolve();
    }
    var CLIENT_CACHE_MARKER = "WAND_APP";
    return caches.keys().then(function (keys) {
        var deletions = keys.filter(function (key) {
            //preserve client files; remove asset/other-app caches
            return key.toUpperCase().indexOf(CLIENT_CACHE_MARKER) === -1;
        }).map(function (key) {
            console.log("Clearing cache: " + key);
            return caches.delete(key);
        });
        return Promise.all(deletions);
    }).catch(function (err) {
        console.error("Error clearing asset caches:", err);
    });
}
//function used by asset to clear storage and ignore TRM or client dependencies
function clearDatabases() {
    console.log("Database maintenance start..");
    var ignoreList = ["Dig", "deviceAuth", "DeviceData"];
    return new Promise(function (resolve, reject) {
        if (isUsingIndexedDB) {
            Dexie.getDatabaseNames().then(function (dataBases) {
                var deletionPromises = [];
                dataBases.forEach(function (each) {
                    // Check if DB name contains any ignore key
                    var shouldIgnore = ignoreList.some(function (ignoreKey) {
                        return each.indexOf(ignoreKey) > -1;
                    });

                    if (isCF || development) {
                        // In CF or development: delete unless in ignoreList
                        if (!shouldIgnore) {
                            console.log("Deleting.. " + each);
                            deletionPromises.push(Dexie.delete(each).catch(function (err) {
                                console.error("Error deleting database:", err);
                                reject(err);
                            }));
                        } else {
                            console.log("Ignoring.. " + each);
                        }
                    } else {
                        // In client: only delete if matches version
                        if (each.indexOf("(" + version + ")") > -1) {
                            console.log("Deleting.. " + each);
                            deletionPromises.push(Dexie.delete(each).catch(function (err) {
                                console.error("Error deleting database:", err);
                                reject(err);
                            }));
                        } else {
                            console.log("Ignoring.. " + each);
                        }
                    }
                });
                // Wait for all deletions to complete
                Promise.all(deletionPromises)
                    .then(function () {
                        console.log("DB maintenance complete");
                        // Proceed with localStorage maintenance
                        clearLocalStorage(resolve);
                    })
                    .catch(reject);
            }).catch(reject);
        } else {
            clearLocalStorage(resolve);
        }
    });
}

function clearLocalStorage(resolve) {
    var ignoreList = [
        "Dig", "deviceAuth", "DeviceData", "MostRecentCCGS", "SessionLastRefresh", "SessionTimeOut",
        "TrmClientConfig", "WeatherUpdate", "ccgsItems", "deviceIdentityInfo", "isCcgsOpen", "isNavOpen",
        "userId", "navItems", "weatherLocation"
    ];
    var LSlength = self.localStorage.length;
    var keys = [];
    for (var i = 0; i < LSlength; i++) {
        keys.push(self.localStorage.key(i));
    }
    keys.forEach(function (each) {
        var shouldIgnore = ignoreList.some(function (ignoreKey) {
            return each.indexOf(ignoreKey) > -1;
        });

        if (isCF || development) {
            // In CF or development: delete unless in ignoreList
            if (!shouldIgnore) {
                console.log("Deleting.. " + each);
                self.localStorage.removeItem(each);
            } else {
                console.log("Ignoring.. " + each);
            }
        } else {
            // In client: only delete if matches version
            if (each.indexOf("(" + version + ")") > -1) {
                console.log("Deleting.. " + each);
                self.localStorage.removeItem(each);
            } else {
                console.log("Ignoring.. " + each);
            }
        }
    });
    console.log("Local Storage maintenance complete");
    resolve();
}
//clean up on exits or closes so new leader can be elected.
//should I do something more in content forecaster..
window.addEventListener('beforeunload', function (event) {
    // Perform actions before the page unloads
    if (platform === "webos") {
        releaseVideos();
    }
    if (leader) {
        self.localStorage.removeItem(heartbeatKey);
    }
});

//04.16.2025 - detect date changes in content forecaster preview and clear heartbeat to trigger new leader election and data refresh on next load
$(document).ready(function () {
    if (isCF) {
        const btn = self.top.document.querySelector('.preview-button');
        if (btn) {
            btn.addEventListener('click', () => {
                self.localStorage.removeItem(heartbeatKey);
                clientDB = null; // Clear clientDB to force fresh data fetch on next load
                console.log("⏳ Content Forecaster: Date/Time change detected.");
            });
        } else {
            console.warn("⚠️ Content Forecaster: Preview button not found");
        }
    }
});

function hideFallback() {
    $(".fallback-wrapper").hide();
    
    // Clear any existing timeout
    if (window.fallbackShowTimeout) {
        clearTimeout(window.fallbackShowTimeout);
    }
    
    // Set timeout to show again after 30 seconds of inactivity
    window.fallbackShowTimeout = setTimeout(function() {
        $(".fallback-wrapper").show();
    }, 30000);
}


//Rotate V6.0
//rotate element code on overflow
var config = {
    attributes: false,
    childList: true,
    subtree: true
};
var observerObj = [];
var queued = [];
var callback = function (event, observer) {
    var unique = [];
    event.forEach(function (each) {
        var divId = $(each.target).attr("data-rotate-id");
        if (divId && !unique[divId]) {
            unique[divId] = true;
            if (observerObj[divId].isRotating) {
                observerObj[divId].shouldReset = true;
            }
            else {
                //stay in sync if adding new rotation
                if ($(".rotation-wrapper").length > 0) {
                    queued.push({
                        id: divId,
                        target: each.target,
                    });
                }
                else {
                    observerObj[divId].rotate($(each.target), observerObj[divId].configs, observerObj[divId].data);
                }
            }
        }
    });
};
var rotateObserver = new MutationObserver(callback);
//global call function 1 or many
var rotateZones = function (node, options) {
    // Default settings
    var settings = $.extend({
        delay: 0,
        cycle: 8000,
        fill: 'packed',
        transition: 'fade'
    }, options);
    $(node).css("overflow", "hidden");
    setTimeout(function () {
        $(node).get().forEach(function (each, idx) {
            if ($(each).attr("data-rotate-id") !== undefined || $(each).attr("target") === "true") {
                return;
            }
            $("body").css("transform", "");
            var rotateId = makeid(8);
            $(each).attr("data-rotate-id", rotateId);
            if (!observerObj[rotateId]) {
                observerObj[rotateId] = new Rotate();
                observerObj[rotateId].configs = settings;
                observerObj[rotateId].data = rotateId;
                observerObj[rotateId].rotate($(each), settings, rotateId);
                rotateObserver.observe(each, config);
            }
        });
    }, settings.delay);
};
function clearQueue() {
    queued.forEach(function (each) {
        observerObj[each.id].rotate($(each.target), observerObj[each.id].configs, observerObj[each.id].data);
    });
    if (queued.length > 0) {
        console.log("queue cleared");
        queued = [];
    }
}
function makeid(length) {
    var result = "";
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    var counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
var Rotate = /** @class */ (function () {
    function Rotate() {
        this.delay = null;
        this.cycle = null;
        this.fill = null;
        this.ele = null;
        this.data = [];
        this.transition = null;
        this.timeOut = [];
        this.hidden = false;
        this.zone = null;
        this.shouldReset = false;
        this.pass = 0;
        this.originalLength = 0;
        this.isRotating = false;
    }
    Rotate.prototype.rotate = function (ele, obj, id) {
        this.originalHeight = ele[0].clientHeight;
        this.ele = ele;
        if (!document.body.contains($(ele)[0])) {
            var forceResize = new CustomEvent('resize');
            window.dispatchEvent(forceResize);
            return;
        }
        this.delay = obj.delay ? obj.delay * 1000 : 0;
        this.cycle = obj.cycle * 1000;
        this.fill = obj.fill ? obj.fill : "packed";
        this.transition = obj.transition ? obj.transition : "fade";
        this.id = id;
        this.build();
    };
    Rotate.prototype.build = function () {
        var _this = this;
        this.zoneToRotate = this.ele[0];
        this.instanceID = this.id;
        $("#" + this.instanceID).empty().remove();
        if (this.zoneToRotate) {
            // cache jQuery references used multiple times
            var $zone = $(this.zoneToRotate);

            // Check if $zone needs position:relative for offset measurements
            // We only need to change static elements - others are already positioned and good reference points
            var computedStyle = window.getComputedStyle(this.zoneToRotate);
            var currentPosition = computedStyle.position;

            // Only change position if it's static (which doesn't establish a positioning context)
            if (currentPosition === 'static') {
                // Store original coordinates to detect if position:relative would move it
                var originalTop = this.zoneToRotate.offsetTop;
                var originalLeft = this.zoneToRotate.offsetLeft;

                // Temporarily set position relative to check if it moves the element
                $zone.css('position', 'relative');
                var newTop = this.zoneToRotate.offsetTop;
                var newLeft = this.zoneToRotate.offsetLeft;

                // If the element moved when we set position:relative, compensate
                if (newTop !== originalTop || newLeft !== originalLeft) {
                    // Calculate and apply offset to maintain original visual position
                    var topOffset = originalTop - newTop;
                    var leftOffset = originalLeft - newLeft;
                    $zone.css({
                        'position': 'relative',
                        'top': topOffset + 'px',
                        'left': leftOffset + 'px'
                    });
                }
                // If no movement, position:relative is already applied and safe
            }
            // If already positioned (relative, absolute, fixed, sticky, etc.), 
            // leave it alone - it's already a good positioning context


            this.settings = { delay: this.delay || 0, cycle: this.cycle || 0, fill: this.fill || "", transition: this.transition || "fade" };
            this.hiddenDiv = [];
            this.itemProperties = [];
            this.groupProperties = [];
            this.zoneProperties = {
                overflowingHeight: false, overflowingWidth: false,
                left: this.zoneToRotate.offsetLeft, top: this.zoneToRotate.offsetTop,
                width: this.zoneToRotate.offsetWidth, height: this.zoneToRotate.offsetHeight,
                actualWidth: this.zoneToRotate.scrollWidth, actualHeight: this.zoneToRotate.scrollHeight
            };
            this.originalHeight = this.originalHeight || $zone.height();
            if (this.zoneProperties.actualHeight > this.zoneProperties.height) {
                this.zoneProperties.overflowingHeight = true;
            }
            if (this.zoneProperties.actualWidth > this.zoneProperties.width) {
                this.zoneProperties.overflowingWidth = true;
            }
            if (this.zoneProperties.overflowingWidth && this.zoneProperties.overflowingHeight) {
                if ((this.zoneProperties.actualWidth - this.zoneProperties.width) > (this.zoneProperties.actualHeight - this.zoneProperties.height)) {
                    this.zoneProperties.overflowingWidth = true;
                    this.zoneProperties.overflowingHeight = false;
                }
                else {
                    this.zoneProperties.overflowingWidth = false;
                    this.zoneProperties.overflowingHeight = true;
                }
            }
            //reset if not overflowing
            if (!this.zoneProperties.overflowingWidth && !this.zoneProperties.overflowingHeight) {
                $(this.zoneToRotate).css("visibility", "");
                this.isRotating = false;
                const forceResize = new CustomEvent('resize');
                window.dispatchEvent(forceResize);
                return;
            }

            //create rotations wrapper
            var zoneWrapper = document.createElement('div');
            $(zoneWrapper).addClass("rotation-wrapper");
            $(zoneWrapper)
                .css("top", this.zoneProperties.top)
                .css("left", this.zoneProperties.left)
                .css("height", this.originalHeight)
                .css("width", this.zoneProperties.width)
                .css("position", "absolute")
                .css("transition", "all 0.3s ease")
                .attr("data-rotate-id", _this.instanceID);

            // Add hover state
            $(zoneWrapper).hover(
                function () {
                    // Mouse enter
                    $(this).css({
                        "background": "rgba(255, 255, 255, 0.1)",
                        "box-shadow": "0 0 20px rgba(0, 123, 255, 0.5)"
                    });
                },
                function () {
                    // Mouse leave
                    $(this).css({
                        "background": "transparent",
                        "box-shadow": "none"
                    });
                }
            );

            zoneWrapper.id = this.id;

            var $zoneWrapper = $(zoneWrapper);
            $zone.parent().append(zoneWrapper);
            $zone.css("visibility", "hidden");

            this.items = $zone.children().toArray();
            $zone.attr("isRotating", "true");
            this.page = -1;
            this.heightRemainderOffset = 0;
            this.items.forEach(function (eachItem) {
                var adjustedTop = eachItem.offsetTop + (_this.zoneProperties.overflowingHeight ? _this.heightRemainderOffset : 0);
                _this.pageCalc = _this.zoneProperties.overflowingHeight
                    ? Math.floor((adjustedTop + (eachItem.offsetHeight >= _this.zoneProperties.height ? 0 : eachItem.offsetHeight)) / _this.zoneProperties.height)
                    : Math.floor((eachItem.offsetLeft + (eachItem.offsetWidth >= _this.zoneProperties.width ? 0 : eachItem.offsetWidth)) / _this.zoneProperties.width);

                if (_this.zoneProperties.overflowingHeight && eachItem.offsetHeight > 0 && eachItem.offsetHeight < _this.zoneProperties.height) {
                    var topWithinPage = adjustedTop % _this.zoneProperties.height;
                    var visibleOnCurrentPage = _this.zoneProperties.height - topWithinPage;
                    if (visibleOnCurrentPage > 0 && eachItem.offsetHeight > visibleOnCurrentPage) {
                        var overflowOnNextPage = eachItem.offsetHeight - visibleOnCurrentPage;
                        if (visibleOnCurrentPage > overflowOnNextPage) {
                            _this.heightRemainderOffset += visibleOnCurrentPage;
                        }
                    }
                }

                if (_this.pageCalc > _this.page) {
                    _this.page = _this.pageCalc;
                    _this.groupProperties.push(createDiv());
                }
                //create cloned zone
                function createDiv() {
                    var div = document.createElement('div');
                    div.id = "RG-" + _this.page + "-" + _this.instanceID;
                    // use jQuery for class additions consistently
                    $(div).addClass("cloned-element");
                    var zoneClass = $(_this.zoneToRotate).attr("class");
                    if (zoneClass) {
                        $(div).addClass(zoneClass);
                    }
                    $(div)
                        .css("position", "absolute")
                        .css("height", _this.zoneProperties.height + "px")
                        .css("width", _this.zoneProperties.width + "px")
                        .css("top", "0px")
                        .css("left", "0px");
                    $(div).attr("target", true);
                    if (_this.page > 0) {
                        $(div).css("visibility", "hidden");
                        _this.hiddenDiv.push(div);
                    }
                    return div;
                }
                _this.itemProperties.push({
                    "page": _this.page,
                    "width": eachItem.offsetWidth,
                    "height": eachItem.offsetHeight,
                    "ele": (function () {
                        var clone = eachItem.cloneNode(true);
                        clone.data = eachItem.data ? eachItem.data : []; // Reattach custom data
                        return clone;
                    })()
                });
            });
            //add items
            this.itemProperties.forEach(function (eachItem) {
                $(eachItem.ele).addClass("cloned-element");
                $(_this.groupProperties[eachItem.page]).append(eachItem.ele);
            });
            // Even distribution: redistribute items across pages to balance visual weight while preserving order
            if (this.settings.fill === "even") {
                // Collect all items in their original order with dimensions
                var allItems = [];
                _this.itemProperties.forEach(function (item) {
                    allItems.push({
                        element: item.ele,
                        width: item.width,
                        height: item.height
                    });
                });
                // Clear all existing page assignments
                _this.groupProperties.forEach(function (eachDiv) {
                    $(eachDiv).empty();
                });
                var totalPages = _this.groupProperties.length;
                var pageItems = [];
                var pageWeights = [];
                // Initialize page arrays and weight tracking
                for (var p = 0; p < totalPages; p++) {
                    pageItems[p] = [];
                    pageWeights[p] = 0;
                }
                // Round-robin distribution with weight balancing
                // This preserves order while trying to balance visual weight
                var currentPage = 0;
                allItems.forEach(function (item, index) {
                    // For every few items, switch to the lightest page to balance weight
                    if (index > 0 && index % 3 === 0) {
                        var lightestPage = 0;
                        var dimension = _this.zoneProperties.overflowingHeight ? 'height' : 'width';
                        for (var i = 1; i < totalPages; i++) {
                            if (pageWeights[i] < pageWeights[lightestPage]) {
                                lightestPage = i;
                            }
                        }
                        currentPage = lightestPage;
                    }
                    // Add item to current page
                    pageItems[currentPage].push(item);
                    // Update weight tracking
                    if (_this.zoneProperties.overflowingHeight) {
                        pageWeights[currentPage] += item.height;
                    }
                    else {
                        pageWeights[currentPage] += item.width;
                    }
                    // Move to next page (round-robin)
                    currentPage = (currentPage + 1) % totalPages;
                });
                // Add redistributed items to their assigned pages
                pageItems.forEach(function (items, pageIndex) {
                    items.forEach(function (item) {
                        $(item.element).addClass("cloned-element");
                        $(_this.groupProperties[pageIndex]).append(item.element);
                    });
                });
            }
            // use TRM duration if 0 duration and possibl   
            if (this.settings.cycle === 0) {
                this.settings.TRMDuration = AssetConfiguration.Duration ? AssetConfiguration.Duration : null;
                this.settings.TRMDuration = this.settings.TRMDuration && this.settings.TRMDuration != 0 ? this.settings.TRMDuration / this.groupProperties.length : 8000;
                this.settings.cycle = this.settings.TRMDuration > 4000 ? this.settings.TRMDuration : 8000;
            }
            _this.groupProperties.forEach(function (eachDiv, idx) {
                //handle last zone for flex containers
                if (idx === _this.groupProperties.length - 1 && _this.overflowingwidth) {
                    if (_this.fill != "even") {
                        $(eachDiv).css("justify-content", "normal");
                    }
                }
                $(eachDiv).attr("Duration", _this.settings.cycle / 1000);
                if (idx === 0) {
                    $(eachDiv).attr("playing", "true");
                }
                else {
                    $(eachDiv).attr("playing", "false");
                }
                $zoneWrapper.append(eachDiv);
            });
            var forceResize = new CustomEvent('resize');
            window.dispatchEvent(forceResize);
            setTimeout(function () {
                _this.animate($zoneWrapper, _this.settings.cycle, _this.settings.transition, _this.settings.delay, false);
            }, _this.settings.cycle + _this.settings.delay);
            _this.watch(zoneWrapper, _this.settings);
        }
        this.isRotating = true;
    };
    Rotate.prototype.watch = function (zoneWrapper, settings) {
        var _this = this;
        try {
            var config = {
                attributes: true
            };
            var playing = (".zone-wrapper", self.frameElement.parentElement);
            var mutationCallBack = function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === "attributes" && mutation.attributeName === "trm-playing") {
                        if (playing.getAttribute("trm-playing") === "false" && _this.hidden === false) {
                            _this.hidden = true;
                            _this.timeOut.forEach(function (each) {
                                clearTimeout(each);
                            });
                            _this.timeOut = [];
                        }
                        if (playing.getAttribute("trm-playing") === "true" && _this.hidden === true) {
                            observer.disconnect();
                            _this.hidden = false;
                            _this.animate(_this.zone, _this.settings.cycle, _this.settings.transition, _this.delay, true);
                            observer.observe(playing, config);
                        }
                    }
                });
            };
            var observer = new MutationObserver(mutationCallBack);
            observer.observe(playing, config);
        }
        catch (err) {
            function stop() {
                if (document.hidden && _this.hidden != true) {
                    _this.hidden = true;
                    _this.timeOut.forEach(function (each) { clearTimeout(each); });
                    _this.timeOut = [];
                    console.log("hidden");
                }
                if (document.hidden === false && _this.hidden != false) {
                    _this.hidden = false;
                    _this.animate(_this.zone, _this.settings.cycle, _this.settings.transition, _this.delay, true);
                    console.log("showing");
                }
            }
            document.addEventListener("visibilitychange", stop);
        }
    };
    Rotate.prototype.animate = function (zone, cycle, transition, delay, restart) {
        var _this = this;
        var menus = $(zone).find("[target='true']");
        var length = menus.length;
        var menuTransitionIndex = -1;
        var queueDelayCalc = delay > 0 ? ((cycle * length) - delay) : 0;
        _this.zone = zone;
        $(menus).hide();
        $(menus[0]).show();
        $(menus).css("visibility", "");
        if (length === 1) {
            return;
        }
        function crossFade(transition) {
            if (_this.shouldReset && menuTransitionIndex === -1) {
                _this.shouldReset = false;
                console.log("rebuilt" + "-" + _this.instanceID);
                _this.delay = 0;
                _this.pass = 0;
                _this.build();
                return;
            }
            if (_this.hidden === true) {
                $(menus).stop(true, true);
                return;
            }
            menuTransitionIndex++;
            $(menus[menuTransitionIndex]).fadeOut("slow");
            $(menus[menuTransitionIndex]).attr("playing", "false");
            var next = menuTransitionIndex + 1;
            if (menuTransitionIndex >= length - 1) {
                menuTransitionIndex = -1;
                setTimeout(function () {
                    clearQueue();
                }, queueDelayCalc);
                $(menus.get(0)).fadeIn("slow");
                $(menus.get(0)).attr("playing", "true");
            }
            else {
                $(menus.get(next)).fadeIn("slow");
                $(menus.get(next)).attr("playing", "true");
            }
            _this.timeOut.push(setTimeout(function () {
                crossFade(transition);
            }, cycle));
        }
        if (restart) {
            (setTimeout(function () {
                crossFade(transition);
            }, _this.delay + cycle));
        }
        else {
            crossFade(transition);
        }
    };
    return Rotate;
}());
//includes() polyfill
//V1.0
//objectValues()
if (!Object.values) {
    Object.values = function (obj) {
        return Object.keys(obj).map(function (key) {
            return obj[key];
        });
    };
}
//Mine
if (!Array.prototype.includes) {
    Array.prototype.includes = function (valueToFind, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
            return false;
        }
        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (o[k] === valueToFind || (typeof o[k] === 'number' && typeof valueToFind === 'number' && isNaN(o[k]) && isNaN(valueToFind))) {
                return true;
            }
            k++;
        }
        return false;
    };
}

// MenuRotator: private scoped menu rotation logic
var MenuRotator = (function () {
    var menuRotationInterval = null;
    var menuRotationConfig = {
        target: '.station-wrapper',
        fadeDuration: 800,
        displayDuration: 6000,
        nextStationFn: null
    };

    // Refactored to accept (target, options)
    function rotateMenus(target, options) {
        // Set defaults and merge with options
        var settings = $.extend({
            fadeDuration: 800,
            delay: 0,
            cycle: 6000,
            transition: 'fade'
        }, options);

        var $stations = $(target);
        if ($stations.length <= 1) return;
        var currentIdx = 0;
        var fadeDuration = settings.fadeDuration || settings.transition === 'fade' ? 800 : 0;
        var displayDuration = (settings.cycle || 6000) * 1; // ms

        // Hide all except the first
        $stations.css({ opacity: 0, visibility: 'hidden', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1 });
        $stations.eq(0).css({ opacity: 1, visibility: 'visible', position: 'relative', zIndex: 2 });

        function nextStation() {
            var prevIdx = currentIdx;
            currentIdx = (currentIdx + 1) % $stations.length;
            $stations.eq(currentIdx)
                .css({ position: 'relative', visibility: 'visible', zIndex: 3 })
                .stop(true, true)
                .animate({ opacity: 1 }, fadeDuration);
            $stations.eq(prevIdx)
                .css({ zIndex: 2 })
                .stop(true, true)
                .animate({ opacity: 0 }, fadeDuration, function () {
                    $(this).css({ visibility: 'hidden', position: 'absolute', zIndex: 1 });
                });
        }

        // Store config for pause/resume
        menuRotationConfig = {
            target: target,
            fadeDuration: fadeDuration,
            displayDuration: displayDuration,
            nextStationFn: nextStation
        };
        if (menuRotationInterval) {
            clearInterval(menuRotationInterval);
        }
        menuRotationInterval = setInterval(nextStation, displayDuration + fadeDuration);
    }

    function pauseMenuRotation() {
        if (menuRotationInterval) {
            clearInterval(menuRotationInterval);
            menuRotationInterval = null;
        }
    }
    function resumeMenuRotation() {
        pauseMenuRotation();
        var cfg = menuRotationConfig;
        if (cfg && typeof cfg.nextStationFn === 'function') {
            setTimeout(function () {
                if (!menuRotationInterval) {
                    menuRotationInterval = setInterval(cfg.nextStationFn, (cfg.displayDuration || 6000) + (cfg.fadeDuration || 800));
                }
            }, 300);
        }
    }
    return {
        rotateMenus: rotateMenus,
        pauseMenuRotation: pauseMenuRotation,
        resumeMenuRotation: resumeMenuRotation
    };
})();

var rotateMenus = MenuRotator.rotateMenus;

//fullscren error template and function

var FULLSCREENERROR = `
<div class="full-screen-error-wrapper {{source}}">
    <div class="full-screen-error">
        <div class="error-text">
            <div class="errorHeader">{{{issue}}}</div>
            <div class="errorDescription">{{{detail}}}</div>
            <div class="errorContact">
                <img height="50" src="resources/phone-icon.png" alt="Phone Icon" />
            </div>
        </div>
        <div class="error-QR">
            <img height="175" src="resources/supportQR.png" alt="Support QR Code" />
        </div>
    </div>
</div>
`
var showFullScreenError = function (toggle, issue, detail) {
    //will be removing to global function
    var obj = {
        "issue": issue || null,
        "detail": detail || null,
    };
    var issue = Mustache.to_html(FULLSCREENERROR, obj);
    $(".loading-wrapper").remove();
    //handle toggle
    if (toggle === "replace") {
        $(".full-screen-error-wrapper").replaceWith(issue);
        return
    }
    if (!toggle) {
        $(".full-screen-error-wrapper").remove();
        return;
    }
    if (toggle) {
        if (!$(".full-screen-error-wrapper").length) {
            $("body").append(issue);
            return;
        }
    }
}

//TRM Data Inteface
//get TRM data with indexedDB, filter by options, and return promise with results

async function readClientDB(options = {}) {
  const DIG_DB_NAME = "Dig";
  const now = new Date();
  const nowEpoch = Math.floor(now.getTime() / 1000);
  const daypartIdFilter = options.daypartId != null ? Number(options.daypartId) : null;
  const storeKeyFilter = options.storeKey != null ? Number(options.storeKey) : null;
  const storeIdFilter = options.storeId != null ? String(options.storeId) : null;
  const zoneIdFilter = options.zoneId != null ? Number(options.zoneId) : null;
  const assetZoneIdFilter = options.assetZoneId != null ? Number(options.assetZoneId) : null;
  const assetIdFilter = options.assetId != null ? Number(options.assetId) : null;
  const displayIdFilter = options.displayId != null ? Number(options.displayId) : null;
  const deviceNumberFilter = options.deviceNumber != null ? Number(options.deviceNumber) : null;
  const displayNumberFilter = options.displayNumber != null ? Number(options.displayNumber) : null;
  const requestedPlatform = options.platform != null ? String(options.platform).toLowerCase() : "";
  const explicitPlatformBasePath = options.platformBasePath != null ? String(options.platformBasePath) : "";

  function deriveElectronPlatformBasePathFromLocation(loc) {
    if (!loc || String(loc.protocol).toLowerCase() !== "file:") return "";

    var pathname = decodeURIComponent(loc.pathname || "").replace(/\\/g, "/");
    pathname = pathname.replace(/\/index\.html.*$/i, "/");

    // Windows file URL pathnames are usually /C:/...
    if (/^\/[A-Za-z]:\//.test(pathname)) {
      pathname = pathname.substring(1);
    }

    pathname = pathname.replace(/\/+$/, "");
    return "file:///" + pathname + "/content/";
  }

  const derivedElectronPlatformBasePath =
    requestedPlatform === "electron" && !explicitPlatformBasePath && typeof location !== "undefined"
      ? deriveElectronPlatformBasePathFromLocation(location)
      : "";

  function openDb(dbName) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("Failed to open DB"));
      req.onupgradeneeded = () => {
        // We are not managing schema here.
        // If this fires, DB may not exist yet in this context.
      };
    });
  }

  function getDisplayNumberFromLocation() {
    if (typeof location === "undefined") return null;

    try {
      const parsed = new URL(String(location.href || ""));
      const raw = parsed.searchParams.get("displayNumber");
      if (raw == null || raw === "") return null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    } catch (err) {
      var href = String((location && location.href) || "");
      var match = href.match(/[?&]displayNumber=([^&#]+)/i);
      if (!match) return null;
      var fromHref = Number(match[1]);
      return Number.isFinite(fromHref) ? fromHref : null;
    }
  }

  function readStore(db, storeName) {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);

      const rows = [];
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          rows.push(cursor.value);
          cursor.continue();
        } else {
          resolve(rows);
        }
      };
      req.onerror = () => reject(req.error || new Error(`Failed reading ${storeName}`));
    });
  }

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function isEffectiveNow(record, epoch) {
    if (!record) return false;
    const eff = Number(record.EffectiveEpoch || 0);
    const term = Number(record.TerminateEpoch || 0);
    if (eff > epoch) return false;
    return term === 0 || term >= epoch;
  }

  function isTimeRangeActive(startSeconds, endSeconds, currentSeconds) {
    if (startSeconds === endSeconds) return true;
    if (endSeconds < startSeconds) return currentSeconds >= startSeconds || currentSeconds < endSeconds;
    return currentSeconds >= startSeconds && currentSeconds < endSeconds;
  }

  function isDayAndTimeActiveNow(record, date) {
    const dayFlags = [
      !!record.Sunday, !!record.Monday, !!record.Tuesday, !!record.Wednesday,
      !!record.Thursday, !!record.Friday, !!record.Saturday
    ];
    if (!dayFlags[date.getDay()]) return false;
    const nowSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    return isTimeRangeActive(Number(record.StartSeconds || 0), Number(record.EndSeconds || 0), nowSeconds);
  }

  function isLayerDaypartActiveNow(layer, dayparts, date, epoch) {
    if (daypartIdFilter !== null && Number(layer.DaypartId) !== daypartIdFilter) {
      return false;
    }

    const matches = dayparts.filter((dp) =>
      dp.Active &&
      dp.DaypartActive &&
      dp.WeekScheduleActive &&
      dp.DaypartId === layer.DaypartId &&
      isEffectiveNow(dp, epoch)
    );
    return matches.some((dp) => isDayAndTimeActiveNow(dp, date));
  }

  function matchesStoreFilter() {
    if (storeKeyFilter === null && !storeIdFilter) {
      return true;
    }

    for (var i = 0; i < arguments.length; i++) {
      var record = arguments[i];
      if (!record) continue;

      var recStoreKey = record.StoreKey != null ? Number(record.StoreKey) : null;
      var recStoreId = record.StoreId != null ? String(record.StoreId) : null;

      var storeKeyOk = storeKeyFilter === null || recStoreKey === storeKeyFilter;
      var storeIdOk = !storeIdFilter || recStoreId === storeIdFilter;

      if (storeKeyOk && storeIdOk && (recStoreKey !== null || recStoreId !== null)) {
        return true;
      }
    }

    // If a store filter was requested but store fields are missing in this DB version,
    // keep records rather than hard-failing to maximize compatibility.
    return true;
  }

  function buildImagePath(primaryFile) {
    if (!primaryFile) return "";
    const clientPath = String(primaryFile.ClientPath || "").replace(/^\/+/, "");
    return clientPath + String(primaryFile.Filename || "");
  }

  function buildPlatformPath(asset) {
    if (!asset) return "";

    function normalizeBasePath(basePath) {
      var normalized = String(basePath || "");
      if (normalized === "") return "";
      if (normalized.charAt(normalized.length - 1) !== "/") normalized += "/";
      return normalized;
    }

    if (explicitPlatformBasePath) {
      return normalizeBasePath(explicitPlatformBasePath) + String(asset.AssetId) + "/";
    }

    if (derivedElectronPlatformBasePath) {
      return normalizeBasePath(derivedElectronPlatformBasePath) + String(asset.AssetId) + "/";
    }

    var shouldUseWebOsContentPath =
      options.useWebOsContentPath === true
      || requestedPlatform === "webos"
      || requestedPlatform === "web_os"
      || requestedPlatform === "lgwebos";

    // Runtime hint for WebOS app container paths.
    if (!shouldUseWebOsContentPath && typeof location !== "undefined") {
      var href = String(location.href || "").toLowerCase();
      if (href.indexOf("com.lg.app.signage") > -1) {
        shouldUseWebOsContentPath = true;
      }
    }

    if (shouldUseWebOsContentPath) {
      return "./content/" + String(asset.AssetId) + "/";
    }

    if (asset.BaseUrl) {
      return normalizeBasePath(asset.BaseUrl) + String(asset.AssetId) + "/";
    }

    // Safe fallback for local playback when BaseUrl is absent.
    return "./content/" + String(asset.AssetId) + "/";
  }

  // Re-home an asset URL onto the origin that served the parent app. The CMS
  // mints absolute URLs on the TRM/media host (e.g. trm-qa.wandcorp.com), which
  // is a different origin than the client host serving this app
  // (e.g. client-qa.wanddigital.com). Same-origin is required for embedded HTML
  // assets (window.frameElement / direct DOM), so we rewrite the origin while
  // keeping the path — the parent host proxies/redirects /cms_mediafiles/... .
  function toParentOriginUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
    if (typeof location === "undefined") return rawUrl;
    // Only meaningful over http(s); leave file:// (Electron/WebOS) untouched.
    if (location.protocol !== "http:" && location.protocol !== "https:") return rawUrl;
    try {
      var resolved = new URL(rawUrl, location.href);
      // Relative URLs and already-matching origins need no change.
      if (resolved.origin === location.origin) return rawUrl;
      return location.origin + resolved.pathname + resolved.search + resolved.hash;
    } catch (err) {
      return rawUrl;
    }
  }

  function toFileType(assetTypeName) {
    switch (String(assetTypeName || "").toUpperCase()) {
      case "JPEG":
      case "JPG":
      case "GIF":
      case "PNG":
        return "image";
      case "MP4":
      case "WEBM":
      case "MKV":
      case "OGG":
        return "video";
      case "HTML":
      case "HTML5":
      case "COMPONENT":
      case "WEB APP":
        return "html";
      case "SWF":
        return "swf";
      default:
        return "unknown";
    }
  }

  function buildElementId(parts) {
    parts = parts || {};

    // gen=1 flags this id as generated by the data interface so embedded
    // assets can be treated differently.
    // Order and keys match the id string consumed by the player:
    // Aid=..;Zid=..;AZid=..;type=..;DISid=..;DAYid=..;SId=..;SKey=..;gen=1
    var withMeta = {
      Aid: parts.Aid,
      Zid: parts.Zid,
      AZid: parts.AZid,
      type: parts.type,
      DISid: parts.DISid,
      DAYid: parts.DAYid,
      SId: parts.SId,
      SKey: parts.SKey,
      gen: 1
    };

    var order = ["Aid", "Zid", "AZid", "type", "DISid", "DAYid", "SId", "SKey", "gen"];
    var pieces = [];
    for (var i = 0; i < order.length; i++) {
      var key = order[i];
      var value = withMeta[key];
      pieces.push(key + "=" + (value == null ? "" : String(value)));
    }
    return pieces.join(";");
  }

  function ext(name) {
    if (!name || !String(name).includes(".")) return "";
    return String(name).split(".").pop().toLowerCase();
  }

  function baseName(name) {
    if (!name || !String(name).includes(".")) return String(name || "");
    const n = String(name);
    return n.slice(0, n.lastIndexOf("."));
  }

  function isContentScheduleUrl(value) {
    if (!value || typeof value !== "string") return false;
    var cleaned = value.split("?")[0].split("#")[0];
    return /displaycontentschedule\.json$/i.test(cleaned) || /contentschedule\.json$/i.test(cleaned);
  }

  function getScheduleUrl(sourceUrl) {
    if (!sourceUrl) return null;

    if (isContentScheduleUrl(sourceUrl)) {
      return sourceUrl;
    }

    try {
      var parsed = new URL(sourceUrl, typeof location !== "undefined" ? location.href : undefined);
      var found = null;
      parsed.searchParams.forEach(function (paramValue) {
        if (!found && isContentScheduleUrl(paramValue)) {
          found = decodeURIComponent(paramValue);
        }
      });
      if (found) return found;
    } catch (err) {
      // fallback below
    }

    var allParams = String(sourceUrl).match(/[?&][^=]+=([^&]+)/gi) || [];
    for (var i = 0; i < allParams.length; i++) {
      var entry = allParams[i];
      var eq = entry.indexOf("=");
      if (eq === -1) continue;
      var candidate = entry.slice(eq + 1);
      try {
        candidate = decodeURIComponent(candidate);
      } catch (decodeErr) {
        // keep candidate as-is
      }
      if (isContentScheduleUrl(candidate)) return candidate;
    }

    return null;
  }

  function getCfSourceUrl() {
    // Content Forecaster: source URL is either preview panel #2 src or the current location.
    try {
      if (typeof window !== "undefined" && window.parent && window.parent.document) {
        var panels = window.parent.document.querySelectorAll(".preview-panel");
        if (panels && panels.length > 1) {
          var panelSrc = panels[1].getAttribute("src") || "";
          if (panelSrc) {
            return panelSrc;
          }
        }
      }
    } catch (err) {
      // Cross-frame access can fail in some contexts; fallback to location.href.
    }

    if (typeof location !== "undefined" && location.href) {
      return String(location.href);
    }

    return "";
  }

  function getPricingUrl(scheduleUrl) {
    if (!scheduleUrl || typeof scheduleUrl !== "string") return null;
    var clean = scheduleUrl.split("?")[0].split("#")[0];
    if (!/displaycontentschedule\.json$/i.test(clean)) return null;
    return scheduleUrl.replace(/displaycontentschedule\.json/ig, "Pricing.json");
  }

  function toSeconds(value) {
    if (!value) return 0;
    if (typeof value === "string") {
      var parts = value.split(":");
      return (Number(parts[0] || 0) * 3600) + (Number(parts[1] || 0) * 60) + Number(parts[2] || 0);
    }
    if (typeof value === "object") {
      return (Number(value.hours || 0) * 3600) + (Number(value.minutes || 0) * 60) + Number(value.seconds || 0);
    }
    return 0;
  }

  function isCfAssetDayAndTimeActive(asset, date) {
    if (!asset || !asset.Engage || asset.Deploy === false) return false;
    var dayKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayKey = dayKeys[date.getDay()];
    if (asset[dayKey] !== true) return false;
    var nowSeconds = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
    return isTimeRangeActive(toSeconds(asset.StartTime), toSeconds(asset.EndTime), nowSeconds);
  }

  function normalizePricingText(value) {
    if (value == null) return "";

    if (Array.isArray(value)) {
      var parts = [];
      for (var i = 0; i < value.length; i++) {
        var normalizedPart = normalizePricingText(value[i]);
        if (normalizedPart) parts.push(normalizedPart);
      }
      return parts.join(" | ");
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (err) {
        return String(value);
      }
    }

    return String(value)
      .replace(/↵/g, " ")
      .replace(/\r\n|\r|\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractMenuItemsFromPricing(pricingData) {
    var customItems = pricingData && Array.isArray(pricingData.CustomItems) ? pricingData.CustomItems : [];
    var pricingMenuItems = pricingData && Array.isArray(pricingData.MenuItems) ? pricingData.MenuItems : [];
    var all = customItems.concat(pricingMenuItems);

    return all.map(function (item) {
      var normalized = Object.assign({}, item);
      var textValue = normalizePricingText(normalized.TextValue || normalized.Value);
      var priceValue = normalizePricingText(normalized.Price);
      var resolvedValue = textValue || priceValue || "";

      if (!Object.prototype.hasOwnProperty.call(normalized, "Value") || normalized.Value == null || String(normalized.Value).trim() === "") {
        normalized.Value = resolvedValue;
      }

      if (Object.prototype.hasOwnProperty.call(normalized, "TextValue")) {
        normalized.TextValue = normalizePricingText(normalized.TextValue);
      }
      if (Object.prototype.hasOwnProperty.call(normalized, "Value")) {
        normalized.Value = normalizePricingText(normalized.Value);
      }
      if (Object.prototype.hasOwnProperty.call(normalized, "Price")) {
        normalized.Price = normalizePricingText(normalized.Price);
      }

      if (Object.prototype.hasOwnProperty.call(normalized, "value")) {
        delete normalized.value;
      }

      return normalized;
    });
  }

  function extractAssetDetailFromSchedule(scheduleData, scheduleUrl) {
    var rows = [];
    var displayGroups = scheduleData && Array.isArray(scheduleData.DisplayGroups) ? scheduleData.DisplayGroups : [];
    var basePath = "";
    if (scheduleUrl && typeof scheduleUrl === "string") {
      var idx = scheduleUrl.lastIndexOf("/");
      basePath = idx > -1 ? scheduleUrl.slice(0, idx + 1) : "";
    }

    displayGroups.forEach(function (group) {
      var deployments = group && Array.isArray(group.Deployments) ? group.Deployments : [];
      deployments.forEach(function (deployment) {
        var dayparts = deployment && Array.isArray(deployment.Dayparts) ? deployment.Dayparts : [];
        dayparts.forEach(function (daypart) {
          if (daypartIdFilter !== null && Number(daypart.ID || daypart.DaypartID || 0) !== daypartIdFilter) {
            return;
          }

          var layersInDaypart = daypart && Array.isArray(daypart.Layers) ? daypart.Layers : [];
          layersInDaypart.forEach(function (layer) {
            var layerRegions = layer && Array.isArray(layer.Regions) ? layer.Regions : [];
            layerRegions.forEach(function (region) {
              var cfZones = region && Array.isArray(region.Zones) ? region.Zones : [];
              cfZones.forEach(function (zone) {
                if (zoneIdFilter !== null && Number(zone.ID || zone.ZoneId || 0) !== zoneIdFilter) {
                  return;
                }

                var cfAssets = zone && Array.isArray(zone.Assets) ? zone.Assets : [];
                cfAssets.forEach(function (asset) {
                  if (assetZoneIdFilter !== null && Number(asset.AssetZoneId || 0) !== assetZoneIdFilter) {
                    return;
                  }

                  if (assetIdFilter !== null && Number(asset.ID || asset.AssetId || 0) !== assetIdFilter) {
                    return;
                  }

                  if (!isCfAssetDayAndTimeActive(asset, now)) {
                    return;
                  }

                  var rawFile = String(asset.AssetFile || "");
                  var assetIdString = String(asset.ID || asset.AssetId || "");
                  var normalizedFile = String(rawFile).replace(/^\/+/, "");
                  try {
                    normalizedFile = decodeURIComponent(normalizedFile);
                  } catch (decodeErr) {
                    // Keep original when malformed escape sequences are present.
                  }
                  normalizedFile = normalizedFile.replace(/\/{2,}/g, "/");
                  var fileNameOnly = normalizedFile.indexOf("/") > -1
                    ? normalizedFile.split("/").pop()
                    : normalizedFile;

                  var imagePath = normalizedFile.indexOf("/") > -1
                    ? normalizedFile
                    : (assetIdString + "/" + normalizedFile).replace(/^\/+/, "");

                  var platformPath = basePath;
                  if (/\/cms_mediafiles\/preview\//i.test(basePath) && assetIdString !== "") {
                    platformPath = basePath.replace(/\/cms_mediafiles\/preview\/[^\/]+\/[^\/]+\//i, "/cms_mediafiles/DIGITAL_ASSETS_NX01/") + assetIdString + "/";
                    // Keep nested asset paths (e.g., HTML app folders) in CF preview mode.
                    imagePath = normalizedFile.indexOf("/") > -1 ? normalizedFile : fileNameOnly;
                  }
                  var fullPath = toParentOriginUrl(platformPath + imagePath);
                  var cfFileType = toFileType(asset.AssetType);
                  var cfElementId = buildElementId({
                    Aid: asset.ID || asset.AssetId,
                    Zid: zone.ID || asset.ZoneId,
                    AZid: asset.AssetZoneId,
                    type: cfFileType,
                    DISid: displayIdFilter,
                    DAYid: daypart.ID || daypart.DaypartID || daypartIdFilter,
                    SId: storeIdFilter,
                    SKey: storeKeyFilter
                  });

                  rows.push({
                    assetId: String(asset.ID || ""),
                    assetName: String(asset.Name || ""),
                    azId: String(asset.AssetZoneId || ""),
                    duration: Number(asset.DurationSeconds || 0),
                    elementId: cfElementId,
                    fileExtension: ext(rawFile),
                    fileName: baseName(rawFile),
                    fileType: cfFileType,
                    fullPath: fullPath,
                    imageLayer: String(layer.ID || ""),
                    layerZOrder: Number(layer.ZOrder || 0),
                    imagePath: imagePath,
                    platformPath: platformPath,
                    sequence: String(asset.SequenceNumber || 0),
                    zoneId: String(zone.ID || asset.ZoneId || ""),
                    zoneName: String(zone.Name || ""),
                    regionName: String(region.Name || ""),
                    isDayAndTimeActive: true,
                    isCurrentDaypartActive: true,
                    isCampaignActive: true,
                    isCurrentDaypartAndCampaignActive: true
                  });
                });
              });
            });
          });
        });
      });
    });

    return rows;
  }

  async function fetchJson(url) {
    if (!url) throw new Error("Missing URL to fetch JSON.");
    var response = await fetch(url, { method: "GET", credentials: "same-origin" });
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status + " for " + url);
    }
    return response.json();
  }

  async function fetchJsonWithRetry(url, options) {
    if (!url) throw new Error("Missing URL to fetch JSON.");

    var cfg = options || {};
    var attempts = Number(cfg.attempts || 30);
    var delayMs = Number(cfg.delayMs || 1500);
    var label = cfg.label || "resource";
    var lastErr = null;

    for (var i = 0; i < attempts; i++) {
      try {
        return await fetchJson(url);
      } catch (err) {
        lastErr = err;
        var message = String((err && err.message) || "");
        var isNotFound = message.indexOf("status 404") > -1;
        var isNetworkError = message.indexOf("Failed to fetch") > -1 || message.indexOf("NetworkError") > -1;
        var shouldRetry = isNotFound || isNetworkError;

        if (!shouldRetry || i === attempts - 1) {
          break;
        }

        console.warn("CF " + label + " not ready yet. Retry " + (i + 1) + "/" + attempts + " for " + url);
        await new Promise(function (resolve) {
          setTimeout(resolve, delayMs);
        });
      }
    }

    throw lastErr || new Error("Failed to fetch " + label + " JSON: " + url);
  }

  function toUnifiedResponse(payload) {
    var safePayload = payload || {};
    return {
      source: safePayload.source || "unknown",
      assetDetail: Array.isArray(safePayload.assetDetail) ? safePayload.assetDetail : [],
      menuItems: Array.isArray(safePayload.menuItems) ? safePayload.menuItems : [],
      scheduleUrl: safePayload.scheduleUrl || null,
      pricingUrl: safePayload.pricingUrl || null
    };
  }

  async function loadFromCfPath() {
    var sourceUrl = getCfSourceUrl();

    var resolvedScheduleUrl = getScheduleUrl(sourceUrl);
    if (!resolvedScheduleUrl && sourceUrl && /contentschedule\.json/i.test(sourceUrl)) {
      resolvedScheduleUrl = sourceUrl;
    }

    if (!resolvedScheduleUrl) {
      throw new Error("CF path could not resolve schedule URL from preview panel src or location.href.");
    }

    var scheduleData = await fetchJsonWithRetry(resolvedScheduleUrl, {
      attempts: 40,
      delayMs: 1500,
      label: "schedule"
    });
    var resolvedPricingUrl = getPricingUrl(resolvedScheduleUrl);

    var pricingData = null;
    if (resolvedPricingUrl) {
      try {
        pricingData = await fetchJsonWithRetry(resolvedPricingUrl, {
          attempts: 20,
          delayMs: 1500,
          label: "pricing"
        });
      } catch (err) {
        pricingData = null;
      }
    }

    return toUnifiedResponse({
      source: "cf",
      assetDetail: extractAssetDetailFromSchedule(scheduleData, resolvedScheduleUrl),
      menuItems: extractMenuItemsFromPricing(pricingData),
      scheduleUrl: resolvedScheduleUrl,
      pricingUrl: resolvedPricingUrl
    });
  }

  var forceCf =
    requestedPlatform === "cf"
    || (typeof isCF !== "undefined" && isCF === true);
  if (forceCf) {
    return loadFromCfPath();
  }

  const db = await openDb(DIG_DB_NAME);
  try {
    const [
      displayDeployments,
      displaySchedules,
      campaigns,
      layers,
      dayparts,
      zones,
      regions,
      assetZones,
      deploymentAssetZones,
      assets,
      assetFiles,
      menuItems,
      menuItemDetails,
      displays,
      devices,
      kvstorage
    ] = await Promise.all([
      readStore(db, "displayDeployments"),
      readStore(db, "displaySchedules"),
      readStore(db, "campaigns"),
      readStore(db, "layers"),
      readStore(db, "dayparts"),
      readStore(db, "zones"),
      readStore(db, "regions"),
      readStore(db, "assetZones"),
      readStore(db, "deploymentAssetZones"),
      readStore(db, "assets"),
      readStore(db, "assetFiles"),
      readStore(db, "menuItems"),
      readStore(db, "menuItemDetails"),
      readStore(db, "displays"),
      readStore(db, "devices"),
      readStore(db, "kvstorage")
    ]);

    let resolvedDisplayId = displayIdFilter;
    const inferredDisplayNumberRaw =
      displayNumberFilter !== null
        ? displayNumberFilter
        : getDisplayNumberFromLocation();
    const inferredDisplayNumber = inferredDisplayNumberRaw !== null
      ? inferredDisplayNumberRaw
      : 1;

    const displayDataEntry = kvstorage.find((row) =>
      row && String(row.key || "").toLowerCase() === "displaydata"
    );
    const cachedDisplayData = Array.isArray(displayDataEntry && displayDataEntry.value)
      ? displayDataEntry.value
      : [];

    // Match client behavior: resolve current display by displayNumber whenever possible.
    if (resolvedDisplayId === null) {
      const matchedDisplay = displays.find((d) =>
        d.Active && Number(d.DisplayNumber) === Number(inferredDisplayNumber)
      );
      if (matchedDisplay) {
        resolvedDisplayId = Number(matchedDisplay.DisplayId);
      }
    }

    if (resolvedDisplayId === null) {
      const cachedDisplay = cachedDisplayData.find((d) =>
        d && Number(d.DisplayNumber) === Number(inferredDisplayNumber)
      );
      if (cachedDisplay && cachedDisplay.DisplayId != null) {
        resolvedDisplayId = Number(cachedDisplay.DisplayId);
      }
    }

    if (resolvedDisplayId === null) {
      if (deviceNumberFilter === null) {
        throw new Error("Unable to resolve display. Provide displayId/deviceNumber or run from a URL with ?displayNumber=");
      }
      const device = devices.find((d) => d.Active && Number(d.DeviceNumber) === deviceNumberFilter);
      if (!device) throw new Error(`No active device for deviceNumber ${deviceNumberFilter}`);
      const display = displays.find((d) =>
        d.Active
        && d.DeviceId === device.DeviceId
        && (inferredDisplayNumber === null || Number(d.DisplayNumber) === Number(inferredDisplayNumber))
      ) || displays.find((d) => d.Active && d.DeviceId === device.DeviceId);
      if (!display) throw new Error(`No active display for deviceId ${device.DeviceId}`);
      resolvedDisplayId = Number(display.DisplayId);
    }

    const activeDeployments = displayDeployments.filter((dd) =>
      dd.Active && Number(dd.DisplayId) === resolvedDisplayId && isEffectiveNow(dd, nowEpoch)
    );

    const activeDeploymentIds = activeDeployments.map((d) => d.DisplayDeploymentId);
    const activeScheduleIds = activeDeployments.map((d) => d.DisplayScheduleId);

    const activeSchedules = displaySchedules.filter((ds) =>
      ds.Active && activeScheduleIds.includes(ds.DisplayScheduleId) && isEffectiveNow(ds, nowEpoch)
    );

    const activeCampaignIds = activeSchedules.map((ds) => ds.CampaignId);
    const activeCampaigns = campaigns.filter((c) => c.Active && activeCampaignIds.includes(c.CampaignId));

    const activeLayers = layers.filter((l) =>
      (daypartIdFilter === null || Number(l.DaypartId) === daypartIdFilter) &&
      l.Active && activeCampaigns.some((c) => c.CampaignId === l.CampaignId)
    );

    const activeZones = zones.filter((z) =>
      (zoneIdFilter === null || Number(z.ZoneId) === zoneIdFilter) &&
      z.Active && isEffectiveNow(z, nowEpoch) && activeLayers.some((l) => l.LayerId === z.LayerId)
    );

    const zoneIds = new Set(activeZones.map((z) => z.ZoneId));
    const baseAZs = assetZones.filter((az) =>
      az.Active
      && zoneIds.has(az.ZoneId)
      && (assetZoneIdFilter === null || Number(az.AssetZoneId) === assetZoneIdFilter)
      && (assetIdFilter === null || Number(az.AssetId) === assetIdFilter)
    );

    const effectiveOverrides = deploymentAssetZones.filter((daz) =>
      daz.Active &&
      isEffectiveNow(daz, nowEpoch) &&
      activeDeploymentIds.includes(daz.DisplayDeploymentId) &&
      baseAZs.some((az) => az.AssetZoneId === daz.AssetZoneId)
    );

    const result = [];
    for (const az of baseAZs) {
      const override = effectiveOverrides.find((o) => o.AssetZoneId === az.AssetZoneId);
      const effectiveAZ = override || az;
      if (!(isEffectiveNow(az, nowEpoch) || !!override)) continue;
      if (!effectiveAZ.ShouldEngage) continue;
      if (!isDayAndTimeActiveNow(effectiveAZ, now)) continue;

      const zone = activeZones.find((z) => z.ZoneId === az.ZoneId);
      if (!zone) continue;

      const layer = activeLayers.find((l) => l.LayerId === zone.LayerId);
      if (!layer) continue;

      const campaign = activeCampaigns.find((c) => c.CampaignId === layer.CampaignId);
      if (!campaign) continue;

      const isCurrentDaypartActive = isLayerDaypartActiveNow(layer, dayparts, now, nowEpoch);
      if (!isCurrentDaypartActive) continue;

      const region = regions.find((r) => r.Active && r.RegionId === zone.RegionId);
      const asset = assets.find((a) => a.Active && a.AssetId === az.AssetId);
      if (!asset) continue;

      if (!matchesStoreFilter(effectiveAZ, zone, layer, region, asset)) continue;

      const primary = assetFiles.find((af) => af.Active && af.AssetId === asset.AssetId && af.IsPrimaryFile) ||
                      assetFiles.find((af) => af.Active && af.AssetId === asset.AssetId);

      const imagePath = buildImagePath(primary);
      const platformPath = buildPlatformPath(asset);
      const fullPath = toParentOriginUrl(platformPath + imagePath);
      const fileType = toFileType(asset.AssetTypeName);
      const elementId = buildElementId({
        Aid: asset.AssetId,
        Zid: zone.ZoneId,
        AZid: az.AssetZoneId,
        type: fileType,
        DISid: resolvedDisplayId,
        DAYid: layer.DaypartId,
        SId: storeIdFilter,
        SKey: storeKeyFilter
      });

      result.push({
        assetId: String(asset.AssetId),
        assetName: asset.AssetName || "",
        azId: String(az.AssetZoneId),
        duration: Number(effectiveAZ.Duration || 0),
        elementId,
        fileExtension: ext(primary && primary.Filename),
        fileName: baseName(primary && primary.Filename),
        fileType,
        fullPath,
        imageLayer: String(layer.LayerId),
        layerZOrder: Number(layer.ZOrder || 0),
        imagePath,
        platformPath,
        sequence: String(effectiveAZ.Sequence ?? ""),
        zoneId: String(zone.ZoneId),
        zoneName: zone.ZoneName || "",
        regionName: (region && region.RegionName) || "",
        isDayAndTimeActive: true,
        isCurrentDaypartActive: true,
        isCampaignActive: true,
        isCurrentDaypartAndCampaignActive: true
      });
    }

    var menuItem = toArray(menuItems).filter(function (item) {
      if (!item || !item.Active) return false;

      if (storeIdFilter && item.StoreId && String(item.StoreId) !== storeIdFilter) {
        return false;
      }

      return true;
    });

    var menuItemDetail = toArray(menuItemDetails).filter(function (item) {
      if (!item || !item.Active) return false;
      if (!isEffectiveNow(item, nowEpoch)) return false;

      if (storeIdFilter && item.StoreId && String(item.StoreId) !== storeIdFilter) {
        return false;
      }

      return true;
    });

    var menuById = {};
    menuItem.forEach(function (mi) {
      menuById[String(mi.MenuItemId)] = {
        menuItem: mi,
        details: []
      };
    });

    menuItemDetail.forEach(function (mid) {
      var key = String(mid.MenuItemId);
      if (!menuById[key]) {
        menuById[key] = {
          menuItem: null,
          details: []
        };
      }
      menuById[key].details.push(mid);
    });

    function normalizeMenuText(value) {
      if (value == null) return "";

      if (Array.isArray(value)) {
        var arrParts = [];
        for (var i = 0; i < value.length; i++) {
          var normalizedPart = normalizeMenuText(value[i]);
          if (normalizedPart) arrParts.push(normalizedPart);
        }
        return arrParts.join(" | ");
      }

      if (typeof value === "object") {
        var jsonText = "";
        try {
          jsonText = JSON.stringify(value);
        } catch (err) {
          jsonText = String(value);
        }
        return jsonText;
      }

      var text = String(value);

      // Convert visible line-break glyph and real line breaks to spaces.
      text = text.replace(/↵/g, " ")
                 .replace(/\r\n|\r|\n/g, " ")
                 .replace(/\s+/g, " ")
                 .trim();

      // If text is serialized JSON (array/object), parse and normalize recursively.
      if ((text.charAt(0) === "[" && text.charAt(text.length - 1) === "]")
        || (text.charAt(0) === "{" && text.charAt(text.length - 1) === "}")) {
        try {
          return normalizeMenuText(JSON.parse(text));
        } catch (e) {
          // Keep original normalized text when malformed JSON-like content.
        }
      }

      return text;
    }

    function getMenuValue(menuObj) {
      var textValue = normalizeMenuText(menuObj && menuObj.TextValue);
      if (textValue !== "") {
        return textValue;
      }

      var priceValue = normalizeMenuText(menuObj && menuObj.Price);
      if (priceValue !== "") {
        return priceValue;
      }

      return "";
    }

    var menuItemCombined = [];
    for (var menuKey in menuById) {
      if (Object.prototype.hasOwnProperty.call(menuById, menuKey)) {
        var grouped = menuById[menuKey];
        var baseMenu = grouped.menuItem || { MenuItemId: Number(menuKey) };

        if (!grouped.details || grouped.details.length === 0) {
          if (baseMenu.TextValue != null) {
            baseMenu.TextValue = normalizeMenuText(baseMenu.TextValue);
          }
          if (baseMenu.Price != null) {
            baseMenu.Price = normalizeMenuText(baseMenu.Price);
          }
          baseMenu.Value = getMenuValue(baseMenu);
          if (Object.prototype.hasOwnProperty.call(baseMenu, "value")) {
            delete baseMenu.value;
          }
          menuItemCombined.push(baseMenu);
          continue;
        }

        for (var d = 0; d < grouped.details.length; d++) {
          var detail = grouped.details[d] || {};
          var merged = {};

          // overlay detail fields on top of menu item fields
          for (var mk in baseMenu) {
            if (Object.prototype.hasOwnProperty.call(baseMenu, mk)) {
              merged[mk] = baseMenu[mk];
            }
          }

          for (var dk in detail) {
            if (Object.prototype.hasOwnProperty.call(detail, dk)) {
              merged[dk] = detail[dk];
            }
          }

          if (merged.TextValue != null) {
            merged.TextValue = normalizeMenuText(merged.TextValue);
          }
          if (merged.Price != null) {
            merged.Price = normalizeMenuText(merged.Price);
          }

          merged.Value = getMenuValue(merged);
          if (Object.prototype.hasOwnProperty.call(merged, "value")) {
            delete merged.value;
          }

          menuItemCombined.push(merged);
        }
      }
    }

    return toUnifiedResponse({
      source: "client",
      assetDetail: result,
      menuItems: menuItemCombined,
      scheduleUrl: null,
      pricingUrl: null
    });
  } finally {
    db.close();
  }
}