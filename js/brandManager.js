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
                    displayName: "Graze"
                },
                piccolaitalia: {
                    logoFilename: "piccolaitalia.png",
                    keywords: ["piccola", "italia"],
                    displayName: "Piccola Italia"
                },
                bigcitybbq: {
                    logoFilename: "bigcitybbq.png",
                    keywords: ["big city", "bigcity", "bbq"],
                    displayName: "Big City BBQ"
                },
                tacocantina: {
                    logoFilename: "tacocantina.png",
                    keywords: ["taco", "cantina"],
                    displayName: "Taco Cantina"
                },
                butcherbaker: {
                    logoFilename: "butcherbaker.png",
                    keywords: ["butcher", "baker", "b&b"],
                    displayName: "Butcher & Baker"
                },
                roost: {
                    logoFilename: "roost1996.png",
                    keywords: ["roost", "1996"],
                    displayName: "Roost 1996"
                },
                flame: {
                    logoFilename: "flame.png",
                    keywords: ["flame"],
                    displayName: "Flame"
                },
                create: {
                    logoFilename: "create.png",
                    keywords: ["create"],
                    displayName: "Create"
                },
                bibimbap: {
                    logoFilename: "bibimbap.png",
                    keywords: ["bibimbap"],
                    displayName: "Bibimbap"
                },
                bokchoy: {
                    logoFilename: "bokchoy.png",
                    keywords: ["bok choy", "bokchoy"],
                    displayName: "Bok Choy"
                },
                crave: {
                    logoFilename: "crave.png",
                    keywords: ["crave"],
                    displayName: "Crave"
                },
                crisp: {
                    logoFilename: "crisp.png",
                    keywords: ["crisp"],
                    displayName: "Crisp"
                },
                earthbowl: {
                    logoFilename: "earthbowl.png",
                    keywords: ["earth bowl", "earthbowl"],
                    displayName: "Earth Bowl"
                },
                fishmarket: {
                    logoFilename: "fishmarket.png",
                    keywords: ["fish market", "fishmarket"],
                    displayName: "Fish Market"
                },
                justburgers: {
                    logoFilename: "justburgers.png",
                    keywords: ["just burgers", "justburgers"],
                    displayName: "Just Burgers"
                },
                kitchenco: {
                    logoFilename: "kitchenco.png",
                    keywords: ["kitchen co", "kitchenco"],
                    displayName: "Kitchen Co"
                },
                maccheeseology: {
                    logoFilename: "maccheeseology.png",
                    keywords: ["mac cheeseology", "maccheeseology", "mac cheese"],
                    displayName: "Mac Cheeseology"
                },
                machuperu: {
                    logoFilename: "machuperu.png",
                    keywords: ["machu peru", "machuperu"],
                    displayName: "Machu Peru"
                },
                madetomelt: {
                    logoFilename: "madetomelt.png",
                    keywords: ["made to melt", "madetomelt"],
                    displayName: "Made to Melt"
                },
                marketfresh: {
                    logoFilename: "marketfresh.png",
                    keywords: ["market fresh", "marketfresh"],
                    displayName: "Market Fresh"
                },
                masala: {
                    logoFilename: "masala_685x300.png",
                    keywords: ["masala"],
                    displayName: "Masala"
                },
                meatballinc: {
                    logoFilename: "meatballInc.png",
                    keywords: ["meatball", "meatballinc"],
                    displayName: "Meatball Inc"
                },
                mezze: {
                    logoFilename: "mezze.png",
                    keywords: ["mezze"],
                    displayName: "Mezze"
                },
                picomesa: {
                    logoFilename: "picomesa.png",
                    keywords: ["pico mesa", "picomesa"],
                    displayName: "Pico Mesa"
                },
                piripiri: {
                    logoFilename: "piripiri.png",
                    keywords: ["piri piri", "piripiri"],
                    displayName: "Piri Piri"
                },
                revolutionnoodle: {
                    logoFilename: "revolutionnoodle.png",
                    keywords: ["revolution noodle", "revolutionnoodle"],
                    displayName: "Revolution Noodle"
                },
                rootsandseeds: {
                    logoFilename: "rootsandsseds.png",
                    keywords: ["roots and seeds", "rootsandseeds"],
                    displayName: "Roots and Seeds"
                },
                soulkitchen: {
                    logoFilename: "soulkitchen.png",
                    keywords: ["soul kitchen", "soulkitchen"],
                    displayName: "Soul Kitchen"
                },
                soup: {
                    logoFilename: "soup.png",
                    keywords: ["soup"],
                    displayName: "Soup"
                }
            };
            this.brands = [];
            this.currentBrand = null;
        }

        BrandManager.prototype.normalizeString = function (str) {
            return (str || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        };

        BrandManager.prototype.extractBrandFromStation = function (stationName) {
            var _this = this;
            var normalized = this.normalizeString(stationName);

            for (var brandKey in _this.brandConfig) {
                var brand = _this.brandConfig[brandKey];
                for (var i = 0; i < brand.keywords.length; i++) {
                    var keyword = _this.normalizeString(brand.keywords[i]);
                    if (normalized.indexOf(keyword) >= 0) {
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
            var currentDay = currentTime();

            var dateValidated = integrationItems.filter(function (each) {
                return new Date(each.date).toDateString() === new Date(currentDay).toDateString();
            });

            dateValidated.forEach(function (item) {
                item.period = item.period || item.mealPeriod || item.imsDaypartName || item.daypart_label || "";
                item.station = item.category || item.mealStation || item.menuZoneName || item.station || "";

                if (!item.station) return;

                var brandKey = _this.extractBrandFromStation(item.station);
                if (!brandKey) return;

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

                if (!brandMap[brandKey].stations[item.station]) {
                    brandMap[brandKey].stations[item.station] = {
                        originalName: item.station,
                        cleanedName: cleanedStation,
                        period: item.period,
                        items: []
                    };
                }

                brandMap[brandKey].stations[item.station].items.push(item);
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

            $('#weekly_menu_page').hide();

            var menuPageId = '#' + brandKey + '_page';
            var menuPage = $(menuPageId);

            if (!menuPage.length) {
                menuPage = _this.createDynamicMenuPage(brandKey);
            }

            _this.populateMenuPage(brand, menuPage);

            menuPage.show();
        };

        BrandManager.prototype.createDynamicMenuPage = function (brandKey) {
            var pageHtml = `
                <div id="${brandKey}_page" class="page" style="display:none;">
                    <div class="background">
                        <img id="${brandKey}_background" src="./media/texture.png" height="1920" width="1080"/>
                    </div>
                    <div class="section-wrapper" style="margin-top: 80px;">
                        <div class="items-wrapper"></div>
                    </div>
                    <div class="goHome" onclick="goHome(event)">
                        <img src="media/homebutton.png">
                    </div>
                </div>
            `;

            $('#target.asset-wrapper').append(pageHtml);
            return $('#' + brandKey + '_page');
        };

        BrandManager.prototype.populateMenuPage = function (brand, menuPage) {
            var _this = this;
            var sectionWrapper = menuPage.find('.section-wrapper');
            sectionWrapper.empty();

            var stationGroups = {};

            Object.keys(brand.stations).forEach(function (stationKey) {
                var station = brand.stations[stationKey];
                var cleanName = station.cleanedName || "Menu";

                if (!stationGroups[cleanName]) {
                    stationGroups[cleanName] = {
                        name: cleanName,
                        items: []
                    };
                }

                stationGroups[cleanName].items = stationGroups[cleanName].items.concat(station.items);
            });

            Object.keys(stationGroups).forEach(function (groupName) {
                var group = stationGroups[groupName];

                if (group.items.length === 0) return;

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
            });

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
