import Anthropic from "@anthropic-ai/sdk";
import fs from "fs-extra";

const client = new Anthropic();

export async function runDevOps(task, projectName) {
  console.log("\n🚀 DevOps Agent working...\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: task }],
    system: `You are a senior DevOps engineer.
You write deployment configs and CI/CD pipelines.
When given a task, output a vercel.json config file optimised for the project.
Include any environment variable requirements as comments.
Output ONLY the raw JSON file content, nothing else.`,
  });

  const json = response.content[0].text;
  await fs.ensureDir(`output/${projectName}`);
  await fs.writeFile(`output/${projectName}/vercel.json`, json);
  console.log(`✅ DevOps agent done → output/${projectName}/vercel.json`);
  return json;
}
