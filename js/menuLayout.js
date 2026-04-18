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
        }
        MenuLayout.prototype.init = function (IMSItems, IMSProducts, IMSSettings, integrationItems, API) {
            var _this = this;
            if (!API) {
                return;
            }
            // Optional image-driven content injector. Remove this call if the template does not use imageStoreManager.
            try {
                this.initImageStoreManager();
            } catch (e) {
                console.error("Error initializing image store manager: ", e);
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
                var filteredIntegrationItems = validateItems(integrationItems, "", "", "");
                var brandCount = brandManager.init(filteredIntegrationItems, null);
                if (brandCount === 0) {
                    $('#card-weeklymenu').hide();
                } else {
                    $('#card-weeklymenu').show();
                }
            } catch (e) {
                console.error("Error in BrandManager init: ", e);
                IMSintegration.Integration.prototype.showConnect(true, "Red", "brandManager", e, "error");
                $('#card-weeklymenu').hide();
            }

            //optional starts
            // try {
            //     this.rotateEles();
            // } catch (e) {
            //     console.error("Error in MenuLayout rotateEles: ", e);
            //     IMSintegration.Integration.prototype.showConnect(true, "Red", "rotateEles", e, "error");
            // }

            try {
                setupNutritionOverlayHandlers();
            } catch (e) {
                console.error("Error in MenuLayout setupNutritionOverlayHandlers: ", e);
            }

            try {
                this.initInactivityManager();
            } catch (e) {
                console.error("Error initializing InactivityManager: ", e);
            }
        };
        MenuLayout.prototype.initImageStoreManager = function () {
            if (!window.ImageStoreManager || typeof window.ImageStoreManager.init !== "function") {
                return;
            }
            window.ImageStoreManager.init();
        };
        MenuLayout.prototype.handleLayout = function (IMSSettings) {
            var _this = this;
            // Set up navigation buttons
            this.setupNavigationButtons();

            // Welcome screen card navigation
            $('#card-weeklymenu').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('weekly_menu_page');
            });

            // Feature cards - navigate to static content pages
            $('#card-happening').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('happening_page');
            });

            $('#card-vote').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('vote_page');
            });

            $('#card-fit').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('fit_page');
            });

            $('#card-mezze').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('mezze_page');
            });

            $('#card-connectwithus').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('connectwithus_page');
            });

            $('#card-ambassador').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('ambassador_page');
            });

            $('#card-foodwithpurpose').on('click', function (e) {
                e.stopPropagation();
                _this.navigateToPage('foodwithpurpose_page');
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
            } else {
                console.error('InactivityManager not found');
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
            
            // Pause inactivity timer when on home screen
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.pause();
            }
        };

        MenuLayout.prototype.setupNavigationButtons = function () {
            var _this = this;

            // Home button - returns to welcome screen from weekly menu
            $(document).on('click', '.floating-nav-home', function (e) {
                e.stopPropagation();
                _this.navigateToWelcome();
            });

            // Edge back button - returns to menu selection from brand pages
            $(document).on('click', '.edge-nav-back', function (e) {
                e.stopPropagation();
                _this.navigateBack();
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

            // Pause inactivity timer when on home screen
            if (typeof InactivityManager !== 'undefined') {
                InactivityManager.pause();
            }

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
