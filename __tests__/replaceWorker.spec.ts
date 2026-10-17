import { describe, test, expect } from "vitest"
import { replaceWorker } from "../dist/esm/index.js"

describe("Replace Worker", () => {
	test("It should inline worker scripts using Blob URLs", () => {
		const workerCode = `self.onmessage = function(e) { postMessage(e.data * 2); }`
		const jsCode = `const worker = new Worker(new URL("./my-worker.js", import.meta.url));`
		const result = replaceWorker(jsCode, "my-worker.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).toContain("new Blob")
		expect(result).toContain("application/javascript")
		expect(result).not.toContain("import.meta.url")
	})

	test("It should handle Vite's complex worker URL pattern", () => {
		const workerCode = `(function(){"use strict";self.onmessage=function(s){const{num:t}=s.data,e=t*2;self.postMessage({result:e})}})();`
		const jsCode = `new Worker(new URL(""+new URL("compute.worker-CwirOBec.js",import.meta.url).href,import.meta.url),{type:"module"})`
		const result = replaceWorker(jsCode, "compute.worker-CwirOBec.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).toContain("new Blob")
		expect(result).not.toContain("import.meta.url")
		expect(result).not.toContain("module")
	})

	test("It should remove type:module from Worker constructor when inlining", () => {
		const workerCode = `console.log("worker");`
		const jsCode = `new Worker(new URL("./worker.js", import.meta.url), {type: "module"})`
		const result = replaceWorker(jsCode, "worker.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).not.toContain('"module"')
		expect(result).toMatch(/new Worker\(URL\.createObjectURL\(new Blob\(\[.*\],\{type:"application\/javascript"\}\)\)\)$/)
	})

	test("It should handle worker filenames with dots", () => {
		const workerCode = `console.log("worker");`
		const jsCode = `new Worker(new URL("./my.worker.js", import.meta.url))`
		const result = replaceWorker(jsCode, "my.worker.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).not.toContain("import.meta.url")
	})

	test("It should handle worker filenames without leading ./", () => {
		const workerCode = `console.log("worker");`
		const jsCode = `new Worker(new URL("worker.js", import.meta.url))`
		const result = replaceWorker(jsCode, "worker.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).not.toContain("import.meta.url")
	})

	test("It should handle single quotes in the URL constructor", () => {
		const workerCode = `console.log("worker");`
		const jsCode = `new Worker(new URL('./my-worker.js', import.meta.url))`
		const result = replaceWorker(jsCode, "my-worker.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).not.toContain("import.meta.url")
	})

	test("It should escape special characters in worker code", () => {
		const workerCode = `const msg = "Hello\\nWorld"; // Comment\nconst x = 1;`
		const jsCode = `new Worker(new URL("./worker.js", import.meta.url))`
		const result = replaceWorker(jsCode, "worker.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).toContain("\\\\n")
		expect(result).toContain('\\"')
	})

	test("It should replace multiple occurrences of the same worker", () => {
		const workerCode = `console.log("worker");`
		const jsCode = `
			const w1 = new Worker(new URL("./worker.js", import.meta.url));
			const w2 = new Worker(new URL("./worker.js", import.meta.url));
		`
		const result = replaceWorker(jsCode, "worker.js", workerCode)
		const matches = result.match(/URL\.createObjectURL/g)
		expect(matches).toHaveLength(2)
	})

	test("It should not modify code that doesn't reference the worker", () => {
		const workerCode = `console.log("worker");`
		const jsCode = `new Worker(new URL("./other-worker.js", import.meta.url))`
		const result = replaceWorker(jsCode, "worker.js", workerCode)
		expect(result).toEqual(jsCode)
	})

	test("It should handle workers with leading slash", () => {
		const workerCode = `console.log("worker");`
		const jsCode = `new Worker(new URL("/worker.js", import.meta.url))`
		const result = replaceWorker(jsCode, "worker.js", workerCode)
		expect(result).toContain("URL.createObjectURL")
		expect(result).not.toContain("import.meta.url")
	})
})
