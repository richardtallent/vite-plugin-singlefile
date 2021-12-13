# vite-plugin-singlefile

This Vite build plugin allows you to _inline_ all JavaScript and CSS resources directly into the final `dist/index.html` file. By doing this, your _enter web app_ can be embedded and distributed as a single HTML file.

## Why?

Bundling your _entire_ site into one file certainly isn't recommended for most situations.

However, this can be very handy for _offline_ web applications--apps you can simply opeen the HTML file in your default web browser. This might include utilities, expert system tools, documentation, demos, and other situations where you want the full power of a web browser, without the need for a Cordova or Electron wrapper or the pain of normal application installation.

## Limitations

Web applications running from a local file have some browser security limitations:

- No ability to access external domains -- no images, no API calls, etc.
- Limited state management options -- no cookies, no `localStorage`. However, you can use the new FileSystem API, with user permission.
- Some web features that require a secure context may not be available.

## How do I use it?

Here's an example `vite.config.ts` file.

```ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
	plugins: [vue(), viteSingleFile()],
	build: {
		target: "esnext",
		assetsInlineLimit: 100000000,
		chunkSizeWarningLimit: 100000000,
		cssCodeSplit: false,
		brotliSize: false,
		rollupOptions: {
			inlineDynamicImports: true,
			output: {
				manualChunks: () => "everything.js",
			},
		},
	},
})
```

- The `cssCodeSplit` option results in all CSS being emitted as a single file, which `vite-plugin-singlefile` can then inline.
- The `assetsInlineLimit` ensures that even very large assets are inlined in your JavaScript.
- The `inlineDynamicImports` also ensures that as many resources as possible are inlined.
- The `manualChunks` option became necessary somewhere around Vite 2.0 release to prevent the creation of a separate `vendor.js` bundle. `outputOptions` became just `output` some time after that.
- The `brotliSize` option just avoids the extra step of testing Brotli compression, which isn't really pertinent to a file served locally.
- The `chunkSizeWarningLimit` option just avoids the warnings about large chunks.
- The filename you choose for `manualChunks` ultimately doesn't matter, it will get rolled into `index.html` by the plugin.

### Caveats

- `favicon` resources are not inlined by Vite, and this plugin doesn't do that either.
- There may be other situations where referenced files aren't inlined by Vite and aren't caught by this plugin either. I've done little testing so far, I just wanted to get this out there first.
- This is my first Vite and first Rollup plugin. I have no idea what I'm doing. PRs welcome.
- This doesn't _remove_ the build artifacts from the `dist` folder, it just embeds them in the `index.html`. You can ignore the extra files. I'd be open to a PR to remove the recognized files so the `dist` folder is cleaner, especially if there's a way to just prevent them from being written in the first place (_i.e._, not having to delete the files).

### Installation

`yarn add vite-plugin-singlefile -D` or `npm i vite-plugin-singlefile -D`

## License

MIT
