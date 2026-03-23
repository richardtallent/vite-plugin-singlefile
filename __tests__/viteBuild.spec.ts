import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import { version as viteVersion } from "vite"
import { afterEach, describe, expect, test } from "vitest"

const repoRoot = process.cwd()
const fixtureRoot = join(repoRoot, "__tests__", "fixtures", "vite-app")
const viteBin = join(repoRoot, "node_modules", "vite", "bin", "vite.js")
const tmpRoots: string[] = []

const createFixtureApp = () => {
	const root = mkdtempSync(join(repoRoot, ".tmp-vite-build-"))
	tmpRoots.push(root)
	cpSync(fixtureRoot, root, { recursive: true })
	writeFileSync(
		join(root, "vite.config.ts"),
		`import { defineConfig } from "vite"
import { viteSingleFile } from "../src/index.ts"

export default defineConfig({
	plugins: [viteSingleFile()],
})
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
})
