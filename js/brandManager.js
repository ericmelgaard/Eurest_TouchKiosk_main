"use strict";

var IMSintegration;
(function (wandDigital) {
    var BrandManager = (function () {
        function BrandManager() {
            this.logoBaseUrl = "https://trm.wandcorp.com/cms_mediafiles/DIGITAL_ASSETS_NX01/297748/eurest_logos/";
            this.brandConfig = {
                graze: {
                    logoFilename: "graze.png",
                    keywords: ["graze"],
                    displayName: "Graze",
                    stationTypes: [
                        { pattern: "Graze - BYO", cleanName: "BYO" },
                        { pattern: "Graze - Daily Features", cleanName: "Daily Features" },
                        { pattern: "Graze - Sides", cleanName: "Sides" }
                    ]
                },
                piccolaitalia: {
                    logoFilename: "piccolaitalia.png",
                    keywords: ["piccola", "italia"],
                    displayName: "Piccola Italia",
                    stationTypes: [
                        { pattern: "Piccola Italia - Entree + 1", cleanName: "Entree + 1" },
                        { pattern: "Piccola Italia - Entree + 2", cleanName: "Entree + 2" }
                    ]
                },
                bigcitybbq: {
                    logoFilename: "bigcitybbq.png",
                    keywords: ["big city", "bigcity", "bbq"],
                    displayName: "Big City BBQ",
                    stationTypes: [
                        { pattern: "Big City BBQ - Core + Sides", cleanName: "Core + Sides" }
                    ]
                },
                tacocantina: {
                    logoFilename: "tacocantina.png",
                    keywords: ["taco", "cantina"],
                    displayName: "Taco Cantina",
                    stationTypes: [
                        { pattern: "Taco Cantina - Express", cleanName: "Express" },
                        { pattern: "Taco Cantina - A La Carte", cleanName: "A La Carte" }
                    ]
                },
                butcherbaker: {
                    logoFilename: "butcherbaker.png",
                    keywords: ["butcher", "baker", "b&b"],
                    displayName: "Butcher & Baker",
                    stationTypes: [
                        { pattern: "Butcher & Baker - BYO Omelet", cleanName: "BYO Omelet" },
                        { pattern: "Butcher & Baker - Daily Features", cleanName: "Daily Features" }
                    ]
                },
                roost: {
                    logoFilename: "roost1996.png",
                    keywords: ["roost", "1996"],
                    displayName: "Roost 1996",
                    stationTypes: [
                        { pattern: "Roost 1996 - By the Slice", cleanName: "By the Slice" },
                        { pattern: "Roost 1996 - Individual Pizza", cleanName: "Individual Pizza" }
                    ]
                },
                flame: {
                    logoFilename: "flame.png",
                    keywords: ["flame"],
                    displayName: "Flame",
                    stationTypes: [
                        { pattern: "Flame - BYO", cleanName: "BYO" },
                        { pattern: "Flame - Daily Features", cleanName: "Daily Features" }
                    ]
                },
                create: {
                    logoFilename: "create.png",
                    keywords: ["create"],
                    displayName: "Create",
                    stationTypes: [
                        { pattern: "Create - BYO", cleanName: "BYO" },
                        { pattern: "Create - Sides", cleanName: "Sides" }
                    ]
                },
                bibimbap: {
                    logoFilename: "bibimbap.png",
                    keywords: ["bibimbap"],
                    displayName: "Bibimbap",
                    stationTypes: [
                        { pattern: "Bibimbap - BYO", cleanName: "BYO" },
                        { pattern: "Bibimbap - Express", cleanName: "Express" }
                    ]
                },
                bokchoy: {
                    logoFilename: "bokchoy.png",
                    keywords: ["bok choy", "bokchoy"],
                    displayName: "Bok Choy",
                    stationTypes: [
                        { pattern: "Bok Choy - BYO", cleanName: "BYO" },
                        { pattern: "Bok Choy - Express", cleanName: "Express" }
                    ]
                },
                crave: {
                    logoFilename: "crave.png",
                    keywords: ["crave"],
                    displayName: "Crave",
                    stationTypes: [
                        { pattern: "Crave - BYO", cleanName: "BYO" },
                        { pattern: "Crave - Daily Features", cleanName: "Daily Features" }
                    ]
                },
                crisp: {
                    logoFilename: "crisp.png",
                    keywords: ["crisp"],
                    displayName: "Crisp",
                    stationTypes: [
                        { pattern: "Crisp - BYO", cleanName: "BYO" },
                        { pattern: "Crisp - Sides", cleanName: "Sides" }
                    ]
                },
                earthbowl: {
                    logoFilename: "earthbowl.png",
                    keywords: ["earth bowl", "earthbowl"],
                    displayName: "Earth Bowl",
                    stationTypes: [
                        { pattern: "Earth Bowl - BYO", cleanName: "BYO" },
                        { pattern: "Earth Bowl - Express", cleanName: "Express" }
                    ]
                },
                fishmarket: {
                    logoFilename: "fishmarket.png",
                    keywords: ["fish market", "fishmarket"],
                    displayName: "Fish Market",
                    stationTypes: [
                        { pattern: "Fish Market - BYO", cleanName: "BYO" },
                        { pattern: "Fish Market - Daily Features", cleanName: "Daily Features" }
                    ]
                },
                justburgers: {
                    logoFilename: "justburgers.png",
                    keywords: ["just burgers", "justburgers"],
                    displayName: "Just Burgers",
                    stationTypes: [
                        { pattern: "Just Burgers - BYO", cleanName: "BYO" },
                        { pattern: "Just Burgers - Express", cleanName: "Express" }
                    ]
                },
                kitchenco: {
                    logoFilename: "kitchenco.png",
                    keywords: ["kitchen co", "kitchenco"],
                    displayName: "Kitchen Co",
                    stationTypes: [
                        { pattern: "Kitchen Co - Daily Features", cleanName: "Daily Features" },
                        { pattern: "Kitchen Co - Sides", cleanName: "Sides" }
                    ]
                },
                maccheeseology: {
                    logoFilename: "maccheeseology.png",
                    keywords: ["mac cheeseology", "maccheeseology", "mac cheese"],
                    displayName: "Mac Cheeseology",
                    stationTypes: [
                        { pattern: "Mac Cheeseology - BYO", cleanName: "BYO" },
                        { pattern: "Mac Cheeseology - Express", cleanName: "Express" }
                    ]
                },
                machuperu: {
                    logoFilename: "machuperu.png",
                    keywords: ["machu peru", "machuperu"],
                    displayName: "Machu Peru",
                    stationTypes: [
                        { pattern: "Machu Peru - BYO", cleanName: "BYO" },
                        { pattern: "Machu Peru - Express", cleanName: "Express" }
                    ]
                },
                madetomelt: {
                    logoFilename: "madetomelt.png",
                    keywords: ["made to melt", "madetomelt"],
                    displayName: "Made to Melt",
                    stationTypes: [
                        { pattern: "Made to Melt - Express", cleanName: "Express" },
                        { pattern: "Made to Melt - A La Carte", cleanName: "A La Carte" }
                    ]
                },
                marketfresh: {
                    logoFilename: "marketfresh.png",
                    keywords: ["market fresh", "marketfresh"],
                    displayName: "Market Fresh",
                    stationTypes: [
                        { pattern: "Market Fresh - BYO", cleanName: "BYO" },
                        { pattern: "Market Fresh - Sides", cleanName: "Sides" }
                    ]
                },
                masala: {
                    logoFilename: "masala_685x300.png",
                    keywords: ["masala"],
                    displayName: "Masala",
                    stationTypes: [
                        { pattern: "Masala - BYO", cleanName: "BYO" },
                        { pattern: "Masala - Express", cleanName: "Express" }
                    ]
                },
                meatballinc: {
                    logoFilename: "meatballInc.png",
                    keywords: ["meatball", "meatballinc"],
                    displayName: "Meatball Inc",
                    stationTypes: [
                        { pattern: "Meatball Inc - Express", cleanName: "Express" },
                        { pattern: "Meatball Inc - A La Carte", cleanName: "A La Carte" }
                    ]
                },
                mezze: {
                    logoFilename: "mezze.png",
                    keywords: ["mezze"],
                    displayName: "Mezze",
                    stationTypes: [
                        { pattern: "Mezze - BYO", cleanName: "BYO" },
                        { pattern: "Mezze - Express", cleanName: "Express" }
                    ]
                },
                picomesa: {
                    logoFilename: "picomesa.png",
                    keywords: ["pico mesa", "picomesa"],
                    displayName: "Pico Mesa",
                    stationTypes: [
                        { pattern: "Pico Mesa - BYO", cleanName: "BYO" },
                        { pattern: "Pico Mesa - Express", cleanName: "Express" }
                    ]
                },
                piripiri: {
                    logoFilename: "piripiri.png",
                    keywords: ["piri piri", "piripiri"],
                    displayName: "Piri Piri",
                    stationTypes: [
                        { pattern: "Piri Piri - BYO", cleanName: "BYO" },
                        { pattern: "Piri Piri - Express", cleanName: "Express" }
                    ]
                },
                revolutionnoodle: {
                    logoFilename: "revolutionnoodle.png",
                    keywords: ["revolution noodle", "revolutionnoodle"],
                    displayName: "Revolution Noodle",
                    stationTypes: [
                        { pattern: "Revolution Noodle - BYO", cleanName: "BYO" },
                        { pattern: "Revolution Noodle - Express", cleanName: "Express" }
                    ]
                },
                rootsandseeds: {
                    logoFilename: "rootsandsseds.png",
                    keywords: ["roots and seeds", "rootsandseeds"],
                    displayName: "Roots and Seeds",
                    stationTypes: [
                        { pattern: "Roots and Seeds - BYO", cleanName: "BYO" },
                        { pattern: "Roots and Seeds - Sides", cleanName: "Sides" }
                    ]
                },
                soulkitchen: {
                    logoFilename: "soulkitchen.png",
                    keywords: ["soul kitchen", "soulkitchen"],
                    displayName: "Soul Kitchen",
                    stationTypes: [
                        { pattern: "Soul Kitchen - Daily Features", cleanName: "Daily Features" },
                        { pattern: "Soul Kitchen - Sides", cleanName: "Sides" }
                    ]
                },
                soup: {
                    logoFilename: "soup.png",
                    keywords: ["soup"],
                    displayName: "Soup",
                    stationTypes: [
                        { pattern: "Soup - Daily Features", cleanName: "Daily Features" }
                    ]
                }
            };
            this.brands = [];
            this.currentBrand = null;
        }

        BrandManager.prototype.normalizeString = function (str) {
            return (str || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        };

        BrandManager.prototype.normalizeStationName = function (stationName) {
            if (!stationName) return "";
            return stationName
                .trim()
                .replace(/[\s\-–—]+/g, " ")
                .toLowerCase();
        };

        BrandManager.prototype.matchStationPattern = function (stationName, brandKey) {
            var _this = this;
            if (!brandKey || !_this.brandConfig[brandKey]) {
                return null;
            }

            var brand = _this.brandConfig[brandKey];
            if (!brand.stationTypes || brand.stationTypes.length === 0) {
                return null;
            }

            var normalizedStation = _this.normalizeStationName(stationName);

            for (var i = 0; i < brand.stationTypes.length; i++) {
                var stationType = brand.stationTypes[i];
                var normalizedPattern = _this.normalizeStationName(stationType.pattern);

                if (normalizedStation === normalizedPattern) {
                    return {
                        pattern: stationType.pattern,
                        cleanName: stationType.cleanName
                    };
                }
            }

            return null;
        };

        BrandManager.prototype.extractBrandFromStation = function (stationName) {
            var _this = this;
            var normalized = this.normalizeString(stationName);
            var normalizedLower = (stationName || "").toLowerCase();

            for (var brandKey in _this.brandConfig) {
                var brand = _this.brandConfig[brandKey];
                for (var i = 0; i < brand.keywords.length; i++) {
                    var keyword = _this.normalizeString(brand.keywords[i]);
                    var keywordLower = brand.keywords[i].toLowerCase();

                    if (normalized.indexOf(keyword) >= 0 || normalizedLower.indexOf(keywordLower) >= 0) {
                        return brandKey;
                    }
                }
            }
            return null;
        };

        BrandManager.prototype.cleanStationName = function (stationName, brandKey) {
            var _this = this;
            if (!brandKey || !_this.brandConfig[brandKey]) {
                return stationName;
            }

            var matchedStation = _this.matchStationPattern(stationName, brandKey);
            if (matchedStation) {
                return matchedStation.cleanName;
            }

            var cleaned = stationName;
            var brand = _this.brandConfig[brandKey];

            brand.keywords.forEach(function (keyword) {
                var regex = new RegExp(keyword, 'gi');
                cleaned = cleaned.replace(regex, '');
            });

            cleaned = cleaned.replace(/^[\s\-–—]+|[\s\-–—]+$/g, '');
            cleaned = cleaned.replace(/\s+/g, ' ');

            return cleaned.trim();
        };

        BrandManager.prototype.analyzeBrands = function (integrationItems) {
            var _this = this;
            var brandMap = {};

            integrationItems.forEach(function (item) {
                item.period = item.period || item.mealPeriod || item.imsDaypartName || item.daypart_label || "";
                item.station = item.category || item.mealStation || item.menuZoneName || item.station || "";

                if (!item.station) return;

                var brandKey = _this.extractBrandFromStation(item.station);
                if (!brandKey) return;

                var matchedStation = _this.matchStationPattern(item.station, brandKey);
                if (!matchedStation && _this.brandConfig[brandKey].stationTypes && _this.brandConfig[brandKey].stationTypes.length > 0) {
                    return;
                }

                if (!brandMap[brandKey]) {
                    brandMap[brandKey] = {
                        brandKey: brandKey,
                        displayName: _this.brandConfig[brandKey].displayName,
                        logoFilename: _this.brandConfig[brandKey].logoFilename,
                        logoUrl: _this.logoBaseUrl + _this.brandConfig[brandKey].logoFilename,
                        stations: {},
                        items: []
                    };
                }

                var cleanedStation = _this.cleanStationName(item.station, brandKey);
                var stationKey = cleanedStation || item.station;

                if (!brandMap[brandKey].stations[stationKey]) {
                    brandMap[brandKey].stations[stationKey] = {
                        originalName: item.station,
                        cleanedName: cleanedStation,
                        period: item.period,
                        items: []
                    };
                }

                brandMap[brandKey].stations[stationKey].items.push(item);
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        <span class="floating-nav-label">Home</span>
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
