import { IndexHtmlTransformResult, IndexHtmlTransformContext } from "vite"
import { Plugin } from "vite"
import { OutputChunk, OutputAsset } from "rollup"

export function viteSingleFile(): Plugin {
	return {
		name: "vite:singlefile",
		transformIndexHtml: {
			enforce: "post",
			transform(html: string, ctx?: IndexHtmlTransformContext): IndexHtmlTransformResult {
				// Only use this plugin during build
				if (!ctx?.bundle) return html
				// Get the bundle
				let extraCode = ""
				for (const [key, value] of Object.entries(ctx.bundle)) {
					console.log(`KEY: ${key} (${value.fileName}):`)
					const o = value as OutputChunk
					const a = value as OutputAsset
					if (o.code) {
						html = html.replace(`<script type="module" src="/${value.fileName}"></script>`, `<script type="module">\n//${o.fileName}\n${o.code}\n</script>`)
					} else if (value.fileName.endsWith(".css")) {
						const css = `<!-- ${a.fileName} --><style type="text/css">\n${a.source}\n</style>`
						const lookFor = `<link rel="stylesheet" src="/${value.fileName}" />`
						if (html.includes(lookFor)) {
							html = html.replace(lookFor, css)
						} else {
							// Vite 2.0 beta 12-15 issue, no link to replace
							// https://github.com/vitejs/vite/issues/1141
							extraCode += css
						}
					} else {
						extraCode += "\n<!-- ASSET NOT INLINED: " + a.fileName + " -->\n"
					}
				}
				return html.replace(/<\/body>/, extraCode + "</body>")
			},
		},
	}
}
