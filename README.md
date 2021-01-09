# vite-plugin-singlefile

This is a build plugin for Vite that _inlines_ all JavaScript and (optionally) CSS resources directly into the `dist/index.html` file. By also choosing to inline your other assets, an _enter web app_ can be embedded and distributed as a single file.

## Why?

Bundling an _entire_ web site into one file certainly isn't recommended for most situations.

However, this can be very handy for _offline_ web applications--apps you can simply double-click on your file system and that run in your default web browser. This might include utilities, expert system tools, documentation, demos, and other situations where you want the full power of a web browser, without having to write a Cordova or Electron wrapper, and without having to deal with the installation process for a normal application.

Keep in mind that web applications running from a local file have some limitations:

- No ability to access external domains -- no images, no API calls, etc.
- Limited state management options -- no cookies, no `localStorage`, etc. However, you can use the new FileSystem API, with user permission.
- Some web features that require a secure context may not be available.

## How do I use it?

Here's an example `vite.config.ts` file. The `cssCodeSplit` option results in all CSS being emitted as a single file, which `vite-plugin-singlefile` can then embed in your `index.html`. The `assetsInlineLimit` ensures that even very large assets are inlined in your JavaScript. The `inlineDynamicImports` also ensures that as many resources as possible are inlined.

```ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
	plugins: [vue(), viteSingleFile()],
	build: {
		cssCodeSplit: false,
		assetsInlineLimit: 100000000,
		rollupOptions: {
			inlineDynamicImports: true,
		},
	},
})
```

### Caveats

- As of the time of publication, Vite (2.0.0-beta.12 - 2.0.0-beta.15) does not include a link to the CSS file when `cssCodeSplit` is set to `false`. This has been reported as a bug, and this plugin will work around that issue.
- Currently, `favicon` resources are not inlined by Vite, and this plugin doesn't do that either.
- There may be other situations where referenced files aren't inlined by Vite and aren't caught by this plugin either. I've done very little testing so far, I just wanted to get this out there first.
- This is my first Vite and first Rollup plugin. I have no idea what I'm doing. PRs welcome.
- This doesn't _remove_ the assets from the `dist` folder, it just _also_ embeds them in the `index.html`. You can ignore the extra files. I'd be open to a PR to remove the recognized files so the `dist` folder is cleaner, especially if there's a way to just prevent them from being written in the first place (_i.e._), not having to delete the files).

### Installation

`yarn add vite-plugin-singlefile -D` or `npm i vite-plugin-singlefile -D`

## License

MIT
