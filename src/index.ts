import { IndexHtmlTransformResult, IndexHtmlTransformContext } from "vite"
import { Plugin } from "vite"
import { OutputChunk, OutputAsset } from "rollup"
import chalk from "chalk"

export function viteSingleFile(): Plugin {
	return {
		name: "vite:singlefile",
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
						html = html.replace(reScript, (_) => code)
						delete ctx.bundle[o.fileName]
					} else if (a.fileName.endsWith(".css")) {
						const reCSS = new RegExp(`<link rel="stylesheet"[^>]*?href="[\./]*${a.fileName}"[^>]*?>`)
						const code = `<style type="text/css">\n${a.source}\n</style>`
						html = html.replace(reCSS, (_) => code)
						delete ctx.bundle[a.fileName]
					} else {
						console.warn(`${chalk.yellow("WARN")} asset not inlined: ${chalk.green(a.fileName)}`)
					}
				}
				return html
			},
		},
	}
}
