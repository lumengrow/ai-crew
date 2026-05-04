import Anthropic from "@anthropic-ai/sdk";
import fs from "fs-extra";

const client = new Anthropic();

export async function runQA(task, projectName) {
  console.log("\n🧪 QA Agent working...\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: task }],
    system: `You are a senior QA engineer.
You write thorough test plans and test cases.
When given a task, output a qa-report.md file with:
- Test cases (happy path + edge cases)
- What to check manually
- Potential bugs to watch for
Output ONLY the raw markdown content, nothing else.`,
  });

  const md = response.content[0].text;
  await fs.ensureDir(`output/${projectName}`);
  await fs.writeFile(`output/${projectName}/qa-report.md`, md);
  console.log(`✅ QA agent done → output/${projectName}/qa-report.md`);
  return md;
}
