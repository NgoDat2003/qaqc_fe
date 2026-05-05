import "@testing-library/jest-dom"
import { afterEach, beforeAll, afterAll } from "vitest"
import { cleanup } from "@testing-library/react"
import { server } from "./msw-server"

// Cleanup sau mỗi test
afterEach(() => cleanup())

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
