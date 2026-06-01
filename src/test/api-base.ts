const testApiBaseUrl = process.env.TEST_API_BASE_URL;

if (!testApiBaseUrl) {
  throw new Error("TEST_API_BASE_URL is required for API unit tests.");
}

export const TEST_API_BASE_URL = testApiBaseUrl.replace(/\/$/, "");
