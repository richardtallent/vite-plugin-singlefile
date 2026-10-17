import { describe, test, expect } from "vitest"
import { viteSingleFile } from "../dist/esm/index.js"

// Runs the plugin's generateBundle against a fake bundle and returns the names of the files that were inlined.
const inlined = (inlinePattern: string[]) => {
	const names = ["a.js", "assets/b.js", "vendor-x.js", "style.css", "assets/c.css"]
	const bundle: Record<string, unknown> = {
		"index.html": {
			fileName: "index.html",
			source: names.map((n) => (n.endsWith(".css") ? `<link rel="stylesheet" href="/${n}">` : `<script type="module" src="/${n}"></script>`)).join(""),
		},
	}
	for (const n of names) {
		bundle[n] = n.endsWith(".css") ? { fileName: n, source: "x{}" } : { fileName: n, code: "x()" }
	}
	const plugin = viteSingleFile({ inlinePattern, useRecommendedBuildConfig: false }) as any
	plugin.generateBundle.handler.call({ info: () => {} }, {}, bundle)
	return names.filter((n) => !(n in bundle)).sort()
}

describe("inlinePattern", () => {
	test("empty pattern inlines everything", () => {
		expect(inlined([])).toEqual(["a.js", "assets/b.js", "assets/c.css", "style.css", "vendor-x.js"])
	})
	test("simple glob only matches top-level files", () => {
		expect(inlined(["*.js"])).toEqual(["a.js", "vendor-x.js"])
	})
	test("globstar matches nested files", () => {
		expect(inlined(["**/*.js"])).toEqual(["a.js", "assets/b.js", "vendor-x.js"])
	})
	test("brace expansion", () => {
		expect(inlined(["*.{js,css}"])).toEqual(["a.js", "style.css", "vendor-x.js"])
	})
	test("negation", () => {
		expect(inlined(["!vendor-*.js"])).toEqual(["a.js", "assets/b.js", "assets/c.css", "style.css"])
	})
	test("multiple patterns", () => {
		expect(inlined(["a.js", "assets/*.css"])).toEqual(["a.js", "assets/c.css"])
	})
})
