import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

let app: Awaited<ReturnType<typeof buildApp>>;

describe("Agents API", () => {
  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates, lists, gets, updates, deletes an agent", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/agents",
      payload: {
        firstName: "Alex",
        lastName: "Rivera",
        email: "alex@purehr.com",
        mobileNumber: "555-123-4567",
      },
    });

    expect(create.statusCode).toBe(201);
    const created = create.json();
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();

    const list = await app.inject({ method: "GET", url: "/agents" });
    expect(list.statusCode).toBe(200);
    const listBody = list.json();
    expect(listBody.length).toBeGreaterThan(0);

    const getOne = await app.inject({
      method: "GET",
      url: `/agents/${created.id}`,
    });
    expect(getOne.statusCode).toBe(200);

    const update = await app.inject({
      method: "PUT",
      url: `/agents/${created.id}`,
      payload: { mobileNumber: "555-999-0000" },
    });
    expect(update.statusCode).toBe(200);
    expect(update.json().mobileNumber).toBe("555-999-0000");

    const del = await app.inject({
      method: "DELETE",
      url: `/agents/${created.id}`,
    });
    expect(del.statusCode).toBe(204);
  });

  it("rejects invalid create payload", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/agents",
      payload: { firstName: "" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Validation failed");
  });

  it("rejects duplicate emails", async () => {
    const payload = {
      firstName: "Jamie",
      lastName: "Lee",
      email: "jamie@purehr.com",
      mobileNumber: "555-222-3333",
    };

    const first = await app.inject({ method: "POST", url: "/agents", payload });
    expect(first.statusCode).toBe(201);

    const second = await app.inject({
      method: "POST",
      url: "/agents",
      payload,
    });
    expect(second.statusCode).toBe(409);
  });
});
