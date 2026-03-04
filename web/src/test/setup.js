import { afterEach, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

if (!globalThis.fetch) {
  globalThis.fetch = () => {
    throw new Error("fetch must be mocked in tests");
  };
}
