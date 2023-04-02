const src = require("../dist/cjs/index.js")

describe("Replace Script", () => {
	test("It should inline external scripts and preserve other script attributes", () => {
		const outputMod = "<script module>\n\n</script>"
		expect(src.replaceScript(`<script module src="./foo.js"></script>`, "foo.js", "")).toEqual(outputMod)
		expect(src.replaceScript(`<script src="./foo.js" module></script>`, "foo.js", "")).toEqual(outputMod)
		const outAsync = "<script async module>\n\n</script>"
		expect(src.replaceScript(`<script async src="./foo.js" module></script>`, "foo.js", "")).toEqual(outAsync)
		expect(src.replaceScript(`<script src="./foo.js" async module></script>`, "foo.js", "")).toEqual(outAsync)
		const outCrossOrigin = `<script async type="module" crossorigin>\n\n</script>`
		expect(src.replaceScript(`<script async type="module" crossorigin src="/assets/foo.js"></script>`, "assets/foo.js", "")).toEqual(outCrossOrigin)
		const outPolyfill = `<script type="module">\n`
		// Removing polyfill without minification
		expect(src.replaceScript(`<script type="module" crossorigin>\n(function polyfill() {stuff here\nfoo})();`, "", "", true)).toEqual(outPolyfill)
		// Removing polyfill with minification
		expect(src.replaceScript(`<script type="module" crossorigin>\n(function(){stuff here\nfoo})();`, "", "", true)).toEqual(outPolyfill)
	})
})
