# AIRA — The saree salon

V9 revises the showroom around the supplied reference film's visual sequence: a stocked boutique, individual sarees, a forward camera move, and a close study of the fabric before the six moods. The reference is used for composition and pacing; it is not included in the repository or played on the site.

## Interior and sarees

The walnut, garnet stone, brass, crystal and ivory marble interior now holds ten illuminated libraries of folded sarees. Each library has six shelves and four stacks of three sarees per shelf, for 720 folded pieces. Their colours, folded edges and gold selvedges are modelled separately.

Seven individual drapes replace the earlier broad hanging panels. Each drape has a rounded lower wrap, front pleats, an upper wrap, a diagonal pallu, a pooled end, a zari border and tassels. Slender brass rails support the cloth; there are no people, mannequins, body meshes or photographic cutouts. Three independent drapes form the bridal edit at the end of the aisle.

The paisley and floral repeat is authored as an SVG and PNG material mask in `public/textures/showroom/`. It is packed into the editable scene. This is the scene's only image texture; all other materials are procedural. It contains no photographic portrait or campaign texture. The existing campaign and product photographs are used in the editorial and catalogue sections.

## Camera and delivery

The camera moves from the showroom entrance, between consultation tables and folded libraries, into the bridal edit, ending close to the crimson pallu's gold motif. Desktop delivery is `public/video/aira-store-v9.mp4` at 1440 × 810. Phone delivery is `public/video/aira-store-mobile-v9.mp4` at 540 × 960 with a separate portrait camera projection.

Each seven-second film has 84 native views at 12fps, repeated twice in a 24fps delivery container. Scroll seeks the rendered camera path forwards and backwards. This is a rendered walkthrough rather than a freely navigable realtime scene. Frequent keyframes and fast-start encoding support paused seeking. Versioned media URLs prevent earlier cached showroom assets from appearing.

The corresponding desktop and phone posters provide still fallbacks. Reduced motion uses the still without downloading a film. The loading screen measures downloaded bytes and decoded readiness. The player uses a single seek scheduler that follows the latest scroll position.

## Editable source

The packed scene is `artwork/aira-store-v9.blend`. Reproduction scripts are in `tools/showroom/`. They require Python with `bpy` 4.5 and Pillow, Node.js with the project's installed dependencies, and `ffmpeg`/`ffprobe` on PATH. Render with a Blender-capable graphics driver.

From the repository root:

```sh
npm ci
node tools/showroom/generate_zari.cjs
python tools/showroom/build_store_v9.py
python tools/showroom/render_store_v9.py --samples 20
python tools/showroom/render_store_v9.py --mobile --samples 16
python tools/showroom/encode_store_v9.py
python tools/showroom/verify_store_v9.py
```

Render desktop and phone sequentially to limit graphics memory pressure. `--proof` renders three checkpoints; complete renders resume from valid frames already present. Set `AIRA_BLENDER_PYTHONPATH` if the `bpy` package is installed outside the selected Python environment.

Working frames, logs and verification reports go to `.preview/store-v9/`, which is excluded from Git. The verifier decodes both delivery files, checks keyframe intervals and MP4 fast-start layout, and verifies that the packed texture matches the authored zari mask. Final browser checks cover desktop and phone entry, forward/reverse seeking, collection navigation and horizontal overflow.

The final scene, delivery and verification reports are also saved in `artwork/reports/` for review alongside the source.

V8 documentation and source remain as historical records. The homepage imports V9 assets.
