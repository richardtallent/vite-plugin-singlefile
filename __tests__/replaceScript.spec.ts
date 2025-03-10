import { describe, test, expect } from "vitest"
import { replaceScript } from "../dist/esm/index.js"

describe("Replace Script", () => {
	test("It should inline external scripts and preserve other script attributes", () => {
		const outputMod = "<script module></script>"
		expect(replaceScript(`<script module src="./foo.js"></script>`, "foo.js", "")).toEqual(outputMod)
		expect(replaceScript(`<script module src="https://www.base.dir/path/foo.js"></script>`, "foo.js", "")).toEqual(outputMod)
		expect(replaceScript(`<script src="./foo.js" module></script>`, "foo.js", "")).toEqual(outputMod)
		expect(replaceScript(`<script src="https://www.base.dir/path/foo.js" module></script>`, "foo.js", "")).toEqual(outputMod)
		const outAsync = "<script async module></script>"
		expect(replaceScript(`<script async src="./foo.js" module></script>`, "foo.js", "")).toEqual(outAsync)
		expect(replaceScript(`<script async src="https://www.base.dir/path/foo.js" module></script>`, "foo.js", "")).toEqual(outAsync)
		expect(replaceScript(`<script src="./foo.js" async module></script>`, "foo.js", "")).toEqual(outAsync)
		expect(replaceScript(`<script src="https://www.base.dir/path/foo.js" async module></script>`, "foo.js", "")).toEqual(outAsync)
		const outCrossOrigin = `<script async type="module" crossorigin></script>`
		expect(replaceScript(`<script async type="module" crossorigin src="/assets/foo.js"></script>`, "assets/foo.js", "")).toEqual(outCrossOrigin)
		expect(replaceScript(`<script async type="module" crossorigin src="https://www.base.dir/path/assets/foo.js"></script>`, "assets/foo.js", "")).toEqual(outCrossOrigin)
		const outPolyfill = `<script type="module">`
		// Removing polyfill without minification
		expect(replaceScript(`<script type="module" crossorigin>(function polyfill() {stuff here\nfoo})();`, "", "", true)).toEqual(outPolyfill)
		// Removing polyfill with minification
		expect(replaceScript(`<script type="module" crossorigin>(function(){stuff here\nfoo})();`, "", "", true)).toEqual(outPolyfill)
	})
})
