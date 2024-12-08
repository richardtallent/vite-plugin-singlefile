# Change Log

| Date       | Version       | Notes                                                                                          |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------- |
| 2021-01-09 | 0.1.0         | First post!                                                                                    |
| 2021-01-14 | 0.2.0         | Fix for newest Vite beta, including CSS support                                                |
| 2021-01-14 | 0.3.0         | Borked npm update                                                                              |
| 2021-01-14 | 0.4.0         | Work around regex accidental replacement variables issue.                                      |
| 2021-01-21 | 0.5.0         | Add TypeScript declaration file (originally 0.1.1 with the wrong base, forgot to push 0.2-0.4) |
| 2021-03-21 | 0.6.1         | Minor tweak to allow node 12.x support                                                         |
| 2021-12-12 | 0.6.2         | Update deps. Fix relative asset paths (thanks @prog-rajkamal!). Improved docs.                 |
| 2021-12-31 | 0.6.3         | Update deps. Fix parent relative asset paths (#17).                                            |
| 2022-03-01 | 0.7.0         | Update deps. Warn for assets not inlined rather than adding comments (#21, thanks @taybart!)   |
| 2022-03-02 | 0.7.1         | Downgrade chalk, fixes #22                                                                     |
| 2022-04-03 | 0.7.2         | Update deps. Remove unneeded code (#24).                                                       |
| 2022-04-19 | 0.8.0         | Option to remove unnecessary Vite loader (#26). Switch to ESM, update/remove deps (#25).       |
|            |               | BREAKING CHANGE NOTE: requires that your `package.json` use `type:module`.                     |
| 2022-04-23 | 0.9.0         | Auto-config by default (#27).                                                                  |
|            |               | Remove `manualChunks` (incompatible with `inlineDynamicImports=true` in vite 2.9.5             |
| 2022-06-14 | 0.10.0-beta   | Dual ESM/CJS exports (#30 and others)                                                          |
|            |               | Switched from `transformIndexHtml` to `generateBundle` to fix issue with UnoCSS (#32)          |
|            |               | BREAKING: Removes inlined chunks before they are written to the file system.                   |
|            |               | Add new optional `inlinePattern` glob pattern to limit inlining (implements #31)               |
|            |               | Removed Chalk -- it's pretty, but not worth the ESM-only hassle                                |
|            |               | More permissive script tag parsing (solves #37)                                                |
|            |               | Added some basic tests (Jest)                                                                  |
|            |               | Added eslint, removed unnecessary escapes for "." in regex patterns                            |
| 2022-06-16 | 0.10.0-beta.2 | Add support for .mjs and .cjs file extensions (#38)                                            |
| 2022-07-01 | 0.10.0        | Fix where some bundles are undefined (#41)                                                     |
|            |               | Remove filename comment from injected scripts (#39)                                            |
|            |               | Remove unneeded Vite Preload marker (#34)                                                      |
|            |               | Make jest a dev dependency only (#40)                                                          |
| 2022-07-23 | 0.11.0        | Widen version range for Vite peer dependency to support Vite 3.0 (#46, #47, thanks @valtism!)  |
| 2022-08-06 | 0.11.1        | Check for null code due to worker URLs (#49, thanks @daniel-kun!)                              |
| 2022-09-21 | 0.12.0        | Set config `base` to `undefined` in recommended options (#56)                                  |
|            |               | Remove optional `type` attribute from style tags (#53, thanks @kidonng!)                       |
|            |               | Remove all `VITE_PRELOAD` markers (#55)                                                        |
|            |               | Point package.json to types file (#54, thanks @kidonng!)                                       |
|            |               | Update various dependencies                                                                    |
|            |               | Add README note about SVG (#52)                                                                |
| 2022-09-21 | 0.12.1        | Rebase... doh!                                                                                 |
| 2022-10-01 | 0.12.2        | Resolve preload script issue (#58)                                                             |
| 2022-10-15 | 0.12.3        | Update various dependencies (including Rollup 3.x), ran tests, no other changes                |
| 2022-11-07 | 0.13.0        | Add deleteInlinedFiles option (#62, thanks @jaerod95!). Update dependencies.                   |
| 2022-11-10 | 0.13.1        | Add node v14 support for non-Vue projects (#64, thanks @aloisklink! See also #60, #61)         |
|            |               | Add CI testing via GitHub action (#65, thanks @aloisklink!)                                    |
| 2022-12-10 | 0.13.2        | Confirmed compatibility with Rollup v3 and Vite v4, loosened package.json versions required    |
| 2023-02-11 | 0.13.3        | Bump build dependencies, update README                                                         |
| 2023-04-01 | 0.13.5        | Allow reporting of compressed bundle size (#70, #71, thanks @mojoaxel!)                        |
|            |               | Fix where polfill not removed when minify disabled (#72)                                       |
| 2024-01-14 | 1.0.0         | BREAKING: Vite 5, Node 18 is now required. This is a breaking change!                          |
|            |               | Fixed relative URLs (#75, #86, thanks @atomiechen!)                                            |
|            |               | Switched from jest to vitest                                                                   |
|            |               | Fix plugin type                                                                                |
| 2024-02-11 | 2.0.0         | BREAKING: Vite 5.1+ is now required                                                            |
|            |               | Uses delegate for `assetsInlineLimit`                                                          |
|            |               | Removed unneeded `\n` around `<style>` and `<script>` tags (only needed w/CDATA) (#85)         |
|            |               | More detailed output                                                                           |
|            |               | Legacy UTF-8 charset declarations are now removed from inlined CSS files (#90)                 |
| 2024-03-03 | 2.0.1         | Fix array issue (#93, thanks @smac89!). Bump dependencies.                                     |
| 2024-06-19 | 2.0.2         | Yet another fix for Preload marker removal, due to Vite 5.3 (#98).                             |
| 2024-11-03 | 2.0.3         | Fix inlined script/comment tags (#102)                                                         |
| 2024-12-08 | 2.1.0         | Allow for Vite 6                                                                               |
|            |               | Note that as of the release date, you'll need vitest 3.0.0-beta.1 to test with vite 6, and     |
|            |               | part of it has a depenency on vite 5 still, so you may have to force vite 6.                   |
