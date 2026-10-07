# AIRA — The private salon

The V8 showroom is a fresh Blender scene. It replaces the previous architecture, furniture, lights, textiles and camera composition. No earlier scene objects, image planes, people, mannequin geometry, portrait textures or model shadows are imported. All showroom surfaces use authored procedural materials; there are no photographic assets in the scene.

The interior has a 5.8m coffered walnut ceiling, onyx inserts, three concentric brass and crystal chandeliers, garnet pilasters, ten illuminated arched silk alcoves, bookmatched ivory marble with brass inlays, oval consultation tables, velvet seating and a monumental bridal arch. Sarees have woven surface detail, folded geometry, gold selvedges and physical cloth thickness. The suspended bridal textile sits in front of the walnut reeds without intersecting them.

The packed scene is `artwork/aira-store-v8.blend`. Historical authoring and render scripts are `tools/showroom/build_store_v8.py`, `tools/showroom/render_store_v8.py` and `tools/showroom/encode_store_v8.py`. The scene report records the object/material counts, camera keys and absence of photographic images. The current homepage uses the V9 saree salon described in `SHOWROOM-V9.md`.

Desktop delivery is `public/video/aira-store-v8.mp4` at 1440 × 810. Phone delivery is `public/video/aira-store-mobile-v8.mp4` at 540 × 960, rendered with its own portrait camera projection. It is not a narrow crop of the desktop film. Each seven-second film contains 84 native views at 12fps, repeated twice in a 24fps delivery container. The browser seeks the rendered camera path forwards and backwards as the visitor scrolls; movement has discrete native view increments. This is a rendered walkthrough, not freely navigable realtime 3D.

`public/images/store-poster-v8.jpg` and `public/images/store-poster-mobile-v8.jpg` provide the corresponding still fallbacks. The active homepage has no curtain canvas or photographic curtain overlay, and applies no colour filter to the rendered interior. Reduced motion skips film download and uses the still. Film URLs are versioned to avoid stale cached figures. The loading screen continues to use the separate cloth illustration.

Historical showroom films, posters and human cutouts are archived under `artwork/history/display-assets/`, outside the public delivery directory. Original campaign and catalogue photographs remain in their established editorial/product sections, outside the showroom.

Render and delivery verification reports are saved in `.preview/store-v8/`. Final browser checks cover desktop and phone entry, forward/reverse camera seeking, collection navigation and the absence of horizontal overflow.
