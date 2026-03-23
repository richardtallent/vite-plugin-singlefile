import { describe, test, expect } from "vitest"
import type { UserConfig } from "vite"
import { viteSingleFile } from "../src/index"

type InlineableOutputOptions = {
	inlineDynamicImports?: boolean
	codeSplitting?: boolean
}

type InlineableBuildOptions = NonNullable<UserConfig["build"]> & {
	rolldownOptions?: {
		output?: InlineableOutputOptions | InlineableOutputOptions[]
	}
}

const applyRecommendedBuildConfig = (config: UserConfig) => {
	const plugin = viteSingleFile() as { config?: (config: UserConfig) => void }
	expect(plugin.config).toBeTypeOf("function")
	plugin.config?.(config)
}

describe("viteSingleFile config", () => {
	test("it configures Rollup output for Vite 5-7 style configs", () => {
		const config: UserConfig = { build: {} }

		applyRecommendedBuildConfig(config)

		expect(config.base).toBe("./")
		expect(config.build?.assetsDir).toBe("")
		expect(config.build?.cssCodeSplit).toBe(false)
		expect(config.build?.assetsInlineLimit?.()).toBe(true)
		expect(config.build?.chunkSizeWarningLimit).toBe(100000000)
		expect(config.build?.rollupOptions?.output).toMatchObject({ inlineDynamicImports: true })
		expect((config.build as InlineableBuildOptions).rolldownOptions).toBeUndefined()
	})

	test("it configures Rolldown output for Vite 8 configs without touching the deprecated alias", () => {
		const rolldownOptions = {} as NonNullable<InlineableBuildOptions["rolldownOptions"]>
		const build = { rolldownOptions } as InlineableBuildOptions

		Object.defineProperty(build, "rollupOptions", {
			configurable: true,
			enumerable: true,
			get() {
				return rolldownOptions
			},
			set() {
				throw new Error("deprecated rollupOptions setter should not be used")
			},
		})

		const config: UserConfig = { build }

		applyRecommendedBuildConfig(config)

		expect(build.rolldownOptions?.output).toMatchObject({ codeSplitting: false })
		expect(build.rollupOptions).not.toHaveProperty("inlineDynamicImports")
	})

	test("it preserves output arrays when applying the Vite 8 workaround", () => {
		const outputs: InlineableOutputOptions[] = [{}, {}]
		const rolldownOptions = { output: outputs }
		const build = { rolldownOptions } as InlineableBuildOptions

		Object.defineProperty(build, "rollupOptions", {
			configurable: true,
			enumerable: true,
			get() {
				return rolldownOptions
			},
			set() {
				throw new Error("deprecated rollupOptions setter should not be used")
			},
		})

		applyRecommendedBuildConfig({ build })

		expect(outputs).toEqual([{ codeSplitting: false }, { codeSplitting: false }])
	})
})
