import { server } from "./msw-server"

export async function setup() {
  // Start MSW server for all tests
  server.listen({ onUnhandledRequest: "warn" })

  return async () => {
    // Return teardown function
    server.close()
  }
}
