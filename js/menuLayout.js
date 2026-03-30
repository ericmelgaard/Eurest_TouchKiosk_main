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
                brandManager.init(integrationItems, function() {
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
            var _this = this;

            // Normalize period (letters only) and station (letters and numbers)
            function normalize(str) {
                return (str || "").replace(/[^a-zA-Z]/g, "").toLowerCase();
            }
            function normalizeStation(str) {
                return (str || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            }

            var period = period || mealPeriod || AssetConfiguration.Daypart || "";

            integrationItems.forEach(function (each) {
                // mealTracker || webtrition || IMS || bonAppetit
                each.period = each.period || each.mealPeriod || each.imsDaypartName || each.daypart_label || "";
                each.station = each.category || each.mealStation || each.menuZoneName || each.station || "";
                //meal tracker
                each.type = each.type || "";
            });

            this.clearMenuItems(".items-wrapper");

            var currentDay = currentTime();
            var dateValidated = integrationItems.filter(function (each) { return new Date(each.date).toDateString() === new Date(currentDay).toDateString(); });



            if (!dateValidated.length) {
                // IMSintegration.Integration.prototype.showConnect(true, "forestgreen", "integration", station + " not serving", "error");
                return [];
            }

            // breakast Reise Eat Shine
            var breakfast_items = dateValidated.filter(function (each) {
                period = "breakfast";
                var station = "flame breakfast - daily features";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });

            if (!breakfast_items.length && !_this.breakfast_overlay) {
                $("#breakfast").hide();
            } else {
                $("#breakfast").show();
            }

            breakfast_items.forEach(function (each, index) {
                if (index > 0 || _this.breakfast_overlay) { return; }
                var item = Mustache.render(MenuLayout.itemWrapper, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#bfast_page .items-wrapper').append($item);
            });

            //Taco Cantina
            var tacocantina_items = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "taco cantina - daily Features";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });

            if (!tacocantina_items.length && !_this.tacocantina_overlay) {
                $("#tacocantina").hide();
            } else {
                $("#tacocantina").show();
            }

            tacocantina_items.forEach(function (each, index) {
                if (index > 0 || _this.tacocantina_overlay) { return; }
                var item = Mustache.render(MenuLayout.itemWrapper, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#tacocantina_page .items-wrapper').append($item);

            });

            //B&B Butcher and Baker
            var bandb_feature = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "butcher & baker - daily features";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });

            if (!bandb_feature.length && !_this.bandb_overlay) {
                $("#butcherbaker").hide();
            } else {
                $("#butcherbaker").show();
            }

            var bandb_soup = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "Soup";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });
            bandb_feature.forEach(function (each) {
                if (_this.bandb_overlay) { return; }
                var item = Mustache.render(MenuLayout.itemWrapper, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#butcherbaker_page .feature-wrapper .items-wrapper').append($item);

            });
            bandb_soup.forEach(function (each) {
                if (_this.bandb_overlay) { return; }
                each.showDescription = "hide"
                each.showPrice = "hide"
                each.showCals = "hide";
                each.showIcons = "hide";
                var item = Mustache.render(MenuLayout.itemWrapper, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#butcherbaker_page .soups-wrapper .items-wrapper').append($item);

            });

            //roost
            var roost_items = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "roost 1996 - choose your sandwich";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station) &&
                    each.name.indexOf("sandwich") > -1;
            });
            if (!roost_items.length && !_this.roost_overlay) {
                $("#roost").hide()
            } else {
                $("#roost").show()
            }
            roost_items.forEach(function (each) {
                if (_this.roost_overlay) { return; }
                // each.showDescription = "hide"
                var item = Mustache.render(MenuLayout.itemWrapper, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#roost_page .feature-wrapper .items-wrapper').append($item);

            });

            var roost_sides = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "roost 1996 - choose your side";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });
            if (!roost_sides.length && !_this.roost_overlay) {
                $("#roost_page .sides-wrapper").hide();
            } else {
                $("#roost_page .sides-wrapper").show();
            }
            roost_sides.forEach(function (each) {
                if (_this.roost_overlay) { return; }
                each.showDescription = "hide"
                var item = Mustache.render(MenuLayout.itemWrapperInline, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#roost_page .sides-wrapper .items-wrapper').append($item);

            });

            // inspiredkitchen

            var inspiredkitchen_items = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "inspired kitchen - daily special";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });
            if (!inspiredkitchen_items.length && !_this.inspiredkitchen_overlay) {
                $("#inspiredkitchen").hide();
            } else {
                $("#inspiredkitchen").show();
            }
            inspiredkitchen_items.forEach(function (each) {
                if (_this.inspiredkitchen_overlay) { return; }

                var item = Mustache.render(MenuLayout.itemWrapperInline, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#inspiredkitchen_page .feature-wrapper .items-wrapper').append($item);

            });

            var inspiredkitchen_sides = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "inspired kitchen - sides";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });
            if (!inspiredkitchen_sides.length && !_this.inspiredkitchen_overlay) {
                $("#inspiredkitchen_page .sides-wrapper").hide();
            } else {
                $("#inspiredkitchen_page .sides-wrapper").show();
            }
            inspiredkitchen_sides.forEach(function (each) {
                if (_this.inspiredkitchen_overlay) { return; }
                each.showDescription = "hide"
                var item = Mustache.render(MenuLayout.itemWrapperInline, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#inspiredkitchen_page .sides-wrapper .items-wrapper').append($item);

            });
            // flame
            var flame_items = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "flame - daily features";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });
            if (!flame_items.length && !_this.flame_overlay) {
                $("#flame").hide();
            } else {
                $("#flame").show();
            }
            flame_items.forEach(function (each) {
                if (_this.flame_overlay) { return; }
                var item = Mustache.render(MenuLayout.itemWrapper, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#flame_page .feature-wrapper .items-wrapper').append($item);

            });
            var flame_sides = dateValidated.filter(function (each) {
                period = "lunch";
                var station = "flame - add a side";
                return normalize(each.period) === normalize(period) &&
                    normalizeStation(each.station) === normalizeStation(station);
            });
            if (!flame_sides.length && !_this.flame_overlay) {
                $("#flame_page .sides-wrapper").hide();
            } else {
                $("#flame_page .sides-wrapper").show();
            }
            flame_sides.forEach(function (each) {
                if (_this.flame_overlay) { return; }
                each.showDescription = "hide"
                var item = Mustache.render(MenuLayout.itemWrapper, each);
                var $item = $(item);
                $item.find('.item-wrapper').data('nutrition', each);
                $('#flame_page .sides-wrapper .items-wrapper').append($item);
            });

            $(".menu-item-wrapper .name").each(function () {
                var nameEl = this;
                var iconWrapper = nameEl.querySelector(".icon-wrapper");
                if (!iconWrapper) {
                    return;
                }
                if ($(iconWrapper).hasClass("hide") || !iconWrapper.querySelector("img")) {
                    return;
                }

                var baseText = "";
                Array.prototype.slice.call(nameEl.childNodes).forEach(function (node) {
                    if (node === iconWrapper) {
                        return;
                    }
                    if (node.nodeType === 3) {
                        baseText += " " + node.nodeValue;
                        return;
                    }
                    if (node.nodeType === 1 && !$(node).hasClass("icon-orphan-fix")) {
                        baseText += " " + node.textContent;
                    }
                });
                baseText = baseText.replace(/\s+/g, " ").trim();
                if (!baseText) {
                    return;
                }

                var words = baseText.split(" ").filter(Boolean);
                if (words.length < 2) {
                    return;
                }

                var renderName = function (moveLastWord) {
                    while (nameEl.firstChild) {
                        nameEl.removeChild(nameEl.firstChild);
                    }

                    if (!moveLastWord) {
                        nameEl.appendChild(document.createTextNode(words.join(" ")));
                        nameEl.appendChild(iconWrapper);
                    } else {
                        nameEl.appendChild(document.createTextNode(words.slice(0, -1).join(" ") + " "));
                        var lineBreak = document.createElement("br");
                        lineBreak.className = "icon-orphan-fix";
                        nameEl.appendChild(lineBreak);

                        var keepTogether = document.createElement("span");
                        keepTogether.className = "icon-orphan-fix";
                        keepTogether.style.whiteSpace = "nowrap";
                        keepTogether.appendChild(document.createTextNode(words[words.length - 1] + " "));
                        keepTogether.appendChild(iconWrapper);
                        nameEl.appendChild(keepTogether);
                    }
                };

                renderName(false);

                var textRange = document.createRange();
                textRange.selectNodeContents(nameEl);
                textRange.setEndBefore(iconWrapper);
                var textRects = textRange.getClientRects();
                var firstIcon = iconWrapper.querySelector("img");
                var iconTop = firstIcon ? firstIcon.getBoundingClientRect().top : iconWrapper.getBoundingClientRect().top;
                var lastTextLineTop = textRects.length ? textRects[textRects.length - 1].top : iconTop;

                if (iconTop > lastTextLineTop + 1) {
                    renderName(true);
                }
            });

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

        MenuLayout.prototype.resetInactivityTimer = function () {
            var _this = this;

            // Clear existing timer
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
            }

            // Set new timer
            this.inactivityTimer = setTimeout(function () {
                _this.returnHome();
            }, this.inactivityTimeout);
        };

        MenuLayout.prototype.returnHome = function () {
            // Hide all menu sections and show home
            $('.page').hide();
            $('.home').show();

            // Clear navigation history
            this.navigationHistory = [];

            // Update navigation buttons
            this.updateNavigationButtons();

            console.log('Returned to home due to inactivity');
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

            // Update navigation buttons
            this.updateNavigationButtons();

            // Scroll to top of new page
            window.scrollTo(0, 0);
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
            var scrollThreshold = 400;
            var hideDelay = 2000;

            $(window).on('scroll', function () {
                var scrollTop = $(window).scrollTop();
                var scrollButton = $('.nav-scroll-top');

                // Show/hide based on scroll position
                if (scrollTop > scrollThreshold) {
                    // Scrolled down enough - show button
                    if (!scrollButton.hasClass('visible')) {
                        scrollButton.addClass('visible');
                    }

                    // Clear existing timeout
                    if (_this.scrollTimeout) {
                        clearTimeout(_this.scrollTimeout);
                    }

                    // Detect scroll direction
                    if (scrollTop < _this.lastScrollTop) {
                        // Scrolling up - hide after delay
                        _this.scrollTimeout = setTimeout(function () {
                            scrollButton.removeClass('visible');
                        }, hideDelay);
                    }

                    _this.lastScrollTop = scrollTop;
                } else {
                    // Near top - hide button
                    scrollButton.removeClass('visible');
                }
            });
        };

        MenuLayout.prototype.scrollToTop = function () {
            $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
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
