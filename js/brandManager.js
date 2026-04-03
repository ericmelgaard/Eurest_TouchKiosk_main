"use strict";

var IMSintegration;
(function (wandDigital) {
    var BrandManager = (function () {
        function BrandManager() {
            this.logoBaseUrl = "https://trm.wandcorp.com/cms_mediafiles/DIGITAL_ASSETS_NX01/297748/eurest_logos/";

            this.includePatterns = [
                "Bibimbap - BYO",
                "Bibimbap - Express",
                "Big City BBQ - Core + Sides",
                "Bok Choy - BYO",
                "Bok Choy - Express",
                "Butcher & Baker - BYO omelet",
                "Butcher & Baker - Daily features",
                "Crave - BYO",
                "Crave - Daily features",
                "Create - BYO",
                "Create - Sides",
                "Crisp - BYO",
                "Crisp - Sides",
                "Earth Bowl - BYO",
                "Earth Bowl - Express",
                "El Mollete - BYO",
                "El Mollete - Express",
                "Fish Market - BYO",
                "Fish Market - Daily features",
                "Flame - BYO",
                "Flame - Daily features",
                "Graze - BYO",
                "Graze - Daily features",
                "Graze - Sides",
                "Just Burgers - BYO",
                "Just Burgers - Express",
                "Kitchen Co - Daily features",
                "Kitchen Co - Sides",
                "Leaf & Ladle - BYO",
                "Leaf & Ladle - Express",
                "Mac Cheeseology - BYO",
                "Mac Cheeseology - Express",
                "Machu Peru - BYO",
                "Machu Peru - Express",
                "Made to Melt - A La Carte",
                "Made to Melt - Express",
                "Market Fresh - BYO",
                "Market Fresh - Sides",
                "Masala - BYO",
                "Masala - Express",
                "Meatball Inc - A La Carte",
                "Meatball Inc - Express",
                "Mezze - BYO",
                "Mezze - Express",
                "piccola italia pizza - daily features",
                "piccola italia pizza - individual pizza",
                "Piccola Italia - Entree + 1",
                "Piccola Italia - Entree + 2",
                "Pico Mesa - BYO",
                "Pico Mesa - Express",
                "Piri Piri - BYO",
                "Piri Piri - Express",
                "Revolution Noodle - BYO",
                "Revolution Noodle - Express",
                "Roost 1996 - By the slice",
                "Roost 1996 - Individual pizza",
                "Roots and Seeds - BYO",
                "Roots and Seeds - Sides",
                "Soul Kitchen - Daily features",
                "Soul Kitchen - Sides",
                "Soup - Daily features",
                "Taco Cantina - A La Carte",
                "Taco Cantina - Express"
            ];

            this.brands = [];
            this.currentBrand = null;
        }

        BrandManager.prototype.sanitizeStationName = function (stationName) {
            if (!stationName) return "";
            return stationName.trim();
        };

        BrandManager.prototype.matchesIncludePattern = function (stationName) {
            var _this = this;
            var sanitized = _this.sanitizeStationName(stationName);

            for (var i = 0; i < _this.includePatterns.length; i++) {
                if (sanitized === _this.includePatterns[i]) {
                    return _this.includePatterns[i];
                }
            }
            return null;
        };

        BrandManager.prototype.extractBrandAndSubstation = function (stationName) {
            var dashIndex = stationName.indexOf(' - ');
            if (dashIndex === -1) {
                return { brandName: stationName.trim(), substationName: "" };
            }

            return {
                brandName: stationName.substring(0, dashIndex).trim(),
                substationName: stationName.substring(dashIndex + 3).trim()
            };
        };

        BrandManager.prototype.sanitizeBrandForLogo = function (brandName) {
            return brandName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');
        };

        BrandManager.prototype.generateLogoUrl = function (brandName) {
            var _this = this;
            var sanitized = _this.sanitizeBrandForLogo(brandName);
            var filename = sanitized + '.png';
            return _this.logoBaseUrl + filename;
        };

        BrandManager.prototype.analyzeBrands = function (integrationItems) {
            var _this = this;
            var brandMap = {};

            integrationItems.forEach(function (item) {
                item.period = item.period || item.mealPeriod || item.imsDaypartName || item.daypart_label || "";
                item.station = item.category || item.mealStation || item.menuZoneName || item.station || "";

                if (!item.station) return;

                var sanitizedStation = _this.sanitizeStationName(item.station);
                var matchedPattern = _this.matchesIncludePattern(sanitizedStation);

                if (!matchedPattern) return;

                var extracted = _this.extractBrandAndSubstation(matchedPattern);
                var brandName = extracted.brandName;
                var substationName = extracted.substationName;
                var brandKey = _this.sanitizeBrandForLogo(brandName);

                if (!brandMap[brandKey]) {
                    brandMap[brandKey] = {
                        brandKey: brandKey,
                        displayName: brandName,
                        logoUrl: _this.generateLogoUrl(brandName),
                        stations: {},
                        items: []
                    };
                }

                if (!brandMap[brandKey].stations[substationName]) {
                    brandMap[brandKey].stations[substationName] = {
                        originalName: matchedPattern,
                        cleanedName: substationName,
                        period: item.period,
                        items: []
                    };
                }

                brandMap[brandKey].stations[substationName].items.push(item);
                brandMap[brandKey].items.push(item);
            });

            _this.brands = Object.keys(brandMap).map(function (key) {
                return brandMap[key];
            });

            return _this.brands;
        };

        BrandManager.prototype.renderBrandCards = function (containerSelector) {
            var _this = this;
            var container = $(containerSelector);

            if (!container.length) {
                console.warn("Brand container not found:", containerSelector);
                return;
            }

            container.empty();

            if (!_this.brands || _this.brands.length === 0) {
                console.warn("No brands available to render");
                return;
            }

            _this.brands.forEach(function (brand) {
                var brandCard = $('<div>')
                    .addClass('brand-card')
                    .attr('data-brand', brand.brandKey);

                var brandLogo = $('<img>')
                    .attr('src', brand.logoUrl)
                    .attr('alt', brand.displayName)
                    .on('error', function () {
                        console.warn('Failed to load logo for ' + brand.displayName + ' from: ' + brand.logoUrl);
                        $(this).hide();
                        brandCard.append($('<div>').text(brand.displayName).css({
                            fontSize: '48px',
                            fontWeight: '600',
                            color: '#2c2c2c',
                            fontFamily: 'BarlowSemiCondensed-Regular',
                            textAlign: 'center',
                            lineHeight: '1.2'
                        }));
                    });

                brandCard.append(brandLogo);
                container.append(brandCard);
            });
        };

        BrandManager.prototype.attachBrandHandlers = function (resetTimerCallback) {
            var _this = this;

            $('.brand-card').off('click').on('click', function () {
                var brandKey = $(this).attr('data-brand');
                _this.showBrandMenu(brandKey);

                if (resetTimerCallback && typeof resetTimerCallback === 'function') {
                    resetTimerCallback();
                }

                // Update navigation using menuLayout
                if (window.menuLayout && typeof menuLayout.navigateToPage === 'function') {
                    menuLayout.navigateToPage(brandKey + '_page');
                }
            });
        };

        BrandManager.prototype.showBrandMenu = function (brandKey) {
            var _this = this;
            var brand = _this.brands.find(function (b) { return b.brandKey === brandKey; });

            if (!brand) {
                console.error("Brand not found:", brandKey);
                return;
            }

            _this.currentBrand = brand;

            var menuPageId = '#' + brandKey + '_page';
            var menuPage = $(menuPageId);

            console.log('🔧 showBrandMenu - looking for:', menuPageId, 'found:', menuPage.length);

            if (!menuPage.length) {
                console.log('🔧 Page not found, creating new page');
                menuPage = _this.createDynamicMenuPage(brandKey);
                console.log('🔧 Created page:', menuPage.length, 'HTML:', menuPage[0]);
            }

            _this.populateMenuPage(brand, menuPage);
        };

        BrandManager.prototype.createDynamicMenuPage = function (brandKey) {
            var _this = this;
            var brand = _this.brands.find(function (b) { return b.brandKey === brandKey; });
            var brandLogoUrl = brand ? brand.logoUrl : '';

            var pageHtml = `
                <div id="${brandKey}_page" class="page" style="display:none;">
                    <button class="edge-nav-back" aria-label="Back to Menu Selection">
                        <div class="edge-nav-chevron">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </div>
                        <span class="edge-nav-label">Menus</span>
                    </button>
                    <button class="floating-nav-btn floating-nav-home" aria-label="Go home">
                        <img src="./media/homebutton.png" alt="Home">
                    </button>
                    <div class="background">
                        <img id="${brandKey}_background" src="./media/texture.png" height="1920" width="1080"/>
                    </div>
                    <div class="section-wrapper">
                        <div class="brand-header-logo">
                            <img src="${brandLogoUrl}" alt="Brand logo" />
                        </div>
                        <div class="items-wrapper"></div>
                    </div>
                </div>
            `;

            $('#target.asset-wrapper').append(pageHtml);
            return $('#' + brandKey + '_page');
        };

        BrandManager.prototype.populateMenuPage = function (brand, menuPage) {
            var _this = this;
            console.log('🔧 populateMenuPage called for brand:', brand.brandKey, brand);

            // Attach back button handler for this menu page
            menuPage.find('.edge-nav-back').off('click').on('click', function (e) {
                e.stopPropagation();
                if (window.menuLayout && typeof menuLayout.navigateBack === 'function') {
                    menuLayout.navigateBack();
                }
            });

            // Attach home button handler for this menu page
            menuPage.find('.floating-nav-home').off('click').on('click', function (e) {
                e.stopPropagation();
                if (window.menuLayout && typeof menuLayout.navigateToWelcome === 'function') {
                    menuLayout.navigateToWelcome();
                }
            });

            var sectionWrapper = menuPage.find('.section-wrapper');
            console.log('🔧 sectionWrapper found:', sectionWrapper.length);
            sectionWrapper.empty();

            var stationGroups = {};

            Object.keys(brand.stations).forEach(function (stationKey) {
                var station = brand.stations[stationKey];
                var cleanName = station.cleanedName || "Menu";
                console.log('🔧 Processing station:', stationKey, '→ cleanName:', cleanName, 'items:', station.items.length);

                if (!stationGroups[cleanName]) {
                    stationGroups[cleanName] = {
                        name: cleanName,
                        items: []
                    };
                }

                stationGroups[cleanName].items = stationGroups[cleanName].items.concat(station.items);
            });

            console.log('🔧 Final stationGroups:', stationGroups);

            Object.keys(stationGroups).forEach(function (groupName) {
                var group = stationGroups[groupName];

                if (group.items.length === 0) {
                    console.log('🔧 Skipping empty group:', groupName);
                    return;
                }

                console.log('🔧 Creating section:', groupName, 'with', group.items.length, 'items');

                var featureWrapper = $('<div>').addClass('feature-wrapper');

                var sectionTitle = $('<div>')
                    .addClass('header')
                    .text(groupName);

                var itemsWrapper = $('<div>').addClass('items-wrapper');

                group.items.forEach(function (item) {
                    var itemHtml = Mustache.render(BrandManager.itemWrapper, item);
                    var $item = $(itemHtml);
                    $item.find('.item-wrapper').data('nutrition', item);
                    itemsWrapper.append($item);
                });

                featureWrapper.append(sectionTitle);
                featureWrapper.append(itemsWrapper);
                sectionWrapper.append(featureWrapper);
                console.log('🔧 Section appended:', groupName);
            });

            console.log('🔧 populateMenuPage complete. Total sections in wrapper:', sectionWrapper.children('.feature-wrapper').length);

            _this.handleIconOrphans(menuPage);
        };

        BrandManager.prototype.handleIconOrphans = function (menuPage) {
            menuPage.find(".menu-item-wrapper .name").each(function () {
                var nameEl = this;
                var iconWrapper = nameEl.querySelector(".icon-wrapper");
                if (!iconWrapper || $(iconWrapper).hasClass("hide") || !iconWrapper.querySelector("img")) {
                    return;
                }

                var baseText = "";
                Array.prototype.slice.call(nameEl.childNodes).forEach(function (node) {
                    if (node === iconWrapper) return;
                    if (node.nodeType === 3) {
                        baseText += " " + node.nodeValue;
                    } else if (node.nodeType === 1 && !$(node).hasClass("icon-orphan-fix")) {
                        baseText += " " + node.textContent;
                    }
                });

                baseText = baseText.replace(/\s+/g, " ").trim();
                if (!baseText) return;

                var words = baseText.split(" ").filter(Boolean);
                if (words.length < 2) return;

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

        BrandManager.prototype.init = function (integrationItems, resetTimerCallback) {
            var _this = this;
            console.log(integrationItems);
            _this.analyzeBrands(integrationItems);
            _this.renderBrandCards('#weekly_menu_page .brand-list');
            _this.attachBrandHandlers(resetTimerCallback);

            console.log("BrandManager initialized with", _this.brands.length, "brands");
        };

        BrandManager.itemWrapper = `
        <div class="menu-item-wrapper">
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

        return BrandManager;
    })();
    IMSintegration.BrandManager = BrandManager;
})(IMSintegration || (IMSintegration = {}));

var brandManager = new IMSintegration.BrandManager();
