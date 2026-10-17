import { describe, test, expect } from "vitest"
import { findCspProblems } from "../src/index"

const meta = (csp: string) => `<head><meta http-equiv="Content-Security-Policy" content="${csp}"></head>`

describe("findCspProblems", () => {
	test("warns for script-src and style-src 'self'", () => {
		const r = findCspProblems(meta("default-src 'self'; script-src 'self'; style-src 'self'"), true, true)
		expect(r).toHaveLength(2)
	})
	test("falls back to default-src", () => {
		expect(findCspProblems(meta("default-src 'self'"), true, true)).toHaveLength(2)
	})
	test("only reports what was inlined", () => {
		expect(findCspProblems(meta("default-src 'self'"), true, false)).toHaveLength(1)
		expect(findCspProblems(meta("default-src 'self'"), false, false)).toHaveLength(0)
	})
	test("allows unsafe-inline, hashes and nonces", () => {
		expect(findCspProblems(meta("script-src 'self' 'unsafe-inline'; style-src 'sha256-abc='"), true, true)).toEqual([])
		expect(findCspProblems(meta("default-src 'nonce-xyz'"), true, true)).toEqual([])
	})
	test("no directive or no CSP means no warning", () => {
		expect(findCspProblems(meta("img-src 'self'"), true, true)).toEqual([])
		expect(findCspProblems("<head></head>", true, true)).toEqual([])
	})
	test("-elem directives take precedence", () => {
		expect(findCspProblems(meta("script-src 'unsafe-inline'; script-src-elem 'self'"), true, false)).toHaveLength(1)
	})
})
