import { ensureDatabaseSchema } from "../src/lib/database";

async function main() {
  await ensureDatabaseSchema();
  console.log("SQLite schema is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
