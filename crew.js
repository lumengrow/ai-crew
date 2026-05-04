import { orchestrate } from "./agents/orchestrator.js";
import { runUX } from "./agents/ux.js";
import { runFrontend } from "./agents/frontend.js";
import { runBackend } from "./agents/backend.js";
import { runQA } from "./agents/qa.js";
import { runDevOps } from "./agents/devops.js";
import fs from "fs-extra";

async function withRetry(fn, retries = 5, delay = 15000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 529 && i < retries - 1) {
        console.log(`⚠️  API overloaded, waiting ${delay/1000}s... (attempt ${i+1}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 1.5, 60000);
      } else {
        throw err;
      }
    }
  }
}

async function main() {
  const task = await fs.readFile("task.md", "utf-8");
  console.log("\n👑 Team Leader task received:");
  console.log(task);

  const plan = await withRetry(() => orchestrate(task));
  console.log("\n📋 Orchestrator plan:");
  console.log(JSON.stringify(plan, null, 2));

  const { project, tasks } = plan;

  await withRetry(() => runUX(tasks.ux, project));
  await withRetry(() => runFrontend(tasks.frontend, project));
  await withRetry(() => runBackend(tasks.backend, project));
  await withRetry(() => runQA(tasks.qa, project));
  await withRetry(() => runDevOps(tasks.devops, project));

  console.log(`\n✅ Crew finished! All files in → output/${project}/`);

  const { execSync } = await import("child_process");
  execSync(`open "output/${project}/index.html"`);
}

main().catch(console.error);
