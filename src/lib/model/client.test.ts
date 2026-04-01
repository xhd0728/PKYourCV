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
    expect(responder).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        response_format: expect.objectContaining({
          type: "json_schema",
          json_schema: expect.objectContaining({
            name: "structured_output",
            strict: true,
            schema: expect.any(Object),
          }),
        }),
      }),
    );
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

  it("passes an ASCII schema name when the label contains non-ASCII text", async () => {
    const responder = vi.fn().mockResolvedValue('{"value":"ok"}');

    await requestStructuredCompletion({
      schema: z.object({
        value: z.string(),
      }),
      schema_label: "候选人分析",
      messages: [{ role: "user", content: "hello" }],
      responder,
      retries: 0,
    });

    expect(responder).toHaveBeenCalledWith(
      expect.objectContaining({
        response_format: expect.objectContaining({
          json_schema: expect.objectContaining({
            name: "structured_output",
          }),
        }),
      }),
    );
  });

  it("retries when the parsed JSON violates a response validator", async () => {
    const responder = vi
      .fn()
      .mockResolvedValueOnce('{"value":"2026 穿越简历"}')
      .mockResolvedValueOnce('{"value":"信号不差，但叙事有点散装。"}');

    const result = await requestStructuredCompletion({
      schema: z.object({
        value: z.string(),
      }),
      schema_label: "测试结构",
      messages: [{ role: "user", content: "hello" }],
      responder,
      retries: 1,
      response_validator: (value) =>
        value.value.includes("2026") ? "不要拿年份或穿越梗做评价。" : null,
    });

    expect(result).toEqual({ value: "信号不差，但叙事有点散装。" });
    expect(responder).toHaveBeenCalledTimes(2);
    expect(responder).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining("不要拿年份或穿越梗做评价。"),
          }),
        ]),
      }),
    );
  });
});
