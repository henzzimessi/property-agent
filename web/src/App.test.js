import { describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import App from "./App.vue";

function mockFetchSequence(responses) {
  globalThis.fetch = vi.fn().mockImplementation(() => {
    const next = responses.shift();
    if (!next) {
      return Promise.reject(new Error("No mock response left"));
    }
    return Promise.resolve(next);
  });
}

describe("App", () => {
  it("renders agent list from API", async () => {
    mockFetchSequence([
      {
        ok: true,
        json: async () => [
          {
            id: "1",
            firstName: "Alex",
            lastName: "Rivera",
            email: "alex@purehr.com",
            mobileNumber: "555-123-4567",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    ]);

    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Alex Rivera");
    expect(globalThis.fetch).toHaveBeenCalledWith("http://localhost:3001/agents");
  });

  it("submits create form and refreshes list", async () => {
    const createdAgent = {
      id: "2",
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@purehr.com",
      mobileNumber: "555-777-8888",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockFetchSequence([
      { ok: true, json: async () => [] },
      { ok: true, json: async () => createdAgent },
      { ok: true, json: async () => [createdAgent] },
    ]);

    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    });
    await flushPromises();

    await wrapper.get('[data-testid="first-name"]').setValue("Jamie");
    await wrapper.get('[data-testid="last-name"]').setValue("Lee");
    await wrapper.get('[data-testid="email"]').setValue("jamie@purehr.com");
    await wrapper.get('[data-testid="mobile-number"]').setValue("555-777-8888");
    await wrapper.get('[data-testid="submit-agent"]').trigger("click");

    await flushPromises();

    const calls = globalThis.fetch.mock.calls;
    expect(calls[1][0]).toBe("http://localhost:3001/agents");
    expect(calls[1][1].method).toBe("POST");
    expect(wrapper.text()).toContain("Jamie Lee");
  });
});
