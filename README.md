# modgraph

Interactive mod map for the **bertie** modpack (NeoForge 1.21.1).

Every mod is sorted into one of four buckets — **content** (on the progression
spine, staged S1–S3 with addon families folded), **fluff** (adds tangible
objects but off the spine), **configurations** (changes behaviour/visuals only),
and **deconstruct** (asset donors, not shipped) — then filtered, searched and
sliced in the browser.

**Live:** https://bertie-mc.github.io/bertie-mod-atlas/

## Layout

```
src/            modular source — a normal static site
  index.html      markup + copy
  styles.css      design tokens and components
  app.js          load → filter → render (one ES module, no dependencies)
  data.json       the mod dataset (source of truth for the site)
build.py        inlines src/ → a single self-contained index.html
index.html      built output (served by GitHub Pages) — do not edit by hand
bertie-mod-stages.md   the written source-of-record
```

## Develop

Serve `src/` and edit the files directly — `app.js` fetches `data.json`:

```
python -m http.server -d src 8000    # http://localhost:8000
```

## Build & deploy

```
python build.py        # regenerates the root index.html
```

`build.py` inlines the stylesheet, script and dataset into one file (the same one
that also works over `file://`), then commit and push — Pages redeploys in ~1 min.

## Update the data

`data.json` is the site's source of truth. Edit it (or regenerate it from the
pack's classification pipeline), run `python build.py`, and push. Each entry:

```json
{ "slug": "...", "adds": "one-line description", "bucket": "content|fluff|configurations|deconstruct",
  "stage": "S1|S2|S3|", "axis": "combat|tech|ui_info|…", "family": "Mekanism|…|",
  "note": "", "flag": "", "conf": "high|med|low",
  "url": "https://modrinth.com/mod/… (or /datapack/, curseforge.com, github.com)" }
```
