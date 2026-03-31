vi.mock("@/lib/leaderboard", () => ({
  getLeaderboard: vi.fn(),
}));

import { GET } from "@/app/api/leaderboard/route";
import { getLeaderboard } from "@/lib/leaderboard";

describe("GET /api/leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns leaderboard payload with normalized query params", async () => {
    vi.mocked(getLeaderboard).mockResolvedValue({
      board: "chaos",
      source_type: "pdf",
      page: 2,
      page_size: 5,
      total: 12,
      entries: [],
    });

    const response = await GET(
      new Request("http://localhost/api/leaderboard?board=chaos&source=pdf&page=2&page_size=5"),
    );

    expect(response.status).toBe(200);
    expect(getLeaderboard).toHaveBeenCalledWith({
      board: "chaos",
      source_type: "pdf",
      page: 2,
      page_size: 5,
    });
    await expect(response.json()).resolves.toMatchObject({
      board: "chaos",
      source_type: "pdf",
    });
  });
});
