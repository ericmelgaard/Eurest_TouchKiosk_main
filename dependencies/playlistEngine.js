"use strict";

(function (window) {
    function asArray(items) {
        if (!items) {
            return [];
        }
        if (Array.isArray(items)) {
            return items;
        }
        if (items.toArray && typeof items.toArray === "function") {
            return items.toArray();
        }
        return $(items).toArray();
    }

    function normalizeTransitionName(name) {
        var key = (name || "crossFade") + "";
        key = key.toLowerCase();
        if (key === "fade") {
            return "crossFade";
        }
        if (key === "crossfade") {
            return "crossFade";
        }
        if (key === "slide") {
            return "slideOut";
        }
        if (key === "slideout") {
            return "slideOut";
        }
        if (key === "flip") {
            return "flip";
        }
        if (key === "none") {
            return "none";
        }
        return "crossFade";
    }

    function parseIntOr(value, fallback) {
        var parsed = parseInt(value, 10);
        return isNaN(parsed) ? fallback : parsed;
    }

    function buildPublicDefaults(defaults) {
        return {
            itemSelector: defaults.itemSelector,
            transition: defaults.transition,
            transitionDurationMs: defaults.transitionDurationMs,
            totalDurationMs: defaults.totalDurationMs,
            dom: {
                sourceAttr: defaults.dom.sourceAttr,
                totalDurationAttr: defaults.dom.totalDurationAttr,
                transitionAttr: defaults.dom.transitionAttr,
                transitionMsAttr: defaults.dom.transitionMsAttr
            },
            visibility: {
                pauseOnHidden: defaults.pauseOnHidden,
                resetToFirstOnResume: defaults.resetToFirstOnResume,
                resumeIndex: defaults.resumeIndex
            },
            mutation: {
                enabled: defaults.mutation.enabled,
                resetOnChange: defaults.mutation.resetOnChange
            },
            video: {
                unloadOnHide: defaults.video.unloadOnHide,
                preloadMode: defaults.video.preloadMode,
                resetOnHide: defaults.video.resetOnHide
            }
        };
    }

    var PlaylistTransitions = {
        none: function (ctx) {
            var $prev = ctx.$prev;
            var $next = ctx.$next;

            if ($prev && $prev.length) {
                $prev.stop(true, true).hide().css({ opacity: 0, transform: "" });
            }
            $next.stop(true, true).show().css({ opacity: 1, transform: "" });
            ctx.done();
        },

        crossFade: function (ctx) {
            var $prev = ctx.$prev;
            var $next = ctx.$next;
            var duration = ctx.duration;

            $next.stop(true, true).show().css({ opacity: 0, transform: "" });
            $next.animate({ opacity: 1 }, duration);

            if ($prev && $prev.length) {
                $prev.stop(true, true).animate({ opacity: 0 }, duration, function () {
                    $(this).hide();
                });
            }

            setTimeout(ctx.done, duration);
        },

        flip: function (ctx) {
            var $container = ctx.$container;
            var $prev = ctx.$prev;
            var $next = ctx.$next;
            var duration = ctx.duration;

            $container.css("perspective", "1200px");

            $next.stop(true, true).show().css({
                opacity: 0,
                transform: "rotateY(-180deg)",
                transformOrigin: "center center",
                backfaceVisibility: "hidden"
            });

            if ($prev && $prev.length) {
                $prev.css({
                    transform: "rotateY(0deg)",
                    transformOrigin: "center center",
                    backfaceVisibility: "hidden"
                });
                $prev.animate({ opacity: 0 }, duration);
            }

            $next.animate({ opacity: 1 }, duration);

            setTimeout(function () {
                if ($prev && $prev.length) {
                    $prev.hide().css({ transform: "" });
                }
                $next.css({ transform: "" });
                ctx.done();
            }, duration);
        },

        slideOut: function (ctx) {
            var $prev = ctx.$prev;
            var $next = ctx.$next;
            var duration = ctx.duration;

            $next.stop(true, true).show().css({
                opacity: 1,
                transform: "translateX(100%)"
            });

            $next.animate({ dummy: 1 }, {
                duration: duration,
                step: function (_, fx) {
                    var progress = fx.pos;
                    var nextX = 100 - (100 * progress);
                    $next.css("transform", "translateX(" + nextX + "%)");

                    if ($prev && $prev.length) {
                        var prevX = -100 * progress;
                        $prev.css("transform", "translateX(" + prevX + "%)");
                    }
                },
                complete: function () {
                    if ($prev && $prev.length) {
                        $prev.hide().css({ transform: "", opacity: 0 });
                    }
                    $next.css({ transform: "", opacity: 1 });
                    ctx.done();
                }
            });
        }
    };

    function PlaylistManager(options) {
        this.options = $.extend(true, {}, PlaylistManager.defaults, options || {});
        this.$container = $(this.options.container);
        this.items = [];
        this.currentIndex = -1;
        this.timer = null;
        this.delayTimer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.isDestroyed = false;
        this.loopCount = 0;
        this.isWebOS = (typeof platform !== "undefined" && platform === "webos");
        this.mutationObserver = null;
        this.mutationTimer = null;

        this.applyDomConfig();

        this.resolveItems();

        if (this.options.pauseOnHidden) {
            this.bindVisibilityWatcher();
        }

        this.updateMutationWatcher();

        if (this.options.autoStart) {
            this.start();
        }
    }

    PlaylistManager.defaults = {
        container: null,
        itemSelector: "[data-playlist-item='true']",
        getItems: null,
        getOrder: function (item, index) {
            var val = parseInt($(item).attr("data-order"), 10);
            return isNaN(val) ? index : val;
        },
        getDurationMs: function (item) {
            var val = parseInt($(item).attr("data-duration"), 10);
            return isNaN(val) ? 0 : val * 1000;
        },
        fallbackDurationMs: 6000,
        totalDurationMs: 0,
        transition: "crossFade",
        transitionDurationMs: 800,
        autoStart: false,
        pauseOnHidden: true,
        resetToFirstOnResume: true,
        resumeIndex: 0,
        preloadNext: true,
        dom: {
            readOptions: true,
            sourceAttr: "data-playlist-source",
            totalDurationAttr: "data-playlist-total-ms",
            transitionAttr: "data-playlist-transition",
            transitionMsAttr: "data-playlist-transition-ms"
        },
        mutation: {
            enabled: false,
            source: null,
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["src", "data-duration", "data-order", "data-transition", "data-playlist-transition"],
            debounceMs: 120,
            resetOnChange: false
        },
        video: {
            unloadOnHide: false,
            preloadMode: "auto",
            resetOnHide: true
        },
        onBeforeAdvance: null,
        onActivate: null,
        onDeactivate: null,
        onLoop: null,
        onMutation: null
    };

    PlaylistManager.prototype.applyDomConfig = function () {
        if (!this.$container || !this.$container.length || !this.options.dom.readOptions) {
            return;
        }

        var $container = this.$container;
        var transition = $container.attr(this.options.dom.transitionAttr);
        var transitionMs = $container.attr(this.options.dom.transitionMsAttr);
        var totalDurationMs = $container.attr(this.options.dom.totalDurationAttr);
        var sourceSelector = $container.attr(this.options.dom.sourceAttr);

        if (transition) {
            this.options.transition = transition;
        }
        this.options.transitionDurationMs = parseIntOr(transitionMs, this.options.transitionDurationMs);
        this.options.totalDurationMs = parseIntOr(totalDurationMs, this.options.totalDurationMs);

        if (sourceSelector) {
            this.options.mutation.source = sourceSelector;
            this.options.mutation.enabled = true;
        }
    };

    PlaylistManager.prototype.resolveMutationSource = function () {
        var source = this.options.mutation.source;
        if (!source) {
            return this.$container && this.$container[0] ? this.$container[0] : null;
        }

        if (typeof source === "string") {
            var scoped = this.$container.find(source).first();
            if (scoped.length) {
                return scoped[0];
            }
            var globalMatch = $(source).first();
            return globalMatch.length ? globalMatch[0] : null;
        }

        if (source.jquery) {
            return source[0] || null;
        }

        return source.nodeType === 1 ? source : null;
    };

    PlaylistManager.prototype.bindVisibilityWatcher = function () {
        var _this = this;
        this.visibilityHandler = function () {
            if (document.hidden) {
                _this.pause();
                return;
            }
            if (_this.options.resetToFirstOnResume) {
                _this.resume({ reset: true, index: _this.options.resumeIndex });
            } else {
                _this.resume();
            }
        };
        document.addEventListener("visibilitychange", this.visibilityHandler);
    };

    PlaylistManager.prototype.updateMutationWatcher = function () {
        var _this = this;
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        if (!this.options.mutation.enabled || !this.$container || !this.$container.length || typeof MutationObserver === "undefined") {
            return;
        }

        var sourceNode = this.resolveMutationSource();
        if (!sourceNode) {
            return;
        }

        this.mutationObserver = new MutationObserver(function () {
            _this.scheduleMutationRefresh();
        });

        this.mutationObserver.observe(sourceNode, {
            childList: this.options.mutation.childList,
            subtree: this.options.mutation.subtree,
            attributes: this.options.mutation.attributes,
            attributeFilter: this.options.mutation.attributeFilter
        });
    };

    PlaylistManager.prototype.scheduleMutationRefresh = function () {
        var _this = this;
        if (this.mutationTimer) {
            clearTimeout(this.mutationTimer);
            this.mutationTimer = null;
        }

        this.mutationTimer = setTimeout(function () {
            _this.mutationTimer = null;
            _this.handleMutationRefresh();
        }, this.options.mutation.debounceMs || 120);
    };

    PlaylistManager.prototype.handleMutationRefresh = function () {
        if (this.isDestroyed) {
            return;
        }

        var wasRunning = this.isRunning && !this.isPaused;
        var targetIndex = this.currentIndex;

        this.applyDomConfig();
        this.resolveItems();

        if (!this.items.length) {
            this.stop({ reset: false });
            return;
        }

        if (this.options.mutation.resetOnChange) {
            if (wasRunning) {
                this.start({ reset: true });
            }
        } else if (wasRunning) {
            if (targetIndex < 0) {
                targetIndex = 0;
            }
            if (targetIndex >= this.items.length) {
                targetIndex = this.items.length - 1;
            }
            this.goTo(targetIndex, {
                immediate: true,
                scheduleNext: this.items.length > 1
            });
        }

        if (typeof this.options.onMutation === "function") {
            this.options.onMutation(this);
        }
    };

    PlaylistManager.prototype.resolveItems = function () {
        var sourceItems;
        var _this = this;

        if (typeof this.options.getItems === "function") {
            sourceItems = asArray(this.options.getItems(this.$container));
        } else {
            sourceItems = this.$container.find(this.options.itemSelector).toArray();
        }

        sourceItems.sort(function (a, b) {
            var aOrder = _this.options.getOrder(a, sourceItems.indexOf(a));
            var bOrder = _this.options.getOrder(b, sourceItems.indexOf(b));
            return aOrder - bOrder;
        });

        this.items = sourceItems;
        return this.items;
    };

    PlaylistManager.prototype.isVideoItem = function (item) {
        return $(item).is("video");
    };

    PlaylistManager.prototype.isInfiniteDurationItem = function (item) {
        var raw = $(item).attr("data-duration");
        if (raw === undefined || raw === null || raw === "") {
            return false;
        }

        var seconds = parseFloat(raw);
        return !isNaN(seconds) && seconds === 0;
    };

    PlaylistManager.prototype.applyVideoLoopState = function (item, shouldLoop) {
        if (!this.isVideoItem(item)) {
            return;
        }

        var video = item;
        video.loop = !!shouldLoop;
        if (shouldLoop) {
            video.setAttribute("loop", "loop");
        } else {
            video.removeAttribute("loop");
        }
    };

    PlaylistManager.prototype.prepareVideoForShow = function (item) {
        if (!this.isVideoItem(item)) {
            return;
        }

        var video = item;
        var $video = $(video);
        var savedSrc = $video.attr("data-playlist-src");

        if (!$video.attr("data-playlist-src")) {
            $video.attr("data-playlist-src", video.getAttribute("src") || video.currentSrc || "");
        }

        if (!video.getAttribute("src") && savedSrc) {
            video.setAttribute("src", savedSrc);
            video.load();
        }

        video.muted = true;
        video.playsInline = true;
        video.setAttribute("muted", "muted");
        video.setAttribute("playsinline", "playsinline");
        video.preload = this.options.video.preloadMode;
    };

    PlaylistManager.prototype.unloadVideoIfNeeded = function (item) {
        if (!this.isVideoItem(item)) {
            return;
        }

        var video = item;
        var $video = $(video);

        if (this.options.video.resetOnHide) {
            try {
                video.currentTime = 0;
            } catch (e) {
                // Some engines throw if metadata is missing.
            }
        }

        video.pause();

        if (!this.isWebOS || !this.options.video.unloadOnHide) {
            return;
        }

        if (!$video.attr("data-playlist-src")) {
            $video.attr("data-playlist-src", video.getAttribute("src") || video.currentSrc || "");
        }

        if (video.getAttribute("src")) {
            video.removeAttribute("src");
            video.load();
        }
    };

    PlaylistManager.prototype.preloadItem = function (item) {
        if (!item || !this.isVideoItem(item)) {
            return;
        }

        this.prepareVideoForShow(item);

        var video = item;
        var playPromise;
        try {
            video.load();
            playPromise = video.play();
            if (playPromise && typeof playPromise.then === "function") {
                playPromise.then(function () {
                    video.pause();
                    try {
                        video.currentTime = 0;
                    } catch (e) {
                        // Ignore metadata races.
                    }
                }).catch(function () {
                    // Ignore autoplay restrictions during preload.
                });
            }
        } catch (e) {
            // Ignore preload failures.
        }
    };

    PlaylistManager.prototype.setItemState = function (item, isActive) {
        var $item = $(item);
        $item.attr("data-playing", isActive ? "true" : "false");
        if (isActive) {
            $item.addClass("is-active");
        } else {
            $item.removeClass("is-active");
        }
    };

    PlaylistManager.prototype.getDurationMsForItem = function (item) {
        if (this.isInfiniteDurationItem(item)) {
            return 0;
        }

        var duration = this.options.getDurationMs(item);
        if ((!duration || duration <= 0) && this.options.totalDurationMs > 0 && this.items.length > 0) {
            duration = Math.floor(this.options.totalDurationMs / this.items.length);
        }
        if (!duration || duration <= 0) {
            duration = this.options.fallbackDurationMs;
        }
        return duration;
    };

    PlaylistManager.prototype.clearTimers = function () {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
    };

    PlaylistManager.prototype.showOnly = function (index) {
        var _this = this;
        this.items.forEach(function (item, idx) {
            var isActive = idx === index;
            _this.setItemState(item, isActive);
            $(item).stop(true, true).css({ transform: "" });
            if (isActive) {
                $(item).show().css("opacity", 1);
                _this.prepareVideoForShow(item);
                if (_this.isVideoItem(item)) {
                    _this.applyVideoLoopState(item, _this.isInfiniteDurationItem(item) || _this.items.length === 1);
                    var playPromise = item.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            // Ignore autoplay blocks.
                        });
                    }
                }
                if (typeof _this.options.onActivate === "function") {
                    _this.options.onActivate(item, idx, _this);
                }
            } else {
                _this.applyVideoLoopState(item, false);
                _this.unloadVideoIfNeeded(item);
                $(item).hide().css("opacity", 0);
                if (typeof _this.options.onDeactivate === "function") {
                    _this.options.onDeactivate(item, idx, _this);
                }
            }
        });
    };

    PlaylistManager.prototype.goTo = function (index, options) {
        var _this = this;
        var opts = $.extend({
            immediate: false,
            scheduleNext: true
        }, options || {});

        if (!this.items.length) {
            return;
        }

        var length = this.items.length;
        var nextIndex = ((index % length) + length) % length;
        var prevIndex = this.currentIndex;
        var prevItem = prevIndex > -1 ? this.items[prevIndex] : null;
        var nextItem = this.items[nextIndex];

        this.clearTimers();

        if (opts.immediate || !prevItem || prevItem === nextItem) {
            this.currentIndex = nextIndex;
            this.showOnly(nextIndex);
            if (opts.scheduleNext) {
                this.scheduleNext();
            }
            return;
        }

        this.setItemState(prevItem, false);
        this.setItemState(nextItem, true);

        this.prepareVideoForShow(nextItem);

        var itemTransition = $(nextItem).attr("data-transition") || $(nextItem).attr("data-playlist-transition");
        var transitionName = normalizeTransitionName(itemTransition || this.options.transition);
        var transitionFn = PlaylistTransitions[transitionName] || PlaylistTransitions.crossFade;
        var itemTransitionMs = parseIntOr($(nextItem).attr("data-transition-ms"), this.options.transitionDurationMs);

        transitionFn({
            $container: this.$container,
            $prev: $(prevItem),
            $next: $(nextItem),
            duration: itemTransitionMs,
            done: function () {
                _this.applyVideoLoopState(prevItem, false);
                _this.unloadVideoIfNeeded(prevItem);

                if (_this.isVideoItem(nextItem)) {
                    _this.applyVideoLoopState(nextItem, _this.isInfiniteDurationItem(nextItem) || _this.items.length === 1);
                    var playPromise = nextItem.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            // Ignore autoplay blocks.
                        });
                    }
                }

                if (typeof _this.options.onDeactivate === "function") {
                    _this.options.onDeactivate(prevItem, prevIndex, _this);
                }
                if (typeof _this.options.onActivate === "function") {
                    _this.options.onActivate(nextItem, nextIndex, _this);
                }

                _this.currentIndex = nextIndex;

                if (opts.scheduleNext) {
                    _this.scheduleNext();
                }
            }
        });
    };

    PlaylistManager.prototype.scheduleNext = function () {
        var _this = this;

        if (!this.isRunning || this.isPaused || this.currentIndex < 0 || !this.items.length) {
            return;
        }

        if (this.items.length === 1) {
            return;
        }

        var currentItem = this.items[this.currentIndex];
        if (this.isInfiniteDurationItem(currentItem)) {
            return;
        }

        var waitMs = this.getDurationMsForItem(currentItem);

        this.timer = setTimeout(function () {
            _this.next();
        }, waitMs);

        if (this.options.preloadNext && this.items.length > 1) {
            var nextIndex = (this.currentIndex + 1) % this.items.length;
            this.preloadItem(this.items[nextIndex]);
        }
    };

    PlaylistManager.prototype.next = function () {
        if (!this.items.length) {
            return;
        }

        if (typeof this.options.onBeforeAdvance === "function") {
            var allowAdvance = this.options.onBeforeAdvance(this);
            if (allowAdvance === false) {
                return;
            }
        }

        var nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.items.length) {
            nextIndex = 0;
            this.loopCount += 1;
            if (typeof this.options.onLoop === "function") {
                this.options.onLoop(this);
            }
        }

        this.goTo(nextIndex, {
            immediate: false,
            scheduleNext: true
        });
    };

    PlaylistManager.prototype.start = function (options) {
        var opts = $.extend({
            reset: true,
            delayMs: 0,
            startIndex: null
        }, options || {});

        if (this.isDestroyed) {
            return;
        }

        this.applyDomConfig();
        this.resolveItems();
        this.clearTimers();
        this.updateMutationWatcher();

        this.isRunning = true;
        this.isPaused = false;

        if (!this.items.length) {
            this.currentIndex = -1;
            return;
        }

        var _this = this;
        var startIndex = opts.reset ? 0 : (this.currentIndex >= 0 ? this.currentIndex : 0);
        if (typeof opts.startIndex === "number") {
            startIndex = Math.max(0, Math.floor(opts.startIndex));
        }

        var startWork = function () {
            _this.goTo(startIndex, {
                immediate: true,
                scheduleNext: _this.items.length > 0
            });
        };

        if (opts.delayMs > 0) {
            this.delayTimer = setTimeout(startWork, opts.delayMs);
        } else {
            startWork();
        }
    };

    PlaylistManager.prototype.pause = function () {
        this.isPaused = true;
        this.clearTimers();
    };

    PlaylistManager.prototype.resume = function (options) {
        var opts = $.extend({
            reset: false,
            index: null
        }, options || {});

        if (this.isDestroyed || !this.isRunning) {
            return;
        }

        this.isPaused = false;
        if (!this.items.length) {
            return;
        }

        if (opts.reset) {
            this.start({
                reset: true,
                startIndex: (typeof opts.index === "number" ? opts.index : this.options.resumeIndex)
            });
            return;
        }

        if (this.currentIndex < 0) {
            this.start({ reset: true });
            return;
        }

        var currentItem = this.items[this.currentIndex];
        if (this.isVideoItem(currentItem)) {
            this.prepareVideoForShow(currentItem);
            var playPromise = currentItem.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    // Ignore autoplay blocks.
                });
            }
        }

        this.scheduleNext();
    };

    PlaylistManager.prototype.stop = function (options) {
        var opts = $.extend({
            reset: true
        }, options || {});

        this.isRunning = false;
        this.isPaused = false;
        this.clearTimers();

        if (!this.items.length) {
            this.currentIndex = -1;
            return;
        }

        if (opts.reset) {
            this.currentIndex = 0;
            this.showOnly(0);
        } else {
            for (var i = 0; i < this.items.length; i++) {
                this.setItemState(this.items[i], false);
                this.unloadVideoIfNeeded(this.items[i]);
                $(this.items[i]).hide().css("opacity", 0);
            }
            this.currentIndex = -1;
        }
    };

    PlaylistManager.prototype.refresh = function () {
        var hadCurrent = this.currentIndex;
        this.applyDomConfig();
        this.resolveItems();
        this.updateMutationWatcher();
        if (!this.items.length) {
            this.currentIndex = -1;
            this.clearTimers();
            return;
        }

        if (hadCurrent >= this.items.length) {
            this.currentIndex = 0;
        }
    };

    PlaylistManager.prototype.destroy = function () {
        this.stop({ reset: false });
        this.isDestroyed = true;

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        if (this.mutationTimer) {
            clearTimeout(this.mutationTimer);
            this.mutationTimer = null;
        }

        if (this.visibilityHandler) {
            document.removeEventListener("visibilitychange", this.visibilityHandler);
            this.visibilityHandler = null;
        }
    };

    function createPlaylistPlayer(options) {
        var merged = $.extend(true, {}, options || {});
        var isWebOSRuntime = (typeof platform !== "undefined" && platform === "webos");

        // Platform policy stays in code, not element attributes.
        if (!merged.video) {
            merged.video = {};
        }
        if (typeof merged.video.unloadOnHide !== "boolean") {
            merged.video.unloadOnHide = isWebOSRuntime;
        }

        return new PlaylistManager(merged);
    }

    window.PlaylistManagerTransitions = PlaylistTransitions;
    window.PlaylistManager = PlaylistManager;

    // Preferred global surface:
    // Playlist.Manager -> shared logic/settings
    // Playlist.createPlayer() -> runtime player instance
    window.Playlist = window.Playlist || {};
    window.Playlist.Manager = {
        defaults: buildPublicDefaults(PlaylistManager.defaults),
        transitions: PlaylistTransitions,
        normalizeTransitionName: normalizeTransitionName
    };
    window.Playlist.Player = PlaylistManager;
    window.Playlist.createPlayer = createPlaylistPlayer;
})(window);
