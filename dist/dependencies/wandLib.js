"use strict";
//***wandLib.js***
//Date: 10.17.2025
//Version: 60.7

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
    // return;
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
        return CFTime.split("T")[0] + "T00:00:00";
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
    if (leader) {
        new Promise(function (resolve, reject) {
            clearDatabases()
                .then(resolve)
                .catch(reject);
        }).then(function () {
            integration.init(leader, isUsingIndexedDB)
        });
    } else {
        integration.init(leader, isUsingIndexedDB)
    }
    return "Simulate clearAssetStorage() event";
};
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
window.addEventListener('unload', function (event) {
    // Perform actions before iframe is closed or leader exits.
    if (platform === "webos") {
        releaseVideos();
    }
    if (leader) {
        self.localStorage.removeItem(heartbeatKey);
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
            this.items.forEach(function (eachItem) {
                _this.pageCalc = _this.zoneProperties.overflowingHeight
                    ? Math.floor((eachItem.offsetTop + (eachItem.offsetHeight >= _this.zoneProperties.height ? 0 : eachItem.offsetHeight)) / _this.zoneProperties.height)
                    : Math.floor((eachItem.offsetLeft + (eachItem.offsetWidth >= _this.zoneProperties.width ? 0 : eachItem.offsetWidth)) / _this.zoneProperties.width);
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
                        $(div).css("opacity", "0");
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
        $(menus).css("opacity", "");
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
/**
 * textFit v2.3.1
 * Previously known as jQuery.textFit
 * 11/2014 by STRML (strml.github.com)
 * MIT License
 *
 * To use: textFit(document.getElementById('target-div'), options);
 *
 * Will make the *text* content inside a container scale to fit the container
 * The container is required to have a set width and height
 * Uses binary search to fit text with minimal layout calls.
 * Version 2.0 does not use jQuery.
 */
/*global define:true, document:true, window:true, HTMLElement:true*/
(function (root, factory) {
    "use strict";
    // UMD shim
    if (typeof define === "function" && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === "object") {
        // Node/CommonJS
        module.exports = factory();
    } else {
        // Browser
        root.textFit = factory();
    }
}(typeof global === "object" ? global : this, function () {
    "use strict";
    var defaultSettings = {
        alignVert: false, // if true, textFit will align vertically using css tables
        alignHoriz: false, // if true, textFit will set text-align: center
        multiLine: true, // if true, textFit will not set white-space: no-wrap
        detectMultiLine: true, // disable to turn off automatic multi-line sensing
        minFontSize: 28,
        maxFontSize: 50,
        reProcess: false, // if true, textFit will re-process already-fit nodes. Set to 'false' for better performance
        widthOnly: true, // if true, textFit will fit text to element width, regardless of text height
        alignVertWithFlexbox: true, // if true, textFit will use flexbox for vertical alignment
    };
    return function textFit(els, options) {
        if (!options)
            options = {};
        // Extend options.
        var settings = {};
        for (var key in defaultSettings) {
            if (options.hasOwnProperty(key)) {
                settings[key] = options[key];
            } else {
                settings[key] = defaultSettings[key];
            }
        }
        // Convert jQuery objects into arrays
        if (typeof els.toArray === "function") {
            els = els.toArray();
        }
        // Support passing a single el
        var elType = Object.prototype.toString.call(els);
        if (elType !== '[object Array]' && elType !== '[object NodeList]' &&
            elType !== '[object HTMLCollection]') {
            els = [els];
        }
        // Process each el we've passed.
        for (var i = 0; i < els.length; i++) {
            processItem(els[i], settings);
        }
    };
    /**
     * The meat. Given an el, make the text inside it fit its parent.
     * @param  {DOMElement} el       Child el.
     * @param  {Object} settings     Options for fit.
     */
    function processItem(el, settings) {
        if (!isElement(el) || (!settings.reProcess && el.getAttribute('textFitted'))) {
            return false;
        }
        // Set textFitted attribute so we know this was processed.
        if (!settings.reProcess) {
            el.setAttribute('textFitted', 1);
        }
        var innerSpan, originalHeight, originalHTML, originalWidth;
        var low, mid, high;
        // Get element data.
        originalHTML = el.innerHTML;
        originalWidth = innerWidth(el);
        originalHeight = innerHeight(el);
        // Don't process if we can't find box dimensions
        if (!originalWidth || (!settings.widthOnly && !originalHeight)) {
            if (!settings.widthOnly)
                throw new Error('Set a static height and width on the target element ' + el.outerHTML +
                    ' before using textFit!');
            else
                throw new Error('Set a static width on the target element ' + el.outerHTML +
                    ' before using textFit!');
        }
        // Add textFitted span inside this container.
        if (originalHTML.indexOf('textFitted') === -1) {
            innerSpan = document.createElement('span');
            innerSpan.className = 'textFitted';
            // Inline block ensure it takes on the size of its contents, even if they are enclosed
            // in other tags like <p>
            innerSpan.style['display'] = 'inline-block';
            innerSpan.innerHTML = originalHTML;
            el.innerHTML = '';
            el.appendChild(innerSpan);
        } else {
            // Reprocessing.
            innerSpan = el.querySelector('span.textFitted');
            // Remove vertical align if we're reprocessing.
            if (hasClass(innerSpan, 'textFitAlignVert')) {
                innerSpan.className = innerSpan.className.replace('textFitAlignVert', '');
                innerSpan.style['height'] = '';
                el.className.replace('textFitAlignVertFlex', '');
            }
        }
        // Prepare & set alignment
        if (settings.alignHoriz) {
            el.style['text-align'] = 'center';
            innerSpan.style['text-align'] = 'center';
        }
        // Check if this string is multiple lines
        // Not guaranteed to always work if you use wonky line-heights
        var multiLine = settings.multiLine;
        if (settings.detectMultiLine && !multiLine &&
            innerSpan.getBoundingClientRect().height >= parseInt(window.getComputedStyle(innerSpan)['font-size'], 10) * 2) {
            multiLine = true;
        }
        // If we're not treating this as a multiline string, don't let it wrap.
        if (!multiLine) {
            el.style['white-space'] = 'nowrap';
        }
        low = settings.minFontSize;
        high = settings.maxFontSize;
        // Binary search for highest best fit
        var size = low;
        while (low <= high) {
            mid = (high + low) >> 1;
            innerSpan.style.fontSize = mid + 'px';
            var innerSpanBoundingClientRect = innerSpan.getBoundingClientRect();
            if (innerSpanBoundingClientRect.width <= originalWidth &&
                (settings.widthOnly || innerSpanBoundingClientRect.height <= originalHeight)) {
                size = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
            // await injection point
        }
        // found, updating font if differs:
        if (innerSpan.style.fontSize != size + 'px')
            innerSpan.style.fontSize = size + 'px';
        // Our height is finalized. If we are aligning vertically, set that up.
        if (settings.alignVert) {
            addStyleSheet();
            var height = innerSpan.scrollHeight;
            if (window.getComputedStyle(el)['position'] === "static") {
                el.style['position'] = 'relative';
            }
            if (!hasClass(innerSpan, "textFitAlignVert")) {
                innerSpan.className = innerSpan.className + " textFitAlignVert";
            }
            innerSpan.style['height'] = height + "px";
            if (settings.alignVertWithFlexbox && !hasClass(el, "textFitAlignVertFlex")) {
                el.className = el.className + " textFitAlignVertFlex";
            }
        }
    }
    // Calculate height without padding.
    function innerHeight(el) {
        var style = window.getComputedStyle(el, null);
        return el.getBoundingClientRect().height -
            parseInt(style.getPropertyValue('padding-top'), 10) -
            parseInt(style.getPropertyValue('padding-bottom'), 10);
    }
    // Calculate width without padding.
    function innerWidth(el) {
        var style = window.getComputedStyle(el, null);
        return el.getBoundingClientRect().width -
            parseInt(style.getPropertyValue('padding-left'), 10) -
            parseInt(style.getPropertyValue('padding-right'), 10);
    }
    //Returns true if it is a DOM element
    function isElement(o) {
        return (typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string");
    }

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
    // Better than a stylesheet dependency
    function addStyleSheet() {
        if (document.getElementById("textFitStyleSheet"))
            return;
        var style = [
            ".textFitAlignVert{",
            "position: absolute;",
            "top: 0; right: 0; bottom: 0; left: 0;",
            "margin: auto;",
            "display: flex;",
            "justify-content: center;",
            "flex-direction: column;",
            "}",
            ".textFitAlignVertFlex{",
            "display: flex;",
            "}",
            ".textFitAlignVertFlex .textFitAlignVert{",
            "position: static;",
            "}",
        ].join("");
        var css = document.createElement("style");
        css.type = "text/css";
        css.id = "textFitStyleSheet";
        css.innerHTML = style;
        document.body.appendChild(css);
    }
}));

function setupNutritionOverlayHandlers(nutritionLabelTemplate) {
    $(document).off('click.menuNutritionGlobal').on('click.menuNutritionGlobal', '.item-wrapper', function (e) {
        e.stopPropagation();
        var nutritionData = $(this).data('nutrition');
        if (nutritionData && typeof openNutritionModal === 'function') {
            openNutritionModal(nutritionData);
        }
    });
}

var nutritionLabelTemplate = `
    <div class="nutrition-label-overlay">
        <div class="nutritional-lable">
            <div class="button-wrapper-NL">
                <button class="close-nutrition-label material-icons" aria-label="Close" type="button" style="background:none;border:none;cursor:pointer;" tabindex="0" role="button" onclick="removeNutritionOverlay()">close</button>
            </div
            <div class="name-wrapper-NL">
                <div class="name-NL">{{name}}</div>
            </div>
        <div class="serving wrapper">
            <div class="name-NL">{{nutrientLabels.servingSize}}</div>
            <div class="value">{{portion}}</div>
        </div>
        <div class="calories wrapper">
            <div class="label-NL">{{}}</div>
            <div class="flex-row">
                <div class="name-NL">{{nutrientLabels.calories}}</div>
                <div class="value">{{calories}}</div>
            </div>
        </div>
        <div class="row">
            <div class="name-NS">{{nutrientLabels.totalFat}}</div>
            <div class="value">{{nutrition.fat.displayValue}}</div>
        </div>
        <div class="row">
            <div class="name-NS">{{nutrientLabels.totalCarbohydrates}}</div>
            <div class="value">{{nutrition.carbohydrates.displayValue}}</div>
        </div>
            <div class="row">
            <div class="name-NS">{{nutrientLabels.protein}}</div>
            <div class="value">{{nutrition.protein.displayValue}}</div>
        </div>
    </div>`;

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

// Image store code - implement later if team finds this useful

$(document).ready(function () {

    if (self.frameElement) {
        var images = [];
        var imageURL = "";
        var imagesLayer = "";
        var duration = "";
        var parentEle = $(self.frameElement).parent();
        var siblingEles = $(parentEle).siblings().get();
        siblingEles.forEach(function (each) {
            if ($(each).children().length === 1) {
                imageURL = $(each).children(false).attr("src");
                imagesLayer = $(each).css("z-index");
                duration = $(each).attr("trm-duration");
                //windows
                if (!isUsingIndexedDB) {
                    imageURL = imageURL.replace("..", "/CMSClient")
                }
                // webos
                if (imageURL.indexOf("/content") > -1) {
                    imageURL = imageURL.replace("./", "/media/developer/apps/usr/palm/applications/com.lg.app.signage/");
                }
            }
            images.push({
                "imageURL": imageURL,
                "imageLayer": imagesLayer,
                "duration": duration
            })
        })
        console.log(images)
    } else {
        return;
    }


    // image store code - implement later if team finds this useful

    function platformPath(url) {
        var path = "";
        for (let i = 0; i < url.length - 2; i++) {
            path = path + url[i] + "/";
        }
        console.log(path);
        return path;
    }

    images.forEach(function (each) {
        var imageParts = each.imageURL.split("/");
        var fileExtension = imageParts[imageParts.length - 1].split(".")[1];
        var videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v'];
        var imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff'];
        
        var fileType = 'unknown';
        if (videoExtensions.includes(fileExtension.toLowerCase())) {
            fileType = 'video';
        } else if (imageExtensions.includes(fileExtension.toLowerCase())) {
            fileType = 'image';
        }
        
        var imgObj = {
            "fullPath": each.imageURL,
            "assetId": imageParts[imageParts.length - 2],
            "imagePath": imageParts[imageParts.length - 2] + "/" + imageParts[imageParts.length - 1],
            "platformPath": platformPath(imageParts),
            "fileName": imageParts[imageParts.length - 1].split(".")[0],
            "fileExtension": fileExtension,
            "fileType": fileType,
            "imageLayer": each.imageLayer,
            "duration": each.duration
        }

        imageStore.push(imgObj)
    })

    console.log(imageStore);
});