import { IndexHtmlTransformResult, IndexHtmlTransformContext } from "vite"
import { Plugin } from "vite"
import { OutputChunk, OutputAsset } from "rollup"
import chalk from "chalk"

export type Config = { removeViteModuleLoader?: boolean }

export function viteSingleFile({ removeViteModuleLoader = false }: Config = {}): Plugin {
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
