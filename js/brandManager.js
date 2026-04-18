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
                    logoUrl: this.logoBaseUrl + "bibimbap.png",
                    stations: [
                        "bibimbap - daily features",
                        "bibimbap - choose your protein",
                        "bibimbap - select your base",
                        "bibimbap - add a sauce",
                        "bibimbap - top with vegetables",
                        "bibimbap - add a side"
                    ]
                },
                "bigcitybbq": {
                    displayName: "Big City BBQ",
                    logoUrl: this.logoBaseUrl + "bigcitybbq.png",
                    stations: [
                        "big city bbq - daily features",
                        "big city bbq - protein",
                        "big city bbq - add a side",
                        "big city bbq - sauces"
                    ]
                },
                "bokchoy": {
                    displayName: "Bok Choy",
                    logoUrl: this.logoBaseUrl + "bokchoy.png",
                    stations: [
                        "bok choy - express",
                        "bok choy - byo"
                    ]
                },
                "breakfastbakery": {
                    displayName: "Breakfast Bakery",
                    logoUrl: this.logoBaseUrl + "breakfastbakery.png",
                    stations: [
                        "breakfast bakery - daily features",
                        "breakfast bakery - a la carte"
                    ]
                },
                "breakfastbyopowerbowl": {
                    displayName: "Breakfast BYO Power Bowl",
                    logoUrl: this.logoBaseUrl + "breakfastbyopowerbowl.png",
                    stations: [
                        "breakfast power bowl - daily features",
                        "breakfast byo power bowl - choose your base",
                        "breakfast byo power bowl - choose your add ins",
                        "breakfast byo power bowl - choose your toppings"
                    ]
                },
                "breakfastbyotoastbar": {
                    displayName: "Breakfast BYO Toast Bar",
                    logoUrl: this.logoBaseUrl + "breakfastbyotoastbar.png",
                    stations: [
                        "breakfast toast - choose your base",
                        "breakfast toast - add a spread",
                        "breakfast toast - add toppers"
                    ]
                },
                "breakfastcharcuterie": {
                    displayName: "Breakfast Charcuterie",
                    logoUrl: this.logoBaseUrl + "breakfastcharcuterie.png",
                    stations: [
                        "breakfast charcuterie - choose your proteins",
                        "breakfast charcuterie - add fruit and vegetables",
                        "breakfast charcuterie - add nuts, dips and breads"
                    ]
                },
                "breakfastdeli": {
                    displayName: "Breakfast Deli",
                    logoUrl: this.logoBaseUrl + "breakfastdeli.png",
                    stations: [
                        "breakfast deli - daily features",
                        "breakfast deli - core",
                        "breakfast deli - sides"
                    ]
                },
                "breakfastgrabandgo": {
                    displayName: "Breakfast Grab & Go",
                    logoUrl: this.logoBaseUrl + "breakfastgrabandgo.png",
                    stations: [
                        "breakfast grab and go - daily features",
                        "breakfast grab and go - express"
                    ]
                },
                "breakfastgrill": {
                    displayName: "Breakfast Grill",
                    logoUrl: this.logoBaseUrl + "breakfastgrill.png",
                    stations: [
                        "breakfast grill - daily features",
                        "breakfast grill - core sandwiches",
                        "breakfast grill - sides",
                        "breakfast grill - scrambled, wrapped or hashed",
                        "breakfast grill - choose your style",
                        "breakfast grill - add a side"
                    ]
                },
                "breakfasthotcereal": {
                    displayName: "Breakfast Hot Cereal",
                    logoUrl: this.logoBaseUrl + "breakfasthotcereal.png",
                    stations: [
                        "breakfast hot cereal - daily features",
                        "breakfast hot cereal - express"
                    ]
                },
                "breakfasthotcoldcerealbar": {
                    displayName: "Breakfast Hot & Cold Cereal Bar",
                    logoUrl: this.logoBaseUrl + "breakfasthotcoldcerealbar.png",
                    stations: [
                        "breakfast cereal - choose your cereal",
                        "breakfast cereal - choose your add ins",
                        "breakfast cereal - add toppers",
                        "breakfast cereal - add sauce or milk"
                    ]
                },
                "breakfasthotgraze": {
                    displayName: "Breakfast Hot Graze",
                    logoUrl: this.logoBaseUrl + "breakfasthotgraze.png",
                    stations: [
                        "breakfast hot graze - daily features",
                        "breakfast hot graze - a la carte"
                    ]
                },
                "breakfastpizza": {
                    displayName: "Breakfast Pizza",
                    logoUrl: this.logoBaseUrl + "breakfastpizza.png",
                    stations: [
                        "breakfast pizza - daily features",
                        "breakfast pizza - core",
                        "breakfast pizza - sides"
                    ]
                },
                "butcherbaker": {
                    displayName: "Butcher & Baker",
                    logoUrl: this.logoBaseUrl + "butcherbaker.png",
                    stations: [
                        "butcher & baker - daily features",
                        "butcher & baker - express",
                        "butcher & baker - choose your protein",
                        "butcher & baker - choose your bread",
                        "butcher & baker - add cheese",
                        "butcher & baker - add toppings",
                        "butcher & baker - add a spread",
                        "butcher & baker - add a side",
                        "b+b subs - daily features",
                        "b+b - sub rolls",
                        "b+b - proteins",
                        "b+b - toppings",
                        "b+b - sauces and spreads",
                        "b+b - something extra",
                        "boxed - daily features",
                        "boxed - start with meat and cheese",
                        "boxed - pick your accompaniments",
                        "boxed - complete your box"
                    ]
                },
                "chefstable": {
                    displayName: "Chef's Table",
                    logoUrl: this.logoBaseUrl + "chefstable.png",
                    stations: [
                        "chefs table - daily features"
                    ]
                },
                "coolchicks": {
                    displayName: "Cool Chicks",
                    logoUrl: this.logoBaseUrl + "coolchicks.png",
                    stations: [
                        "cool chix - daily features",
                        "cool chix - crispy or grilled",
                        "cool chix - choose your sides",
                        "cool chix - something extra"
                    ]
                },
                "crave": {
                    displayName: "Crave",
                    logoUrl: this.logoBaseUrl + "crave.png",
                    stations: [
                        "crave - daily features",
                        "crave - byo"
                    ]
                },
                "create": {
                    displayName: "Create",
                    logoUrl: this.logoBaseUrl + "create.png",
                    stations: [
                        "create - daily features",
                        "create - step 1",
                        "create - step 2",
                        "create - step 3",
                        "create - step 4"
                    ]
                },
                "crisp": {
                    displayName: "Crisp",
                    logoUrl: this.logoBaseUrl + "crisp.png",
                    stations: [
                        "crisp - daily features",
                        "crisp - express"
                    ]
                },
                "dhabanorth": {
                    displayName: "Dhaba North",
                    logoUrl: this.logoBaseUrl + "dhabanorth.png",
                    stations: [
                        "dhaba north - daily features",
                        "dhaba north - choose your side",
                        "dhaba north - choose your rice"
                    ]
                },
                "dhabasouth": {
                    displayName: "Dhaba South",
                    logoUrl: this.logoBaseUrl + "dhabasouth.png",
                    stations: [
                        "dhaba south - daily features",
                        "dhaba south - choose your side",
                        "dhaba south - choose your rice"
                    ]
                },
                "dhabatikka": {
                    displayName: "Dhaba Tikka",
                    logoUrl: this.logoBaseUrl + "dhabatikka.png",
                    stations: [
                        "dhaba - daily features",
                        "dhaba - choose your style",
                        "dhaba - add protein",
                        "dhaba - top it",
                        "dhaba - add flavor"
                    ]
                },
                "earthbowl": {
                    displayName: "Earth Bowl",
                    logoUrl: this.logoBaseUrl + "earthbowl.png",
                    stations: [
                        "earth bowl - daily features",
                        "earth bowl - start with a base",
                        "earth bowl - top it",
                        "earth bowl - add flavor",
                        "earth bowl - something extra"
                    ]
                },
                "elmollete": {
                    displayName: "El Mollete",
                    logoUrl: this.logoBaseUrl + "elmollete.png",
                    stations: [
                        "el mollete - express",
                        "el mollete - byo"
                    ]
                },
                "fishandchipshop": {
                    displayName: "Fish & Chip Shop",
                    logoUrl: this.logoBaseUrl + "fishandchipshop.png",
                    stations: [
                        "fish and chip shop - daily features",
                        "fish and chip shop - something extra"
                    ]
                },
                "fishmarket": {
                    displayName: "Fish Market",
                    logoUrl: this.logoBaseUrl + "fishmarket.png",
                    stations: [
                        "fish market - daily features",
                        "fish market - choose your seafood",
                        "fish market - add a side",
                        "fish market - add a sauce"
                    ]
                },
                "flame": {
                    displayName: "Flame",
                    logoUrl: this.logoBaseUrl + "flame.png",
                    stations: [
                        "flame - daily features",
                        "flame - express",
                        "flame - choose your protein",
                        "flame - choose your style",
                        "flame - add cheese",
                        "flame - add your toppings",
                        "flame - core options",
                        "flame - add a side",
                        "flame breakfast - daily features",
                        "flame breakfast - eggs your way",
                        "flame breakfast - breakfast sandwiches",
                        "flame breakfast - house favorites",
                        "flame breakfast - simply breakfast plate",
                        "flame breakfast omelet - choose your eggs",
                        "flame breakfast omelet - choose your vegetables",
                        "flame breakfast omelet - pick your cheese",
                        "flame breakfast omelet - choose your protein",
                        "flame breakfast - from the griddle",
                        "flame breakfast - griddle toppings"
                    ]
                },
                "flychix": {
                    displayName: "Fly Chix",
                    logoUrl: this.logoBaseUrl + "flychix.png",
                    stations: [
                        "fly chix - daily features",
                        "fly chix - choose your meal",
                        "fly chix - choose your flavor",
                        "fly chix - add a side",
                        "fly chix - choose your dip",
                        "fly chix - something extra"
                    ]
                },
                "gingerrepublic": {
                    displayName: "Ginger Republic",
                    logoUrl: this.logoBaseUrl + "gingerrepublic.png",
                    stations: [
                        "ginger republic - daily features",
                        "ginger republic - choose a side",
                        "ginger republic - something extra"
                    ]
                },
                "goodmoodmonday": {
                    displayName: "Good Mood Monday",
                    logoUrl: this.logoBaseUrl + "goodmoodmonday.png",
                    stations: [
                        "musical monday - daily features",
                        "musical monday - choose your sauce",
                        "musical monday - choose your base",
                        "musical monday - choose your protein",
                        "musical monday - choose your toppings",
                        "musical monday - choose your dressing",
                        "musical monday - something extra",
                        "monday mash up - daily features",
                        "golden monday - daily features",
                        "golden monday - choose your side",
                        "mocktail monday - daily features",
                        "comfort monday - daily features"
                    ]
                },
                "graze": {
                    displayName: "Graze",
                    logoUrl: this.logoBaseUrl + "graze.png",
                    stations: [
                        "graze - daily features",
                        "graze - express"
                    ]
                },
                "grillsandgreens": {
                    displayName: "Grills & Greens",
                    logoUrl: this.logoBaseUrl + "grillsandgreens.png",
                    stations: [
                        "grills & greens - daily features",
                        "grills & greens - choose your style",
                        "grills & greens - add protein",
                        "grills & greens - top with dressing",
                        "grills & greens - something extra"
                    ]
                },
                "ifpigshadwings": {
                    displayName: "If Pigs Had Wings",
                    logoUrl: this.logoBaseUrl + "ifpigshadwings.png",
                    stations: [
                        "if pigs had wings - daily features",
                        "if pigs had wings - choose your slaw",
                        "if pigs had wings - choose your pickle",
                        "if pigs had wings - something extra"
                    ]
                },
                "islandeats": {
                    displayName: "Island Eats",
                    logoUrl: this.logoBaseUrl + "islandeats.png",
                    stations: [
                        "island eats - daily features",
                        "island eats - pick two sides",
                        "island eats - something extra"
                    ]
                },
                "justburgers": {
                    displayName: "Just Burgers",
                    logoUrl: this.logoBaseUrl + "justburgers.png",
                    stations: [
                        "just burgers - express",
                        "just burgers - byo"
                       ]
                },
                "kitchenco": {
                    displayName: "Kitchen & Co.",
                    logoUrl: this.logoBaseUrl + "kitchenco.png",
                    stations: [
                        "kitchen & co. - daily features",
                        "kitchen & co. - choose your entree",
                        "kitchen & co. - choose your sides",
                        "kitchen & co. - something extra"
                    ]
                },
                "leafladle": {
                    displayName: "Leaf & Ladle",
                    logoUrl: this.logoBaseUrl + "leafladle.png",
                    stations: [
                        "leaf & ladle - express",
                        "leaf & ladle - byo"
                    ]
                },
                "littlelime": {
                    displayName: "Little Lime",
                    logoUrl: this.logoBaseUrl + "littlelime.png",
                    stations: [
                        "little lime - daily features",
                        "little lime - something extra",
                        "little lime - choose your base",
                        "little lime - choose your protein",
                        "little lime - toppings",
                        "little lime - choose your dressing"
                    ]
                },
                "maccheeseology": {
                    displayName: "Mac & Cheesyology",
                    logoUrl: this.logoBaseUrl + "maccheeseology.png",
                    stations: [
                        "mac & cheesyology - daily features bowls",
                        "mac & cheesyology - daily features melts"
                    ]
                },
                "machuperu": {
                    displayName: "Machu Peru",
                    logoUrl: this.logoBaseUrl + "machuperu.png",
                    stations: [
                        "machu peru - daily features",
                        "machu peru - choose a base",
                        "machu peru - choose a side",
                        "machu peru - choose a sauce",
                        "machu peru - add a dessert"
                    ]
                },
                "madetomelt": {
                    displayName: "Made to Melt",
                    logoUrl: this.logoBaseUrl + "madetomelt.png",
                    stations: [
                        "made to melt - express",
                        "made to melt - a la carte"
                    ]
                },
                "madspice": {
                    displayName: "Mad Spice",
                    logoUrl: this.logoBaseUrl + "madspice.png",
                    stations: [
                        "mad spice - daily features",
                        "mad spice - something extra"
                    ]
                },
                "marketfresh": {
                    displayName: "Market Fresh",
                    logoUrl: this.logoBaseUrl + "marketfresh.png",
                    stations: [
                        "market fresh - byo",
                        "market fresh - sides"
                    ]
                },
                "masala": {
                    displayName: "Masala",
                    logoUrl: this.logoBaseUrl + "masala.png",
                    stations: [
                        "masala - express",
                        "masala - byo"
                    ]
                },
                "meatballinc": {
                    displayName: "Meatball, Inc",
                    logoUrl: this.logoBaseUrl + "meatballinc.png",
                    stations: [
                        "meatball, inc - daily features",
                        "meatball, inc - sides"
                    ]
                },
                "mezze": {
                    displayName: "Mezze",
                    logoUrl: this.logoBaseUrl + "mezze.png",
                    stations: [
                        "mezze bowl - daily features",
                        "mezze bowl - select your base",
                        "mezze bowl - choose your protein",
                        "mezze bowl - add a spread",
                        "mezze bowl - top it",
                        "mezze bowl - finish it",
                        "mezze gyros - daily features",
                        "mezze gyros - select your base",
                        "mezze gyros - choose your protein",
                        "mezze gyros - top it",
                        "mezze gyros - choose a side",
                        "mezze gyros - extras",
                        "mezze plate - daily features",
                        "mezze plate - choose your protein",
                        "mezze plate - choose your sides",
                        "mezze plate - choose your spreads",
                        "mezze plate - extras"
                    ]
                },
                "mix": {
                    displayName: "Mix",
                    logoUrl: this.logoBaseUrl + "mix.png",
                    stations: [
                        "mix - daily features",
                        "mix - chopped or wrapped",
                        "mix - choose a style",
                        "mix - add protein",
                        "mix - something extra"
                    ]
                },
                "piccolaitalia": {
                    displayName: "Piccola Italia",
                    logoUrl: this.logoBaseUrl + "piccolaitalia.png",
                    stations: [
                        "piccola italia pizza - daily features",
                        "piccola italia pasta - daily features",
                        "piccola italia pizza - personal pizza",
                        "piccola italia pizza - by the slice",
                        "piccola italia pasta - choose your base",
                        "piccola italia pasta - choose your protein",
                        "piccola italia pasta - choose your toppings",
                        "piccola italia pasta - add a side",
                        "piccola italia pizza - choose your base",
                        "piccola italia pizza - choose your protein",
                        "piccola italia pizza - choose your toppings",
                        "piccola italia pizza - add a side"
                    ]
                },
                "picomesa": {
                    displayName: "Pico Mesa",
                    logoUrl: this.logoBaseUrl + "picomesa.png",
                    stations: [
                        "pico mesa - express",
                        "pico mesa - byo"
                    ]
                },
                "piripiri": {
                    displayName: "Piri Piri",
                    logoUrl: this.logoBaseUrl + "piripiri.png",
                    stations: [
                        "piri piri - choose a protein",
                        "piri piri - choose a side",
                        "piri piri - choose a sauce"
                    ]
                },
                "pulpculture": {
                    displayName: "Pulp Culture",
                    logoUrl: this.logoBaseUrl + "pulpculture.png",
                    stations: [
                        "pulp culture - daily features",
                        "pulp culture - smoothies",
                        "pulp culture - juices",
                        "pulp culture - agua frescas",
                        "pulp culture - enhancers"
                    ]
                },
                "revolutionnoodle": {
                    displayName: "Revolution Noodle",
                    logoUrl: this.logoBaseUrl + "revolutionnoodle.png",
                    stations: [
                        "revolution noodle - daily features",
                        "revolution noodle - add a side",
                        "revolution noodle - choose your toppings",
                        "revolution noodle - something extra"
                    ]
                },
                "rhythmandroux": {
                    displayName: "Rhythm & Roux",
                    logoUrl: this.logoBaseUrl + "rhythmandroux.png",
                    stations: [
                        "rhythm - daily features",
                        "rhythm - choose your sauce",
                        "rhythm - choose your sides",
                        "roux - daily features",
                        "roux - choose your sides"
                    ]
                },
                "roost1996": {
                    displayName: "Roost 1996",
                    logoUrl: this.logoBaseUrl + "roost1996.png",
                    stations: [
                        "roost 1996 - choose your sandwich",
                        "roost 1996 - choose your side"
                    ]
                },
                "rootsandseeds": {
                    displayName: "Roots & Seeds",
                    logoUrl: this.logoBaseUrl + "rootsandseeds.png",
                    stations: [
                        "roots & seeds - daily features",
                        "roots & seeds - choose your greens",
                        "roots & seeds - select your color",
                        "roots & seeds - add protein",
                        "roots & seeds - drizzle with dressing",
                        "roots & seeds - sprinkle with toppings"
                    ]
                },
                "soulkitchen": {
                    displayName: "Soul Kitchen",
                    logoUrl: this.logoBaseUrl + "soulkitchen.png",
                    stations: [
                        "soul kitchen - daily features",
                        "soul kitchen - sides"
                    ]
                },
                "soup": {
                    displayName: "Soup",
                    logoUrl: this.logoBaseUrl + "soup.png",
                    stations: [
                        "soup - daily features"
                    ]
                },
                "streeteats": {
                    displayName: "Street Eats",
                    logoUrl: this.logoBaseUrl + "streeteats.png",
                    stations: [
                        "street eats - daily features",
                        "street eats - add a side",
                        "street eats - something extra"
                    ]
                },
                "tacocantina": {
                    displayName: "Taco Cantina",
                    logoUrl: this.logoBaseUrl + "tacocantina.png",
                    stations: [
                        "taco cantina - daily features",
                        "taco cantina - choose your protein",
                        "taco cantina - choose your base",
                        "taco cantina - add your toppings",
                        "taco cantina - add chips and dip",
                        "taco cantina - add extra protein",
                        "taco cantina - add a side"
                    ]
                },
                "tagine": {
                    displayName: "Tagine",
                    logoUrl: this.logoBaseUrl + "tagine.png",
                    stations: [
                        "tagine - daily features",
                        "tagine - toppings",
                        "tagine - something extra"
                    ]
                },
                "thaiandtrue": {
                    displayName: "Thai & True",
                    logoUrl: this.logoBaseUrl + "thaiandtrue.png",
                    stations: [
                        "thai & true - daily feature",
                        "thai & true - something extra",
                        "thai & true - choose your curry",
                        "thai & true - choose your vegetables",
                        "thai & true - choose your entree",
                        "thai & true - choose your toppings",
                        "thai & true - choose your side"
                    ]
                },
                "turoturo": {
                    displayName: "Turo Turo",
                    logoUrl: this.logoBaseUrl + "turoturo.png",
                    stations: [
                        "turo turo - daily features",
                        "turo turo - pick your protein",
                        "turo turo - choose your side",
                        "turo turo - something extra"
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

        BrandManager.prototype.normalizeForMatching = function (text) {
            if (!text) return "";

            var normalizedText = text.toLowerCase();
            if (typeof normalizedText.normalize === 'function') {
                normalizedText = normalizedText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }

            // Remove all special characters and whitespace, keep only alphanumeric
            return normalizedText.replace(/[^a-z0-9]/g, '');
        };

        BrandManager.prototype.matchesIncludePattern = function (stationName) {
            var _this = this;
            var sanitized = _this.sanitizeStationName(stationName);
            var normalized = _this.normalizeForMatching(sanitized);

            // Search through all brand configs to find matching station
            for (var brandKey in _this.brandConfig) {
                var brand = _this.brandConfig[brandKey];
                for (var i = 0; i < brand.stations.length; i++) {
                    var normalizedPattern = _this.normalizeForMatching(brand.stations[i]);
                    if (normalized === normalizedPattern) {
                        return {
                            matchedStation: brand.stations[i],
                            brandKey: brandKey,
                            displayName: brand.displayName,
                            stationIndex: i
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

        BrandManager.prototype.generateLogoUrl = function (brandName, brandKey) {
            var _this = this;
            var config = brandKey ? _this.brandConfig[brandKey] : null;

            if (config && config.logoUrl) {
                return config.logoUrl;
            }

            return "";
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
                var stationIndex = typeof matchResult.stationIndex === "number" ? matchResult.stationIndex : Number.MAX_SAFE_INTEGER;

                // Extract substation name from matched station pattern
                var extracted = _this.extractBrandAndSubstation(matchedStation);
                var substationName = extracted.substationName;

                if (!brandMap[brandKey]) {
                    brandMap[brandKey] = {
                        brandKey: brandKey,
                        displayName: brandName,
                        logoUrl: _this.generateLogoUrl(brandName, brandKey),
                        stations: {},
                        items: []
                    };
                }

                if (!brandMap[brandKey].stations[substationName]) {
                    brandMap[brandKey].stations[substationName] = {
                        originalName: matchedStation,
                        cleanedName: substationName,
                        sortIndex: stationIndex,
                        period: item.period,
                        items: []
                    };
                } else {
                    brandMap[brandKey].stations[substationName].sortIndex = Math.min(
                        brandMap[brandKey].stations[substationName].sortIndex,
                        stationIndex
                    );
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


            if (!menuPage.length) {
                menuPage = _this.createDynamicMenuPage(brandKey);
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
            sectionWrapper.empty();

            var stationGroups = {};

            Object.keys(brand.stations).forEach(function (stationKey) {
                var station = brand.stations[stationKey];
                var cleanName = station.cleanedName || "Menu";
                var sortIndex = typeof station.sortIndex === "number" ? station.sortIndex : Number.MAX_SAFE_INTEGER;

                if (!stationGroups[cleanName]) {
                    stationGroups[cleanName] = {
                        name: cleanName,
                        sortIndex: sortIndex,
                        items: []
                    };
                } else {
                    stationGroups[cleanName].sortIndex = Math.min(stationGroups[cleanName].sortIndex, sortIndex);
                }

                stationGroups[cleanName].items = stationGroups[cleanName].items.concat(station.items);
            });

            var sortedStationGroups = Object.keys(stationGroups)
                .map(function (groupName) {
                    return stationGroups[groupName];
                })
                .sort(function (a, b) {
                    if (a.sortIndex !== b.sortIndex) {
                        return a.sortIndex - b.sortIndex;
                    }
                    return a.name.localeCompare(b.name);
                });

            sortedStationGroups.forEach(function (group) {
                var groupName = group.name;

                if (group.items.length === 0) {
                    console.log('🔧 Skipping empty group:', groupName);
                    return;
                }

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

            if(_this.brands.length === 0) {
                console.log("🛑 BrandManager initialized with", _this.brands.length, "brands");
            } else {
                console.log("✅ BrandManager initialized with", _this.brands.length, "brands");
            }
            return _this.brands.length;
        };

        BrandManager.itemWrapper = `
        <div class="menu-item-wrapper">
                <div class="item-wrapper">
                    <span class="name">
                        {{{name}}}{{comboName}}{{menuItemName}}<span class="icon-wrapper {{showIcons}}">{{#icons}}<img src="{{fileURL}}" data-fallback-url="{{url}}" class="nutrition-icon vegetarian nutrition-icon-fallback-url" onerror="if (this.dataset.fallbackTried) { this.style.display = 'none'; return; } var fallbackUrl = this.dataset.fallbackUrl; if (fallbackUrl) { this.dataset.fallbackTried = '1'; this.src = fallbackUrl; } else { this.style.display = 'none'; }" />{{/icons}}
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