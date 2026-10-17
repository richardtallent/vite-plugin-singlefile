import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import { version as viteVersion } from "vite"
import { afterEach, describe, expect, test } from "vitest"

const repoRoot = process.cwd()
const fixtureRoot = join(repoRoot, "__tests__", "fixtures", "vite-app")
const viteBin = join(repoRoot, "node_modules", "vite", "bin", "vite.js")
const tmpRoots: string[] = []

const createFixtureApp = (viteConfigOptions = "") => {
	const root = mkdtempSync(join(repoRoot, ".tmp-vite-build-"))
	tmpRoots.push(root)
	cpSync(fixtureRoot, root, { recursive: true })
	writeFileSync(
		join(root, "vite.config.ts"),
		`import { defineConfig } from "vite"
import { viteSingleFile } from "../src/index.ts"

export default defineConfig({
	plugins: [viteSingleFile()],
${viteConfigOptions}})
`
	)
	return root
}

afterEach(() => {
	for (const root of tmpRoots.splice(0)) {
		rmSync(root, { recursive: true, force: true })
	}
})

describe("viteSingleFile build integration", () => {
	test("it produces a single HTML file without the Vite 8 deprecation warning", () => {
		const root = createFixtureApp()
		const result = spawnSync("node", [viteBin, "build"], {
			cwd: root,
			encoding: "utf8",
		})
		const output = `${result.stdout}${result.stderr}`

		expect(result.status).toBe(0)
		if (Number(viteVersion.split(".")[0]) >= 8) {
			expect(output).not.toContain("inlineDynamicImports option is deprecated")
		}

		expect(readdirSync(join(root, "dist")).sort()).toEqual(["index.html"])

		const html = readFileSync(join(root, "dist", "index.html"), "utf8")
		expect(html).toContain("<style")
		expect(html).toContain("lazy-loaded")
		expect(html).not.toMatch(/<script[^>]+src=/)
		expect(html).not.toMatch(/<link[^>]+href=.*\\.css/)
	})

	// `build.license` was added in Vite 8; the license plugin reads chunk.moduleIds in generateBundle, so
	// this plugin must not delete the inlined chunks before it runs.
	test.runIf(Number(viteVersion.split(".")[0]) >= 8)("it preserves dependency licenses when build.license is enabled", () => {
		const root = createFixtureApp("\tbuild: { license: true },\n")
		const depDir = join(root, "node_modules", "fake-licensed-dep")
		mkdirSync(depDir, { recursive: true })
		writeFileSync(join(depDir, "package.json"), JSON.stringify({ name: "fake-licensed-dep", version: "1.2.3", license: "MIT", main: "index.js" }))
		writeFileSync(join(depDir, "index.js"), "module.exports = { fake: 'fake-dep-value' }\n")
		writeFileSync(join(depDir, "LICENSE"), "Fake license text\n")
		appendFileSync(join(root, "src", "main.js"), "\nimport { fake } from 'fake-licensed-dep'\nconsole.log(fake)\n")

		const result = spawnSync("node", [viteBin, "build"], { cwd: root, encoding: "utf8" })
		expect(result.status).toBe(0)

		const license = readFileSync(join(root, "dist", ".vite", "license.md"), "utf8")
		expect(license).toContain("fake-licensed-dep - 1.2.3 (MIT)")
		expect(license).toContain("Fake license text")
	})
})
