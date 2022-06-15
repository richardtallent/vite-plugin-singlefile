import { UserConfig, Plugin } from "vite"
import { OutputChunk, OutputAsset, OutputOptions } from "rollup"
import micromatch from "micromatch"

export type Config = {
	// Modifies the Vite build config to make this plugin work well. See `_useRecommendedBuildConfig`
	// in the plugin implementation for more details on how this works.
	//
	// @default true
	useRecommendedBuildConfig?: boolean
	// Remove the unused Vite module loader. Safe to do since all JS is inlined by this plugin.
	//
	// @default false
	removeViteModuleLoader?: boolean
	// Optionally, only inline assets that match one or more glob patterns.
	//
	// @default []
	inlinePattern?: string[]
}

const defaultConfig = { useRecommendedBuildConfig: true, removeViteModuleLoader: false }

export function replaceScript(html: string, scriptFilename: string, scriptCode: string, removeViteModuleLoader = false): string {
	const reScript = new RegExp(`<script([^>]*?) src="[./]*${scriptFilename}"([^>]*)></script>`)
	const inlined = html.replace(reScript, (_, beforeSrc, afterSrc) => `<script${beforeSrc}${afterSrc}>\n//${scriptFilename}\n${scriptCode}\n</script>`)
	return removeViteModuleLoader ? _removeViteModuleLoader(inlined) : inlined
}

export function replaceCss(html: string, scriptFilename: string, scriptCode: string): string {
	const reCss = new RegExp(`<link[^>]*? href="[./]*${scriptFilename}"[^>]*?>`)
	const inlined = html.replace(reCss, `<style type="text/css">\n${scriptCode}\n</style>`)
	return inlined
}

const warnNotInlined = (filename: string) => console.warn(`WARNING: asset not inlined: ${filename}`)

export function viteSingleFile({ useRecommendedBuildConfig = true, removeViteModuleLoader = false, inlinePattern = [] }: Config = defaultConfig): Plugin {
	return {
		name: "vite:singlefile",
		config: useRecommendedBuildConfig ? _useRecommendedBuildConfig : undefined,
		enforce: "post",
		generateBundle: (_, bundle) => {
			const htmlFiles = Object.keys(bundle).filter((i) => i.endsWith(".html"))
			const cssAssets = Object.keys(bundle).filter((i) => i.endsWith(".css"))
			const jsAssets = Object.keys(bundle).filter((i) => i.endsWith(".js"))
			for (const name of htmlFiles) {
				const htmlChunk = bundle[name] as OutputAsset
				let replacedHtml = htmlChunk.source as string
				for (const jsName of jsAssets) {
					if (!inlinePattern.length || micromatch.isMatch(jsName, inlinePattern)) {
						const jsChunk = bundle[jsName] as OutputChunk
						replacedHtml = replaceScript(replacedHtml, jsChunk.fileName, jsChunk.code, removeViteModuleLoader)
						delete bundle[jsName]
					} else {
						warnNotInlined(jsName)
					}
				}
				for (const cssName of cssAssets) {
					if (!inlinePattern.length || micromatch.isMatch(cssName, inlinePattern)) {
						const cssChunk = bundle[cssName] as OutputAsset
						replacedHtml = replaceCss(replacedHtml, cssChunk.fileName, cssChunk.source as string)
						delete bundle[cssName]
					} else {
						warnNotInlined(cssName)
					}
				}
				htmlChunk.source = replacedHtml
			}
			for (const name of Object.keys(bundle).filter((i) => !i.endsWith(".js") && !i.endsWith(".css") && !i.endsWith(".html"))) {
				warnNotInlined(name)
			}
		},
	}
}

// Optionally remove the Vite module loader since it's no longer needed because this plugin has inlined all code.
const _removeViteModuleLoader = (html: string) => {
	const match = html.match(/(<script type="module">[\s\S]*)(const (\S)=function\(\)\{[\s\S]*\};\3\(\);)/)
	// Graceful fallback if Vite updates the format of their module loader in the future.
	if (!match || match.length < 3) return html
	return html.replace(match[1], '  <script type="module">').replace(match[2], "")
}

// Modifies the Vite build config to make this plugin work well.
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
	}

	if (!Array.isArray(config.build.rollupOptions.output)) {
		updateOutputOptions(config.build.rollupOptions.output)
	} else {
		config.build.rollupOptions.output.forEach(updateOutputOptions)
	}
}
