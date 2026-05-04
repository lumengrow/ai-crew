import Anthropic from "@anthropic-ai/sdk";
import fs from "fs-extra";

const client = new Anthropic();

export async function runBackend(task, projectName) {
  console.log("\n⚙️  Backend Agent working...\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: task }],
    system: `You are a senior backend developer.
You write clean Node.js/Express APIs and database schemas.
When given a task, output a single server.js file with all routes and logic.
Include comments explaining each endpoint.
Output ONLY the raw JS file content, nothing else.`,
  });

  const js = response.content[0].text;
  await fs.ensureDir(`output/${projectName}`);
  await fs.writeFile(`output/${projectName}/server.js`, js);
  console.log(`✅ Backend agent done → output/${projectName}/server.js`);
  return js;
}
