import { UserConfig, PluginOption, version as viteVersion } from "vite"
import type { OutputChunk, OutputAsset, OutputOptions } from "rollup"
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
	// Optionally, delete inlined assets preventing them from being output.
	//
	// @default true
	deleteInlinedFiles?: boolean
	// If you need to override anything specific in the recommended build config, pass a sparse
	// object here. For example, use `{ base: "/" }` to override the default "./" base path for
	// non-inlined public files.
	overrideConfig?: Partial<UserConfig>
	// Inline web worker scripts as Blob URLs. When enabled, worker files are embedded directly
	// into the JavaScript code that creates them, using Blob URLs instead of separate files.
	//
	// @default true
	inlineWorkers?: boolean
}

const defaultConfig = { useRecommendedBuildConfig: true, removeViteModuleLoader: false, deleteInlinedFiles: true, inlineWorkers: true }

export function replaceScript(html: string, scriptFilename: string, scriptCode: string, removeViteModuleLoader = false): string {
	const f = scriptFilename.replaceAll(".", "\\.")
	const reScript = new RegExp(`<script([^>]*?) src="(?:[^"]*?/)?${f}"([^>]*)></script>`)
	const preloadMarker = /"?__VITE_PRELOAD__"?/g
	const newCode = scriptCode.replace(preloadMarker, "void 0").replace(/<(\/script>|!--)/g, "\\x3C$1")
	const inlined = html.replace(reScript, (_, beforeSrc, afterSrc) => `<script${beforeSrc}${afterSrc}>${newCode.trim()}</script>`)
	return removeViteModuleLoader ? _removeViteModuleLoader(inlined) : inlined
}

export function replaceCss(html: string, scriptFilename: string, scriptCode: string): string {
	const f = scriptFilename.replaceAll(".", "\\.")
	const reStyle = new RegExp(`<link([^>]*?) href="(?:[^"]*?/)?${f}"([^>]*)>`)
	const newCode = scriptCode.replace(`@charset "UTF-8";`, "")
	const inlined = html.replace(reStyle, (_, beforeSrc, afterSrc) => `<style${beforeSrc}${afterSrc}>${newCode.trim()}</style>`)
	return inlined
}

// Replaces worker file URLs in JavaScript code with inline Blob URLs.
// This handles patterns like:
//   - new URL("./worker.js", import.meta.url)
//   - new URL(""+new URL("worker.js",import.meta.url).href,import.meta.url) (Vite's transformed pattern)
// and transforms them to: URL.createObjectURL(new Blob([...], {type: "application/javascript"}))
// Also removes {type: "module"} from Worker constructor since Blob URLs don't work with module workers.
export function replaceWorker(jsCode: string, workerFilename: string, workerCode: string): string {
	const escapedFilename = workerFilename.replaceAll(".", "\\.").replaceAll("/", "\\/")
	const escapedWorkerCode = workerCode.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
	const blobUrlCode = `URL.createObjectURL(new Blob(["${escapedWorkerCode}"],{type:"application/javascript"}))`
	let result = jsCode

	// Pattern 1: Vite's complex pattern - new URL(""+new URL("worker.js",import.meta.url).href,import.meta.url)
	const reViteWorkerUrl = new RegExp(
		`new\\s+URL\\s*\\(\\s*["']\\s*["']\\s*\\+\\s*new\\s+URL\\s*\\(\\s*["'](?:\\.\\/|\\/)?(${escapedFilename})["']\\s*,\\s*import\\.meta\\.url\\s*\\)\\.href\\s*,\\s*import\\.meta\\.url\\s*\\)`,
		"g"
	)
	result = result.replace(reViteWorkerUrl, blobUrlCode)

	// Pattern 2: Simple pattern - new URL("./worker.js", import.meta.url)
	const reSimpleWorkerUrl = new RegExp(`new\\s+URL\\s*\\(\\s*["'](?:\\.\\/|\\/)?(${escapedFilename})["']\\s*,\\s*import\\.meta\\.url\\s*\\)`, "g")
	result = result.replace(reSimpleWorkerUrl, blobUrlCode)

	// Remove {type:"module"} or {type: "module"} from Worker constructors that use Blob URL
	// Vite bundles workers as IIFEs, so they don't need to be modules
	result = result.replace(
		/new\s+Worker\s*\(\s*(URL\.createObjectURL\(new\s+Blob\(\[[^\]]+\],\{type:"application\/javascript"\}\)\))\s*,\s*\{\s*type\s*:\s*["']module["']\s*\}\s*\)/g,
		"new Worker($1)"
	)

	return result
}

const isJsFile = /\.[mc]?js$/
const isCssFile = /\.css$/
const isHtmlFile = /\.html?$/
const isWorkerFile = /[-.]worker[-.][\w-]*\.[mc]?js$/

export function viteSingleFile({
	useRecommendedBuildConfig = true,
	removeViteModuleLoader = false,
	inlinePattern = [],
	deleteInlinedFiles = true,
	overrideConfig = {},
	inlineWorkers = true,
}: Config = defaultConfig): PluginOption {
	// Modifies the Vite build config to make this plugin work well.
	const _useRecommendedBuildConfig = (config: UserConfig) => {
		if (!config.build) config.build = {}
		// Ensures that even very large assets are inlined in your JavaScript.
		config.build.assetsInlineLimit = () => true
		// Avoid warnings about large chunks.
		config.build.chunkSizeWarningLimit = 100000000
		// Emit all CSS as a single file, which `vite-plugin-singlefile` can then inline.
		config.build.cssCodeSplit = false
		// We need relative path to support any static files in public folder,
		// which are copied to ${build.outDir} by vite.
		config.base = "./"
		// Make generated files in ${build.outDir}'s root, instead of default ${build.outDir}/assets.
		// Then the embedded resources can be loaded by relative path.
		config.build.assetsDir = ""

		if (!config.build.rollupOptions) config.build.rollupOptions = {}
		if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {}

		const viteMajor = parseInt(viteVersion.split(".")[0], 10)
		const updateOutputOptions = (out: OutputOptions) => {
			// Ensure that as many resources as possible are inlined.
			// Vite 8+ (Rolldown) uses codeSplitting:false; earlier versions use inlineDynamicImports:true
			if (viteMajor >= 8) {
				;(out as OutputOptions & { codeSplitting: boolean }).codeSplitting = false
			} else {
				out.inlineDynamicImports = true
			}
		}

		if (Array.isArray(config.build.rollupOptions.output)) {
			for (const o of config.build.rollupOptions.output) updateOutputOptions(o as OutputOptions)
		} else {
			updateOutputOptions(config.build.rollupOptions.output as OutputOptions)
		}

		Object.assign(config, overrideConfig)
	}

	return {
		name: "vite:singlefile",
		config: useRecommendedBuildConfig ? _useRecommendedBuildConfig : undefined,
		enforce: "post",
		generateBundle(_options: unknown, bundle: Record<string, unknown>) {
			const warnNotInlined = (filename: string) => this.info(`NOTE: asset not inlined: ${filename}`)
			this.info("\n")
			const files = {
				html: [] as string[],
				css: [] as string[],
				js: [] as string[],
				worker: [] as string[],
				other: [] as string[],
			}
			for (const i of Object.keys(bundle)) {
				if (isHtmlFile.test(i)) {
					files.html.push(i)
				} else if (isCssFile.test(i)) {
					files.css.push(i)
				} else if (isWorkerFile.test(i)) {
					files.worker.push(i)
				} else if (isJsFile.test(i)) {
					files.js.push(i)
				} else {
					files.other.push(i)
				}
			}
			const bundlesToDelete = [] as string[]

			if (inlineWorkers) {
				for (const workerFilename of files.worker) {
					if (inlinePattern.length && !micromatch.isMatch(workerFilename, inlinePattern)) {
						warnNotInlined(workerFilename)
						continue
					}
					const workerChunk = bundle[workerFilename]
					const workerCode = workerChunk.type === "chunk" ? workerChunk.code : ((workerChunk as OutputAsset).source as string)
					if (workerCode != null) {
						for (const jsFilename of files.js) {
							const jsChunk = bundle[jsFilename] as OutputChunk
							if (jsChunk.code != null) {
								const updatedCode = replaceWorker(jsChunk.code, workerChunk.fileName, workerCode)
								if (updatedCode !== jsChunk.code) {
									this.info(`Inlining worker: ${workerFilename} into ${jsFilename}`)
									jsChunk.code = updatedCode
									if (!bundlesToDelete.includes(workerFilename)) {
										bundlesToDelete.push(workerFilename)
									}
								}
							}
						}
					}
				}
			}

			for (const name of files.html) {
				const htmlChunk = bundle[name] as OutputAsset
				let replacedHtml = htmlChunk.source as string
				for (const filename of files.js) {
					if (inlinePattern.length && !micromatch.isMatch(filename, inlinePattern)) {
						warnNotInlined(filename)
						continue
					}
					const jsChunk = bundle[filename] as OutputChunk
					if (jsChunk.code != null) {
						this.info(`Inlining: ${filename}`)
						bundlesToDelete.push(filename)
						replacedHtml = replaceScript(replacedHtml, jsChunk.fileName, jsChunk.code, removeViteModuleLoader)
					}
				}
				for (const filename of files.css) {
					if (inlinePattern.length && !micromatch.isMatch(filename, inlinePattern)) {
						warnNotInlined(filename)
						continue
					}
					const cssChunk = bundle[filename] as OutputAsset
					this.info(`Inlining: ${filename}`)
					bundlesToDelete.push(filename)
					replacedHtml = replaceCss(replacedHtml, cssChunk.fileName, cssChunk.source as string)
				}
				htmlChunk.source = replacedHtml
			}
			if (deleteInlinedFiles) {
				for (const name of bundlesToDelete) {
					delete bundle[name]
				}
			}
			for (const name of files.other) {
				warnNotInlined(name)
			}
		},
	}
}

// Optionally remove the Vite module loader since it's no longer needed because this plugin has inlined all code.
// This assumes that the Module Loader is (1) the FIRST function declared in the module, (2) an IIFE, (4) is within
// a script with no unexpected attribute values, and (5) that the containing script is the first script tag that
// matches the above criteria. Changes to the SCRIPT tag especially could break this again in the future. It should
// work whether `minify` is enabled or not.
// Update example:
// https://github.com/richardtallent/vite-plugin-singlefile/issues/57#issuecomment-1263950209
const _removeViteModuleLoader = (html: string) =>
	html.replace(/(<script type="module" crossorigin>\s*)\(function(?: polyfill)?\(\)\s*\{[\s\S]*?\}\)\(\);/, '<script type="module">')
