import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"
import { server } from "./msw-server"

// Start MSW in each test worker (globalSetup runs in main thread, not shared with workers)
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => server.close())
