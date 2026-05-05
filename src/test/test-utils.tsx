import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Tạo wrapper với QueryClient fresh cho mỗi test
export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}
