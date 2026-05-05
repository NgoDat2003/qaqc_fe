import { setupServer } from "msw/node"

// Server MSW — handlers được add trong từng test file
// Dùng: server.use(http.get('/api/brands', resolver))
export const server = setupServer()
