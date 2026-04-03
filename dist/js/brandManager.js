"use strict";

var IMSintegration;
(function (wandDigital) {
    var BrandManager = (function () {
        function BrandManager() {
            this.logoBaseUrl = "https://trm.wandcorp.com/cms_mediafiles/DIGITAL_ASSETS_NX01/297748/eurest_logos/";

            // Brand configuration mapping stations to unified brand names
            this.brandConfig = {
                "bibimbap": {
                    displayName: "Bibimbap",
                    stations: [
                        "bibimbap - byo",
                        "bibimbap - express"
                    ]
                },
                "bigcitybbq": {
                    displayName: "Big City BBQ",
                    stations: [
                        "big city bbq - core + sides"
                    ]
                },
                "bokchoy": {
                    displayName: "Bok Choy",
                    stations: [
                        "bok choy - byo",
                        "bok choy - express"
                    ]
                },
                "butcherbaker": {
                    displayName: "Butcher & Baker",
                    stations: [
                        "butcher & baker - byo omelet",
                        "butcher & baker - daily features"
                    ]
                },
                "crave": {
                    displayName: "Crave",
                    stations: [
                        "crave - byo",
                        "crave - daily features"
                    ]
                },
                "create": {
                    displayName: "Create",
                    stations: [
                        "create - byo",
                        "create - sides"
                    ]
                },
                "crisp": {
                    displayName: "Crisp",
                    stations: [
                        "crisp - byo",
                        "crisp - sides"
                    ]
                },
                "earthbowl": {
                    displayName: "Earth Bowl",
                    stations: [
                        "earth bowl - byo",
                        "earth bowl - express"
                    ]
                },
                "elmollete": {
                    displayName: "El Mollete",
                    stations: [
                        "el mollete - byo",
                        "el mollete - express"
                    ]
                },
                "fishmarket": {
                    displayName: "Fish Market",
                    stations: [
                        "fish market - byo",
                        "fish market - daily features"
                    ]
                },
                "flame": {
                    displayName: "Flame",
                    stations: [
                        "flame - byo",
                        "flame - daily features"
                    ]
                },
                "graze": {
                    displayName: "Graze",
                    stations: [
                        "graze - byo",
                        "graze - daily features",
                        "graze - sides"
                    ]
                },
                "justburgers": {
                    displayName: "Just Burgers",
                    stations: [
                        "just burgers - byo",
                        "just burgers - express"
                    ]
                },
                "kitchenco": {
                    displayName: "Kitchen Co",
                    stations: [
                        "kitchen co - daily features",
                        "kitchen co - sides"
                    ]
                },
                "leafladle": {
                    displayName: "Leaf & Ladle",
                    stations: [
                        "leaf & ladle - byo",
                        "leaf & ladle - express"
                    ]
                },
                "maccheeseology": {
                    displayName: "Mac Cheeseology",
                    stations: [
                        "mac cheeseology - byo",
                        "mac cheeseology - express"
                    ]
                },
                "machuperu": {
                    displayName: "Machu Peru",
                    stations: [
                        "machu peru - byo",
                        "machu peru - express"
                    ]
                },
                "madetomelt": {
                    displayName: "Made to Melt",
                    stations: [
                        "made to melt - express",
                        "made to melt - a la carte"
                    ]
                },
                "marketfresh": {
                    displayName: "Market Fresh",
                    stations: [
                        "market fresh - byo",
                        "market fresh - sides"
                    ]
                },
                "masala": {
                    displayName: "Masala",
                    stations: [
                        "masala - byo",
                        "masala - express"
                    ]
                },
                "meatballinc": {
                    displayName: "Meatball Inc",
                    stations: [
                        "meatball inc - express",
                        "meatball inc - a la carte"
                    ]
                },
                "mezze": {
                    displayName: "Mezze",
                    stations: [
                        "mezze - byo",
                        "mezze - express"
                    ]
                },
                "piccolaitalia": {
                    displayName: "Piccola Italia",
                    stations: [
                        "piccola italia (pizza) - by the slice",
                        "piccola italia (pizza) - individual pizza",
                        "piccola italia (pasta) - entree + 1 side",
                        "piccola italia (pasta) - entree + 2 sides"
                    ]
                },
                "picomesa": {
                    displayName: "Pico Mesa",
                    stations: [
                        "pico mesa - byo",
                        "pico mesa - express"
                    ]
                },
                "piripiri": {
                    displayName: "Piri Piri",
                    stations: [
                        "piri piri - byo",
                        "piri piri - express"
                    ]
                },
                "revolutionnoodle": {
                    displayName: "Revolution Noodle",
                    stations: [
                        "revolution noodle - byo",
                        "revolution noodle - express"
                    ]
                },
                "roost1996": {
                    displayName: "Roost 1996",
                    stations: [
                        "roost 1996 - by the slice",
                        "roost 1996 - individual pizza"
                    ]
                },
                "rootsandseeds": {
                    displayName: "Roots and Seeds",
                    stations: [
                        "roots and seeds - byo",
                        "roots and seeds - sides"
                    ]
                },
                "soulkitchen": {
                    displayName: "Soul Kitchen",
                    stations: [
                        "soul kitchen - daily features",
                        "soul kitchen - sides"
                    ]
                },
                "soup": {
                    displayName: "Soup",
                    stations: [
                        "soup - daily features"
                    ]
                },
                "tacocantina": {
                    displayName: "Taco Cantina",
                    stations: [
                        "taco cantina - express",
                        "taco cantina - a la carte"
                    ]
                }
            };

            this.brands = [];
            this.currentBrand = null;
        }

        BrandManager.prototype.sanitizeStationName = function (stationName) {
            if (!stationName) return "";
            return stationName.trim();
        };

        BrandManager.prototype.matchesIncludePattern = function (stationName) {
            var _this = this;
            var sanitized = _this.sanitizeStationName(stationName).toLowerCase();

            // Search through all brand configs to find matching station
            for (var brandKey in _this.brandConfig) {
                var brand = _this.brandConfig[brandKey];
                for (var i = 0; i < brand.stations.length; i++) {
                    if (sanitized === brand.stations[i]) {
                        return {
                            matchedStation: brand.stations[i],
                            brandKey: brandKey,
                            displayName: brand.displayName
                        };
                    }
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
                var matchResult = _this.matchesIncludePattern(sanitizedStation);

                if (!matchResult) return;

                var brandKey = matchResult.brandKey;
                var brandName = matchResult.displayName;
                var matchedStation = matchResult.matchedStation;

                // Extract substation name from matched station pattern
                var extracted = _this.extractBrandAndSubstation(matchedStation);
                var substationName = extracted.substationName;

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
                        originalName: matchedStation,
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
