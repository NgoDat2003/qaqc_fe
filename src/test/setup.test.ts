import { describe, it, expect } from "vitest"

describe("Test infrastructure", () => {
  it("Vitest chạy được", () => {
    expect(1 + 1).toBe(2)
  })

  it("boundary: empty array không phải falsy", () => {
    const result: string[] = []
    expect(result).toBeDefined()
    expect(result.length).toBe(0)
    expect(Array.isArray(result)).toBe(true)
  })
})
