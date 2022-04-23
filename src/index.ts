import { IndexHtmlTransformResult, IndexHtmlTransformContext, UserConfig, Plugin } from "vite"
import { OutputChunk, OutputAsset, OutputOptions } from "rollup"
import chalk from "chalk"

export type Config = {
	/**
	 * Modifies the Vite build config to make this plugin work well.
	 * See plugin implementation for more details on how this works.
	 *
	 * @default true
	 */
	useRecommendedBuildConfig?: boolean
	/**
	 * Remove the unused Vite module loader. Safe to do since all JS is inlined by this plugin.
	 *
	 * @default false
	 */
	removeViteModuleLoader?: boolean
}

const defaultConfig = { useRecommendedBuildConfig: true, removeViteModuleLoader: false }

export function viteSingleFile({ useRecommendedBuildConfig = true, removeViteModuleLoader = false }: Config = defaultConfig): Plugin {
	return {
		name: "vite:singlefile",
		config: useRecommendedBuildConfig ? _useRecommendedBuildConfig : undefined,
		transformIndexHtml: {
			enforce: "post",
			transform(html: string, ctx?: IndexHtmlTransformContext): IndexHtmlTransformResult {
				// Only use this plugin during build
				if (!ctx || !ctx.bundle) return html
				// Get the bundle
				for (const [, value] of Object.entries(ctx.bundle)) {
					const o = value as OutputChunk
					const a = value as OutputAsset
					if (o.code) {
						const reScript = new RegExp(`<script type="module"[^>]*?src="[\./]*${o.fileName}"[^>]*?></script>`)
						const code = `<script type="module">\n//${o.fileName}\n${o.code}\n</script>`
						const inlined = html.replace(reScript, (_) => code)
						html = removeViteModuleLoader ? _removeViteModuleLoader(inlined) : inlined
					} else if (a.fileName.endsWith(".css")) {
						const reCSS = new RegExp(`<link rel="stylesheet"[^>]*?href="[\./]*${a.fileName}"[^>]*?>`)
						const code = `<style type="text/css">\n${a.source}\n</style>`
						html = html.replace(reCSS, (_) => code)
					} else {
						console.warn(`${chalk.yellow("WARN")} asset not inlined: ${chalk.green(a.fileName)}`)
					}
				}
				return html
			},
		},
	}
}

/**
 * Optionally remove the Vite module loader since it's no longer needed when this plugin has inlined all code.
 */
const _removeViteModuleLoader = (html: string) => {
	const match = html.match(/(<script type="module">[\s\S]*)(const (\S)=function\(\)\{[\s\S]*\};\3\(\);)/)
	// Graceful fallback if Vite updates the format of their module loader in the future.
	if (!match || match.length < 3) return html
	return html.replace(match[1], '  <script type="module">').replace(match[2], "")
}

/**
 * Modifies the Vite build config to make this plugin work well.
 */
const _useRecommendedBuildConfig = (config: UserConfig) => {
	if (!config.build) config.build = {}
	// Ensures that even very large assets are inlined in your JavaScript.
	config.build.assetsInlineLimit = 100000000
	// Avoid warnings about large chunks.
	config.build.chunkSizeWarningLimit = 100000000
	// Emit all CSS as a single file, which `vite-plugin-singlefile` can then inline.
	config.build.cssCodeSplit = false
	// Avoids the extra step of testing Brotli compression, which isn't really pertinent to a file served locally.
	config.build.reportCompressedSize = false

	if (!config.build.rollupOptions) config.build.rollupOptions = {}
	if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {}

	const updateOutputOptions = (out: OutputOptions) => {
		// Ensure that as many resources as possible are inlined.
		out.inlineDynamicImports = true
		// The `manualChunks` option became necessary somewhere around Vite 2.0 release to prevent the creation of a separate `vendor.js` bundle.
		// The filename you choose for `manualChunks` ultimately doesn't matter, it will get rolled into `index.html` by the plugin.`outputOptions` became just `output` some time after that.
		// This is _apparently_ [not needed](https://github.com/vitejs/vite/discussions/2462#discussioncomment-2444172) as of Vite 2.9, but I'm leaving it here for now in case folks are still using older versions of Vite.
		out.manualChunks = () => "everything.js"
	}

	if (!Array.isArray(config.build.rollupOptions.output)) {
		updateOutputOptions(config.build.rollupOptions.output)
	} else {
		config.build.rollupOptions.output.forEach(updateOutputOptions)
	}
}
