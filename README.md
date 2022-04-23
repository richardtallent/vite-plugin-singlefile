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

This doesn't _remove_ the build artifacts from the `dist` folder, it just embeds them in the `index.html`. You can ignore the extra files. I'd be open to a PR to remove the recognized files so the `dist` folder is cleaner, especially if there's a way to just prevent them from being written in the first place (_i.e._, not having to delete the files). (Note: removing the entries from `ctx.bundle` does not prevent the files from being written [#24].)

## How do I use it?

Here's an example `vite.config.ts` file.

```ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
	plugins: [vue(), viteSingleFile()],
})
```

### Config

You can optionally include a config object to optimize your build:

```ts
viteSingleFile({ removeViteModuleLoader: true })
```

Here's a full reference of available options:

```ts
viteSingleFile({
	/**
	 * Modifies the Vite build config to make this plugin work well.
	 * See plugin implementation for more details on how this works.
	 *
	 * @default true
	 */
	useRecommendedBuildConfig: true,
	/**
	 * Remove the unused Vite module loader. Safe to do since all JS is inlined by this plugin.
	 *
	 * @default false
	 */
	removeViteModuleLoader: true,
})
```

### Caveats

- `favicon` resources are not inlined by Vite, and this plugin doesn't do that either.
- There may be other situations where referenced files aren't inlined by Vite and aren't caught by this plugin either. I've done little testing so far, I just wanted to get this out there first.
- This is my first Vite and first Rollup plugin. I have no idea what I'm doing. PRs welcome.

### Installation

`yarn add vite-plugin-singlefile -D` or `npm i vite-plugin-singlefile -D`

## Contributing

- Please have PrettierJS installed so your IDE formatting doesn't overwrite the formatting in the source files
- Please clone [vite-plugin-singlefile-example](https://github.com/richardtallent/vite-plugin-singlefile-example) in a sister folder and use it to test your modifications to this plugin before submitting a PR. (I'm happy to take PRs for it as well if you want to add more edge cases to test, such as a large third-party dependency. It's pretty barebones for now.)

## License

MIT
