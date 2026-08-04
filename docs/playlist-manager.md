# Playlist Manager And Player

This project now uses a shared playlist engine from dependencies/playlistEngine.js. The app-facing wrapper that consumes it lives in js/playlistController.js.

## Mental Model

- Playlist Manager: rules and decision logic.
- Player: runtime instance that applies those rules to DOM elements.

In code:

- Playlist.Manager is the logic surface (defaults, transitions, helpers).
- Playlist.createPlayer(...) creates the action surface (a player instance).
- Playlist.Player is the player constructor if you need direct construction.

## Global API

From any loaded script file:

```javascript
// Logic surfaces
window.Playlist.Manager.defaults
window.Playlist.Manager.transitions
window.Playlist.Manager.normalizeTransitionName("fade"); // -> crossFade

// Player creation (recommended)
var player = window.Playlist.createPlayer({ ...options });

// Direct constructor (equivalent)
var player2 = new window.Playlist.Player({ ...options });
```

Legacy globals are still available:

```javascript
window.PlaylistManager
window.PlaylistManagerTransitions
```

Note: `window.Playlist.Manager.defaults` is a curated public view of recommended settings.

## Expected DOM Pattern

A function can build its own DOM structure, then hand control to the player.

Required expectations:

- One parent container element.
- Children inside that container are playlist items.
- Each item can define optional attributes:
  - data-order for explicit order.
  - data-duration for per-item duration in seconds.
    - data-transition or data-playlist-transition for per-item transition override.
    - data-transition-ms for per-item transition duration override.

Container-level optional attributes:

- data-playlist-transition
- data-playlist-transition-ms
- data-playlist-total-ms (optional total duration budget for the whole list)
- data-playlist-source (optional selector for source material to observe for changes)

All other behavior policies are code-side options in Playlist.createPlayer({ ... }), not element attributes.

Example item markup:

```html
<div class="cms-media" data-media-injected="true">
  <img data-playlist-item="true" data-order="0" data-duration="6" src="a.jpg" />
  <video data-playlist-item="true" data-order="1" data-duration="8" src="b.mp4" muted playsinline></video>
</div>
```

## Create + Invoke From Any File

```javascript
function mountExamplePlaylist($container, media) {
    $container.empty();

    media.forEach(function (item, index) {
        var $el = item.type === "video" ? $("<video>") : $("<img>");
        $el.attr({
            src: item.src,
            "data-playlist-item": "true",
            "data-order": item.order != null ? item.order : index,
            "data-duration": item.durationSec || 6
        });

        if (item.type === "video") {
            $el.attr("muted", "muted");
            $el.attr("playsinline", "playsinline");
        }

        $container.append($el);
    });

    $container.attr("data-playlist-transition", "crossFade");
    $container.attr("data-playlist-transition-ms", "500");
    $container.attr("data-playlist-source", ".source-material");

    var player = window.Playlist.createPlayer({
        container: $container,
        mutation: {
            enabled: true,
            resetOnChange: true
        }
    });

    player.start({ reset: true });
    return player;
}
```

## Player Lifecycle Methods

Use these instance methods on the player:

- start({ reset, delayMs })
- next()
- goTo(index, { immediate, scheduleNext })
- pause()
- resume({ reset })
- stop({ reset })
- refresh()
- destroy()

Typical lifecycle in a page module:

```javascript
var pagePlayer = null;

function onPageEnter($container, data) {
    if (pagePlayer) {
        pagePlayer.destroy();
    }
    pagePlayer = mountExamplePlaylist($container, data);
}

function onPageLeave() {
    if (!pagePlayer) {
        return;
    }
    pagePlayer.stop({ reset: false });
}
```

## Transition Rules

The player chooses transition in this order:

1. next item data-transition or data-playlist-transition.
2. container data-playlist-transition.
3. manager default (crossFade).

Built-ins:

- crossFade
- flip
- slideOut
- none

Synonyms resolved by normalizeTransitionName:

- fade -> crossFade
- slide -> slideOut

If an unknown transition is requested, it falls back to crossFade.

## WebOS Video Behavior

For webos, unload behavior is inferred by platform in Playlist.createPlayer().

Behavior:

- hidden/deactivated videos are paused.
- currentTime resets if resetOnHide is true.
- on webos, src is removed on hide and restored on next show.
- preloadNext can warm up the next video item.

## How Existing Files Use It

- js/imageStoreManager.js: creates one player per injected media container and delegates start/advance/activate to that player.
- dependencies/wandLib.js Rotate.animate: uses one player per rotate zone wrapper.
- dependencies/wandLib.js MenuRotator.rotateMenus: uses one player for station wrappers.

## Recommended Team Pattern

1. A feature function builds DOM items in its container.
2. It tags each child and container with playlist attributes.
3. It creates one player instance for that container and passes only non-content policy options.
4. Navigation/page lifecycle controls start/pause/resume/stop/destroy.
5. No new hand-written setTimeout rotation loops unless absolutely required.
