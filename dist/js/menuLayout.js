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
            this.inactivityTimer = null;
            this.inactivityTimeout = 30000; // 30 seconds default
            this.breakfast_overlay = null;
            this.tacocantina_overlay = null;
            this.bandb_overlay = null;
            this.roost_overlay = null;
            this.inspiredkitchen_overlay = null;
            this.flame_overlay = null;
            this.navigationHistory = [];
            this.isScrolling = false;
            this.scrollTimeout = null;
            this.lastScrollTop = 0;
        }
        MenuLayout.prototype.init = function (IMSItems, IMSProducts, IMSSettings, integrationItems, API) {
            var _this = this;
            if (!API) {
                return;
            }
            try {
                this.handleSettings(IMSSettings);
            } catch (e) {
                console.error("Error in MenuLayout handleSettings: ", e);
                IMSintegration.Integration.prototype.showConnect(true, "Red", "handleSettings", e, "error");
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
            try {
                var filteredIntegrationItems = validateItems(integrationItems);
                brandManager.init(filteredIntegrationItems, function() {
                    _this.resetInactivityTimer();
                });
            } catch (e) {
                console.error("Error in BrandManager init: ", e);
                IMSintegration.Integration.prototype.showConnect(true, "Red", "brandManager", e, "error");
            }

            //optional starts
            // try {
            //     this.rotateEles();
            // } catch (e) {
            //     console.error("Error in MenuLayout rotateEles: ", e);
            //     IMSintegration.Integration.prototype.showConnect(true, "Red", "rotateEles", e, "error");
            // }

            try {
                setupNutritionOverlayHandlers(nutritionLabelTemplate);
            } catch (e) {
                console.error("Error in MenuLayout setupNutritionOverlayHandlers: ", e);
            }

            try {
                this.initInactivityManager();
            } catch (e) {
                console.error("Error initializing InactivityManager: ", e);
            }
        };
        MenuLayout.prototype.handleSettings = function (IMSSettings) {
            var _this = this;
            var piccola_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("piccolaitalia") >= 0 && item.fileType === "image";
            });

            if (piccola_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#piccolaitalia_page .background img").attr("src", piccola_img[0].fullPath);
                console.log("Set #piccolaitalia src to:", piccola_img[0].fullPath);
            }

            var graze_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("graze") >= 0 && item.fileType === "image";
            });
            if (graze_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#graze_page .background img").attr("src", graze_img[0].fullPath);
                console.log("Set #graze src to:", graze_img[0].fullPath);
            }

            var bigcity_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("bigcity") >= 0 && item.fileType === "image";
            });
            if (bigcity_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#bigcity_page .background img").attr("src", bigcity_img[0].fullPath);
                console.log("Set #bigcity src to:", bigcity_img[0].fullPath);
            }

            var mashup_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("mashup") >= 0 && item.fileType === "image";
            });
            if (mashup_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#mashup_page .background img").attr("src", mashup_img[0].fullPath);
                console.log("Set #mashup src to:", mashup_img[0].fullPath);
            }

            var sipsbites_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("sipsbites") >= 0 && item.fileType === "image";
            });
            if (sipsbites_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#sipsbites_page .background img").attr("src", sipsbites_img[0].fullPath);
                console.log("Set #sipsbites src to:", sipsbites_img[0].fullPath);
            }

            var breajfast_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("breakfast") >= 0 && item.fileType === "image";
            });
            if (breajfast_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#bfast_page .background img").attr("src", breajfast_img[0].fullPath);
                _this.breakfast_overlay = true;
                console.log("Set #breakfast src to:", breajfast_img[0].fullPath);
            } else {
                _this.breakfast_overlay = false;
            }

            var tacocantina_overlay = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("tacocantina") >= 0 && item.fileType === "image";
            });
            if (tacocantina_overlay.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#tacocantina_page .background img").attr("src", tacocantina_overlay[0].fullPath);
                _this.tacocantina_overlay = true;
                console.log("Set #tacocantina src to:", tacocantina_overlay[0].fullPath);
            } else {
                _this.tacocantina_overlay = false;
            }

            var bandb_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("butcherbaker") >= 0 && item.fileType === "image";
            });
            if (bandb_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#butcherbaker_page .background img").attr("src", bandb_img[0].fullPath);
                _this.bandb_overlay = true;
                console.log("Set #butcherbaker src to:", bandb_img[0].fullPath);
            } else {
                _this.bandb_overlay = false;
            }
            var roost_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("roost") >= 0 && item.fileType === "image";
            });
            if (roost_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#roost_page .background img").attr("src", roost_img[0].fullPath);
                _this.roost_overlay = true;
                console.log("Set #roost src to:", roost_img[0].fullPath);
            } else {
                _this.roost_overlay = false;
            }
            var inspiredkitchen_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("inspiredkitchen") >= 0 && item.fileType === "image";
            });
            if (inspiredkitchen_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#inspiredkitchen_page .background img").attr("src", inspiredkitchen_img[0].fullPath);
                _this.inspiredkitchen_overlay = true;
                console.log("Set #inspiredkitchen src to:", inspiredkitchen_img[0].fullPath);
            } else {
                _this.inspiredkitchen_overlay = false;
            }
            var flame_img = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf("flame") >= 0 && item.fileType === "image";
            });
            if (flame_img.length > 0) {
                // Use the first matching image's fullPath as the src
                $("#flame_page .background img").attr("src", flame_img[0].fullPath);
                _this.flame_overlay = true;
                console.log("Set #flame src to:", flame_img[0].fullPath);
            } else {
                _this.flame_overlay = false;
            }
        };
        MenuLayout.prototype.handleLayout = function (IMSSettings) {
            var _this = this;
            // Set up inactivity timer
            this.setupInactivityTimer();

            // Set up scroll detection
            this.setupScrollDetection();

            // Set up navigation buttons
            this.setupNavigationButtons();

            // Welcome screen card navigation
            $('#card-weeklymenu').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('weekly_menu_page');
                _this.resetInactivityTimer();
            });

            // Feature cards - keeping existing actions or no-ops for now
            $('#card-happening').on('click', function (e) {
                e.stopPropagation();
                _this.resetInactivityTimer();
            });

            $('#card-beverage').on('click', function (e) {
                e.stopPropagation();
                _this.resetInactivityTimer();
            });

            $('#card-youpickit').on('click', function (e) {
                e.stopPropagation();
                _this.resetInactivityTimer();
            });

            $('#card-fit').on('click', function (e) {
                e.stopPropagation();
                _this.resetInactivityTimer();
            });

            $('#card-mezze').on('click', function (e) {
                e.stopPropagation();
                _this.resetInactivityTimer();
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
            // This function is for static home page promotional content only
            // Example: "What's Happening in March" cards, special announcements, etc.
            // All brand/menu functionality is handled by brandManager.js

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

        MenuLayout.prototype.setupInactivityTimer = function () {
            var _this = this;

            // Events that should reset the inactivity timer
            // Removed 'click' and 'mousedown' to prevent interference with actual click handlers
            var events = ['touchstart', 'touchmove', 'mousemove'];

            // Add event listeners to document for all activity
            events.forEach(function (event) {
                $(document).on(event, function () {
                    _this.resetInactivityTimer();
                });
            });

            // Start the initial timer
            this.resetInactivityTimer();
        };

        MenuLayout.prototype.initInactivityManager = function () {
            var _this = this;

            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.init({
                    warningDelay: 30000,
                    countdownDuration: 10000,
                    nutritionExtension: 30000,
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
            } else {
                console.error('InactivityManager not found');
            }
        };

        MenuLayout.prototype.resetInactivityTimer = function () {
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.reset();
            } else {
                var _this = this;
                if (this.inactivityTimer) {
                    clearTimeout(this.inactivityTimer);
                }
                this.inactivityTimer = setTimeout(function () {
                    _this.returnHome();
                }, this.inactivityTimeout);
            }
        };

        MenuLayout.prototype.returnHome = function () {
            var _this = this;

            closeNutritionModal();

            $('.page').hide();
            $('.home').show();

            this.navigationHistory = [];

            this.updateNavigationButtons();

            window.scrollTo(0, 0);

            if (this.breakfast_overlay) {
                $(this.breakfast_overlay).hide();
            }
            if (this.tacocantina_overlay) {
                $(this.tacocantina_overlay).hide();
            }
            if (this.bandb_overlay) {
                $(this.bandb_overlay).hide();
            }
            if (this.roost_overlay) {
                $(this.roost_overlay).hide();
            }
            if (this.inspiredkitchen_overlay) {
                $(this.inspiredkitchen_overlay).hide();
            }
            if (this.flame_overlay) {
                $(this.flame_overlay).hide();
            }

            // Pause inactivity timer when on home screen
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.pause();
            }
        };

        MenuLayout.prototype.setupNavigationButtons = function () {
            var _this = this;

            // Close button - returns to welcome screen from weekly menu
            $('.nav-close').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToWelcome();
                _this.resetInactivityTimer();
            });

            // Back button - returns to previous page
            $('.nav-back').on('click', function (e) {
                e.stopPropagation();
                _this.navigateBack();
                _this.resetInactivityTimer();
            });

            // Scroll to top button
            $('.nav-scroll-top').on('click', function (e) {
                e.stopPropagation();
                _this.scrollToTop();
                _this.resetInactivityTimer();
            });
        };

        MenuLayout.prototype.navigateToPage = function (pageId) {
            var currentPage = $('.page:visible').attr('id');

            // Add current page to history if there's one visible
            if (currentPage) {
                this.navigationHistory.push(currentPage);
            } else {
                // Coming from welcome screen
                this.navigationHistory = [];
            }

            // Hide all pages and welcome screen
            $('.page').hide();
            $('.home').hide();

            // Show the target page
            $('#' + pageId).show();

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

                // Hide current page
                $('.page').hide();

                // Show previous page
                $('#' + previousPage).show();

                // Update navigation buttons
                this.updateNavigationButtons();

                // Scroll to top
                window.scrollTo(0, 0);
            }
        };

        MenuLayout.prototype.navigateToWelcome = function () {
            // Hide all pages
            $('.page').hide();

            // Show welcome screen
            $('.home').show();

            // Clear navigation history
            this.navigationHistory = [];

            // Update navigation buttons
            this.updateNavigationButtons();

            // Scroll to top
            window.scrollTo(0, 0);

            // Pause inactivity timer when on home screen
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.pause();
            }
        };

        MenuLayout.prototype.updateNavigationButtons = function () {
            var currentPage = $('.page:visible').attr('id');
            var isOnWelcome = $('.home:visible').length > 0;

            // Hide all nav buttons first
            $('.nav-close, .nav-back').hide();

            if (isOnWelcome) {
                // On welcome screen - no navigation buttons
                return;
            }

            if (currentPage === 'weekly_menu_page') {
                // On weekly menu page - show close button
                $('.nav-close').show();
            } else if (currentPage) {
                // On any brand page - show back button
                $('.nav-back').show();
            }
        };

        MenuLayout.prototype.setupScrollDetection = function () {
            var _this = this;
            var scrollThreshold = 300;
            var hideDelay = 1500;

            _this.lastScrollTop = 0;

            // Wait for DOM to be ready, then attach to all .section-wrapper elements
            setTimeout(function() {
                var wrappers = $('.section-wrapper');
                console.log('Found section wrappers:', wrappers.length);

                wrappers.each(function() {
                    console.log('Attaching scroll to:', this);
                });

                wrappers.on('scroll', function () {
                    var scrollTop = $(this).scrollTop();
                    var scrollButton = $('.nav-scroll-top');

                    console.log('Scroll detected! scrollTop:', scrollTop);

                    // Clear existing timeout
                    if (_this.scrollTimeout) {
                        clearTimeout(_this.scrollTimeout);
                    }

                    // Check if we're scrolling up or down
                    var isScrollingUp = scrollTop < _this.lastScrollTop;

                    if (scrollTop > scrollThreshold && isScrollingUp) {
                        // Scrolling up past threshold - show button
                        console.log('Showing scroll button');
                        scrollButton.addClass('visible');

                        // Hide after stop scrolling delay
                        _this.scrollTimeout = setTimeout(function () {
                            scrollButton.removeClass('visible');
                        }, hideDelay);
                    } else {
                        // Scrolling down or near top - hide button
                        scrollButton.removeClass('visible');
                    }

                    _this.lastScrollTop = scrollTop;
                });
            }, 1000);
        };

        MenuLayout.prototype.scrollToTop = function () {
            $('.section-wrapper').animate({ scrollTop: 0 }, 600, 'swing');
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
        MenuLayout.itemWrapper = `
        <div class="menu-item-wrapper" data-item-name="{{{name}}}{{comboName}}{{menuItemName}}">
                <div class="item-wrapper">
                    <span class="name">
                        {{{name}}}{{comboName}}{{menuItemName}}<span class="icon-wrapper {{showIcons}}">{{#icons}}<img src="./{{fileName}}" class="nutrition-icon vegetarian" />{{/icons}}
                        </span>
                    </span>
                </div>
                <div class="desc {{showDescription}}">{{description}}</div>
                <div class="price-wrapper">
                    <div class="calories {{showCals}}">{{calories}} cal</div>
                    <div class="price {{showPrice}}">{{price}}</div>
                </div>
        </div>`;

        MenuLayout.itemWrapperInline = `
        <div class="menu-item-wrapper inline" data-item-name="{{{name}}}{{comboName}}{{menuItemName}}">
                <div class="item-wrapper">
                    <span class="name">
                        {{{name}}}{{comboName}}{{menuItemName}}<span class="icon-wrapper {{showIcons}}">{{#icons}}<img src="./{{fileName}}" class="nutrition-icon vegetarian" />{{/icons}}
                        </span>
                    </span>
                    <div class="price-wrapper">
                        <div class="calories {{showCals}}">{{calories}} cal</div>
                        <div class="price {{showPrice}}">{{price}}</div>
                    </div>
                </div>
            <div class="desc {{showDescription}}">{{description}}</div>
        </div>`;

        return MenuLayout;
    })();
    IMSintegration.MenuLayout = MenuLayout;
})(IMSintegration || (IMSintegration = {}));
