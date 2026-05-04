import Anthropic from "@anthropic-ai/sdk";
import fs from "fs-extra";

const client = new Anthropic();

export async function runFrontend(task, projectName) {
  console.log("\n⚛️  Frontend Agent working...\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: task }],
    system: `You are a senior frontend developer.
You write clean, modern JavaScript and CSS.
When given a task, output a single app.js file with vanilla JS or React logic.
Focus on interactivity, state management, and clean component structure.
Output ONLY the raw JS file content, nothing else.`,
  });

  const js = response.content[0].text;
  await fs.ensureDir(`output/${projectName}`);
  await fs.writeFile(`output/${projectName}/app.js`, js);
  console.log(`✅ Frontend agent done → output/${projectName}/app.js`);
  return js;
}
