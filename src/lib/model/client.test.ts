import { z } from "zod";

import { requestStructuredCompletion } from "@/lib/model/client";

describe("requestStructuredCompletion", () => {
  it("retries once when the model returns invalid JSON", async () => {
    const responder = vi
      .fn()
      .mockResolvedValueOnce("not json at all")
      .mockResolvedValueOnce('{"value":"ok"}');

    const result = await requestStructuredCompletion({
      schema: z.object({
        value: z.string(),
      }),
      schema_label: "测试结构",
      messages: [{ role: "user", content: "hello" }],
      responder,
      retries: 1,
    });

    expect(result).toEqual({ value: "ok" });
    expect(responder).toHaveBeenCalledTimes(2);
  });

  it("throws when retries are exhausted", async () => {
    const responder = vi.fn().mockResolvedValue("still broken");

    await expect(
      requestStructuredCompletion({
        schema: z.object({
          value: z.string(),
        }),
        schema_label: "测试结构",
        messages: [{ role: "user", content: "hello" }],
        responder,
        retries: 0,
      }),
    ).rejects.toThrow("JSON");
  });
});
