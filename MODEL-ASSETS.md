Historical reference only: V8 replaces every previous showroom scene and contains no people, mannequins, portrait textures or photographic image planes. Old delivery files and cutouts are archived outside public delivery under `artwork/history/display-assets/`. See `SHOWROOM-V8.md`.

Historical integration: V7 superseded the historical revisions below. See `SHOWROOM-INTEGRATION-V7.md` for current assets, exact built-in prompts, fixed surface orientation, diffuse lighting, alpha handling, floor contact and limitations.

# AIRA photographic model assets

Historical V6 showroom replaced all three historical campaign-derived figures below with two brand-new generated portraits. Their exact prompts and source paths are in `SHOWROOM-PORTRAITS-V6.md`. The historical sources are retained for recovery and are absent from the current packed scene.

The three fashion models are photographic alpha cutouts, placed within the authored Blender showroom. They are camera-facing image geometry, not rigged 3D human scans. The camera, cabinetry, textiles, physical glass, lighting and architecture are authored 3D. The resulting film is rendered offline for browser performance.

Created with the built-in image-generation tool, using the supplied campaign images as edit targets. The generated alpha channel is preserved. UV geometry uses the alpha bounds without changing the bitmap.

## heritage

Saved asset: [Heritage model](<C:/Users/Trade/OneDrive/Desktop/VS Tech/Saree Website/public/images/models/heritage-cutout.png>)

Use case: background-extraction. Asset type: photographic human cutout for a physically rendered saree showroom. Edit the supplied campaign photograph: extract ONLY the same adult Indian woman, her full saree, jewelry and hair onto a genuinely transparent background. Preserve her identity, facial detail, natural anatomy, pose, burgundy saree, intricate fabric weave and exact garment draping. Complete the tiny missing bottom edge of the hem if needed so her entire head-to-floor figure is visible. Center the isolated full-length person with a small transparent margin. Use the original photographic lighting and real skin texture, no stylization or 3D plastic look. No architecture, no floor, no backdrop, no rectangular photo remnants, no baked shadow, no text or watermark. True alpha transparency including around fingers and hair. High-resolution fashion photography, crisp detailed edges.

## bridal

Saved asset: [Bridal model](<C:/Users/Trade/OneDrive/Desktop/VS Tech/Saree Website/public/images/models/bridal-cutout.png>)

Use case: background-extraction. Asset type: photographic human cutout for a physically rendered saree showroom. Edit the supplied campaign photograph: extract ONLY the same adult Indian woman, her full saree, jewelry and hair onto a genuinely transparent background. Preserve her identity, facial detail, natural anatomy, pose, red saree, intricate fabric weave and exact garment draping. Complete the tiny missing bottom edge of the hem if needed so her entire head-to-floor figure is visible. Center the isolated full-length person with a small transparent margin. Use the original photographic lighting and real skin texture, no stylization or 3D plastic look. No architecture, no floor, no backdrop, no rectangular photo remnants, no baked shadow, no text or watermark. True alpha transparency including around fingers and hair. High-resolution fashion photography, crisp detailed edges.

## contemporary

Saved asset: [Contemporary model](<C:/Users/Trade/OneDrive/Desktop/VS Tech/Saree Website/public/images/models/contemporary-cutout.png>)

Use case: background-extraction. Asset type: photographic human cutout for a physically rendered saree showroom. Edit the supplied campaign photograph: extract ONLY the same adult Indian woman, her full saree, jewelry and hair onto a genuinely transparent background. Preserve her identity, facial detail, natural anatomy, pose, charcoal saree, intricate fabric weave and exact garment draping. Complete the tiny missing bottom edge of the hem if needed so her entire head-to-floor figure is visible. Center the isolated full-length person with a small transparent margin. Use the original photographic lighting and real skin texture, no stylization or 3D plastic look. No architecture, no floor, no backdrop, no rectangular photo remnants, no baked shadow, no text or watermark. True alpha transparency including around fingers and hair. High-resolution fashion photography, crisp detailed edges.

## Material sources

Scanned marble and fine wood textures are public-domain assets from [Poly Haven Marble 01](https://polyhaven.com/a/marble_01) and [Fine Grained Wood](https://polyhaven.com/a/fine_grained_wood), under [CC0](https://polyhaven.com/license). Powered by Poly Haven. Textures are baked into the film and are not loaded by the website.

The earlier primitive mannequins have been removed from the v2 scene.
## Independent editorial showroom revision (v4)

The v4 packed scene is `artwork/aira-store-v4.blend`. It preserves the enlarged room, photographed figures and glass/saree displays while replacing the reference-like nested square ceiling lights and ruby slabs with five custom suspended oval LED pendants in champagne bronze. Ivory plaster, wine columns (#532735) and warmer scanned timber distinguish the interior from the supplied recording.

Delivered media: `public/video/aira-store-v4.mp4` (1440Ã—810,24fps), `public/video/aira-store-mobile-v4.mp4` (540Ã—960,24fps), `public/images/store-poster-v4.jpg` (1440Ã—810). 56 native camera frames are rendered at20samples and interpolated for smooth seeking. The mobile film uses a progressive portrait crop; both films use frequent keyframes.

The new editorial fabric study uses the built-in image-generation tool. Its original PNG, optimized WebP and exact prompt are recorded in `EDITORIAL-ASSETS.md`.

## Grand salon revision (v5)

The latest packed scene is `artwork/aira-store-v5.blend`, with an 11.6 × 24m footprint and 4.8m ceiling. New pale stone architecture, bronze-framed ceiling coves, subtle marble veining, glass textile vitrines and a fluted walnut bridal salon create a longer, brighter interior. Pearl upholstered seats, marble consultation pieces and lowered 2.34m garment rails establish human scale.

The v4 audit measured visible alpha silhouettes of 1.74m, 1.74m and 1.77m. The original mesh UVs already trim transparent image margins; multiplying the height by the alpha fraction again incorrectly understates the figure height. V5 uniformly scales each visible silhouette to 1.78m (factors approximately 1.023, 1.023 and 1.006), preserves natural width-to-height proportions, uses 22mm display platforms and brings the front figures toward the aisle. The camera eye height is approximately 1.62–1.59m.

The source photographs are unchanged. The homepage's collection/product frames are taller and use collection-specific uniform zoom anchored near the hem, with larger responsive image sources to preserve clarity. These are presentation changes, not regenerated people.

Delivered v5 paths: `public/video/aira-store-v5-clean.mp4`, `public/video/aira-store-mobile-v5-clean.mp4`, `public/images/store-poster-v5.jpg`. Native renders use 56 frames at 1440×810 with 20 EEVEE samples. The delivered clean films repeat each native frame three times in a 24fps container (168 frames, seven seconds); they contain 8 actual camera views per second. Tested motion-synthesis modes distorted faces and fine architecture, so the native-frame delivery preserves photographic pauses with visible movement increments. The portrait crop follows the entrance figure and bridal destination. Frequent keyframes support forward and reverse scroll seeking.

## Current replacement portraits (v6)

`public/images/models/v6/wine-silk.png` and `public/images/models/v6/ivory-gold.png` are1024×1536RGBA original built-in generations with true alpha. The scene uses their alpha bounds as UV coordinates while preserving intrinsic shape; no vertical stretching, raster compositing or reused identity is applied. Both visible silhouettes measure1.82m. Entrance position is(1.60,1.80,.023)m; bridal is(1.58,19.15,.023)m. Every old campaign plane, base, shadow and photographic material is removed. The room, lighting and eye-level camera retain approvedV5 architecture.

Current delivered paths: `artwork/aira-store-v6.blend`, `public/video/aira-store-v6.mp4`, `public/video/aira-store-mobile-v6.mp4`, `public/images/store-poster-v6.jpg`. Native-frame delivery preserves crisp faces at rest.
