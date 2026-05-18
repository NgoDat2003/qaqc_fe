import "@testing-library/jest-dom"
import { cleanup } from "@testing-library/react"
import { server } from "./msw-server"

// This runs in each test file context (not global setup)
// We need to register afterEach here to work with the test suite
if (typeof afterEach !== "undefined") {
  afterEach(() => {
    cleanup()
    server.resetHandlers()
  })
}
