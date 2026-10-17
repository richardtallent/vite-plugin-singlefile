import { describe, test, expect } from "vitest"
import { replaceCss } from "../src/index"

describe("Replace Css", () => {
	test("It should inline external css and preserve other script attributes", () => {
		const outputStyle = `<style rel="stylesheet"></style>`
		expect(replaceCss(`<link rel="stylesheet" href="./foo.css">`, "foo.css", "")).toEqual(outputStyle)
		expect(replaceCss(`<link rel="stylesheet" href="https://www.base.dir/path/foo.css">`, "foo.css", "")).toEqual(outputStyle)
	})
})
