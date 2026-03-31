import { assertPublicUrl, isPrivateIpAddress } from "@/lib/source/security";

describe("source security", () => {
  it("detects private IP ranges", () => {
    expect(isPrivateIpAddress("10.0.0.1")).toBe(true);
    expect(isPrivateIpAddress("127.0.0.1")).toBe(true);
    expect(isPrivateIpAddress("192.168.10.4")).toBe(true);
    expect(isPrivateIpAddress("8.8.8.8")).toBe(false);
  });

  it("allows a normal public URL", async () => {
    const dnsLookup = vi.fn().mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    const result = await assertPublicUrl("https://example.com/profile", dnsLookup as never);

    expect(result.hostname).toBe("example.com");
  });

  it("blocks URLs resolving to private networks", async () => {
    const dnsLookup = vi.fn().mockResolvedValue([{ address: "10.0.0.8", family: 4 }]);

    await expect(assertPublicUrl("https://example.com", dnsLookup as never)).rejects.toThrow(
      "私网",
    );
  });
});
