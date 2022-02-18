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
            console.warn(`${chalk.yellow('WARN')} asset not inlined: ${chalk.green(a.fileName)}`)
          }
        }
        return html.replace(/<\/body>/, extraCode + "</body>")
      },
    },
  }
}
