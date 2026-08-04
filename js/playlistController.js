"use strict";

(function (window, $) {
    if (!window || !$) {
        return;
    }

    var PLAYER_DATA_KEY = "playlistManager";

    function asJQuery(target) {
        if (!target) {
            return $();
        }
        if (target.jquery) {
            return target;
        }
        return $(target);
    }

    function getItems($container) {
        var $items = $container.children("[data-playlist-item='true'], [data-media-item='true']");
        if ($items.length) {
            return $items;
        }
        return $container.children("img, video");
    }

    function toMs(value, fallback) {
        var parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 0) {
            return fallback;
        }
        return parsed;
    }

    function readDurationMs($item, fallbackMs) {
        var seconds = parseInt($item.attr("data-duration"), 10);
        if (!isNaN(seconds) && seconds > 0) {
            return seconds * 1000;
        }
        return fallbackMs;
    }

    function updateContainerState($container, isPlaying) {
        $container.attr("data-playlist-playing", isPlaying ? "true" : "false");
    }

    function getDurationForContainer($container, options) {
        var perItemMs = toMs(options.duration, 6000);
        var totalMs = 0;

        getItems($container).each(function () {
            totalMs += readDurationMs($(this), perItemMs);
        });

        return {
            perItemMs: perItemMs,
            totalMs: totalMs
        };
    }

    function buildPlayerOptions($container, options) {
        var opts = options || {};
        var runtimeTransition = opts.transition || $container.attr("data-playlist-transition") || "crossFade";
        var runtimeTransitionMs = toMs(opts.transitionDurationMs || opts.transitionMs || $container.attr("data-playlist-transition-ms"), 360);
        var durationInfo = getDurationForContainer($container, opts);
        var isWebOS = (typeof platform !== "undefined" && platform === "webos");

        return {
            container: $container,
            transition: runtimeTransition,
            transitionDurationMs: runtimeTransitionMs,
            fallbackDurationMs: durationInfo.perItemMs,
            getDurationMs: function (item) {
                return readDurationMs($(item), durationInfo.perItemMs);
            },
            video: {
                // WebOS policy: remove src while hidden; src is restored before playback by core manager.
                unloadOnHide: typeof opts.unloadVideoOnHide === "boolean" ? opts.unloadVideoOnHide : isWebOS,
                preloadMode: opts.preloadMode || "auto",
                resetOnHide: opts.resetVideoOnHide !== false
            },
            onActivate: function (item) {
                $(item).attr("data-playing", "true");
                updateContainerState($container, true);
            },
            onDeactivate: function (item) {
                $(item).attr("data-playing", "false");
            }
        };
    }

    function getOrCreatePlayer($container, options, createIfMissing) {
        var existing = $container.data(PLAYER_DATA_KEY);
        if (existing || !createIfMissing) {
            return existing || null;
        }

        if (!window.Playlist || typeof window.Playlist.createPlayer !== "function") {
            return null;
        }

        var player = window.Playlist.createPlayer(buildPlayerOptions($container, options));
        $container.data(PLAYER_DATA_KEY, player);
        return player;
    }

    function buildState($container, player, options) {
        var items = getItems($container);
        var durationInfo = getDurationForContainer($container, options || {});
        var shouldLoop = items.length > 1;

        return {
            totalDuration: durationInfo.totalMs,
            playing: shouldLoop,
            count: items.length,
            container: $container,
            player: player
        };
    }

    function callStateCallback(options, state) {
        if (!options || typeof options.onStart !== "function") {
            return;
        }
        options.onStart(state);
    }

    function startOne($container, options) {
        var opts = options || {};
        var player = getOrCreatePlayer($container, opts, true);
        if (!player) {
            return null;
        }

        var state = buildState($container, player, opts);
        $container.attr("data-playlist-total-ms", state.totalDuration);

        player.refresh();

        if (state.count <= 1) {
            player.stop({ reset: true });
            updateContainerState($container, false);
            callStateCallback(opts, state);
            return state;
        }

        var startDelayMs = toMs(opts.preloadDelayMs || opts.delayMs, 500);
        player.start({
            reset: opts.reset !== false,
            delayMs: startDelayMs,
            startIndex: typeof opts.startIndex === "number" ? opts.startIndex : null
        });

        updateContainerState($container, true);
        callStateCallback(opts, state);
        return state;
    }

    function startPlaylist(target, options) {
        var $targets = asJQuery(target);
        var states = [];

        $targets.each(function () {
            var state = startOne($(this), options || {});
            if (state) {
                states.push(state);
            }
        });

        return states.length <= 1 ? (states[0] || null) : states;
    }

    function pausePlaylist(target) {
        var $targets = asJQuery(target);
        $targets.each(function () {
            var $container = $(this);
            var player = $container.data(PLAYER_DATA_KEY);
            if (!player || typeof player.pause !== "function") {
                return;
            }
            player.pause();
            updateContainerState($container, false);
        });
        return $targets;
    }

    function resetPlaylist(target, options) {
        var opts = options || {};
        var $targets = asJQuery(target);

        $targets.each(function () {
            var $container = $(this);
            var player = getOrCreatePlayer($container, opts, true);
            if (!player) {
                return;
            }

            var state = buildState($container, player, opts);
            $container.attr("data-playlist-total-ms", state.totalDuration);

            if (state.count <= 1) {
                player.stop({ reset: true });
                updateContainerState($container, false);
                return;
            }

            player.start({
                reset: true,
                delayMs: toMs(opts.preloadDelayMs || opts.delayMs, 500),
                startIndex: typeof opts.startIndex === "number" ? opts.startIndex : 0
            });
            updateContainerState($container, true);
        });

        return $targets;
    }

    function endPlaylist(target, options) {
        var opts = options || {};
        var keepFirstVisible = opts.keepFirstVisible === true;
        var $targets = asJQuery(target);

        $targets.each(function () {
            var $container = $(this);
            var player = $container.data(PLAYER_DATA_KEY);
            if (!player || typeof player.stop !== "function") {
                getItems($container).each(function () {
                    $(this).attr("data-playing", "false").removeClass("is-active").hide().css("opacity", 0);
                });
                updateContainerState($container, false);
                return;
            }

            if (keepFirstVisible) {
                player.stop({ reset: true });
                updateContainerState($container, false);
                return;
            }

            player.stop({ reset: false });
            updateContainerState($container, false);
        });

        return $targets;
    }

    function getPlaylistManager(target, options) {
        var $target = asJQuery(target).first();
        if (!$target.length) {
            return null;
        }

        var createIfMissing = !!(options && options.createIfMissing);
        return getOrCreatePlayer($target, options || {}, createIfMissing);
    }

    // Global hooks
    window.startPlaylist = startPlaylist;
    window.pausePlaylist = pausePlaylist;
    window.resetPlaylist = resetPlaylist;
    window.endPlaylist = endPlaylist;
    window.getPlaylistManager = getPlaylistManager;

    // jQuery hooks
    $.fn.startPlaylist = function (options) {
        startPlaylist(this, options || {});
        return this;
    };

    $.fn.pausePlaylist = function () {
        pausePlaylist(this);
        return this;
    };

    $.fn.resetPlaylist = function (options) {
        resetPlaylist(this, options || {});
        return this;
    };

    $.fn.endPlaylist = function (options) {
        endPlaylist(this, options || {});
        return this;
    };
})(window, window.jQuery);