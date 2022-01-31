import { IndexHtmlTransformResult, IndexHtmlTransformContext, Plugin, UserConfig, OutputOptions } from "vite"
import { OutputChunk, OutputAsset } from "rollup"

export function viteSingleFile(): Plugin {
	return {
		name: "vite:singlefile",
		config(config: UserConfig) {
			if (!config.build) config.build = {}
			config.build.assetsInlineLimit = 100000000
			config.build.chunkSizeWarningLimit = 100000000
			config.build.cssCodeSplit = false

			if (!config.build.rollupOptions) config.build.rollupOptions = {}
			if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {}

			if (!Array.isArray(config.build.rollupOptions.output)) {
				config.build.rollupOptions.output.inlineDynamicImports = true
				config.build.rollupOptions.output.manualChunks = () => "everything.js"
			} else {
				config.build.rollupOptions.output.forEach((out: OutputOptions) => {
					out.inlineDynamicImports = true
					out.manualChunks = () => "everything.js"
				})
			}
		},
		transformIndexHtml: {
			enforce: "post",
			transform(html: string, ctx?: IndexHtmlTransformContext): IndexHtmlTransformResult {
				// Only use this plugin during build
				if (!ctx || !ctx.bundle) return html
				// Get the bundle
				let extraCode = ""
				for (const [, value] of Object.entries(ctx.bundle)) {
					const o = value as OutputChunk
					const a = value as OutputAsset
					if (o.code) {
						const reScript = new RegExp(`<script type="module"[^>]*?src="[\./]*${value.fileName}"[^>]*?></script>`)
						const code = `<script type="module">\n//${o.fileName}\n${o.code}\n</script>`
						html = html.replace(reScript, (_) => code)
					} else if (value.fileName.endsWith(".css")) {
						const reCSS = new RegExp(`<link rel="stylesheet"[^>]*?href="[\./]*${value.fileName}"[^>]*?>`)
						const code = `<!-- ${a.fileName} --><style type="text/css">\n${a.source}\n</style>`
						html = html.replace(reCSS, (_) => code)
					} else {
						extraCode += "\n<!-- ASSET NOT INLINED: " + a.fileName + " -->\n"
					}
				}
				return html.replace(/<\/body>/, extraCode + "</body>")
			},
		},
	}
}
