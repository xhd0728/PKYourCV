import { AppFrame } from "@/components/app-frame";
import { LeaderboardShell } from "@/components/leaderboard-shell";
import { getLeaderboard } from "@/lib/leaderboard";
import type { LeaderboardResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getInitialData(): Promise<LeaderboardResponse> {
  try {
    return await getLeaderboard({
      board: "hireable",
      source_type: "all",
      page: 1,
      page_size: 8,
    });
  } catch {
    return {
      board: "hireable",
      source_type: "all",
      page: 1,
      page_size: 8,
      total: 0,
      entries: [],
    };
  }
}

export default async function LeaderboardPage() {
  const initialData = await getInitialData();

  return (
    <AppFrame active="leaderboard">
      <LeaderboardShell initialData={initialData} />
    </AppFrame>
  );
}
