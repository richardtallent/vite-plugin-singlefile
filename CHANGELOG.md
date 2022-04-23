# Change Log

| Date       | Version | Notes                                                                                          |
| ---------- | ------- | ---------------------------------------------------------------------------------------------- |
| 2021-01-09 | 0.1.0   | First post!                                                                                    |
| 2021-01-14 | 0.2.0   | Fix for newest Vite beta, including CSS support                                                |
| 2021-01-14 | 0.3.0   | Borked npm update                                                                              |
| 2021-01-14 | 0.4.0   | Work around regex accidental replacement variables issue.                                      |
| 2021-01-21 | 0.5.0   | Add TypeScript declaration file (originally 0.1.1 with the wrong base, forgot to push 0.2-0.4) |
| 2021-03-21 | 0.6.1   | Minor tweak to allow node 12.x support                                                         |
| 2021-12-12 | 0.6.2   | Update deps. Fix relative asset paths (thanks @prog-rajkamal!). Improved docs.                 |
| 2021-12-31 | 0.6.3   | Update deps. Fix parent relative asset paths (#17).                                            |
| 2022-03-01 | 0.7.0   | Update deps. Warn for assets not inlined rather than adding comments (#21, thanks @taybart!)   |
| 2022-03-02 | 0.7.1   | Downgrade chalk, fixes #22                                                                     |
| 2022-04-03 | 0.7.2   | Update deps. Remove unneeded code (#24).                                                       |
| 2022-04-19 | 0.8.0   | Option to remove unnecessary Vite loader (#26). Switch to ESM, update/remove deps (#25).       |
|            |         | BREAKING CHANGE NOTE: requires that your `package.json` use `type:module`.                     |
| 2022-04-23 | 0.9.0   | Auto-config by default (#27).                                                                  |
|            |         | Remove `manualChunks` (incompatible with `inlineDynamicImports=true` in vite 2.9.5             |
