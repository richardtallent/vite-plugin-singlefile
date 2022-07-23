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
