// Test data dùng chung giữa các spec

export const BRAND = {
  name: "Test Brand",
  code: "TB",
}

export const STORE = {
  name: "Test Store 01",
  code: "TB-01",
  address: "123 Test Street",
}

export const CRITERIA_GROUP = {
  code: "C",
  name: "Cleanliness",
  weight: 30,
}

export const CRITERIA = {
  code: "C1.1",
  content: "Sàn nhà sạch sẽ, không bụi bẩn",
  deductionPerError: 2,
  maxDeduction: 10,
  flag: "none" as const,
}

// Boundary data
export const BOUNDARY = {
  longString: "a".repeat(256),         // quá dài
  emptyString: "",
  sqlInjection: "'; DROP TABLE users;--",
  xss: '<script>alert("xss")</script>',
  maxErrors: 4,                         // lần 4 → auto CCP
  negativeNumber: -1,
}
